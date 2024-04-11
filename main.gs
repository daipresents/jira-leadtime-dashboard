/**
 * 設定。
 * 
 * プロジェクトの設定 ＞ プロジェクトプロパティで以下の値を定義してください。
 *   PROJECT_ID： JIRAプロジェクトID 例： NLBO
 *   BASE_URL： JIRA REST APIのベースURL 例： https://example.atlassian.net
 *   JIRA_USER_NAME： JIRAのユーザ名（Email) 例： example@gmail.com
 *   API_TOKEN： API_TOKEN。こちらから作成する。 https://id.atlassian.com/manage-profile/security/api-tokens
 */

// デバッグ
const debug = false;

// JIRA
const PROJECT_ID = PropertiesService.getScriptProperties().getProperty("PROJECT_ID");
// リードタイム対象となるIssueType
// 将来的に複数指定できると便利だけど、そうするとIssueTypeごとにTransition設定できるので
// IssueTypeごとに集計方法を変えなければならない
const ISSUE_TYPE = 'ストーリー';
const BASE_URL = PropertiesService.getScriptProperties().getProperty("BASE_URL");
const SEARCH_URL = BASE_URL + '/rest/api/3/search';
const CHANGELOG_URL = BASE_URL + '/rest/api/3/issue';
const TRANSITION_URL = BASE_URL + '/rest/api/3/issue';

// Auth
const JIRA_USER_NAME = PropertiesService.getScriptProperties().getProperty("JIRA_USER_NAME");
const API_TOKEN = PropertiesService.getScriptProperties().getProperty("API_TOKEN");
const CREDENTIAL = Utilities.base64Encode(JIRA_USER_NAME + ":" + API_TOKEN);
const REQUEST_ARGS = {
  contentType: "application/json",
  headers: { "Authorization": "Basic " + CREDENTIAL },
  muteHttpExceptions: true
};

// 集計するスプリントの数（指定したスプリントのIDから過去MAX_SPRINT_NUMだけ遡る）
const MAX_SPRINT_NUM = 10;
// 出力するデータ情報。 ['シート名', ['見出し', '見出し'・・・]]
const exports = [
  ['data(Status)', ['sprintId', 'key', 'summary', 'from-to', 'leadtime', 'created']],
  ['data(Issue)', ['sprintId', 'key', 'summary', 'leadtime', 'created']],
  ['data(Sprint)', ['sprintId', 'leadtime']],
];
// リードタイムの計算単位。Unixtime（秒）で計算するため、１時間単位なら６０秒 ｘ ６０分 ＝ ３６００秒を設定
const LEADTILE_UNIT = 60 * 60;
// 1時間に満たない場合にまるめる値
const LEADTILE_MIN = 0.5;

/**
 * メインロジック
 */
function main() {
  const sprintId = Number(Browser.inputBox("SprintのIDを0以上の半角数字で入力してください"));
  if(!validateInputData(sprintId)) {
    return;
  }

  // for debug
  //const sprintId = 4;

  Logger.log('指定されたスプリントのIDから過去' + MAX_SPRINT_NUM + 'スプリントのデータを集計します');
  const dashboardData = [];
  let startSprint = sprintId - MAX_SPRINT_NUM;
  if (startSprint <= 0) {
    startSprint = 1;
  }

  for(let i = startSprint; i <= sprintId; i++) {
    try {
      dashboardData.push(createDashboardData(i));
    } catch (e) {
      Logger.log(e.message);
    }
  }  

  Logger.log('export開始');
  for(let i = 0; i < exports.length; i++) {
    const sheet = prepareExportData(exports[i][0]);
    const header = exports[i][1];

    // 見出し
    sheet.appendRow(header);
    
    for(let j = 0; j < dashboardData.length; j++) {
      exportData(sheet, header, dashboardData[j][i]);
    }
  }

  Logger.log('export完了');
}

