export interface JIRAIssueResponse {
  expand: string,
  startAt: number,
  maxResults: number,
  total: number,
  issues: Array,
}

export interface JIRAIssueErrorResponse {
  errorMessages: Array<string>,
  warningMessages: Array<string>,
}
export interface JIRAIssue {
  expand: string,
  id: string,
  self: string,
  key: string,
  fields: {
    summary: string,
    description: string,
    issuetype: JIRAIssuetype,
    created: string,
    updated: string,
  }
}

export interface JIRAIssuetype {
  self: string,
  id: string,
  description: string,
  iconUrl: string,
  name: string,
  subtask: boolean,
  avatarId: number,
  entityId: string,
  hierarchyLevel: number,
}

export interface JIRAChangelogResponse {
  values: JIRAChangelog[],
}

export interface JIRAChangelog {
  id: string,
  author: object,
  created: string,
  items: JIRAItem[],
}

export interface JIRAItem {
  field: string,
  fieldtype: string,
  fieldId: string
  from: string,
  fromString: string,
  to: string,
  toString: string,
}
