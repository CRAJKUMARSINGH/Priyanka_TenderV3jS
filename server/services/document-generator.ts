import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType } from 'docx';
import puppeteer from 'puppeteer';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { TenderData, type IStorage } from '@shared/schema';

export async function generateAllDocuments(tenderData: TenderData, storage: IStorage): Promise<string> {
  const outputDir = path.join(process.cwd(), 'generated_docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const documentsPath: string[] = [];

  // Generate all 4 documents in both formats
  const documents = [
    { type: 'comparative', generator: generateComparativeStatement },
    { type: 'scrutiny', generator: generateScrutinySheet },
    { type: 'work_order', generator: generateWorkOrder },
    { type: 'acceptance', generator: generateAcceptanceLetter }
  ];

  for (const doc of documents) {
    // Generate DOC format
    const docPath = await doc.generator(tenderData, 'doc', outputDir);
    documentsPath.push(docPath);
    
    // Generate PDF format
    const pdfPath = await doc.generator(tenderData, 'pdf', outputDir);
    documentsPath.push(pdfPath);

    // Store in memory storage
    await storage.createGeneratedDocument({
      tenderId: tenderData.id,
      docType: doc.type,
      format: 'doc',
      filePath: docPath
    });
    
    await storage.createGeneratedDocument({
      tenderId: tenderData.id,
      docType: doc.type,
      format: 'pdf',
      filePath: pdfPath
    });
  }

  // Create ZIP file
  const zip = new JSZip();
  
  for (const filePath of documentsPath) {
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    zip.file(fileName, fileBuffer);
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  const zipPath = path.join(outputDir, `PWD_Documents_${tenderData.nitNumber}_${Date.now()}.zip`);
  fs.writeFileSync(zipPath, zipBuffer);

  // Clean up individual files
  documentsPath.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  return zipPath;
}

async function generateComparativeStatement(tenderData: TenderData, format: 'doc' | 'pdf', outputDir: string): Promise<string> {
  const fileName = `Comparative_Statement_${tenderData.nitNumber}.${format}`;
  const filePath = path.join(outputDir, fileName);

  if (format === 'doc') {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'landscape'
            }
          }
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "OFFICE OF THE EXECUTIVE ENGINEER PWD ELECTRIC DIVISION, UDAIPUR",
                bold: true,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "COMPARATIVE STATEMENT OF TENDERS",
                bold: true,
                size: 22
              })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: `Name of Work: ${tenderData.workName}` })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `NIT No.: ${tenderData.nitNumber}` }),
              new TextRun({ text: `     Date: ${tenderData.nitDate}     ITEM-1` })
            ]
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("S.No")] }),
                  new TableCell({ children: [new Paragraph("Bidder Name")] }),
                  new TableCell({ children: [new Paragraph("Estimated Cost Rs.")] }),
                  new TableCell({ children: [new Paragraph("Quoted Percentage")] }),
                  new TableCell({ children: [new Paragraph("Quoted Amount Rs.")] })
                ]
              }),
              ...(tenderData.bidders as any[]).map((bidder: any) => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(bidder.sno.toString())] }),
                    new TableCell({ children: [new Paragraph(bidder.name)] }),
                    new TableCell({ children: [new Paragraph(bidder.estimatedCost.toString())] }),
                    new TableCell({ children: [new Paragraph(bidder.quotedPercentage)] }),
                    new TableCell({ children: [new Paragraph(bidder.quotedAmount.toString())] })
                  ]
                })
              )
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Lowest Amount Quoted BY: ${tenderData.lowestBidder}     ${tenderData.lowestPercentage}     ${tenderData.lowestAmount}`,
                bold: true
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 60, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.RIGHT,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("AR")] }),
                  new TableCell({ children: [new Paragraph("DA")] }),
                  new TableCell({ children: [new Paragraph("TA")] }),
                  new TableCell({ children: [new Paragraph("EE")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] })
                ]
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Auditor                    Divisional Accountant                    TA                    Executive Engineer" })
            ]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
  } else {
    // Generate PDF using Puppeteer
    await generatePDF(getComparativeHTML(tenderData), filePath, true);
  }

  return filePath;
}

async function generateScrutinySheet(tenderData: TenderData, format: 'doc' | 'pdf', outputDir: string): Promise<string> {
  const fileName = `Scrutiny_Sheet_${tenderData.nitNumber}.${format}`;
  const filePath = path.join(outputDir, fileName);

  if (format === 'doc') {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Scrutiny Sheet of Tender",
                bold: true,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("1")] }),
                  new TableCell({ children: [new Paragraph("Head of Account")] }),
                  new TableCell({ children: [new Paragraph("8443")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("2")] }),
                  new TableCell({ children: [new Paragraph("Name of work")] }),
                  new TableCell({ children: [new Paragraph(tenderData.workName)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("3")] }),
                  new TableCell({ children: [new Paragraph("Reference of ADM. Sanction")] }),
                  new TableCell({ children: [new Paragraph("-")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("Amount in Rs.")] }),
                  new TableCell({ children: [new Paragraph(tenderData.estimatedAmount.toString())] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("4")] }),
                  new TableCell({ children: [new Paragraph("Reference of technical sanction with amount")] }),
                  new TableCell({ children: [new Paragraph("-")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("5")] }),
                  new TableCell({ children: [new Paragraph("Date of calling NIT")] }),
                  new TableCell({ children: [new Paragraph(tenderData.nitDate)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("6")] }),
                  new TableCell({ children: [new Paragraph("Date of receipt of tender")] }),
                  new TableCell({ children: [new Paragraph(tenderData.receiptDate)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("7")] }),
                  new TableCell({ children: [new Paragraph("No. of tender sold")] }),
                  new TableCell({ children: [new Paragraph(tenderData.tendersSold.toString())] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("8")] }),
                  new TableCell({ children: [new Paragraph("No. of tender received")] }),
                  new TableCell({ children: [new Paragraph(tenderData.tendersReceived.toString())] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("9")] }),
                  new TableCell({ children: [new Paragraph("Allotment of fund during the current financial year")] }),
                  new TableCell({ children: [new Paragraph("Adequate.")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("10")] }),
                  new TableCell({ children: [new Paragraph("Expenditure up to last bill")] }),
                  new TableCell({ children: [new Paragraph("Nil.")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("11")] }),
                  new TableCell({ children: [new Paragraph("Lowest rate quoted and condition if any")] }),
                  new TableCell({ children: [new Paragraph(`${tenderData.lowestPercentage}. No Condition.`)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("12")] }),
                  new TableCell({ children: [new Paragraph("Financial implication of condition if any in tender")] }),
                  new TableCell({ children: [new Paragraph("Not Applicable.")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("13")] }),
                  new TableCell({ children: [new Paragraph("Name of lowest contractor")] }),
                  new TableCell({ children: [new Paragraph(tenderData.lowestBidder)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("14")] }),
                  new TableCell({ children: [new Paragraph("Authority competent to sanction the tender")] }),
                  new TableCell({ children: [new Paragraph("The Executive Engineer")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("15")] }),
                  new TableCell({ children: [new Paragraph("Validity of tender")] }),
                  new TableCell({ children: [new Paragraph("20 Days")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("Valid Upto Dated")] }),
                  new TableCell({ children: [new Paragraph("13-04-25")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("16")] }),
                  new TableCell({ children: [new Paragraph("Remarks if any")] }),
                  new TableCell({ children: [new Paragraph("None.")] })
                ]
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "AUDITOR" })
            ]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
  } else {
    await generatePDF(getScrutinyHTML(tenderData), filePath, false);
  }

  return filePath;
}

async function generateWorkOrder(tenderData: TenderData, format: 'doc' | 'pdf', outputDir: string): Promise<string> {
  const fileName = `Work_Order_${tenderData.nitNumber}.${format}`;
  const filePath = path.join(outputDir, fileName);

  if (format === 'doc') {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "WRITTEN ORDER TO COMMENCE WORK",
                bold: true,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "To," })]
          }),
          new Paragraph({
            children: [new TextRun({ text: tenderData.lowestBidder })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: `Name of Work: ${tenderData.workName}` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `NIT No.: ${tenderData.nitNumber}     ITEM-1` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `NIT Date: ${tenderData.nitDate}` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Tender Receipt Date: ${tenderData.receiptDate}` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Your Tender / Negotiations dated: ${tenderData.receiptDate}` })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Dear Sir," })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ 
              text: "You are therefore, requested to please contact the Assistant Engineer-in-Charge and start the work. The time allowed for commencement of work shall be reckoned from 1st days after the receipt of this order. Including tender document shall form part of the agreement and shall be treated as executed between you and the Governor of Rajasthan."
            })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Agreement No.: /2025-26" })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "Stipulated date for commencement of work: 25-03-25" })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Stipulated date for completion of work: 24-12-25` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "Administrative Sanction: -" })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "Technical Sanction: -" })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "Budget Provision: -" })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Yours Faithfully," })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Executive Engineer" })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "On behalf of the Governor of State of Rajasthan" })]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
  } else {
    await generatePDF(getWorkOrderHTML(tenderData), filePath, false);
  }

  return filePath;
}

