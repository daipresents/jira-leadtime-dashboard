import { Logger } from "./logger";
import { ResultByStatus, ResultByIssue, ResultBySprint } from "./types/common";
import { Settings } from "./settings";
import fs from "fs";

export function prepareDirectory() {
  if (!fs.existsSync(Settings.OUTPUT_DIR)) {
    fs.mkdirSync(Settings.OUTPUT_DIR);
    Logger.info(`ディレクトリが作成されました。 ${Settings.OUTPUT_DIR}`);
  } else {
    Logger.debug(`ディレクトリは既に存在します。 ${Settings.OUTPUT_DIR}`);
  }
}

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
    headerRow += `${header}${Settings.OUTPUT_SEPARATOR}`;
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
    return `${rowData.sprintId}${Settings.OUTPUT_SEPARATOR}${rowData.key}${Settings.OUTPUT_SEPARATOR}${rowData.summary}${Settings.OUTPUT_SEPARATOR}${rowData.fromTo}${Settings.OUTPUT_SEPARATOR}${rowData.leadtime}${Settings.OUTPUT_SEPARATOR}${rowData.created}`;
  } else if ("created" in rowData) {
    // ResultByIssue
    return `${rowData.sprintId}${Settings.OUTPUT_SEPARATOR}${rowData.key}${Settings.OUTPUT_SEPARATOR}${rowData.summary}${Settings.OUTPUT_SEPARATOR}${rowData.leadtime}${Settings.OUTPUT_SEPARATOR}${rowData.created}`;
  } else {
    // ResultBySprint
    return `${rowData.sprintId}${Settings.OUTPUT_SEPARATOR}${rowData.leadtime}`;
  }
}
