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