/**
 * データ集計処理。
 * IssueごとのChangelogを使ってリードタイムを集計している。
 * 集計はステータスごと、Issueごと、スプリントごとの３つ。
 * ChangelogにはItemという形でデータが複数入っているため、対象データを探す必要がある。
 * 
 * ステータスが前の段階に戻った場合はその戻ったログを無視しなければならない。
 *  例：
 *   00:00 fromString=ステージ1, toString=ステージ2
 *   01:00 fromString=ステージ2, toString=ステージ1
 *   02:00 fromString=ステージ1, toString=ステージ2
 *   03:00 fromString=ステージ2, toString=DONE
 *   この場合、ステージ１から２に一度手戻りしているため以下の計算になる。
 *     ステージ1からステージ2のリードタイム： 2時間（02:00 - 00:00 = 2)
 *     ステージ2からDONEのリードタイム： 1時間（03:00 - 02:00 = 1)
 */
function createDashboardData(sprintId) {

  // 加工するデータをここに集約していく
  const leadTimeDataByStatus = [];
  const leadTimeDataByIssue = [];
  const leadTimeDataBySprint = [];

  const resultBySprint = {};
  resultBySprint['leadtime'] = 0;
  
  // スプリントごとのIssueを取得
  const issues = getSprintIssues(sprintId);

  for (issue of issues) {
    
    debugLog(issue);

    // 対象のIssueTypeかを判定
    if (issue.fields.issuetype.name !== ISSUE_TYPE) {
      Logger.log('issueType: ' + issue.fields.issuetype.name + ' so skip it.');
      continue;
    }

    Logger.log(issue.key + '.issueType: ' + issue.fields.issuetype.name + ' so lets go!');
  
    const changeLogs = getChangeLogs(issue.key);

    // データ作成開始（Issueごと）
    const resultByIssue = {};
    resultByIssue['leadtime'] = 0;

    // ステータスが戻っていないか判定用
    let previousFrom = null;
    // 前のステータスからのリードタイム計算用
    let previousCreated = null;

    for(changeLog of changeLogs){
      
      debugLog(changeLog);

      // ステータス変更だけ集計
      // DONEの場合、ステータスと解決情報の2アイテムがItemsに同時に入るらしいので探す必要がある
      for(item of changeLog.items) {
        
        debugLog(item);

        // 前のステータスに戻っていたら無視して次へ
        if (previousFrom === item.toString) {
          debugLog('Back to previous status. skip.');
          continue;
        }
        
        // データ作成（ステータスごと）
        const resultByStatus = {};
        resultByStatus['leadtime'] = 0;

        if (item.fromString === '') {
          // fromがない場合はステータスのChangelogではないのでIssueの作成日時を設定して次に進む
          previousCreated = formatDateForSpreadsheet(issue.fields.created);
          continue;

        } else if (item.fieldId === 'status') {
          const created = formatDateForSpreadsheet(changeLog.created);
          resultByStatus['sprintId'] = sprintId;
          resultByStatus['key'] = issue.key;
          resultByStatus['summary'] = issue.fields.summary;
          resultByStatus['created'] = created;
          resultByStatus['from-to'] = item.fromString + '~' + item.toString;

          // 前のステータスとのリードタイムを計算
          const leadtime = calcLeadtimeHour(previousCreated, created);
          resultByStatus['leadtime'] = leadtime;

          previousFrom = item.fromString;
          previousCreated = created;

        } else {
          debugLog('skip this changelog. item.fieldId:' + item.fieldId);
          continue;
        }

        debugLog(resultByStatus);
        leadTimeDataByStatus.push(resultByStatus);

        resultByIssue['leadtime'] += resultByStatus['leadtime'];
      }
    }

    // データ作成（Issueごと）
    resultByIssue['sprintId'] = sprintId;
    resultByIssue['key'] = issue.key;
    resultByIssue['summary'] = issue.fields.summary;
    resultByIssue['created'] = formatDateForSpreadsheet(issue.fields.created);

    debugLog(resultByIssue);
    leadTimeDataByIssue.push(resultByIssue);
    
    resultBySprint['sprintId'] = sprintId;
    resultBySprint['leadtime'] += resultByIssue['leadtime'];
  }

  // データ作成（スプリントごと）
  debugLog(resultBySprint);
  leadTimeDataBySprint.push(resultBySprint);

  // スプリントのデータをまとめる
  return [leadTimeDataByStatus, leadTimeDataByIssue, leadTimeDataBySprint];
}

