import { Logger } from "./logger";
import { Settings } from "./settings";

/**
 * リードタイムを時間で計算
 */
export function calcLeadtimeHour(start: string, end: string) {
  Logger.debug(`[calcLeadtime] from ${start} to ${end}`);

  const startDate = getUnixtime(start);
  const endDate = getUnixtime(end);
  const leadtimeSecond = endDate - startDate;

  // 時間で計算。1時間以内は0.5時間とする
  const leadtimeHour = leadtimeSecond / Settings.LEADTILE_UNIT;
  Logger.debug(`leadtimeHour: ${leadtimeHour}`);

  // 1時間に満たない場合は0.5hに丸める
  if (leadtimeHour < 1) {
    return Settings.LEADTILE_MIN;
  } else {
    return Math.round(leadtimeHour);
  }
}

/**
 * JIRAの日付フォーマット（例： 2024-04-04T23:56:43.710+0900）ではパースできないのでUnixtimeに変換
 */
function getUnixtime(dateString: string) {
  const formattedString = formatDateForSpreadsheet(dateString);
  Logger.debug(`[getUnixtime]formatDateForSpreadsheet: ${formattedString}`);

  const unixtime = Date.parse(formattedString) / 1000;
  Logger.debug(`[getUnixtime]unixtime: ${unixtime}`);

  return unixtime;
}

/**
 * JIRAの日付フォーマットをSpreadsheetで扱いやすい形式に修正
 * 例： 2024-04-04T23:56:43.710+0900 => 2024-04-04 23:56:43
 */
export function formatDateForSpreadsheet(dateString: string) {
  return dateString.replace("T", " ").replace(/\..+/, "");;
}
