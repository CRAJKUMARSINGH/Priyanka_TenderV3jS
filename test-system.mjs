import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test the Excel processing and document generation
async function testSystem() {
  try {
    // First test: Try to send a multipart form request to the upload endpoint
    const FormData = require('form-data');
    const fs = require('fs');
    const fetch = require('node-fetch');
    
    console.log('🔄 Testing PWD Document Generation System...');
    
    // Create form data with the Excel file
    const form = new FormData();
    const filePath = join(__dirname, 'uploads', 'test.xlsx');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Test file not found');
      return;
    }
    
    const fileStream = fs.createReadStream(filePath);
    form.append('excelFile', fileStream, 'test.xlsx');
    
    console.log('📤 Uploading Excel file...');
    
    const uploadResponse = await fetch('http://localhost:5000/api/upload-excel', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log('❌ Upload failed:', errorText);
      return;
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful!');
    console.log('📊 Extracted data:', JSON.stringify(uploadResult.data, null, 2));
    
    // Test document generation
    const tenderId = uploadResult.data.id;
    console.log('📄 Generating documents for tender ID:', tenderId);
    
    const generateResponse = await fetch(`http://localhost:5000/api/generate-documents/${tenderId}`, {
      method: 'POST'
    });
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.log('❌ Document generation failed:', errorText);
      return;
    }
    
    const blob = await generateResponse.buffer();
    console.log('✅ Documents generated successfully!');
    console.log(`📦 ZIP file size: ${blob.length} bytes`);
    
    // Save the generated ZIP file
    fs.writeFileSync('test-output.zip', blob);
    console.log('💾 Documents saved as test-output.zip');
    
    console.log('🎉 System test completed successfully!');
    
  } catch (error) {
    console.error('❌ System test failed:', error);
  }
}

testSystem().catch(console.error);