/**
 * 入直値チェック
 */
function validateInputData(sprintId) {
  if(!sprintId || sprintId <= 0) {
    const message = 'SprintのIDを0以上の半角数字で入力してください';
    Browser.msgBox(message);
    debugLog(message);
    return false;
  }

  return true;
}

/**
 * リードタイムを時間で計算
 */
function calcLeadtimeHour(start, end) {
  debugLog('[calcLeadtime] from ' + start + ' to ' + end);
  
  const startDate = getUnixtime(start);
  const endDate = getUnixtime(end);
  const leadtimeSecond = endDate - startDate;

  // 時間で計算。1時間以内は0.5時間とする
  const leadtimeHour = leadtimeSecond / LEADTILE_UNIT;
  debugLog('leadtimeHour: ' + leadtimeHour);

  // 1時間に満たない場合は0.5hに丸める
  if (leadtimeHour < 1) {
    return LEADTILE_MIN;
  } else {
    return Math.round(leadtimeHour);
  }
}

/**
 * JIRAの日付フォーマット（例： 2024-04-04T23:56:43.710+0900）ではパースできないのでUnixtimeに変換
 */
function getUnixtime(dateString) {
  const formattedString = formatDateForSpreadsheet(dateString);
  debugLog('[getUnixtime]formatDateForSpreadsheet: ' + formattedString);

  const unixtime = Date.parse(formattedString) / 1000;
  debugLog('[getUnixtime]unixtime: ' + unixtime);

  return unixtime;
}

/**
 * JIRAの日付フォーマットをSpreadsheetで扱いやすい形式に修正
 * 例： 2024-04-04T23:56:43.710+0900 => 2024-04-04 23:56:43
 */
function formatDateForSpreadsheet(dateString) {
  return dateString.replace('T', ' ').replace(/\..+/, '');;
}
/**
 * デバッグ用のログはこちらを使う
 */
function debugLog(object) {
  if (debug) {
    Logger.log(object);
  }
}

/**
 * exportデータシートを準備
 */
function prepareExportData(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (sheet) {
    debugLog('Clear export sheet.');
    sheet.clear();
    return sheet;
  } else {
    debugLog('Create export sheet.');
    return spreadsheet.insertSheet().setName(sheetName);
  }
}

/**
 * スプレッドシートへのデータ出力
 */
function exportData(sheet, headers, data) {
  debugLog('[exportData] start.');

  for(row of data) {
    const newRow = [];
    for(header of headers) {
      newRow.push(row[header]);
    }
    debugLog(newRow);
    sheet.appendRow(newRow);
  }
}

/**
 * JQLを使ってIssueを取得
 * See: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-get
 */
function getSprintIssues(sprintId) {
  const url = SEARCH_URL + '?jql=' + encodeURI('sprint=' + sprintId + ' ORDER BY created ASC');
  debugLog('[getSprintIssues] url: ' + url);
  const response = request(url);
  if(response) {
    return response.issues
  } else {
    throw new Error('Issue not found.');
  }
}

/**
 * Issueの変更履歴を取得
 * See: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-changelog-get
 */
function getChangeLogs(issueKey) {
 const url = CHANGELOG_URL + '/' + issueKey + '/changelog';
 debugLog('[getChangeLogs] url: ' + url);
 return request(url).values;
}

/**
 * JIRA Rest APIにリクエストを投げる
 */
function request(url) {
  const response = UrlFetchApp.fetch(url, REQUEST_ARGS);
  if (response) {
    const responseCode = response.getResponseCode();
    switch (responseCode) {
      case 200:
       return JSON.parse(response.getContentText());
      case 404:
        Logger.log("[request] Error: Not found." + responseCode);
        return;
      default:
        Logger.log("[request] Error: " + responseCode);
        return;
    }
  } else {
    Logger.log("[request] No response.");
    return;
  }
}
