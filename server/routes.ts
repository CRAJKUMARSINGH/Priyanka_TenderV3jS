import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertTenderDataSchema } from "@shared/schema";
import { processExcelFile } from "./services/excel-processor";
import { generateAllDocuments } from "./services/document-generator";

const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and process Excel file
  app.post('/api/upload-excel', upload.single('excelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Process Excel file
      const processedData = await processExcelFile(req.file.path);
      
      // Validate data
      const validatedData = insertTenderDataSchema.parse({
        fileName: req.file.originalname,
        ...processedData
      });

      // Store in memory
      const tenderData = await storage.createTenderData(validatedData);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({ 
        success: true, 
        data: tenderData,
        message: 'Excel file processed successfully'
      });

    } catch (error) {
      console.error('Excel processing error:', error);
      
      // Clean up uploaded file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to process Excel file'
      });
    }
  });

  // Generate all documents
  app.post('/api/generate-documents/:tenderId', async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: 'Invalid tender ID' });
      }

      const tenderData = await storage.getTenderData(tenderId);
      if (!tenderData) {
        return res.status(404).json({ message: 'Tender data not found' });
      }

      // Generate all documents
      const zipFilePath = await generateAllDocuments(tenderData, storage);

      // Send the zip file
      res.download(zipFilePath, `PWD_Documents_${tenderData.nitNumber}.zip`, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ message: 'Failed to download documents' });
        }
        
        // Clean up the zip file after download
        setTimeout(() => {
          if (fs.existsSync(zipFilePath)) {
            fs.unlinkSync(zipFilePath);
          }
        }, 5000);
      });

    } catch (error) {
      console.error('Document generation error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to generate documents'
      });
    }
  });

  // Get tender data
  app.get('/api/tender-data/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tenderData = await storage.getTenderData(id);
      
      if (!tenderData) {
        return res.status(404).json({ message: 'Tender data not found' });
      }

      res.json(tenderData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tender data' });
    }
  });

  // Get all tender data
  app.get('/api/tender-data', async (req, res) => {
    try {
      const allData = await storage.getAllTenderData();
      res.json(allData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tender data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
