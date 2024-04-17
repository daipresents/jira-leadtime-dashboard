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

// JIRA Issue Response
// {
//   expand: 'operations,versionedRepresentations,editmeta,changelog,customfield_10010.requestTypePractice,renderedFields',
//   id: '10000',
//   self: 'https://daipresents.atlassian.net/rest/api/3/issue/10000',
//   key: 'NLBO-1',
//   fields: {
//     statuscategorychangedate: '2024-04-04T23:39:37.147+0900',
//     issuetype: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/issuetype/10001',
//       id: '10001',
//       description: 'ユーザー目標として表明された機能。',
//       iconUrl: 'https://daipresents.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
//       name: 'ストーリー',
//       subtask: false,
//       avatarId: 10315,
//       entityId: '33e15666-9af6-421d-849b-c99c257b9f3c',
//       hierarchyLevel: 0
//     },
//     timespent: null,
//     project: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/project/10000',
//       id: '10000',
//       key: 'NLBO',
//       name: 'リードタイムを計測するためのプロジェクト',
//       projectTypeKey: 'software',
//       simplified: true,
//       avatarUrls: [Object]
//     },
//     fixVersions: [],
//     customfield_10033: null,
//     aggregatetimespent: null,
//     resolution: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/resolution/10000',
//       id: '10000',
//       description: 'この課題に対する作業は完了しました。',
//       name: '完了'
//     },
//     customfield_10036: null,
//     customfield_10037: null,
//     customfield_10027: null,
//     customfield_10028: null,
//     customfield_10029: null,
//     resolutiondate: '2024-04-04T23:39:37.141+0900',
//     workratio: -1,
//     watches: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/issue/NLBO-1/watchers',
//       watchCount: 0,
//       isWatching: false
//     },
//     lastViewed: '2024-04-10T22:49:55.556+0900',
//     created: '2024-04-04T23:34:14.135+0900',
//     customfield_10020: [ [Object], [Object], [Object] ],
//     customfield_10021: null,
//     customfield_10022: null,
//     customfield_10023: null,
//     priority: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/priority/3',
//       iconUrl: 'https://daipresents.atlassian.net/images/icons/priorities/medium.svg',
//       name: 'Medium',
//       id: '3'
//     },
//     customfield_10024: null,
//     customfield_10025: '10008_*:*_1_*:*_2618_*|*_10007_*:*_1_*:*_29211_*|*_10009_*:*_1_*:*_2003_*|*_10000_*:*_1_*:*_105946_*|*_10010_*:*_1_*:*_1505_*|*_10002_*:*_1_*:*_0_*|*_10001_*:*_1_*:*_173908_*|*_10004_*:*_1_*:*_1260_*|*_10003_*:*_1_*:*_2811_*|*_10006_*:*_1_*:*_1605_*|*_10005_*:*_1_*:*_2162',
//     customfield_10026: null,
//     labels: [],
//     customfield_10016: null,
//     customfield_10017: null,
//     customfield_10018: {
//       hasEpicLinkFieldDependency: false,
//       showField: false,
//       nonEditableReason: [Object]
//     },
//     customfield_10019: '0|hzzzzr:',
//     aggregatetimeoriginalestimate: null,
//     timeestimate: null,
//     versions: [],
//     issuelinks: [],
//     assignee: null,
//     updated: '2024-04-04T23:59:53.728+0900',
//     status: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/status/10002',
//       description: '',
//       iconUrl: 'https://daipresents.atlassian.net/',
//       name: '完了',
//       id: '10002',
//       statusCategory: [Object]
//     },
//     components: [],
//     timeoriginalestimate: null,
//     description: null,
//     customfield_10010: null,
//     customfield_10014: null,
//     customfield_10015: null,
//     customfield_10005: null,
//     customfield_10006: null,
//     security: null,
//     customfield_10007: null,
//     customfield_10008: null,
//     aggregatetimeestimate: null,
//     customfield_10009: null,
//     summary: 'AWS契約・アカウント作成',
//     creator: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/user?accountId=557058%3A27e81fdf-4993-402f-8926-60146574c86d',
//       accountId: '557058:27e81fdf-4993-402f-8926-60146574c86d',
//       emailAddress: 'daipresents@gmail.com',
//       avatarUrls: [Object],
//       displayName: 'Dai Fujihara',
//       active: true,
//       timeZone: 'Asia/Tokyo',
//       accountType: 'atlassian'
//     },
//     subtasks: [],
//     reporter: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/user?accountId=557058%3A27e81fdf-4993-402f-8926-60146574c86d',
//       accountId: '557058:27e81fdf-4993-402f-8926-60146574c86d',
//       emailAddress: 'daipresents@gmail.com',
//       avatarUrls: [Object],
//       displayName: 'Dai Fujihara',
//       active: true,
//       timeZone: 'Asia/Tokyo',
//       accountType: 'atlassian'
//     },
//     aggregateprogress: { progress: 0, total: 0 },
//     customfield_10001: null,
//     customfield_10002: null,
//     customfield_10003: null,
//     customfield_10004: null,
//     environment: null,
//     duedate: null,
//     progress: { progress: 0, total: 0 },
//     votes: {
//       self: 'https://daipresents.atlassian.net/rest/api/3/issue/NLBO-1/votes',
//       votes: 0,
//       hasVoted: false
//     }
//   }
// }
