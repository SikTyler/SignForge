import { 
  type User, type InsertUser, type Project, type InsertProject,
  type DrawingSet, type InsertDrawingSet, type SignType, type InsertSignType,
  type SpecPage, type InsertSpecPage, type Sign, type InsertSign,
  type TileArtwork, type InsertTileArtwork, type Comment, type InsertComment,
  type RomPricing, type CodeSummary, type ExamplePackage, type Vendor,
  type Rfq, type InsertRfq, type Bid, type InsertBid, type Proof, type ProofItem,
  type TakeoffPage, type InsertTakeoffPage, type MasterSignType, type InsertMasterSignType,
  type ProjectSignType, type InsertProjectSignType, type TakeoffMarker, type InsertTakeoffMarker,
  users, projects, drawingSets, signTypes, specPages, signs, tileArtworks, comments,
  romPricing, codeSummaries, examplePackages, vendors, rfqs, bids, proofs, proofItems,
  takeoffPages, masterSignTypes, projectSignTypes, takeoffMarkers
} from "@shared/schema-sqlite";
import { db } from "./db-sqlite";
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

  async getDrawingSets(projectId: string): Promise<DrawingSet[]> {
    return await db.select().from(drawingSets).where(eq(drawingSets.projectId, projectId));
  }

  async createDrawingSet(insertDrawingSet: InsertDrawingSet): Promise<DrawingSet> {
    const [drawingSet] = await db
      .insert(drawingSets)
      .values(insertDrawingSet)
      .returning();
    
    // Create takeoff pages for each page
    const pages = Array.from({ length: insertDrawingSet.totalPages }, (_, i) => ({
      drawingSetId: drawingSet.id,
      pageNumber: i + 1,
      isIncluded: false
    }));
    
    await db.insert(takeoffPages).values(pages);
    
    return drawingSet;
  }

  async updateDrawingSetPages(drawingSetId: string, includedPages: number[]): Promise<DrawingSet> {
    // Update included_pages_json in drawing set
    const [drawingSet] = await db
      .update(drawingSets)
      .set({ includedPagesJson: JSON.stringify(includedPages) })
      .where(eq(drawingSets.id, drawingSetId))
      .returning();
    
    // Update takeoff pages
    await db
      .update(takeoffPages)
      .set({ isIncluded: false })
      .where(eq(takeoffPages.drawingSetId, drawingSetId));
    
    if (includedPages.length > 0) {
      await db
        .update(takeoffPages)
        .set({ isIncluded: true })
        .where(
          and(
            eq(takeoffPages.drawingSetId, drawingSetId),
            inArray(takeoffPages.pageNumber, includedPages)
          )
        );
    }
    
    return drawingSet;
  }

  async getTakeoffPages(drawingSetId: string): Promise<TakeoffPage[]> {
    return await db.select().from(takeoffPages).where(eq(takeoffPages.drawingSetId, drawingSetId));
  }

  async getSignTypes(projectId: string): Promise<(SignType & { specVersion?: string; signCount: number })[]> {
    const result = await db
      .select({
        signType: signTypes,
        specPage: specPages,
        signCount: sql<number>`COALESCE(COUNT(${signs.id}), 0)`.as('sign_count')
      })
      .from(signTypes)
      .leftJoin(specPages, eq(signTypes.specPageId, specPages.id))
      .leftJoin(signs, eq(signTypes.id, signs.signTypeId))
      .where(eq(signTypes.projectId, projectId))
      .groupBy(signTypes.id, specPages.id);

    return result.map(({ signType, specPage, signCount }) => ({
      ...signType,
      specVersion: specPage?.version,
      signCount: Number(signCount)
    }));
  }

  async getSignType(id: string): Promise<SignType | undefined> {
    const [signType] = await db.select().from(signTypes).where(eq(signTypes.id, id));
    return signType || undefined;
  }

  async createSignType(insertSignType: InsertSignType): Promise<SignType> {
    const [signType] = await db
      .insert(signTypes)
      .values(insertSignType)
      .returning();
    return signType;
  }

  async getSpecPage(signTypeId: string): Promise<SpecPage | undefined> {
    const [specPage] = await db.select().from(specPages).where(eq(specPages.signTypeId, signTypeId));
    return specPage || undefined;
  }

  async createSpecPage(insertSpecPage: InsertSpecPage): Promise<SpecPage> {
    const [specPage] = await db
      .insert(specPages)
      .values(insertSpecPage)
      .returning();
    return specPage;
  }

  async updateSpecPage(id: string, updateData: Partial<InsertSpecPage>): Promise<SpecPage> {
    const [specPage] = await db
      .update(specPages)
      .set(updateData)
      .where(eq(specPages.id, id))
      .returning();
    
    if (!specPage) throw new Error('Spec page not found');
    return specPage;
  }

  async getSigns(projectId: string): Promise<(Sign & { signTypeName: string })[]> {
    const result = await db
      .select({
        sign: signs,
        signTypeName: signTypes.name
      })
      .from(signs)
      .leftJoin(signTypes, eq(signs.signTypeId, signTypes.id))
      .where(eq(signs.projectId, projectId));

    return result.map(({ sign, signTypeName }) => ({
      ...sign,
      signTypeName: signTypeName || 'Unknown'
    }));
  }

  async getSign(id: string): Promise<Sign | undefined> {
    const [sign] = await db.select().from(signs).where(eq(signs.id, id));
    return sign || undefined;
  }

  async createSign(insertSign: InsertSign): Promise<Sign> {
    const [sign] = await db
      .insert(signs)
      .values(insertSign)
      .returning();
    return sign;
  }

  async updateSign(id: string, updateData: Partial<InsertSign>): Promise<Sign> {
    const [sign] = await db
      .update(signs)
      .set(updateData)
      .where(eq(signs.id, id))
      .returning();
    
    if (!sign) throw new Error('Sign not found');
    return sign;
  }

  async getTileArtwork(signId: string): Promise<TileArtwork | undefined> {
    const [artwork] = await db.select().from(tileArtworks).where(eq(tileArtworks.signId, signId));
    return artwork || undefined;
  }

  async createTileArtwork(insertTileArtwork: InsertTileArtwork): Promise<TileArtwork> {
    const [artwork] = await db
      .insert(tileArtworks)
      .values(insertTileArtwork)
      .returning();
    return artwork;
  }

  async updateTileArtwork(id: string, updateData: Partial<InsertTileArtwork>): Promise<TileArtwork> {
    const [artwork] = await db
      .update(tileArtworks)
      .set(updateData)
      .where(eq(tileArtworks.id, id))
      .returning();
    
    if (!artwork) throw new Error('Tile artwork not found');
    return artwork;
  }

  async markArtworkStale(signTypeId: string): Promise<void> {
    await db
      .update(tileArtworks)
      .set({ version: sql`${tileArtworks.version} || '_stale'` })
      .where(
        eq(tileArtworks.signId, sql`(
          SELECT ${signs.id} FROM ${signs} 
          WHERE ${signs.signTypeId} = ${signTypeId}
        )`)
      );
  }

  async getComments(entityType: string, entityId: string): Promise<(Comment & { userName: string })[]> {
    const result = await db
      .select({
        comment: comments,
        userName: users.name
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.entityType, entityType),
          eq(comments.entityId, entityId)
        )
      );

    return result.map(({ comment, userName }) => ({
      ...comment,
      userName: userName || 'Unknown User'
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getRomPricing(projectId: string): Promise<RomPricing | undefined> {
    const [pricing] = await db.select().from(romPricing).where(eq(romPricing.projectId, projectId));
    return pricing || undefined;
  }

  async updateRomPricing(projectId: string, total: number, breakdown: any): Promise<RomPricing> {
    const existing = await this.getRomPricing(projectId);
    
    if (existing) {
      const [pricing] = await db
        .update(romPricing)
        .set({ 
          summaryTotal: total, 
          breakdownJson: breakdown,
          updatedAt: new Date()
        })
        .where(eq(romPricing.projectId, projectId))
        .returning();
      return pricing;
    } else {
      const [pricing] = await db
        .insert(romPricing)
        .values({ 
          projectId, 
          summaryTotal: total, 
          breakdownJson: breakdown 
        })
        .returning();
      return pricing;
    }
  }

  async recalculateRom(projectId: string): Promise<void> {
    // Simple recalculation - sum up all signs
    const projectSigns = await this.getSigns(projectId);
    const total = projectSigns.reduce((sum, sign) => sum + (sign.unitPrice * sign.qty), 0);
    
    const breakdown = {
      signage: total,
      installation: total * 0.3, // 30% for installation
      permits: 500, // fixed permit cost
      total: total * 1.3 + 500
    };
    
    await this.updateRomPricing(projectId, breakdown.total, breakdown);
  }

  async getCodeSummary(projectId: string): Promise<CodeSummary | undefined> {
    const [summary] = await db.select().from(codeSummaries).where(eq(codeSummaries.projectId, projectId));
    return summary || undefined;
  }

  async getExamplePackages(): Promise<ExamplePackage[]> {
    return await db.select().from(examplePackages);
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getRfqs(projectId: string): Promise<(Rfq & { bidCount: number; lowestBid?: number })[]> {
    const result = await db
      .select({
        rfq: rfqs,
        bidCount: sql<number>`COALESCE(COUNT(${bids.id}), 0)`.as('bid_count'),
        lowestBid: sql<number>`MIN(${bids.price})`.as('lowest_bid')
      })
      .from(rfqs)
      .leftJoin(bids, eq(rfqs.id, bids.rfqId))
      .where(eq(rfqs.projectId, projectId))
      .groupBy(rfqs.id);

    return result.map(({ rfq, bidCount, lowestBid }) => ({
      ...rfq,
      bidCount: Number(bidCount),
      lowestBid: lowestBid ? Number(lowestBid) : undefined
    }));
  }

  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const [rfq] = await db
      .insert(rfqs)
      .values(insertRfq)
      .returning();
    return rfq;
  }

  async getBids(rfqId: string): Promise<(Bid & { vendorName: string })[]> {
    const result = await db
      .select({
        bid: bids,
        vendorName: vendors.org
      })
      .from(bids)
      .leftJoin(vendors, eq(bids.vendorId, vendors.id))
      .where(eq(bids.rfqId, rfqId));

    return result.map(({ bid, vendorName }) => ({
      ...bid,
      vendorName: vendorName || 'Unknown Vendor'
    }));
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db
      .insert(bids)
      .values(insertBid)
      .returning();
    return bid;
  }

  async getProof(projectId: string): Promise<(Proof & { items: (ProofItem & { sign: Sign })[] }) | undefined> {
    const [proof] = await db.select().from(proofs).where(eq(proofs.projectId, projectId));
    if (!proof) return undefined;

    const items = await db
      .select({
        proofItem: proofItems,
        sign: signs
      })
      .from(proofItems)
      .leftJoin(signs, eq(proofItems.signId, signs.id))
      .where(eq(proofItems.proofId, proof.id));

    return {
      ...proof,
      items: items.map(({ proofItem, sign }) => ({
        ...proofItem,
        sign: sign!
      }))
    };
  }

  async createProof(projectId: string): Promise<Proof> {
    const [proof] = await db
      .insert(proofs)
      .values({ projectId, currentVersion: '1.0', status: 'draft' })
      .returning();
    return proof;
  }

  // New methods for takeoffs functionality
  async getMasterSignTypes(): Promise<MasterSignType[]> {
    return await db.select().from(masterSignTypes);
  }

  async createMasterSignType(insertMasterSignType: InsertMasterSignType): Promise<MasterSignType> {
    const [masterSignType] = await db
      .insert(masterSignTypes)
      .values(insertMasterSignType)
      .returning();
    return masterSignType;
  }

  async getProjectSignTypes(projectId: string): Promise<ProjectSignType[]> {
    return await db.select().from(projectSignTypes).where(eq(projectSignTypes.projectId, projectId));
  }

  async createProjectSignType(insertProjectSignType: InsertProjectSignType): Promise<ProjectSignType> {
    const [projectSignType] = await db
      .insert(projectSignTypes)
      .values(insertProjectSignType)
      .returning();
    return projectSignType;
  }

  async copyMasterSignTypesToProject(projectId: string, masterIds: string[]): Promise<ProjectSignType[]> {
    const masterSignTypesToCopy = await db
      .select()
      .from(masterSignTypes)
      .where(inArray(masterSignTypes.id, masterIds));

    const projectSignTypesToInsert = masterSignTypesToCopy.map(master => ({
      projectId,
      name: master.name,
      category: master.category,
      specsJson: master.defaultSpecsJson,
      sourceMasterId: master.id
    }));

    const insertedProjectSignTypes = await db
      .insert(projectSignTypes)
      .values(projectSignTypesToInsert)
      .returning();

    return insertedProjectSignTypes;
  }

  async updateProjectSignType(id: string, updateData: Partial<InsertProjectSignType>): Promise<ProjectSignType> {
    const [projectSignType] = await db
      .update(projectSignTypes)
      .set(updateData)
      .where(eq(projectSignTypes.id, id))
      .returning();
    
    if (!projectSignType) throw new Error('Project sign type not found');
    return projectSignType;
  }

  async deleteProjectSignType(id: string): Promise<void> {
    await db.delete(projectSignTypes).where(eq(projectSignTypes.id, id));
  }

  async getTakeoffMarkers(projectId: string): Promise<TakeoffMarker[]> {
    return await db.select().from(takeoffMarkers).where(eq(takeoffMarkers.projectId, projectId));
  }

  async getTakeoffMarkersForPage(drawingSetId: string, pageNumber: number): Promise<TakeoffMarker[]> {
    return await db
      .select()
      .from(takeoffMarkers)
      .where(
        and(
          eq(takeoffMarkers.drawingSetId, drawingSetId),
          eq(takeoffMarkers.pageNumber, pageNumber)
        )
      );
  }

  async createTakeoffMarker(insertTakeoffMarker: InsertTakeoffMarker): Promise<TakeoffMarker> {
    const [marker] = await db
      .insert(takeoffMarkers)
      .values(insertTakeoffMarker)
      .returning();
    return marker;
  }

  async updateTakeoffMarker(id: string, updateData: Partial<InsertTakeoffMarker>): Promise<TakeoffMarker> {
    const [marker] = await db
      .update(takeoffMarkers)
      .set(updateData)
      .where(eq(takeoffMarkers.id, id))
      .returning();
    
    if (!marker) throw new Error('Takeoff marker not found');
    return marker;
  }

  async deleteTakeoffMarker(id: string): Promise<void> {
    await db.delete(takeoffMarkers).where(eq(takeoffMarkers.id, id));
  }

  async getTakeoffsData(projectId: string): Promise<{
    drawingSets: (DrawingSet & { includedPages: number[] })[];
    projectSignTypes: ProjectSignType[];
    markers: TakeoffMarker[];
  }> {
    const [drawingSetResults, projectSignTypesResults, markersResults] = await Promise.all([
      db.select().from(drawingSets).where(eq(drawingSets.projectId, projectId)),
      this.getProjectSignTypes(projectId),
      this.getTakeoffMarkers(projectId)
    ]);

    const drawingSetsWithPages = drawingSetResults.map(ds => ({
      ...ds,
      includedPages: ds.includedPagesJson ? JSON.parse(ds.includedPagesJson) : []
    }));

    return {
      drawingSets: drawingSetsWithPages,
      projectSignTypes: projectSignTypesResults,
      markers: markersResults
    };
  }
}