import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTenderSchema, insertBidderSchema, insertBidderPercentileSchema } from "@shared/schema";
import { z } from "zod";

// Simple server-side PDF generation function
async function generateBasicPDF(data: any, title: string): Promise<string> {
  // Basic PDF structure with actual content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
50 750 Td
(${title}) Tj
0 -30 Td
/F1 12 Tf
(Tender: ${data.tenderNumber}) Tj
0 -20 Td
(Work: ${data.workDescription.substring(0, 50)}...) Tj
0 -20 Td
(Amount: Rs. ${data.estimatedAmount}) Tj
0 -20 Td
(Bidders: ${data.bidders?.length || 0}) Tj
0 -30 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -20 Td
(PWD Udaipur - Mrs. Premlata Jain Initiative) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000207 00000 n 
0000000460 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
527
%%EOF`;

  return Buffer.from(pdfContent).toString('base64');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Tender routes
  app.get("/api/tenders", async (req, res) => {
    try {
      const tenders = await storage.getAllTenders();
      res.json(tenders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenders" });
    }
  });

  app.post("/api/tenders", async (req, res) => {
    try {
      const validatedData = insertTenderSchema.parse(req.body);
      const tender = await storage.createTender(validatedData);
      res.json(tender);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tender data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tender" });
      }
    }
  });

  app.get("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tender = await storage.getTender(id);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      res.json(tender);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tender" });
    }
  });

  app.put("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTenderSchema.partial().parse(req.body);
      const tender = await storage.updateTender(id, validatedData);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      res.json(tender);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tender data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update tender" });
      }
    }
  });

  // Bidder routes
  app.get("/api/bidders", async (req, res) => {
    try {
      const bidders = await storage.getAllBidders();
      res.json(bidders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bidders" });
    }
  });

  app.post("/api/bidders", async (req, res) => {
    try {
      const validatedData = insertBidderSchema.parse(req.body);
      const bidder = await storage.createBidder(validatedData);
      res.json(bidder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bidder data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bidder" });
      }
    }
  });

  app.put("/api/bidders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBidderSchema.partial().parse(req.body);
      const bidder = await storage.updateBidder(id, validatedData);
      if (!bidder) {
        return res.status(404).json({ message: "Bidder not found" });
      }
      res.json(bidder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bidder data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update bidder" });
      }
    }
  });

  app.delete("/api/bidders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBidder(id);
      if (!success) {
        return res.status(404).json({ message: "Bidder not found" });
      }
      res.json({ message: "Bidder deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bidder" });
    }
  });

  // Bidder Percentile routes
  app.get("/api/tenders/:tenderId/percentiles", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      const percentiles = await storage.getBidderPercentilesByTender(tenderId);
      res.json(percentiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bidder percentiles" });
    }
  });

  app.post("/api/bidder-percentiles", async (req, res) => {
    try {
      const validatedData = insertBidderPercentileSchema.parse(req.body);
      const percentile = await storage.createBidderPercentile(validatedData);
      res.json(percentile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid percentile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bidder percentile" });
      }
    }
  });

  app.put("/api/bidder-percentiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBidderPercentileSchema.partial().parse(req.body);
      const percentile = await storage.updateBidderPercentile(id, validatedData);
      if (!percentile) {
        return res.status(404).json({ message: "Bidder percentile not found" });
      }
      res.json(percentile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid percentile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update bidder percentile" });
      }
    }
  });

  app.delete("/api/bidder-percentiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBidderPercentile(id);
      if (!success) {
        return res.status(404).json({ message: "Bidder percentile not found" });
      }
      res.json({ message: "Bidder percentile deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bidder percentile" });
    }
  });

  // Excel upload and processing
  app.post("/api/upload-excel", async (req, res) => {
    try {
      const { fileData, fileName } = req.body;
      
      // Process Excel data
      const processedData = {
        tenderNumber: fileData.tenderNumber || `TND-${Date.now()}`,
        workDescription: fileData.workDescription || "Tender work from Excel file",
        estimatedAmount: fileData.estimatedAmount?.toString() || "1000000.00",
        excelData: JSON.stringify(fileData)
      };

      const tender = await storage.createTender(processedData);
      res.json({ 
        message: "Excel file processed successfully", 
        tender 
      });
    } catch (error) {
      console.error('Excel processing error:', error);
      res.status(500).json({ message: "Failed to process Excel file: " + (error as Error).message });
    }
  });

  // Document generation
  app.post("/api/generate-documents", async (req, res) => {
    try {
      const { tenderId, documentTypes } = req.body;
      
      // Get tender and bidder data
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      const bidderPercentiles = await storage.getBidderPercentilesByTender(tenderId);
      const allBidders = await storage.getAllBidders();
      
      // Prepare data for PDF generation
      const bidders = bidderPercentiles.map(bp => {
        const bidder = allBidders.find(b => b.id === bp.bidderId);
        return {
          name: bidder?.name || bp.bidderDetails.split('\n')[0] || 'Unknown Bidder',
          address: bidder?.address || bp.bidderDetails.split('\n').slice(1).join(' ') || 'Address not available',
          percentage: parseFloat(bp.percentage)
        };
      });
      
      const documentData = {
        tenderNumber: tender.tenderNumber,
        workDescription: tender.workDescription,
        estimatedAmount: tender.estimatedAmount,
        bidders: bidders,
        items: tender.excelData ? JSON.parse(tender.excelData).items : undefined
      };

      // Generate documents
      const documents = [];
      for (const docType of documentTypes) {
        let pdfContent = '';
        let fileName = '';
        
        // Generate PDF content based on type
        switch (docType) {
          case 'tender':
            fileName = `Tender_Document_${tender.tenderNumber}_${Date.now()}.pdf`;
            pdfContent = await generateBasicPDF(documentData, 'TENDER DOCUMENT');
            break;
          case 'comparison':
            fileName = `Bidder_Comparison_${tender.tenderNumber}_${Date.now()}.pdf`;
            pdfContent = await generateBasicPDF(documentData, 'BIDDER COMPARISON SHEET');
            break;
          case 'summary':
            fileName = `Work_Summary_${tender.tenderNumber}_${Date.now()}.pdf`;
            pdfContent = await generateBasicPDF(documentData, 'WORK SUMMARY REPORT');
            break;
          case 'financial':
            fileName = `Financial_Analysis_${tender.tenderNumber}_${Date.now()}.pdf`;
            pdfContent = await generateBasicPDF(documentData, 'FINANCIAL ANALYSIS REPORT');
            break;
          default:
            fileName = `Document_${docType}_${tender.tenderNumber}_${Date.now()}.pdf`;
            pdfContent = await generateBasicPDF(documentData, docType.toUpperCase());
        }
        
        const document = await storage.createDocument({
          tenderId,
          documentType: docType,
          fileName: fileName,
          filePath: `/documents/${fileName}`,
          fileData: pdfContent
        });
        documents.push(document);
      }

      res.json({ 
        message: "Documents generated successfully", 
        documents 
      });
    } catch (error) {
      console.error('Document generation error:', error);
      res.status(500).json({ message: "Failed to generate documents: " + (error as Error).message });
    }
  });

  // ZIP download
  app.get("/api/download-zip/:tenderId", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      const documents = await storage.getDocumentsByTender(tenderId);
      const tender = await storage.getTender(tenderId);
      
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      if (documents.length === 0) {
        return res.status(404).json({ message: "No documents found for this tender" });
      }
      
      // Create a simple ZIP structure manually (basic implementation)
      const zipEntries: Array<{ name: string; data: Buffer }> = [];
      
      documents.forEach(doc => {
        if (doc.fileData) {
          const fileData = Buffer.from(doc.fileData, 'base64');
          zipEntries.push({
            name: doc.fileName,
            data: fileData
          });
        }
      });
      
      // Add a manifest file
      const manifest = {
        generatedAt: new Date().toISOString(),
        tenderNumber: tender.tenderNumber,
        workDescription: tender.workDescription,
        documentsIncluded: documents.map(doc => doc.fileName),
        totalDocuments: documents.length,
        initiative: "Mrs. Premlata Jain, Additional Administrative Officer, PWD, Udaipur"
      };
      
      zipEntries.push({
        name: 'manifest.json',
        data: Buffer.from(JSON.stringify(manifest, null, 2))
      });
      
      // Basic ZIP file header (simplified for demo)
      let zipBuffer = Buffer.alloc(0);
      const centralDirectory: Buffer[] = [];
      let offset = 0;
      
      zipEntries.forEach((entry, index) => {
        // Local file header
        const localHeader = Buffer.alloc(30 + entry.name.length);
        localHeader.writeUInt32LE(0x04034b50, 0); // Local file signature
        localHeader.writeUInt16LE(20, 4); // Version needed
        localHeader.writeUInt16LE(0, 6); // Flags
        localHeader.writeUInt16LE(0, 8); // Compression method (none)
        localHeader.writeUInt32LE(entry.data.length, 18); // Uncompressed size
        localHeader.writeUInt32LE(entry.data.length, 22); // Compressed size
        localHeader.writeUInt16LE(entry.name.length, 26); // Filename length
        localHeader.write(entry.name, 30); // Filename
        
        zipBuffer = Buffer.concat([zipBuffer, localHeader, entry.data]);
        offset += localHeader.length + entry.data.length;
      });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="tender_${tender.tenderNumber}_documents.zip"`);
      res.send(zipBuffer);
    } catch (error) {
      console.error('ZIP generation error:', error);
      res.status(500).json({ message: "Failed to generate ZIP file: " + (error as Error).message });
    }
  });

  // Demo/test endpoint for quick workflow testing
  app.post("/api/demo-setup", async (req, res) => {
    try {
      // Create a demo tender
      const demoTender = await storage.createTender({
        tenderNumber: "DEMO-2025-001",
        workDescription: "Construction of Community Center with modern facilities including halls, meeting rooms, and recreational areas. This is a demo tender for testing purposes.",
        estimatedAmount: "2500000.00",
        excelData: JSON.stringify({
          items: [
            { srNo: 1, description: "Site preparation and excavation", quantity: 1, unit: "Lump Sum", rate: 150000, amount: 150000 },
            { srNo: 2, description: "Foundation and structural work", quantity: 2500, unit: "Sq Ft", rate: 450, amount: 1125000 },
            { srNo: 3, description: "Roofing and waterproofing", quantity: 2500, unit: "Sq Ft", rate: 200, amount: 500000 },
            { srNo: 4, description: "Electrical installation", quantity: 1, unit: "Lump Sum", rate: 300000, amount: 300000 },
            { srNo: 5, description: "Plumbing and sanitation", quantity: 1, unit: "Lump Sum", rate: 200000, amount: 200000 },
            { srNo: 6, description: "Interior finishing", quantity: 2500, unit: "Sq Ft", rate: 100, amount: 250000 }
          ]
        })
      });

      // Add demo bidder percentiles
      const bidders = await storage.getAllBidders();
      const demoPercentiles = [
        { bidderId: 1, percentage: "-5.5", bidderDetails: "M/s ABC Construction Company\nMain Street, Udaipur" },
        { bidderId: 2, percentage: "-3.2", bidderDetails: "XYZ Builders Ltd\nIndustrial Area, Udaipur" },
        { bidderId: 3, percentage: "+2.1", bidderDetails: "Smart Infrastructure Pvt Ltd\nCity Center, Udaipur" },
        { bidderId: 4, percentage: "-7.8", bidderDetails: "Royal Construction Co\nPalace Road, Udaipur" },
        { bidderId: 5, percentage: "+1.5", bidderDetails: "Modern Builders Group\nFateh Sagar Area, Udaipur" }
      ];

      for (const percentile of demoPercentiles) {
        if (percentile.bidderId <= bidders.length) {
          await storage.createBidderPercentile({
            tenderId: demoTender.id!,
            bidderId: percentile.bidderId,
            percentage: percentile.percentage,
            bidderDetails: percentile.bidderDetails
          });
        }
      }

      res.json({ 
        message: "Demo setup completed successfully! Ready for testing all features.", 
        tender: demoTender,
        bidderCount: demoPercentiles.length
      });
    } catch (error) {
      console.error('Demo setup error:', error);
      res.status(500).json({ message: "Failed to setup demo: " + (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
