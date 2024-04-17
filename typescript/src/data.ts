import { Logger } from "./logger";
import { ResultByStatus, ResultByIssue, ResultBySprint } from "./types/common";

// /**
//  * exportデータシートを準備
//  */
// function prepareExportData(sheetName) {
//   const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
//   let sheet = spreadsheet.getSheetByName(sheetName);

//   if (sheet) {
//     debugLog('Clear export sheet.');
//     sheet.clear();
//     return sheet;
//   } else {
//     debugLog('Create export sheet.');
//     return spreadsheet.insertSheet().setName(sheetName);
//   }
// }

/**
 * スプレッドシートへのデータ出力
 */
export function exportData(sheetName: string, data: ResultByStatus[] | ResultByIssue[] | ResultBySprint[]) {
  Logger.debug(`[exportData] start. sheetName: ${sheetName}`);

  for(let row of data) {
    //console.log(row);
  }

  Logger.debug('[exportData] end.');

}

