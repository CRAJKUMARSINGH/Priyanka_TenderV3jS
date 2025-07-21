import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  tenderNumber: text("tender_number").notNull(),
  workDescription: text("work_description").notNull(),
  estimatedAmount: decimal("estimated_amount", { precision: 15, scale: 2 }).notNull(),
  excelData: text("excel_data"), // JSON string of Excel data
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("active"), // active, completed, cancelled
});

export const bidders = pgTable("bidders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  contactInfo: text("contact_info"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bidderPercentiles = pgTable("bidder_percentiles", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id),
  bidderId: integer("bidder_id").references(() => bidders.id),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(), // -99.99 to +99.99
  bidderDetails: text("bidder_details").notNull(), // Combined name & address
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id),
  documentType: text("document_type").notNull(), // pdf, excel, zip
  fileName: text("file_name").notNull(),
  filePath: text("file_path"),
  fileData: text("file_data"), // Base64 encoded file data
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertTenderSchema = createInsertSchema(tenders).omit({
  id: true,
  createdAt: true,
});

export const insertBidderSchema = createInsertSchema(bidders).omit({
  id: true,
  createdAt: true,
});

export const insertBidderPercentileSchema = createInsertSchema(bidderPercentiles).omit({
  id: true,
  createdAt: true,
}).extend({
  percentage: z.number().min(-99.99).max(99.99),
});

export const insertDocumentSchema = createInsertSchema(generatedDocuments).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type Tender = typeof tenders.$inferSelect;

export type InsertBidder = z.infer<typeof insertBidderSchema>;
export type Bidder = typeof bidders.$inferSelect;

export type InsertBidderPercentile = z.infer<typeof insertBidderPercentileSchema>;
export type BidderPercentile = typeof bidderPercentiles.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
