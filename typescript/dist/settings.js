"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
/**
 * Please add these values to `.env` file.
 *   PROJECT_ID： JIRAプロジェクトID 例： NLBO
 *   BASE_URL： JIRA REST APIのベースURL 例： https://example.atlassian.net
 *   JIRA_USER_NAME： JIRAのユーザ名（Email) 例： example@gmail.com
 *   API_TOKEN： API_TOKEN。こちらから作成する。 https://id.atlassian.com/manage-profile/security/api-tokens
 */
const buffer_1 = require("buffer");
require("dotenv/config");
var Settings;
(function (Settings) {
    // ++++++++++
    // Sprint ID
    // ++++++++++
    Settings.SPRINT_ID = 4;
    // Debug log
    Settings.DEBUG = false;
    // JIRA
    Settings.PROJECT_ID = process.env.PROJECT_ID;
    // リードタイム対象となるIssueType
    // 将来的に複数指定できると便利だけど、そうするとIssueTypeごとにTransition設定できるので
    // IssueTypeごとに集計方法を変えなければならない
    Settings.ISSUE_TYPE = 'ストーリー';
    Settings.BASE_URL = process.env.BASE_URL;
    Settings.SEARCH_URL = Settings.BASE_URL + '/rest/api/3/search';
    Settings.CHANGELOG_URL = Settings.BASE_URL + '/rest/api/3/issue';
    Settings.TRANSITION_URL = Settings.BASE_URL + '/rest/api/3/issue';
    // Auth
    Settings.JIRA_USER_NAME = process.env.JIRA_USER_NAME;
    Settings.API_TOKEN = process.env.API_TOKEN;
    Settings.CREDENTIAL = buffer_1.Buffer.from(Settings.JIRA_USER_NAME + ":" + Settings.API_TOKEN).toString('base64');
    Settings.REQUEST_HEADERS = {
        "Authorization": `Basic ${Settings.CREDENTIAL}`,
        "Accept": "application/json",
    };
    // 集計するスプリントの数（指定したスプリントのIDから過去MAX_SPRINT_NUMだけ遡る）
    Settings.MAX_SPRINT_NUM = 10;
    // 出力するデータ情報。 ['シート名', ['見出し', '見出し'・・・]]
    Settings.SPREADSHEET_META_INFO_ARRAY = [
        {
            "sheetName": "data(Status)",
            "key": "resultByStatus",
            "headers": ["sprintId", "key", "summary", "from-to", "leadtime", "created"],
        },
        {
            "sheetName": "data(Issue)",
            "key": "resultByIssue",
            "headers": ["sprintId", "key", "summary", "leadtime", "created"],
        },
        {
            "sheetName": "data(Sprint)",
            "key": "resultByIssue",
            "headers": ["sprintId", "leadtime"],
        },
    ];
    // リードタイムの計算単位。Unixtime（秒）で計算するため、１時間単位なら６０秒 ｘ ６０分 ＝ ３６００秒を設定
    Settings.LEADTILE_UNIT = 60 * 60;
    // 1時間に満たない場合にまるめる値
    Settings.LEADTILE_MIN = 0.5;
})(Settings || (exports.Settings = Settings = {}));
