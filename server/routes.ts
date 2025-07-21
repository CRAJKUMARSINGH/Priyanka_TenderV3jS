import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTenderSchema, insertBidderSchema, insertBidderPercentileSchema } from "@shared/schema";
import { z } from "zod";

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
      
      // Process Excel data (placeholder for actual Excel processing)
      const processedData = {
        tenderNumber: `TND-${Date.now()}`,
        workDescription: "Processed from Excel file",
        estimatedAmount: "1000000.00",
        excelData: JSON.stringify(fileData)
      };

      const tender = await storage.createTender(processedData);
      res.json({ 
        message: "Excel file processed successfully", 
        tender 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process Excel file" });
    }
  });

  // Document generation
  app.post("/api/generate-documents", async (req, res) => {
    try {
      const { tenderId, documentTypes } = req.body;
      
      // Generate documents (placeholder for actual PDF generation)
      const documents = [];
      for (const docType of documentTypes) {
        const document = await storage.createDocument({
          tenderId,
          documentType: docType,
          fileName: `${docType}_${tenderId}_${Date.now()}.pdf`,
          filePath: `/documents/${docType}_${tenderId}.pdf`,
          fileData: "base64_encoded_pdf_data" // Placeholder
        });
        documents.push(document);
      }

      res.json({ 
        message: "Documents generated successfully", 
        documents 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate documents" });
    }
  });

  // ZIP download
  app.get("/api/download-zip/:tenderId", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      const documents = await storage.getDocumentsByTender(tenderId);
      
      // Generate ZIP file (placeholder for actual ZIP generation)
      const zipData = "base64_encoded_zip_data"; // Placeholder
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="tender_${tenderId}_documents.zip"`);
      res.send(Buffer.from(zipData, 'base64'));
    } catch (error) {
      res.status(500).json({ message: "Failed to generate ZIP file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
