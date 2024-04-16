/**
 * exportデータシートを準備
 */
function prepareExportData(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (sheet) {
    debugLog('Clear export sheet.');
    sheet.clear();
    return sheet;
  } else {
    debugLog('Create export sheet.');
    return spreadsheet.insertSheet().setName(sheetName);
  }
}

/**
 * スプレッドシートへのデータ出力
 */
function exportData(sheet, headers, data) {
  debugLog('[exportData] start.');

  for(row of data) {
    const newRow = [];
    for(header of headers) {
      newRow.push(row[header]);
    }
    debugLog(newRow);
    sheet.appendRow(newRow);
  }
}

