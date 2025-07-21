import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tenderData = pgTable("tender_data", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  workName: text("work_name").notNull(),
  nitNumber: text("nit_number").notNull(),
  nitDate: text("nit_date").notNull(),
  estimatedAmount: integer("estimated_amount").notNull(),
  earnestMoney: integer("earnest_money").notNull(),
  completionTime: integer("completion_time").notNull(),
  tendersSold: integer("tenders_sold").notNull(),
  tendersReceived: integer("tenders_received").notNull(),
  receiptDate: text("receipt_date").notNull(),
  bidders: jsonb("bidders").notNull(),
  lowestBidder: text("lowest_bidder").notNull(),
  lowestAmount: integer("lowest_amount").notNull(),
  lowestPercentage: text("lowest_percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenderData.id),
  docType: text("doc_type").notNull(), // 'comparative', 'scrutiny', 'work_order', 'acceptance'
  format: text("format").notNull(), // 'doc', 'pdf'
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTenderDataSchema = createInsertSchema(tenderData).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TenderData = typeof tenderData.$inferSelect;
export type InsertTenderData = z.infer<typeof insertTenderDataSchema>;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = z.infer<typeof insertGeneratedDocumentSchema>;

// Bidder type for JSON structure
export const bidderSchema = z.object({
  sno: z.number(),
  name: z.string(),
  estimatedCost: z.number(),
  quotedPercentage: z.string(),
  quotedAmount: z.number(),
});

export type Bidder = z.infer<typeof bidderSchema>;