async function generateAcceptanceLetter(tenderData: TenderData, format: 'doc' | 'pdf', outputDir: string): Promise<string> {
  const fileName = `Acceptance_Letter_${tenderData.nitNumber}.${format}`;
  const filePath = path.join(outputDir, fileName);

  if (format === 'doc') {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "OFFICE OF THE EXECUTIVE ENGINEER PWD ELECTRIC DIVISION UDAIPUR",
                bold: true,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Letter of Acceptance of Tender)",
                bold: true,
                size: 18
              })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "To," })]
          }),
          new Paragraph({
            children: [new TextRun({ text: tenderData.lowestBidder })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: `Name of Work: ${tenderData.workName}` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `NIT No.: ${tenderData.nitNumber}     ITEM-1` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `NIT Date: ${tenderData.nitDate}` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Tender Receipt Date: ${tenderData.receiptDate}` })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Your Tender / Negotiations dated: ${tenderData.receiptDate}` })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Dear Sir," })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({
              text: "Security Deposit as per rule of the gross amount of the running bill shall be deducted from each running bill or you may opt to deposit full amount of security deposit in the shape of bank guarantee or any acceptable form of security before or at the time of executing agreement. Kindly submit the required stamp duty of Rs. 1000/- as per rule and Deposit Additional Performance Guarantee Amounting to Rs NIL in this Office and do may sign the agreement within 3 days failing which action as per rule may be initiated."
            })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "The receipt of the may please be acknowledged." })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Yours Faithfully," })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Executive Engineer" })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "On behalf of the Governor of State of Rajasthan" })]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
  } else {
    await generatePDF(getAcceptanceHTML(tenderData), filePath, false);
  }

  return filePath;
}

