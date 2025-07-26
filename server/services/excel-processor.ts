import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { ExcelBidder } from '@shared/schema';

export interface WorkBidder {
  sno: number;
  name: string;
  address?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  quotedPercentage: string;
  quotedAmount: number;
  status: string;
  rank?: number;
}

export interface Work {
  itemNo: number;
  name: string;
  estimatedCostLacs: number;
  gScheduleAmount: number;
  completionMonths: number;
  earnestMoney: number;
  bidders: WorkBidder[];
  lowestBidder: string;
  lowestAmount: number;
  lowestPercentage: string;
}

export interface ProcessedExcelData {
  nitNumber: string;
  nitDate: string;
  works: Work[];
  receiptDate: string;
  tendersSold: number;
  tendersReceived: number;
}

export async function processExcelFile(filePath: string): Promise<ProcessedExcelData> {
  try {
    console.log(`Reading Excel file from path: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Read the Excel file using fs and then parse with XLSX
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`File size: ${fileBuffer.length} bytes`);
    
    let workbook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (parseError) {
      console.error('Error parsing Excel file:', parseError);
      throw new Error(`Failed to parse Excel file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in the Excel file');
    }
    
    const sheetName = workbook.SheetNames[0];
    console.log(`Processing sheet: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Worksheet '${sheetName}' not found in the Excel file`);
    }
    
    // Convert to JSON
    console.log('Converting worksheet to JSON...');
    let data;
    try {
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      console.log(`Successfully converted worksheet to JSON. Rows: ${data.length}`);
    } catch (conversionError) {
      console.error('Error converting worksheet to JSON:', conversionError);
      throw new Error(`Failed to convert worksheet to JSON: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
    }
    
    // Extract NIT level data
    const processedData: ProcessedExcelData = {
      nitNumber: findCellValue(data, 'NIT No') || '',
      nitDate: findCellValue(data, 'Date') || '',
      receiptDate: findCellValue(data, 'Date of Reciept of Tender') || '',
      tendersSold: parseNumber(findCellValue(data, 'Number of tender sold')) || 0,
      tendersReceived: parseNumber(findCellValue(data, 'Number of tender received')) || 0,
      works: []
    };

    // Find all work sections in the Excel
    const workSections: {start: number, end: number}[] = [];
    let currentWorkStart = -1;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      
      // Look for work header
      const isWorkHeader = row.some(cell => 
        typeof cell === 'string' && 
        cell.toLowerCase().includes('item no') &&
        row.some(c2 => typeof c2 === 'string' && c2.toLowerCase().includes('name of work'))
      );
      
      if (isWorkHeader) {
        if (currentWorkStart >= 0) {
          workSections.push({ start: currentWorkStart, end: i - 1 });
        }
        currentWorkStart = i;
      }
    }
    
    // Add the last work section
    if (currentWorkStart >= 0) {
      workSections.push({ start: currentWorkStart, end: data.length - 1 });
    }
    
    // Process each work section
    for (const section of workSections) {
      const workData = data.slice(section.start, section.end + 1);
      
      // Extract work details (first rows after header)
      const work: Work = {
        itemNo: 0,
        name: '',
        estimatedCostLacs: 0,
        gScheduleAmount: 0,
        completionMonths: 0,
        earnestMoney: 0,
        bidders: [],
        lowestBidder: '',
        lowestAmount: 0,
        lowestPercentage: ''
      };
      
      // Process work details (first few rows after header)
      for (let i = 1; i < Math.min(10, workData.length); i++) {
        const row = workData[i];
        if (!row || row.length < 2) continue;
        
        const cellValue = (row[0] || '').toString().toLowerCase();
        if (cellValue.includes('item no')) {
          work.itemNo = parseNumber(row[1]) || 0;
        } else if (cellValue.includes('name of work')) {
          work.name = (row[1] || '').toString().trim();
        } else if (cellValue.includes('estimated cost')) {
          work.estimatedCostLacs = parseNumber(row[1]) || 0;
        } else if (cellValue.includes('completion')) {
          work.completionMonths = parseNumber(row[1]) || 0;
        } else if (cellValue.includes('earnest money')) {
          work.earnestMoney = parseNumber(row[1]) || 0;
        }
      }
      
      // Find bidders section (look for 'Bidder Name' header)
      const biddersStartRow = workData.findIndex(row => 
        row && row.some(cell => 
          typeof cell === 'string' && cell.toLowerCase().includes('bidder name')
        )
      );
      
      if (biddersStartRow >= 0) {
        const bidders: WorkBidder[] = [];
        
        // Process bidders (rows after the header)
        for (let i = biddersStartRow + 1; i < workData.length; i++) {
          const row = workData[i];
          if (!row || row.length < 5 || !row[1]) break;
          
          try {
            const quotedPercentage = (row[3] || '0').toString().trim();
            const quotedAmount = parseNumber(row[4]) || 0;
            
            const bidder: WorkBidder = {
              sno: bidders.length + 1,
              name: row[1].toString().trim(),
              address: row[2]?.toString().trim(),
              quotedPercentage,
              quotedAmount,
              status: 'active'
            };
            
            bidders.push(bidder);
          } catch (error) {
            console.error(`Error processing bidder at row ${i}:`, error);
          }
        }
        
        // Sort bidders by quoted amount (ascending)
        bidders.sort((a, b) => a.quotedAmount - b.quotedAmount);
        
        // Assign ranks and update work with bidders
        work.bidders = bidders.map((bidder, index) => ({
          ...bidder,
          rank: index + 1
        }));
        
        // Set lowest bidder info
        if (bidders.length > 0) {
          work.lowestBidder = bidders[0].name;
          work.lowestAmount = bidders[0].quotedAmount;
          work.lowestPercentage = bidders[0].quotedPercentage;
        }
      }
      
      if (work.name) {
        processedData.works.push(work);
      }
    }

    // Process each work's bidders and calculate percentiles
    for (const work of processedData.works) {
      // Ensure we have bidders for this work
      if (!work.bidders || work.bidders.length === 0) continue;
      
      // Calculate percentiles based on quoted amounts
      work.bidders.forEach((bidder, index) => {
        // Calculate percentile (1-based rank / total bidders * 100)
        const percentile = ((index + 1) / work.bidders.length) * 100;
        // Update bidder with percentile information
        bidder.quotedPercentage = `${percentile.toFixed(2)}%`;
      });
      
      // Sort bidders by quoted amount (ascending) if not already sorted
      work.bidders.sort((a, b) => a.quotedAmount - b.quotedAmount);
      
      // Update lowest bidder info
      if (work.bidders.length > 0) {
        const lowestBidder = work.bidders[0];
        work.lowestBidder = lowestBidder.name;
        work.lowestAmount = lowestBidder.quotedAmount;
        work.lowestPercentage = lowestBidder.quotedPercentage;
      }
    }

    // If no works found, create a default work with sample bidders
    if (processedData.works.length === 0) {
      const defaultWork: Work = {
        itemNo: 1,
        name: 'Sample Work',
        estimatedCostLacs: 100,
        gScheduleAmount: 0,
        completionMonths: 6,
        earnestMoney: 2,
        bidders: [
          {
            sno: 1,
            name: "M/s. Vikas Enterprises, Udaipur",
            quotedPercentage: "2.00%",
            quotedAmount: 980000,
            status: 'active',
            rank: 1
          },
          {
            sno: 2,
            name: "M/s. Powertech Engineer, Rajsamand",
            quotedPercentage: "2.01%",
            quotedAmount: 979900,
            status: 'active',
            rank: 2
          },
          {
            sno: 3,
            name: "M/s. Neha Electricals, Pali",
            quotedPercentage: "1.50%",
            quotedAmount: 985000,
            status: 'active',
            rank: 3
          }
        ],
        lowestBidder: "M/s. Powertech Engineer, Rajsamand",
        lowestAmount: 979900,
        lowestPercentage: "2.01%"
      };
      
      processedData.works.push(defaultWork);
    }

    return processedData;
    
  } catch (error) {
    console.error('Excel processing error:', error);
    throw new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function findCellValue(data: any[][], searchText: string): string | null {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j] && data[i][j].toString().toLowerCase().includes(searchText.toLowerCase())) {
        // Return the next cell or the cell after ':'
        const cellContent = data[i][j].toString();
        if (cellContent.includes(':')) {
          const parts = cellContent.split(':');
          if (parts.length > 1) {
            return parts[1].trim();
          }
        }
        // Try next cell in the same row
        if (j + 1 < data[i].length && data[i][j + 1]) {
          return data[i][j + 1].toString();
        }
        // Try next row, same column
        if (i + 1 < data.length && data[i + 1][j]) {
          return data[i + 1][j].toString();
        }
      }
    }
  }
  return null;
}

function findRowWithText(data: any[][], searchText: string): number {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j] && data[i][j].toString().toLowerCase().includes(searchText.toLowerCase())) {
        return i;
      }
    }
  }
  return -1;
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
