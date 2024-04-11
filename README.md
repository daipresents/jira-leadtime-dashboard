# jira-leadtime-dashboard-gas
GASを使ってJIRAからリードタイム情報を抜き出し、ダッシュボードを作っています。 / I am using GAS to extract lead time information from JIRA and create a dashboard.

# Settings

プロジェクトの設定 ＞ プロジェクトプロパティで以下の値を定義してください。

* PROJECT_ID： Target JIRA project ID. e.g. NLBO
* BASE_URL： JIRA REST API base url. e.g. https://example.atlassian.net
* JIRA_USER_NAME： JIRA user name(email). e.g. example@gmail.com
* API_TOKEN： API_TOKEN： Create from https://id.atlassian.com/manage-profile/security/api-tokens
