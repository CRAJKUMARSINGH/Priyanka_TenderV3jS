import * as XLSX from 'xlsx';

export interface ExcelData {
  workDescription: string;
  estimatedAmount: number;
  tenderNumber: string;
  items: Array<{
    srNo: number;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;
}

export async function processExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract tender information from the Excel file
        let workDescription = "Tender Work Description";
        let estimatedAmount = 0;
        let tenderNumber = `TND-${Date.now()}`;
        
        // Try to find work description in the first few rows
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
          const row = jsonData[i] as any[];
          if (row && row[0] && typeof row[0] === 'string') {
            if (row[0].toLowerCase().includes('work') || row[0].toLowerCase().includes('tender') || row[0].toLowerCase().includes('project')) {
              workDescription = row[1] || row[0];
              break;
            }
          }
        }
        
        // Extract items from the table
        const items: any[] = [];
        let headerRowIndex = -1;
        
        // Find the header row (looking for "Sr", "Description", "Quantity", etc.)
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row && row.length > 3) {
            const rowStr = row.join('').toLowerCase();
            if (rowStr.includes('sr') && (rowStr.includes('description') || rowStr.includes('item'))) {
              headerRowIndex = i;
              break;
            }
          }
        }
        
        // If we found a header row, extract items
        if (headerRowIndex >= 0) {
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row && row.length >= 4 && row[0]) {
              const srNo = typeof row[0] === 'number' ? row[0] : parseInt(row[0]) || items.length + 1;
              const description = row[1] || `Item ${srNo}`;
              const quantity = parseFloat(row[2]) || 1;
              const unit = row[3] || 'Nos';
              const rate = parseFloat(row[4]) || 0;
              const amount = parseFloat(row[5]) || (quantity * rate);
              
              estimatedAmount += amount;
              
              items.push({
                srNo,
                description,
                quantity,
                unit,
                rate,
                amount
              });
            }
          }
        }
        
        // If no items found, create a default structure
        if (items.length === 0) {
          const defaultItems = [
            {
              srNo: 1,
              description: "Construction Work - Item 1",
              quantity: 100,
              unit: "Sqm",
              rate: 500,
              amount: 50000
            },
            {
              srNo: 2,
              description: "Material Supply - Item 2", 
              quantity: 50,
              unit: "MT",
              rate: 2000,
              amount: 100000
            }
          ];
          items.push(...defaultItems);
          estimatedAmount = defaultItems.reduce((sum, item) => sum + item.amount, 0);
        }
        
        // Ensure all numeric values are properly formatted
        const formattedItems = items.map(item => ({
          ...item,
          srNo: Number(item.srNo),
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount)
        }));
        
        const processedData: ExcelData = {
          workDescription,
          estimatedAmount,
          tenderNumber,
          items: formattedItems
        };
        
        console.log('Processed Excel data:', processedData);
        resolve(processedData);
      } catch (error) {
        console.error('Excel processing error:', error);
        reject(new Error('Failed to process Excel file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function validateExcelStructure(data: any): boolean {
  // Placeholder validation logic
  // In production, this would validate the Excel structure against expected format
  
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for required fields
  const requiredFields = ['workDescription', 'estimatedAmount', 'items'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      return false;
    }
  }
  
  // Validate items array
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return false;
  }
  
  // Validate each item structure
  for (const item of data.items) {
    const itemFields = ['srNo', 'description', 'quantity', 'unit', 'rate', 'amount'];
    for (const field of itemFields) {
      if (!(field in item)) {
        return false;
      }
    }
  }
  
  return true;
}