async function generatePDF(html: string, outputPath: string, landscape: boolean = false): Promise<void> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    landscape: landscape,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
}

function getComparativeHTML(tenderData: TenderData): string {
  const bidders = tenderData.bidders as any[];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20px; }
        .info { margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid black; padding: 5px; text-align: left; }
        th { background-color: #f0f0f0; }
        .bordered-box { 
          width: 60%; 
          margin-left: auto; 
          border: 2px solid #1e40af; 
          padding: 20px; 
          background: #f8fafc; 
          margin-top: 20px; 
        }
        .signatures { display: flex; justify-content: space-between; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>OFFICE OF THE EXECUTIVE ENGINEER PWD ELECTRIC DIVISION, UDAIPUR</div>
        <div>COMPARATIVE STATEMENT OF TENDERS</div>
      </div>
      
      <div class="info">Name of Work: ${tenderData.workName}</div>
      <div class="info">NIT No.: ${tenderData.nitNumber} &nbsp;&nbsp;&nbsp; Date: ${tenderData.nitDate} &nbsp;&nbsp;&nbsp; ITEM-1</div>
      
      <table>
        <tr>
          <th>S.No</th>
          <th>Bidder Name</th>
          <th>Estimated Cost Rs.</th>
          <th>Quoted Percentage</th>
          <th>Quoted Amount Rs.</th>
        </tr>
        ${bidders.map(bidder => `
          <tr>
            <td>${bidder.sno}</td>
            <td>${bidder.name}</td>
            <td>${bidder.estimatedCost}</td>
            <td>${bidder.quotedPercentage}</td>
            <td>${bidder.quotedAmount}</td>
          </tr>
        `).join('')}
      </table>
      
      <div class="bordered-box">
        <div style="text-align: center;">
          <p><strong>Lowest Amount Quoted BY:</strong></p>
          <p>${tenderData.lowestBidder}</p>
          <p>${tenderData.lowestPercentage} - Rs. ${tenderData.lowestAmount}</p>
        </div>
        <table style="margin-top: 20px;">
          <tr>
            <td style="text-align: center;">AR</td>
            <td style="text-align: center;">DA</td>
            <td style="text-align: center;">TA</td>
            <td style="text-align: center;">EE</td>
          </tr>
          <tr>
            <td style="height: 40px;"></td>
            <td style="height: 40px;"></td>
            <td style="height: 40px;"></td>
            <td style="height: 40px;"></td>
          </tr>
        </table>
      </div>
      
      <div class="signatures">
        <span>Auditor</span>
        <span>Divisional Accountant</span>
        <span>TA</span>
        <span>Executive Engineer</span>
      </div>
    </body>
    </html>
  `;
}

function getScrutinyHTML(tenderData: TenderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        td { border: 1px solid black; padding: 5px; }
        .num { width: 30px; }
        .desc { width: 40%; }
        .value { width: auto; }
      </style>
    </head>
    <body>
      <div class="header">Scrutiny Sheet of Tender</div>
      
      <table>
        <tr><td class="num">1</td><td class="desc">Head of Account</td><td class="value">8443</td></tr>
        <tr><td class="num">2</td><td class="desc">Name of work</td><td class="value">${tenderData.workName}</td></tr>
        <tr><td class="num"></td><td class="desc">Job No.</td><td class="value">-</td></tr>
        <tr><td class="num">3</td><td class="desc">Reference of ADM. Sanction</td><td class="value">-</td></tr>
        <tr><td class="num"></td><td class="desc">Amount in Rs.</td><td class="value">${tenderData.estimatedAmount}</td></tr>
        <tr><td class="num">4</td><td class="desc">Reference of technical sanction with amount</td><td class="value">-</td></tr>
        <tr><td class="num">5</td><td class="desc">Date of calling NIT</td><td class="value">${tenderData.nitDate}</td></tr>
        <tr><td class="num">6</td><td class="desc">Date of receipt of tender</td><td class="value">${tenderData.receiptDate}</td></tr>
        <tr><td class="num">7</td><td class="desc">No. of tender sold</td><td class="value">${tenderData.tendersSold}</td></tr>
        <tr><td class="num">8</td><td class="desc">No. of tender received</td><td class="value">${tenderData.tendersReceived}</td></tr>
        <tr><td class="num">9</td><td class="desc">Allotment of fund during the current financial year</td><td class="value">Adequate.</td></tr>
        <tr><td class="num">10</td><td class="desc">Expenditure up to last bill</td><td class="value">Nil.</td></tr>
        <tr><td class="num">11</td><td class="desc">Lowest rate quoted and condition if any</td><td class="value">${tenderData.lowestPercentage}. No Condition.</td></tr>
        <tr><td class="num">12</td><td class="desc">Financial implication of condition if any in tender</td><td class="value">Not Applicable.</td></tr>
        <tr><td class="num">13</td><td class="desc">Name of lowest contractor</td><td class="value">${tenderData.lowestBidder}</td></tr>
        <tr><td class="num">14</td><td class="desc">Authority competent to sanction the tender</td><td class="value">The Executive Engineer</td></tr>
        <tr><td class="num">15</td><td class="desc">Validity of tender</td><td class="value">20 Days</td></tr>
        <tr><td class="num"></td><td class="desc">Valid Upto Dated</td><td class="value">13-04-25</td></tr>
        <tr><td class="num">16</td><td class="desc">Remarks if any</td><td class="value">None.</td></tr>
      </table>
      
      <div style="margin-top: 40px;">
        <strong>AUDITOR</strong>
      </div>
    </body>
    </html>
  `;
}

function getWorkOrderHTML(tenderData: TenderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; line-height: 1.5; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 16px; }
        .info { margin-bottom: 10px; }
        .signature { margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">WRITTEN ORDER TO COMMENCE WORK</div>
      
      <div>To,</div>
      <div>${tenderData.lowestBidder}</div>
      <br>
      
      <div class="info">Name of Work: ${tenderData.workName}</div>
      <div class="info">NIT No.: ${tenderData.nitNumber} &nbsp;&nbsp;&nbsp; ITEM-1</div>
      <div class="info">NIT Date: ${tenderData.nitDate}</div>
      <div class="info">Tender Receipt Date: ${tenderData.receiptDate}</div>
      <div class="info">Your Tender / Negotiations dated: ${tenderData.receiptDate}</div>
      <br>
      
      <div>Dear Sir,</div>
      <br>
      
      <p>You are therefore, requested to please contact the Assistant Engineer-in-Charge and start the work. The time allowed for commencement of work shall be reckoned from 1st days after the receipt of this order. Including tender document shall form part of the agreement and shall be treated as executed between you and the Governor of Rajasthan.</p>
      
      <div class="info">Agreement No.: /2025-26</div>
      <div class="info">Stipulated date for commencement of work: 25-03-25</div>
      <div class="info">Stipulated date for completion of work: 24-12-25</div>
      <div class="info">Administrative Sanction: -</div>
      <div class="info">Technical Sanction: -</div>
      <div class="info">Budget Provision: -</div>
      
      <div class="signature">
        <div>Yours Faithfully,</div>
        <br>
        <div>Executive Engineer</div>
        <div>On behalf of the Governor of State of Rajasthan</div>
      </div>
    </body>
    </html>
  `;
}

function getAcceptanceHTML(tenderData: TenderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; line-height: 1.5; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 16px; }
        .info { margin-bottom: 10px; }
        .signature { margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>OFFICE OF THE EXECUTIVE ENGINEER PWD ELECTRIC DIVISION UDAIPUR</div>
        <div>(Letter of Acceptance of Tender)</div>
      </div>
      
      <div>To,</div>
      <div>${tenderData.lowestBidder}</div>
      <br>
      
      <div class="info">Name of Work: ${tenderData.workName}</div>
      <div class="info">NIT No.: ${tenderData.nitNumber} &nbsp;&nbsp;&nbsp; ITEM-1</div>
      <div class="info">NIT Date: ${tenderData.nitDate}</div>
      <div class="info">Tender Receipt Date: ${tenderData.receiptDate}</div>
      <div class="info">Your Tender / Negotiations dated: ${tenderData.receiptDate}</div>
      <br>
      
      <div>Dear Sir,</div>
      <br>
      
      <p>Security Deposit as per rule of the gross amount of the running bill shall be deducted from each running bill or you may opt to deposit full amount of security deposit in the shape of bank guarantee or any acceptable form of security before or at the time of executing agreement. Kindly submit the required stamp duty of Rs. 1000/- as per rule and Deposit Additional Performance Guarantee Amounting to Rs NIL in this Office and do may sign the agreement within 3 days failing which action as per rule may be initiated.</p>
      
      <p>The receipt of the may please be acknowledged.</p>
      
      <div class="signature">
        <div>Yours Faithfully,</div>
        <br>
        <div>Executive Engineer</div>
        <div>On behalf of the Governor of State of Rajasthan</div>
      </div>
    </body>
    </html>
  `;
}
