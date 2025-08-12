import { 
  type User, type InsertUser, type Project, type InsertProject,
  type DrawingSet, type InsertDrawingSet, type SignType, type InsertSignType,
  type SpecPage, type InsertSpecPage, type Sign, type InsertSign,
  type TileArtwork, type InsertTileArtwork, type Comment, type InsertComment,
  type RomPricing, type CodeSummary, type ExamplePackage, type Vendor,
  type Rfq, type InsertRfq, type Bid, type InsertBid, type Proof, type ProofItem,
  type TakeoffPage, type InsertTakeoffPage, type MasterSignType, type InsertMasterSignType,
  type ProjectSignType, type InsertProjectSignType, type TakeoffMarker, type InsertTakeoffMarker
} from "@shared/schema-sqlite";

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
  updateDrawingSetPages(drawingSetId: string, includedPages: number[]): Promise<DrawingSet>;
  getTakeoffPages(drawingSetId: string): Promise<TakeoffPage[]>;

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

  // Master Sign Types
  getMasterSignTypes(): Promise<MasterSignType[]>;
  createMasterSignType(masterSignType: InsertMasterSignType): Promise<MasterSignType>;
  
  // Project Sign Types
  getProjectSignTypes(projectId: string): Promise<ProjectSignType[]>;
  createProjectSignType(projectSignType: InsertProjectSignType): Promise<ProjectSignType>;
  copyMasterSignTypesToProject(projectId: string, masterIds: string[]): Promise<ProjectSignType[]>;
  updateProjectSignType(id: string, projectSignType: Partial<InsertProjectSignType>): Promise<ProjectSignType>;
  deleteProjectSignType(id: string): Promise<void>;
  
  // Takeoff Markers
  getTakeoffMarkers(projectId: string): Promise<TakeoffMarker[]>;
  getTakeoffMarkersForPage(drawingSetId: string, pageNumber: number): Promise<TakeoffMarker[]>;
  createTakeoffMarker(marker: InsertTakeoffMarker): Promise<TakeoffMarker>;
  updateTakeoffMarker(id: string, marker: Partial<InsertTakeoffMarker>): Promise<TakeoffMarker>;
  deleteTakeoffMarker(id: string): Promise<void>;
  
  // Takeoffs data (combined)
  getTakeoffsData(projectId: string): Promise<{
    drawingSets: (DrawingSet & { includedPages: number[] })[];
    projectSignTypes: ProjectSignType[];
    markers: TakeoffMarker[];
  }>;
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();