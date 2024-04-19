export interface ResultBySprint {
  "sprintId": number,
  "leadtime": number,
};

export interface ResultByIssue {
  "leadtime": number,
  "sprintId": number,
  "key": string,
  "summary": string,
  "created": string,
}

export interface ResultByStatus {
  "leadtime": number,
  "sprintId": number,
  "key": string,
  "summary": string,
  "created": string,
  "from-to": string,
}

export interface DashboardData {
  "sprintId": number,
  "resultByStatus": ResultByStatus[],
  "resultByIssue": ResultByIssue[],
  "resultBySprint": ResultBySprint[],
}

export interface SPREADSHEET_META_INFO {
  "sheetName": string,
  "key": "resultByStatus" | "resultByIssue" | "resultBySprint",
  "headers": Array<string>,
}
