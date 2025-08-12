import { 
  type User, type InsertUser, type Project, type InsertProject,
  type DrawingSet, type InsertDrawingSet, type SignType, type InsertSignType,
  type SpecPage, type InsertSpecPage, type Sign, type InsertSign,
  type TileArtwork, type InsertTileArtwork, type Comment, type InsertComment,
  type RomPricing, type CodeSummary, type ExamplePackage, type Vendor,
<<<<<<< HEAD
  type Rfq, type InsertRfq, type Bid, type InsertBid, type Proof, type ProofItem,
  type TakeoffPage, type InsertTakeoffPage, type MasterSignType, type InsertMasterSignType,
  type ProjectSignType, type InsertProjectSignType, type TakeoffMarker, type InsertTakeoffMarker
} from "@shared/schema-sqlite";
=======
  type Rfq, type InsertRfq, type Bid, type InsertBid, type Proof, type ProofItem
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
>>>>>>> parent of 27122f1 (Add takeoff functionality for project sign management)

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Drawing Sets
  getDrawingSets(projectId: string): Promise<DrawingSet[]>;
  createDrawingSet(drawingSet: InsertDrawingSet): Promise<DrawingSet>;

  // Sign Types
  getSignTypes(projectId: string): Promise<(SignType & { specVersion?: string; signCount: number })[]>;
  getSignType(id: string): Promise<SignType | undefined>;
  createSignType(signType: InsertSignType): Promise<SignType>;

  // Spec Pages
  getSpecPage(signTypeId: string): Promise<SpecPage | undefined>;
  createSpecPage(specPage: InsertSpecPage): Promise<SpecPage>;
  updateSpecPage(id: string, specPage: Partial<InsertSpecPage>): Promise<SpecPage>;

  // Signs
  getSigns(projectId: string): Promise<(Sign & { signTypeName: string })[]>;
  getSign(id: string): Promise<Sign | undefined>;
  createSign(sign: InsertSign): Promise<Sign>;
  updateSign(id: string, sign: Partial<InsertSign>): Promise<Sign>;

  // Tile Artworks
  getTileArtwork(signId: string): Promise<TileArtwork | undefined>;
  createTileArtwork(artwork: InsertTileArtwork): Promise<TileArtwork>;
  updateTileArtwork(id: string, artwork: Partial<InsertTileArtwork>): Promise<TileArtwork>;
  markArtworkStale(signTypeId: string): Promise<void>;

  // Comments
  getComments(entityType: string, entityId: string): Promise<(Comment & { userName: string })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // ROM Pricing
  getRomPricing(projectId: string): Promise<RomPricing | undefined>;
  updateRomPricing(projectId: string, total: number, breakdown: any): Promise<RomPricing>;
  recalculateRom(projectId: string): Promise<void>;

  // Code Summary
  getCodeSummary(projectId: string): Promise<CodeSummary | undefined>;

  // Example Packages
  getExamplePackages(): Promise<ExamplePackage[]>;

  // Vendors & RFQs
  getVendors(): Promise<Vendor[]>;
  getRfqs(projectId: string): Promise<(Rfq & { bidCount: number; lowestBid?: number })[]>;
  createRfq(rfq: InsertRfq): Promise<Rfq>;
  getBids(rfqId: string): Promise<(Bid & { vendorName: string })[]>;
  createBid(bid: InsertBid): Promise<Bid>;

  // Proofs
  getProof(projectId: string): Promise<(Proof & { items: (ProofItem & { sign: Sign })[] }) | undefined>;
  createProof(projectId: string): Promise<Proof>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private drawingSets: Map<string, DrawingSet>;
  private signTypes: Map<string, SignType>;
  private specPages: Map<string, SpecPage>;
  private signs: Map<string, Sign>;
  private tileArtworks: Map<string, TileArtwork>;
  private comments: Map<string, Comment>;
  private romPricing: Map<string, RomPricing>;
  private codeSummaries: Map<string, CodeSummary>;
  private examplePackages: Map<string, ExamplePackage>;
  private vendors: Map<string, Vendor>;
  private rfqs: Map<string, Rfq>;
  private bids: Map<string, Bid>;
  private proofs: Map<string, Proof>;
  private proofItems: Map<string, ProofItem>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.drawingSets = new Map();
    this.signTypes = new Map();
    this.specPages = new Map();
    this.signs = new Map();
    this.tileArtworks = new Map();
    this.comments = new Map();
    this.romPricing = new Map();
    this.codeSummaries = new Map();
    this.examplePackages = new Map();
    this.vendors = new Map();
    this.rfqs = new Map();
    this.bids = new Map();
    this.proofs = new Map();
    this.proofItems = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(insertUser.passwordHash, 10);
    const user: User = { 
      ...insertUser, 
      id, 
      passwordHash,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async getDrawingSets(projectId: string): Promise<DrawingSet[]> {
    return Array.from(this.drawingSets.values()).filter(ds => ds.projectId === projectId);
  }

  async createDrawingSet(insertDrawingSet: InsertDrawingSet): Promise<DrawingSet> {
    const id = randomUUID();
    const drawingSet: DrawingSet = { 
      ...insertDrawingSet, 
      id, 
      uploadedAt: new Date()
    };
    this.drawingSets.set(id, drawingSet);
    return drawingSet;
  }

  async getSignTypes(projectId: string): Promise<(SignType & { specVersion?: string; signCount: number })[]> {
    const signTypes = Array.from(this.signTypes.values()).filter(st => st.projectId === projectId);
    
    return signTypes.map(signType => {
      const specPage = signType.specPageId ? this.specPages.get(signType.specPageId) : undefined;
      const signCount = Array.from(this.signs.values()).filter(s => s.signTypeId === signType.id).length;
      
      return {
        ...signType,
        specVersion: specPage?.version,
        signCount
      };
    });
  }

  async getSignType(id: string): Promise<SignType | undefined> {
    return this.signTypes.get(id);
  }

  async createSignType(insertSignType: InsertSignType): Promise<SignType> {
    const id = randomUUID();
    const signType: SignType = { 
      ...insertSignType, 
      id, 
      createdAt: new Date()
    };
    this.signTypes.set(id, signType);
    return signType;
  }

  async getSpecPage(signTypeId: string): Promise<SpecPage | undefined> {
    return Array.from(this.specPages.values()).find(sp => sp.signTypeId === signTypeId);
  }

  async createSpecPage(insertSpecPage: InsertSpecPage): Promise<SpecPage> {
    const id = randomUUID();
    const specPage: SpecPage = { 
      ...insertSpecPage, 
      id, 
      updatedAt: new Date()
    };
    this.specPages.set(id, specPage);
    return specPage;
  }

  async updateSpecPage(id: string, updateData: Partial<InsertSpecPage>): Promise<SpecPage> {
    const specPage = this.specPages.get(id);
    if (!specPage) throw new Error('Spec page not found');
    
    const updated: SpecPage = { 
      ...specPage, 
      ...updateData, 
      updatedAt: new Date()
    };
    this.specPages.set(id, updated);
    
    // Mark related artworks as stale
    const signType = Array.from(this.signTypes.values()).find(st => st.specPageId === id);
    if (signType) {
      await this.markArtworkStale(signType.id);
    }
    
    return updated;
  }

  async getSigns(projectId: string): Promise<(Sign & { signTypeName: string })[]> {
    const signs = Array.from(this.signs.values()).filter(s => s.projectId === projectId);
    
    return signs.map(sign => {
      const signType = this.signTypes.get(sign.signTypeId);
      return {
        ...sign,
        signTypeName: signType?.name || 'Unknown'
      };
    });
  }

  async getSign(id: string): Promise<Sign | undefined> {
    return this.signs.get(id);
  }

  async createSign(insertSign: InsertSign): Promise<Sign> {
    const id = randomUUID();
    const sign: Sign = { 
      ...insertSign, 
      id, 
      updatedAt: new Date()
    };
    this.signs.set(id, sign);
    
    // Recalculate ROM pricing
    await this.recalculateRom(insertSign.projectId);
    
    return sign;
  }

  async updateSign(id: string, updateData: Partial<InsertSign>): Promise<Sign> {
    const sign = this.signs.get(id);
    if (!sign) throw new Error('Sign not found');
    
    const updated: Sign = { 
      ...sign, 
      ...updateData, 
      updatedAt: new Date()
    };
    this.signs.set(id, updated);
    
    // Recalculate ROM pricing
    await this.recalculateRom(sign.projectId);
    
    return updated;
  }

  async getTileArtwork(signId: string): Promise<TileArtwork | undefined> {
    return Array.from(this.tileArtworks.values()).find(ta => ta.signId === signId);
  }

  async createTileArtwork(insertTileArtwork: InsertTileArtwork): Promise<TileArtwork> {
    const id = randomUUID();
    const tileArtwork: TileArtwork = { 
      ...insertTileArtwork, 
      id, 
      updatedAt: new Date()
    };
    this.tileArtworks.set(id, tileArtwork);
    return tileArtwork;
  }

  async updateTileArtwork(id: string, updateData: Partial<InsertTileArtwork>): Promise<TileArtwork> {
    const artwork = this.tileArtworks.get(id);
    if (!artwork) throw new Error('Tile artwork not found');
    
    const updated: TileArtwork = { 
      ...artwork, 
      ...updateData, 
      updatedAt: new Date()
    };
    this.tileArtworks.set(id, updated);
    return updated;
  }

  async markArtworkStale(signTypeId: string): Promise<void> {
    const signs = Array.from(this.signs.values()).filter(s => s.signTypeId === signTypeId);
    
    for (const sign of signs) {
      const artwork = await this.getTileArtwork(sign.id);
      if (artwork) {
        const params = artwork.paramsJson as any || {};
        params.stale = true;
        await this.updateTileArtwork(artwork.id, { paramsJson: params });
      }
    }
  }

  async getComments(entityType: string, entityId: string): Promise<(Comment & { userName: string })[]> {
    const comments = Array.from(this.comments.values())
      .filter(c => c.entityType === entityType && c.entityId === entityId);
    
    return comments.map(comment => {
      const user = this.users.get(comment.userId);
      return {
        ...comment,
        userName: user?.name || 'Unknown User'
      };
    });
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getRomPricing(projectId: string): Promise<RomPricing | undefined> {
    return Array.from(this.romPricing.values()).find(rp => rp.projectId === projectId);
  }

  async updateRomPricing(projectId: string, total: number, breakdown: any): Promise<RomPricing> {
    const existing = await this.getRomPricing(projectId);
    
    if (existing) {
      const updated: RomPricing = {
        ...existing,
        summaryTotal: total,
        breakdownJson: breakdown,
        updatedAt: new Date()
      };
      this.romPricing.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const romPricing: RomPricing = {
        id,
        projectId,
        summaryTotal: total,
        breakdownJson: breakdown,
        assumptions: 'Auto-calculated from sign pricing',
        updatedAt: new Date()
      };
      this.romPricing.set(id, romPricing);
      return romPricing;
    }
  }

  async recalculateRom(projectId: string): Promise<void> {
    const signs = Array.from(this.signs.values()).filter(s => s.projectId === projectId);
    const total = signs.reduce((sum, sign) => sum + (sign.unitPrice * sign.qty), 0);
    
    const breakdown = {
      signCount: signs.length,
      avgPrice: signs.length > 0 ? total / signs.length : 0,
      byCategory: {}
    };
    
    await this.updateRomPricing(projectId, total, breakdown);
  }

  async getCodeSummary(projectId: string): Promise<CodeSummary | undefined> {
    return Array.from(this.codeSummaries.values()).find(cs => cs.projectId === projectId);
  }

  async getExamplePackages(): Promise<ExamplePackage[]> {
    return Array.from(this.examplePackages.values());
  }

  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getRfqs(projectId: string): Promise<(Rfq & { bidCount: number; lowestBid?: number })[]> {
    const rfqs = Array.from(this.rfqs.values()).filter(r => r.projectId === projectId);
    
    return rfqs.map(rfq => {
      const bids = Array.from(this.bids.values()).filter(b => b.rfqId === rfq.id);
      const lowestBid = bids.length > 0 ? Math.min(...bids.map(b => b.price)) : undefined;
      
      return {
        ...rfq,
        bidCount: bids.length,
        lowestBid
      };
    });
  }

  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const id = randomUUID();
    const rfq: Rfq = { 
      ...insertRfq, 
      id, 
      createdAt: new Date()
    };
    this.rfqs.set(id, rfq);
    return rfq;
  }

  async getBids(rfqId: string): Promise<(Bid & { vendorName: string })[]> {
    const bids = Array.from(this.bids.values()).filter(b => b.rfqId === rfqId);
    
    return bids.map(bid => {
      const vendor = this.vendors.get(bid.vendorId);
      return {
        ...bid,
        vendorName: vendor?.org || 'Unknown Vendor'
      };
    });
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = randomUUID();
    const bid: Bid = { 
      ...insertBid, 
      id, 
      createdAt: new Date()
    };
    this.bids.set(id, bid);
    return bid;
  }

  async getProof(projectId: string): Promise<(Proof & { items: (ProofItem & { sign: Sign })[] }) | undefined> {
    const proof = Array.from(this.proofs.values()).find(p => p.projectId === projectId);
    if (!proof) return undefined;
    
    const items = Array.from(this.proofItems.values())
      .filter(pi => pi.proofId === proof.id)
      .map(item => {
        const sign = this.signs.get(item.signId);
        return {
          ...item,
          sign: sign!
        };
      });
    
    return {
      ...proof,
      items
    };
  }

  async createProof(projectId: string): Promise<Proof> {
    const id = randomUUID();
    const proof: Proof = {
      id,
      projectId,
      currentVersion: '1.0',
      status: 'draft',
      createdAt: new Date()
    };
    this.proofs.set(id, proof);
    return proof;
  }
}

export const storage = new MemStorage();
