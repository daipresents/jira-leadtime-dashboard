import { Logger } from "./logger";
import { ResultByStatus, ResultByIssue, ResultBySprint } from "./types/common";
import fs from "fs";

/**
 * ヘッダを出力
 * @param fileName
 * @param headers
 */
export function exportHeaders(filePath: string, headers: Array<string>) {
  Logger.debug("[exportHeaders] start.");
  Logger.debugObject("headers", headers);

  let headerRow = "";
  for(let header of headers) {
    headerRow += `${header}\t`;
  }

  try {
    fs.writeFileSync(filePath, `${headerRow}\n`);
  } catch (e) {
    console.log(e);
  }

  Logger.debug("[exportHeaders] end.");
}

/**
 * スプレッドシートへのデータ出力
 */
export function exportData(filePath: string, dataArray: ResultByStatus[] | ResultByIssue[] | ResultBySprint[]) {
  Logger.debug("[exportData] start");
  Logger.debugObject("dataArray", dataArray);

  for(let rowData of dataArray) {
    const rowString = convertFromObjectToCSV(rowData);
    Logger.debug(rowString);

    try {
      fs.appendFileSync(filePath, `${rowString}\n`);

    } catch (e) {
      console.log(e);
    }
  }

  Logger.debug("[exportData] end.");

}

function convertFromObjectToCSV (rowData: ResultByStatus | ResultByIssue | ResultBySprint): string {
  if ("fromTo" in rowData) {
    // ResultByStatus
    return `${rowData.sprintId}\t${rowData.key}\t${rowData.summary}\t${rowData.fromTo}\t${rowData.leadtime}\t${rowData.created}`;
  } else if ("created" in rowData) {
    // ResultByIssue
    return `${rowData.sprintId}\t${rowData.key}\t${rowData.summary}\t${rowData.leadtime}\t${rowData.created}`;
  } else {
    // ResultBySprint
    return `${rowData.sprintId}\t${rowData.leadtime}`;
  }
}
