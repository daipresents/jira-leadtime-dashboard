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
