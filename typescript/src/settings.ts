import 'dotenv/config'
import { Buffer } from 'buffer';
require('dotenv').config()

/**
 * 設定。
 * .envで以下の値を定義してください。
 *   PROJECT_ID： JIRAプロジェクトID 例： NLBO
 *   BASE_URL： JIRA REST APIのベースURL 例： https://example.atlassian.net
 *   JIRA_USER_NAME： JIRAのユーザ名（Email) 例： example@gmail.com
 *   API_TOKEN： API_TOKEN。こちらから作成する。 https://id.atlassian.com/manage-profile/security/api-tokens
 */


// デバッグ
const debug = false;

// JIRA
const PROJECT_ID = process.env.PROJECT_ID;
// リードタイム対象となるIssueType
// 将来的に複数指定できると便利だけど、そうするとIssueTypeごとにTransition設定できるので
// IssueTypeごとに集計方法を変えなければならない
const ISSUE_TYPE = 'ストーリー';
const BASE_URL = process.env.BASE_URL;
const SEARCH_URL = BASE_URL + '/rest/api/3/search';
const CHANGELOG_URL = BASE_URL + '/rest/api/3/issue';
const TRANSITION_URL = BASE_URL + '/rest/api/3/issue';

// Auth
const JIRA_USER_NAME = process.env.JIRA_USER_NAME;
const API_TOKEN = process.env.API_TOKEN;

const org = 'user1:password-goes-here!';
console.log( `original = ${org}`);

const CREDENTIAL = Buffer.from(JIRA_USER_NAME + ":" + API_TOKEN).toString('base64') ;
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
