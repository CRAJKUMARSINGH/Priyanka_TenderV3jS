import { users, tenderData, generatedDocuments, type User, type InsertUser, type TenderData, type InsertTenderData, type GeneratedDocument, type InsertGeneratedDocument } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tender data operations
  createTenderData(data: InsertTenderData): Promise<TenderData>;
  getTenderData(id: number): Promise<TenderData | undefined>;
  getAllTenderData(): Promise<TenderData[]>;
  
  // Generated documents operations
  createGeneratedDocument(doc: InsertGeneratedDocument): Promise<GeneratedDocument>;
  getDocumentsByTenderId(tenderId: number): Promise<GeneratedDocument[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenderDataMap: Map<number, TenderData>;
  private generatedDocsMap: Map<number, GeneratedDocument>;
  private currentUserId: number;
  private currentTenderId: number;
  private currentDocId: number;

  constructor() {
    this.users = new Map();
    this.tenderDataMap = new Map();
    this.generatedDocsMap = new Map();
    this.currentUserId = 1;
    this.currentTenderId = 1;
    this.currentDocId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTenderData(data: InsertTenderData): Promise<TenderData> {
    const id = this.currentTenderId++;
    const tenderData: TenderData = { 
      ...data, 
      id,
      createdAt: new Date()
    };
    this.tenderDataMap.set(id, tenderData);
    return tenderData;
  }

  async getTenderData(id: number): Promise<TenderData | undefined> {
    return this.tenderDataMap.get(id);
  }

  async getAllTenderData(): Promise<TenderData[]> {
    return Array.from(this.tenderDataMap.values());
  }

  async createGeneratedDocument(doc: InsertGeneratedDocument): Promise<GeneratedDocument> {
    const id = this.currentDocId++;
    const generatedDoc: GeneratedDocument = {
      ...doc,
      id,
      createdAt: new Date()
    };
    this.generatedDocsMap.set(id, generatedDoc);
    return generatedDoc;
  }

  async getDocumentsByTenderId(tenderId: number): Promise<GeneratedDocument[]> {
    return Array.from(this.generatedDocsMap.values()).filter(
      doc => doc.tenderId === tenderId
    );
  }
}

export const storage = new MemStorage();
