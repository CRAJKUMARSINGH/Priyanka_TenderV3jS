const { processExcelFile } = require('./dist/services/excel-processor');
const path = require('path');
const fs = require('fs');

async function testExcel() {
  try {
    // Test both Excel files in the TEST_FILES directory
    const testFiles = [
      'NIT_1 work.xlsx',
      'NIT_10 works.xlsx'
    ];

    for (const file of testFiles) {
      const excelPath = path.join(__dirname, 'TEST_FILES', file);
      console.log('\nTesting Excel file:', excelPath);
      
      try {
        const result = await processExcelFile(excelPath);
        console.log('Processed data:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testExcel();