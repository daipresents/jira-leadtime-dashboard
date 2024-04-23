export interface ResultBySprint {
  sprintId: number,
  leadtime: number,
};

export interface ResultByIssue {
  leadtime: number,
  sprintId: number,
  key: string,
  summary: string,
  created: string,
}

export type ResultByStatus = {
  leadtime: number,
  sprintId: number,
  key: string,
  summary: string,
  created: string,
  fromTo: string,
}

export type DashboardData= {
  sprintId: number,
  resultByStatus: ResultByStatus[],
  resultByIssue: ResultByIssue[],
  resultBySprint: ResultBySprint[],
}

export type SPREADSHEET_META_INFO = {
  sheetName: string,
  key: "resultByStatus" | "resultByIssue" | "resultBySprint",
  headers: Array<string>,
}
