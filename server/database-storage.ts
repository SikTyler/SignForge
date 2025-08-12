import { 
  type User, type InsertUser, type Project, type InsertProject,
  type DrawingSet, type InsertDrawingSet, type SignType, type InsertSignType,
  type SpecPage, type InsertSpecPage, type Sign, type InsertSign,
  type TileArtwork, type InsertTileArtwork, type Comment, type InsertComment,
  type RomPricing, type CodeSummary, type ExamplePackage, type Vendor,
  type Rfq, type InsertRfq, type Bid, type InsertBid, type Proof, type ProofItem,
  type TakeoffPage, type InsertTakeoffPage, type MasterSignType, type InsertMasterSignType,
  type ProjectSignType, type InsertProjectSignType, type TakeoffMarker, type InsertTakeoffMarker,
  type SignItem, type InsertSignItem, type Takeoff, type InsertTakeoff, type TakeoffLine, type InsertTakeoffLine,
  type RomEstimate, type InsertRomEstimate, type InsertCodeSummary, type InsertVendor, type InsertMilestone,
  users, projects, drawingSets, signTypes, specPages, signs, tileArtworks, comments,
  romPricing, codeSummaries, examplePackages, vendors, rfqs, bids, proofs, proofItems,
  takeoffPages, masterSignTypes, projectSignTypes, takeoffMarkers, signItems, takeoffs, takeoffLines,
  romEstimates, milestones
} from "@shared/schema-sqlite";
import { db } from "./src/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const passwordHash = await bcrypt.hash(insertUser.passwordHash, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, passwordHash })
      .returning();
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  // Sign Types
  async getSignTypes(projectId: string): Promise<SignType[]> {
    return await db.select().from(signTypes).where(eq(signTypes.projectId, projectId));
  }

  async createSignType(insertSignType: InsertSignType): Promise<SignType> {
    const [signType] = await db
      .insert(signTypes)
      .values(insertSignType)
      .returning();
    return signType;
  }

  // Sign Items
  async getSignItems(signTypeId: string): Promise<SignItem[]> {
    return await db.select().from(signItems).where(eq(signItems.signTypeId, signTypeId));
  }

  async createSignItem(insertSignItem: InsertSignItem): Promise<SignItem> {
    const [signItem] = await db
      .insert(signItems)
      .values(insertSignItem)
      .returning();
    return signItem;
  }

  // Takeoffs
  async getTakeoffs(projectId: string): Promise<Takeoff[]> {
    return await db.select().from(takeoffs).where(eq(takeoffs.projectId, projectId));
  }

  async createTakeoff(insertTakeoff: InsertTakeoff): Promise<Takeoff> {
    const [takeoff] = await db
      .insert(takeoffs)
      .values(insertTakeoff)
      .returning();
    return takeoff;
  }

  // Takeoff Lines
  async getTakeoffLines(takeoffId: string): Promise<TakeoffLine[]> {
    return await db.select().from(takeoffLines).where(eq(takeoffLines.takeoffId, takeoffId));
  }

  async createTakeoffLine(insertTakeoffLine: InsertTakeoffLine): Promise<TakeoffLine> {
    const [takeoffLine] = await db
      .insert(takeoffLines)
      .values(insertTakeoffLine)
      .returning();
    return takeoffLine;
  }

  // ROM Estimates
  async getRomEstimates(projectId: string): Promise<RomEstimate[]> {
    return await db.select().from(romEstimates).where(eq(romEstimates.projectId, projectId));
  }

  async createRomEstimate(insertRomEstimate: InsertRomEstimate): Promise<RomEstimate> {
    const [romEstimate] = await db
      .insert(romEstimates)
      .values(insertRomEstimate)
      .returning();
    return romEstimate;
  }

  // Code Summaries
  async getCodeSummary(projectId: string): Promise<CodeSummary | undefined> {
    const [codeSummary] = await db
      .select()
      .from(codeSummaries)
      .where(eq(codeSummaries.projectId, projectId))
      .orderBy(sql`${codeSummaries.createdAt} DESC`)
      .limit(1);
    return codeSummary || undefined;
  }

  async createCodeSummary(insertCodeSummary: InsertCodeSummary): Promise<CodeSummary> {
    const [codeSummary] = await db
      .insert(codeSummaries)
      .values(insertCodeSummary)
      .returning();
    return codeSummary;
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  // RFQs
  async getRfqs(projectId: string): Promise<Rfq[]> {
    return await db.select().from(rfqs).where(eq(rfqs.projectId, projectId));
  }

  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const [rfq] = await db
      .insert(rfqs)
      .values(insertRfq)
      .returning();
    return rfq;
  }

  // Milestones
  async getMilestones(projectId: string): Promise<any[]> {
    return await db.select().from(milestones).where(eq(milestones.projectId, projectId));
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<any> {
    const [milestone] = await db
      .insert(milestones)
      .values(insertMilestone)
      .returning();
    return milestone;
  }

  // Example Packages
  async getExamplePackages(): Promise<ExamplePackage[]> {
    return await db.select().from(examplePackages);
  }

  async createExamplePackage(insertExamplePackage: any): Promise<ExamplePackage> {
    const [examplePackage] = await db
      .insert(examplePackages)
      .values(insertExamplePackage)
      .returning();
    return examplePackage;
  }

  // Legacy methods (keeping for compatibility)
  async getDrawingSets(projectId: string): Promise<DrawingSet[]> {
    return await db.select().from(drawingSets).where(eq(drawingSets.projectId, projectId));
  }

  async createDrawingSet(insertDrawingSet: InsertDrawingSet): Promise<DrawingSet> {
    const [drawingSet] = await db
      .insert(drawingSets)
      .values(insertDrawingSet)
      .returning();
    return drawingSet;
  }

  async updateDrawingSetPages(drawingSetId: string, includedPages: number[]): Promise<DrawingSet> {
    const [drawingSet] = await db
      .update(drawingSets)
      .set({ includedPagesJson: JSON.stringify(includedPages) })
      .where(eq(drawingSets.id, drawingSetId))
      .returning();
    return drawingSet;
  }

  async getSigns(projectId: string): Promise<Sign[]> {
    return await db.select().from(signs).where(eq(signs.projectId, projectId));
  }

  async createSign(insertSign: InsertSign): Promise<Sign> {
    const [sign] = await db
      .insert(signs)
      .values(insertSign)
      .returning();
    return sign;
  }

  async getSpecPages(signTypeId: string): Promise<SpecPage[]> {
    return await db.select().from(specPages).where(eq(specPages.signTypeId, signTypeId));
  }

  async createSpecPage(insertSpecPage: InsertSpecPage): Promise<SpecPage> {
    const [specPage] = await db
      .insert(specPages)
      .values(insertSpecPage)
      .returning();
    return specPage;
  }

  async getTileArtworks(signId: string): Promise<TileArtwork[]> {
    return await db.select().from(tileArtworks).where(eq(tileArtworks.signId, signId));
  }

  async createTileArtwork(insertTileArtwork: InsertTileArtwork): Promise<TileArtwork> {
    const [tileArtwork] = await db
      .insert(tileArtworks)
      .values(insertTileArtwork)
      .returning();
    return tileArtwork;
  }

  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(eq(comments.entityType, entityType), eq(comments.entityId, entityId)));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getProofs(projectId: string): Promise<Proof[]> {
    return await db.select().from(proofs).where(eq(proofs.projectId, projectId));
  }

  async createProof(projectId: string): Promise<Proof> {
    const [proof] = await db
      .insert(proofs)
      .values({ projectId, currentVersion: "v1.0" })
      .returning();
    return proof;
  }

  async getProofItems(proofId: string): Promise<ProofItem[]> {
    return await db.select().from(proofItems).where(eq(proofItems.proofId, proofId));
  }

  async getBids(rfqId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.rfqId, rfqId));
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db
      .insert(bids)
      .values(insertBid)
      .returning();
    return bid;
  }
}