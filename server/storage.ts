import { 
  users, 
  tenders, 
  bidders, 
  bidderPercentiles, 
  generatedDocuments,
  type User, 
  type InsertUser,
  type Tender,
  type InsertTender,
  type Bidder,
  type InsertBidder,
  type BidderPercentile,
  type InsertBidderPercentile,
  type GeneratedDocument,
  type InsertDocument
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tender methods
  createTender(tender: InsertTender): Promise<Tender>;
  getTender(id: number): Promise<Tender | undefined>;
  getAllTenders(): Promise<Tender[]>;
  updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender | undefined>;
  
  // Bidder methods
  createBidder(bidder: InsertBidder): Promise<Bidder>;
  getBidder(id: number): Promise<Bidder | undefined>;
  getAllBidders(): Promise<Bidder[]>;
  updateBidder(id: number, bidder: Partial<InsertBidder>): Promise<Bidder | undefined>;
  deleteBidder(id: number): Promise<boolean>;
  
  // Bidder Percentile methods
  createBidderPercentile(percentile: InsertBidderPercentile): Promise<BidderPercentile>;
  getBidderPercentilesByTender(tenderId: number): Promise<BidderPercentile[]>;
  updateBidderPercentile(id: number, percentile: Partial<InsertBidderPercentile>): Promise<BidderPercentile | undefined>;
  deleteBidderPercentile(id: number): Promise<boolean>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<GeneratedDocument>;
  getDocumentsByTender(tenderId: number): Promise<GeneratedDocument[]>;
  getDocument(id: number): Promise<GeneratedDocument | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tenders: Map<number, Tender> = new Map();
  private bidders: Map<number, Bidder> = new Map();
  private bidderPercentiles: Map<number, BidderPercentile> = new Map();
  private documents: Map<number, GeneratedDocument> = new Map();
  
  private currentUserId = 1;
  private currentTenderId = 1;
  private currentBidderId = 1;
  private currentPercentileId = 1;
  private currentDocumentId = 1;

  constructor() {
    this.initializeDefaultBidders();
  }

  private initializeDefaultBidders() {
    // Initialize 44 existing bidders as mentioned in requirements
    const defaultBidders = [
      { name: "M/s ABC Construction Company", address: "123, Industrial Area, Sector-5, Udaipur, Rajasthan - 313001", contactInfo: "+91-9876543210" },
      { name: "M/s XYZ Builders & Contractors", address: "456, Business Park, Udaipur, Rajasthan - 313002", contactInfo: "+91-9876543211" },
      { name: "M/s PQR Engineering Solutions", address: "789, Tech Plaza, Udaipur, Rajasthan - 313003", contactInfo: "+91-9876543212" },
      { name: "M/s Rajasthan Infrastructure Ltd", address: "101, Corporate Avenue, Udaipur, Rajasthan - 313004", contactInfo: "+91-9876543213" },
      { name: "M/s Mewar Construction Co.", address: "202, City Center, Udaipur, Rajasthan - 313005", contactInfo: "+91-9876543214" },
      { name: "M/s Aravalli Builders", address: "303, Trade Center, Udaipur, Rajasthan - 313006", contactInfo: "+91-9876543215" },
      { name: "M/s Sisodia Enterprises", address: "404, Business Hub, Udaipur, Rajasthan - 313007", contactInfo: "+91-9876543216" },
      { name: "M/s Udaipur Constructions", address: "505, Commercial Complex, Udaipur, Rajasthan - 313008", contactInfo: "+91-9876543217" },
      { name: "M/s Lake City Builders", address: "606, Industrial Estate, Udaipur, Rajasthan - 313009", contactInfo: "+91-9876543218" },
      { name: "M/s Royal Engineering Works", address: "707, Tech Park, Udaipur, Rajasthan - 313010", contactInfo: "+91-9876543219" },
      // Adding 34 more bidders to reach 44 total
      { name: "M/s Maharana Construction", address: "808, Sector-7, Udaipur, Rajasthan - 313011", contactInfo: "+91-9876543220" },
      { name: "M/s Pratap Builders", address: "909, Industrial Zone, Udaipur, Rajasthan - 313012", contactInfo: "+91-9876543221" },
      { name: "M/s Chittor Engineering", address: "1010, Business District, Udaipur, Rajasthan - 313013", contactInfo: "+91-9876543222" },
      { name: "M/s Bhilwara Constructions", address: "1111, Commercial Hub, Udaipur, Rajasthan - 313014", contactInfo: "+91-9876543223" },
      { name: "M/s Kota Infrastructure", address: "1212, Tech Valley, Udaipur, Rajasthan - 313015", contactInfo: "+91-9876543224" },
      { name: "M/s Jaipur Builders Pvt Ltd", address: "1313, Industrial Area-2, Udaipur, Rajasthan - 313016", contactInfo: "+91-9876543225" },
      { name: "M/s Ajmer Engineering Co.", address: "1414, Business Center, Udaipur, Rajasthan - 313017", contactInfo: "+91-9876543226" },
      { name: "M/s Jodhpur Construction Ltd", address: "1515, Corporate Plaza, Udaipur, Rajasthan - 313018", contactInfo: "+91-9876543227" },
      { name: "M/s Bikaner Enterprises", address: "1616, Trade Hub, Udaipur, Rajasthan - 313019", contactInfo: "+91-9876543228" },
      { name: "M/s Alwar Builders", address: "1717, Commercial Zone, Udaipur, Rajasthan - 313020", contactInfo: "+91-9876543229" },
      { name: "M/s Bharatpur Construction", address: "1818, Industrial Complex, Udaipur, Rajasthan - 313021", contactInfo: "+91-9876543230" },
      { name: "M/s Sawai Madhopur Builders", address: "1919, Business Park-2, Udaipur, Rajasthan - 313022", contactInfo: "+91-9876543231" },
      { name: "M/s Pali Engineering Works", address: "2020, Tech Center, Udaipur, Rajasthan - 313023", contactInfo: "+91-9876543232" },
      { name: "M/s Nagaur Constructions", address: "2121, Commercial District, Udaipur, Rajasthan - 313024", contactInfo: "+91-9876543233" },
      { name: "M/s Jhunjhunu Builders", address: "2222, Industrial Hub, Udaipur, Rajasthan - 313025", contactInfo: "+91-9876543234" },
      { name: "M/s Sikar Infrastructure", address: "2323, Business Quarter, Udaipur, Rajasthan - 313026", contactInfo: "+91-9876543235" },
      { name: "M/s Churu Engineering", address: "2424, Corporate Center, Udaipur, Rajasthan - 313027", contactInfo: "+91-9876543236" },
      { name: "M/s Banswara Constructions", address: "2525, Trade Center-2, Udaipur, Rajasthan - 313028", contactInfo: "+91-9876543237" },
      { name: "M/s Dungarpur Builders", address: "2626, Commercial Plaza, Udaipur, Rajasthan - 313029", contactInfo: "+91-9876543238" },
      { name: "M/s Tonk Engineering Co.", address: "2727, Industrial Park, Udaipur, Rajasthan - 313030", contactInfo: "+91-9876543239" },
      { name: "M/s Bundi Construction Ltd", address: "2828, Business Avenue, Udaipur, Rajasthan - 313031", contactInfo: "+91-9876543240" },
      { name: "M/s Jhalawar Enterprises", address: "2929, Tech Hub-2, Udaipur, Rajasthan - 313032", contactInfo: "+91-9876543241" },
      { name: "M/s Baran Builders", address: "3030, Commercial Estate, Udaipur, Rajasthan - 313033", contactInfo: "+91-9876543242" },
      { name: "M/s Dausa Engineering", address: "3131, Industrial District, Udaipur, Rajasthan - 313034", contactInfo: "+91-9876543243" },
      { name: "M/s Karauli Constructions", address: "3232, Business Complex-2, Udaipur, Rajasthan - 313035", contactInfo: "+91-9876543244" },
      { name: "M/s Rajsamand Builders", address: "3333, Corporate Hub, Udaipur, Rajasthan - 313036", contactInfo: "+91-9876543245" },
      { name: "M/s Chittaurgarh Engineering", address: "3434, Trade District, Udaipur, Rajasthan - 313037", contactInfo: "+91-9876543246" },
      { name: "M/s Hanumangarh Construction", address: "3535, Commercial Center-2, Udaipur, Rajasthan - 313038", contactInfo: "+91-9876543247" },
      { name: "M/s Ganganagar Builders", address: "3636, Industrial Zone-2, Udaipur, Rajasthan - 313039", contactInfo: "+91-9876543248" },
      { name: "M/s Jaisalmer Engineering", address: "3737, Business Park-3, Udaipur, Rajasthan - 313040", contactInfo: "+91-9876543249" },
      { name: "M/s Barmer Constructions", address: "3838, Tech Plaza-2, Udaipur, Rajasthan - 313041", contactInfo: "+91-9876543250" },
      { name: "M/s Jalore Builders Ltd", address: "3939, Corporate Valley, Udaipur, Rajasthan - 313042", contactInfo: "+91-9876543251" },
      { name: "M/s Sirohi Infrastructure", address: "4040, Commercial Hub-2, Udaipur, Rajasthan - 313043", contactInfo: "+91-9876543252" },
      { name: "M/s Mount Abu Constructions", address: "4141, Industrial Campus, Udaipur, Rajasthan - 313044", contactInfo: "+91-9876543253" },
      { name: "M/s Rajasthan PWD Contractors", address: "4242, Government Complex, Udaipur, Rajasthan - 313045", contactInfo: "+91-9876543254" }
    ];

    defaultBidders.forEach(bidder => {
      const id = this.currentBidderId++;
      this.bidders.set(id, {
        id,
        ...bidder,
        isActive: true,
        createdAt: new Date()
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Tender methods
  async createTender(insertTender: InsertTender): Promise<Tender> {
    const id = this.currentTenderId++;
    const tender: Tender = { 
      ...insertTender, 
      id,
      createdAt: new Date(),
      status: "active",
      excelData: insertTender.excelData || null
    };
    this.tenders.set(id, tender);
    return tender;
  }

  async getTender(id: number): Promise<Tender | undefined> {
    return this.tenders.get(id);
  }

  async getAllTenders(): Promise<Tender[]> {
    return Array.from(this.tenders.values());
  }

  async updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender | undefined> {
    const existing = this.tenders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...tender };
    this.tenders.set(id, updated);
    return updated;
  }

  // Bidder methods
  async createBidder(insertBidder: InsertBidder): Promise<Bidder> {
    const id = this.currentBidderId++;
    const bidder: Bidder = { 
      ...insertBidder, 
      id,
      createdAt: new Date(),
      isActive: true,
      contactInfo: insertBidder.contactInfo || null
    };
    this.bidders.set(id, bidder);
    return bidder;
  }

  async getBidder(id: number): Promise<Bidder | undefined> {
    return this.bidders.get(id);
  }

  async getAllBidders(): Promise<Bidder[]> {
    return Array.from(this.bidders.values()).filter(bidder => bidder.isActive);
  }

  async updateBidder(id: number, bidder: Partial<InsertBidder>): Promise<Bidder | undefined> {
    const existing = this.bidders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...bidder };
    this.bidders.set(id, updated);
    return updated;
  }

  async deleteBidder(id: number): Promise<boolean> {
    const existing = this.bidders.get(id);
    if (!existing) return false;
    
    const updated = { ...existing, isActive: false };
    this.bidders.set(id, updated);
    return true;
  }

  // Bidder Percentile methods
  async createBidderPercentile(insertPercentile: InsertBidderPercentile): Promise<BidderPercentile> {
    const id = this.currentPercentileId++;
    const percentile: BidderPercentile = { 
      ...insertPercentile, 
      id,
      createdAt: new Date(),
      tenderId: insertPercentile.tenderId || null,
      bidderId: insertPercentile.bidderId || null,
      percentage: insertPercentile.percentage.toString()
    };
    this.bidderPercentiles.set(id, percentile);
    return percentile;
  }

  async getBidderPercentilesByTender(tenderId: number): Promise<BidderPercentile[]> {
    return Array.from(this.bidderPercentiles.values()).filter(p => p.tenderId === tenderId);
  }

  async updateBidderPercentile(id: number, percentile: Partial<InsertBidderPercentile>): Promise<BidderPercentile | undefined> {
    const existing = this.bidderPercentiles.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...percentile,
      percentage: percentile.percentage ? percentile.percentage.toString() : existing.percentage
    };
    this.bidderPercentiles.set(id, updated);
    return updated;
  }

  async deleteBidderPercentile(id: number): Promise<boolean> {
    return this.bidderPercentiles.delete(id);
  }

  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<GeneratedDocument> {
    const id = this.currentDocumentId++;
    const document: GeneratedDocument = { 
      ...insertDocument, 
      id,
      createdAt: new Date(),
      tenderId: insertDocument.tenderId || null,
      fileData: insertDocument.fileData || null,
      filePath: insertDocument.filePath || null
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocumentsByTender(tenderId: number): Promise<GeneratedDocument[]> {
    return Array.from(this.documents.values()).filter(doc => doc.tenderId === tenderId);
  }

  async getDocument(id: number): Promise<GeneratedDocument | undefined> {
    return this.documents.get(id);
  }
}

export const storage = new MemStorage();
