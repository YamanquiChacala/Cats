function test() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    const tableData = [
        ['Table Title', null],
        ['Name', 'Grade'],
        ['Aby', 8.5],
        ['Bob', 9.7],
    ];

    const tableRange = sheet.getRange(1, 1, tableData.length, 2);

    tableRange.setValues(tableData);
}