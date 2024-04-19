import { Logger } from "./logger";
import { ResultByStatus, ResultByIssue, ResultBySprint } from "./types/common";
import { Settings } from "./settings";
import fs from "fs";

/**
 * ヘッダを出力
 * @param fileName
 * @param headers
 */
export function exportHeaders(filePath: string, headers: Array<string>) {
  Logger.info("[exportHeaders] start.");
  Logger.debugObject("headers", headers);

  let headerRow = "";
  for(let header of headers) {
    headerRow += header;
    headerRow += "\t";
  }

  try {
    fs.writeFileSync(filePath, `${headerRow}`);
  } catch (e) {
    console.log(e);
  }

  Logger.info("[exportHeaders] end.");
}

/**
 * スプレッドシートへのデータ出力
 */
export function exportData(filePath: string, dataArray: ResultByStatus[] | ResultByIssue[] | ResultBySprint[]) {
  Logger.info("[exportData] start");
  Logger.debugObject("dataArray", dataArray);

  for(let rowData of dataArray) {
    const rowString = convertFromObjectToCSV(rowData);

    try {
      //fs.appendFileSync(filePath, rowString);

    } catch (e) {
      console.log(e);
    }
  }

  Logger.info("[exportData] end.");

}

function convertFromObjectToCSV (rowData: ResultByStatus | ResultByIssue | ResultBySprint): string {
  let rowString = "";
  for (const property in rowData) {
    //rowString += rowData[property];
    //rowString += '\t';
  }

  return "";
}
