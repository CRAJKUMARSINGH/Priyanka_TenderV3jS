const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testExcelUpload() {
  try {
    const filePath = path.join(__dirname, 'TEST_FILES', 'NIT_1 work.xlsx');
    const fileStream = fs.createReadStream(filePath);
    
    const formData = new FormData();
    formData.append('file', fileStream, 'NIT_1 work.xlsx');
    
    console.log('Sending request to upload Excel file...');
    console.log('Server URL: http://localhost:5000/api/upload');
    const response = await axios.post('http://localhost:5000/api/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    console.log('Upload successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error uploading file:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Make sure the server is running before executing this
testExcelUpload();
