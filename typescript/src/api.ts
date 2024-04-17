import { Logger } from './logger';
import { Settings } from './settings';
import { JIRAIssueResponse, JIRAIssueErrorResponse, JIRAIssue, JIRAChangelogResponse, JIRAChangelog } from './types/jira';

/**
 * JQLを使ってIssueを取得
 * See: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-get
 */
export async function getSprintIssues(sprintId: number): Promise<JIRAIssue[]> {
  const jql = encodeURI(`sprint = ${sprintId} ORDER BY created ASC`);
  const url = `${Settings.SEARCH_URL}?jql=${jql}`;
  const response = await request(url) as JIRAIssueResponse;

  if(response) {
    return response["issues"];
  } else {
    throw new Error(`[getSprintIssues] The response is ${response}`);
  }
}

/**
 * Issueの変更履歴を取得
 * See: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-changelog-get
 */
export async function getChangeLogs(issueKey: string): Promise<JIRAChangelog[]> {
  const url = `${Settings.CHANGELOG_URL}/${issueKey}/changelog`;
  const response = await request(url) as JIRAChangelogResponse;

  if(response) {
    return response["values"];
  } else {
    throw new Error(`[getChangeLogs] The response is ${response}`);
  }
}

/**
 * JIRA Rest APIにリクエストを投げる
 */
async function request(url: string): Promise<JIRAIssueResponse | JIRAChangelogResponse> {
  Logger.debug(`[request] fetch ${url}`);

  const response =
    await fetch(url, {
      method: 'GET',
      headers: Settings.REQUEST_HEADERS,
    });

  const responseMessage = `[request] Response: ${response.status} ${response.statusText}`;
  Logger.debugObject("responseMessage", responseMessage);

  if (response.ok) {
    const json = await response.json() as JIRAIssueResponse | JIRAChangelogResponse;
    Logger.debugObject("json", json);
    return json;

  } else if (response.status === 400) {
    const json = await response.json() as JIRAIssueErrorResponse;
    Logger.debugObject("json", json);

    throw new Error(`${responseMessage} ${json.errorMessages[0]}`);

  } else {
    throw new Error(responseMessage);
  }
}
