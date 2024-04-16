/**
 * リードタイムを時間で計算
 */
function calcLeadtimeHour(start, end) {
  debugLog('[calcLeadtime] from ' + start + ' to ' + end);
  
  const startDate = getUnixtime(start);
  const endDate = getUnixtime(end);
  const leadtimeSecond = endDate - startDate;

  // 時間で計算。1時間以内は0.5時間とする
  const leadtimeHour = leadtimeSecond / LEADTILE_UNIT;
  debugLog('leadtimeHour: ' + leadtimeHour);

  // 1時間に満たない場合は0.5hに丸める
  if (leadtimeHour < 1) {
    return LEADTILE_MIN;
  } else {
    return Math.round(leadtimeHour);
  }
}

/**
 * JIRAの日付フォーマット（例： 2024-04-04T23:56:43.710+0900）ではパースできないのでUnixtimeに変換
 */
function getUnixtime(dateString) {
  const formattedString = formatDateForSpreadsheet(dateString);
  debugLog('[getUnixtime]formatDateForSpreadsheet: ' + formattedString);

  const unixtime = Date.parse(formattedString) / 1000;
  debugLog('[getUnixtime]unixtime: ' + unixtime);

  return unixtime;
}

/**
 * JIRAの日付フォーマットをSpreadsheetで扱いやすい形式に修正
 * 例： 2024-04-04T23:56:43.710+0900 => 2024-04-04 23:56:43
 */
function formatDateForSpreadsheet(dateString) {
  return dateString.replace('T', ' ').replace(/\..+/, '');;
}
/**
 * デバッグ用のログはこちらを使う
 */
function debugLog(object) {
  if (debug) {
    Logger.log(object);
  }
}
