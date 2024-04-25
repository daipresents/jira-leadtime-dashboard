import { Settings } from "./settings";
import { Logger } from "./logger";
import { JIRAIssue  } from "./types/jira";
import {ResultByStatus, ResultByIssue, ResultBySprint, DashboardData } from "./types/common";
import { formatDateForSpreadsheet, calcLeadtimeHour } from "./leadtime";
import { getSprintIssues, getChangeLogs } from "./api";
import { prepareDirectory, exportData, exportHeaders } from "./data";
import { BadRequestError } from "./errors/bad-request-error";

main();


/**
 * メインロジック
 *   1. 集計
 *   2. エクスポート
 */
async function main() {

  const sprintId = Settings.SPRINT_ID;

  Logger.info(`指定されたスプリントのID: ${Settings.SPRINT_ID} から過去${Settings.MAX_SPRINT_NUM}スプリントのデータを集計します`);

  const dashboardData: DashboardData[] = [];

  let startSprint = sprintId - Settings.MAX_SPRINT_NUM;
  if (startSprint <= 0) {
    startSprint = 1;
  }

  Logger.info("集計開始");

  for(let i = startSprint; i <= sprintId; i++) {
    Logger.info(`sprintId: ${i}`);
    try {
      const data = await createDashboardData(i);
      if (data) {
        dashboardData.push(data);
      }
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        Logger.warn(error.message);
      } else {
        Logger.error(error.message);
      }
    }
  }

  Logger.info("集計完了");
  Logger.info("エクスポート開始");

  for (let i = 0; i < Settings.SPREADSHEET_META_INFO_ARRAY.length; i++) {
    const metaInfo = Settings.SPREADSHEET_META_INFO_ARRAY[i];
    Logger.debugObject("metaInfo", metaInfo);

    const fileName: string = metaInfo["sheetName"];
    const key = metaInfo["key"];
    const headers: Array<string> = metaInfo["headers"];

    const filePath = `${Settings.OUTPUT_DIR}/${fileName}.tsv`;
    Logger.debug(filePath);

    // ディレクトリ作成
    prepareDirectory();

    // ヘッダの書き出し
    exportHeaders(filePath, headers);

    // データの書き出し
    for(let j = 0; j < dashboardData.length; j++) {
      exportData(filePath, dashboardData[j][key]);
    }
  }

  Logger.info("エクスポート完了");


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
  async function createDashboardData(sprintId: number): Promise<DashboardData | null>{

    // 加工するデータをここに集約していく
    const leadTimeDataByStatus: Array<ResultByStatus> = [];
    const leadTimeDataByIssues: Array<ResultByIssue> = [];
    const leadTimeDataBySprint: Array<ResultBySprint> = [];

    const resultBySprint = {
      sprintId: 0,
      leadtime: 0,
    };

    // スプリントごとのIssueを取得
    const issues: JIRAIssue[] = await getSprintIssues(sprintId);
    if (!issues) {
      const message = `sprintId: ${sprintId} is no issue: ${issues}`;
      Logger.warn(message);
      return null;
    }

    for (let issue of issues) {

      // 対象のプロジェクトではなかったら次のスプリントへ
      if (!issue.key.includes(Settings.PROJECT_ID as string)) {
        const message = `[SKIP] target: ${Settings.PROJECT_ID} but the key is ${issue.key} so skip it.`;
        Logger.warn(message);
        return null;
      }

      // 対象のIssueTypeかを判定
      if (issue.fields.issuetype.name !== Settings.ISSUE_TYPE) {
        Logger.debug(`[SKIP] issueType: ${issue.fields.issuetype.name} so skip it.`);
        continue;
      }

      const changeLogs = await getChangeLogs(issue.key);
      if (!changeLogs) {
        const message = `sprintId: ${sprintId}, key: ${issue.key} is no changeLog: ${changeLogs}`;
        Logger.warn(message);
        continue;
      }

      // データ作成開始（Issueごと）
      const resultByIssue: ResultByIssue = {
        leadtime: 0,
        sprintId: sprintId,
        key: "",
        summary: "",
        created: "",
      };

      // ステータスが戻っていないか判定用
      let previousFrom = null;
      // 前のステータスからのリードタイム計算用
      let previousCreated: string = "";

      for(let changeLog of changeLogs){
        Logger.debugObject("changelog", changeLog);

        // ステータス変更だけ集計
        // DONEの場合、ステータスと解決情報の2アイテムがItemsに同時に入るらしいので探す必要がある
        for(let item of changeLog.items) {
          Logger.debugObject("item", item);

          // 前のステータスに戻っていたら無視して次へ
          if (previousFrom === item.toString) {
            Logger.warn(`[SKIP] This ticket has its status changed to the previous status. key: ${issue.key}, status from ${item.fromString} to ${item.toString}.`);
            continue;
          }

          // データ作成（ステータスごと）
          const resultByStatus: ResultByStatus = {
            leadtime: 0,
            sprintId: sprintId,
            key: "",
            summary: "",
            created: "",
            fromTo: "",
          };

          if (item.fromString === "") {
            // fromがない場合はステータスのChangelogではないのでIssueの作成日時を設定して次に進む
            previousCreated = formatDateForSpreadsheet(issue.fields.created);
            continue;

          } else if (item.fieldId === "status") {
            const created = formatDateForSpreadsheet(changeLog.created);
            resultByStatus.key = issue.key;
            resultByStatus.summary = issue.fields.summary;
            resultByStatus.created = created;
            resultByStatus.fromTo = `from ${item.fromString} to ${item.toString}`;

            // 前のステータスとのリードタイムを計算
            const leadtime = calcLeadtimeHour(previousCreated, created);
            resultByStatus.leadtime = leadtime;

            previousFrom = item.fromString;
            previousCreated = created;

          } else {
            Logger.warn(`[SKIP] this changelog. item.fieldId: ${item.fieldId}`);
            continue;
          }

          Logger.debugObject("resultbyStatus", resultByStatus);
          leadTimeDataByStatus.push(resultByStatus);

          resultByIssue.leadtime += resultByStatus.leadtime;
        }
      }

      if (!leadTimeDataByStatus.length) {
        const message = `[SKIP] Array of Leadtime by status is zero.`;
        Logger.warn(message);
        return null;
      }

      // データ作成（Issueごと）
      resultByIssue.sprintId = sprintId;
      resultByIssue.key = issue.key;
      resultByIssue.summary = issue.fields.summary;
      resultByIssue.created = formatDateForSpreadsheet(issue.fields.created);

      Logger.debugObject("resultByIssue", resultByIssue);
      leadTimeDataByIssues.push(resultByIssue);

      resultBySprint.sprintId = sprintId;
      resultBySprint.leadtime += resultByIssue.leadtime;
    }

    // データ作成（スプリントごと）
    Logger.debugObject("resultBySprint", resultBySprint);
    if (!resultBySprint.sprintId) {
      leadTimeDataBySprint.push(resultBySprint);
    }

    const dashboardData: DashboardData = {
      "sprintId": sprintId,
      "resultByStatus": leadTimeDataByStatus,
      "resultByIssue": leadTimeDataByIssues,
      "resultBySprint": leadTimeDataBySprint,
    }

    return dashboardData;
  }
}
