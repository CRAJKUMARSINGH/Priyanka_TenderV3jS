const { processExcelFile } = require('./server/services/excel-processor.ts');
const path = require('path');

async function testExcel() {
  try {
    const excelPath = path.join(__dirname, 'attached_assets', 'NIT_1 work_1753073391023.xlsx');
    console.log('Testing Excel file:', excelPath);
    
    const result = await processExcelFile(excelPath);
    console.log('Processed data:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error processing Excel:', error);
  }
}

testExcel();