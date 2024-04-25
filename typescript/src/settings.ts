import { SPREADSHEET_META_INFO } from "./types/common";

/**
 * Please add these values to `.env` file.
 *   PROJECT_ID： JIRAプロジェクトID 例： NLBO
 *   BASE_URL： JIRA REST APIのベースURL 例： https://example.atlassian.net
 *   JIRA_USER_NAME： JIRAのユーザ名（Email) 例： example@gmail.com
 *   API_TOKEN： API_TOKEN。こちらから作成する。 https://id.atlassian.com/manage-profile/security/api-tokens
 */
import { Buffer } from "buffer";
import "dotenv/config"

export namespace Settings {

  // ++++++++++
  // Sprint ID
  // ++++++++++
  export const SPRINT_ID = 4;
  // The script will tally the sprints going back from this value by MAX_SPRINT_NUM (default is 10).
  export const MAX_SPRINT_NUM = 10;

  // Log level: "DEBUG", "INFO", "WARN", "ERROR"
  export const LOG_LEVEL = "INFO";

  // JIRA
  export const PROJECT_ID = process.env.PROJECT_ID;

  // リードタイム対象となるIssueType
  // 将来的に複数指定できると便利だけど、そうするとIssueTypeごとにTransition設定できるので
  // IssueTypeごとに集計方法を変えなければならない
  export const ISSUE_TYPE = "ストーリー";
  export const BASE_URL = process.env.BASE_URL;
  export const SEARCH_URL = BASE_URL + "/rest/api/3/search";
  export const CHANGELOG_URL = BASE_URL + "/rest/api/3/issue";
  export const TRANSITION_URL = BASE_URL + "/rest/api/3/issue";

  // Auth
  export const JIRA_USER_NAME = process.env.JIRA_USER_NAME;
  export const API_TOKEN = process.env.API_TOKEN;
  export const CREDENTIAL = Buffer.from(JIRA_USER_NAME + ":" + API_TOKEN).toString("base64") ;
  export const REQUEST_HEADERS = {
      "Authorization": `Basic ${CREDENTIAL}`,
      "Accept": "application/json",
  };

  // 出力するデータ情報。 ["シート名", ["見出し", "見出し"・・・]]
  export const SPREADSHEET_META_INFO_ARRAY: Array<SPREADSHEET_META_INFO> = [
    {
      "sheetName": "data(Status)",
      "key": "resultByStatus",
      "headers":  ["sprintId", "key", "summary", "fromTo", "leadtime", "created"],
    },
    {
      "sheetName": "data(Issue)",
      "key": "resultByIssue",
      "headers": ["sprintId", "key", "summary", "leadtime", "created"],
    },
    {
      "sheetName": "data(Sprint)",
      "key": "resultBySprint",
      "headers": ["sprintId", "leadtime"],
    },
  ];

  // リードタイムの計算単位。Unixtime（秒）で計算するため、１時間単位なら６０秒 ｘ ６０分 ＝ ３６００秒を設定
  export const LEADTILE_UNIT = 60 * 60;
  // 1時間に満たない場合にまるめる値
  export const LEADTILE_MIN = 0.5;

  // Output
  export const OUTPUT_SEPARATOR = "\t";
  export const OUTPUT_DIR = "./tsv";
}
