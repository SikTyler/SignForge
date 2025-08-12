import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'developer' | 'gc' | 'architect' | 'pm' | 'vendor'
  org: text("org").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  clientOrg: text("client_org"),
  status: text("status").notNull().default('active'),
  logoPath: text("logo_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drawingSets = pgTable("drawing_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  filePath: text("file_path").notNull(),
  filename: text("filename").notNull(),
  totalPages: integer("total_pages").notNull(),
  includedPagesJson: text("included_pages_json"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const signTypes = pgTable("sign_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  specPageId: varchar("spec_page_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specPages = pgTable("spec_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  signTypeId: varchar("sign_type_id").notNull().references(() => signTypes.id),
  title: text("title").notNull(),
  jsonSpecs: json("json_specs"),
  filePath: text("file_path"),
  version: text("version").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const signs = pgTable("signs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  signTypeId: varchar("sign_type_id").notNull().references(() => signTypes.id),
  locationRef: text("location_ref").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
  unitPrice: real("unit_price").notNull(),
  qty: integer("qty").notNull(),
  status: text("status").notNull().default('draft'),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tileArtworks = pgTable("tile_artworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  signId: varchar("sign_id").notNull().references(() => signs.id),
  filePath: text("file_path"),
  paramsJson: json("params_json"),
  version: text("version").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const proofs = pgTable("proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  currentVersion: text("current_version").notNull(),
  status: text("status").notNull().default('draft'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const proofItems = pgTable("proof_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proofId: varchar("proof_id").notNull().references(() => proofs.id),
  signId: varchar("sign_id").notNull().references(() => signs.id),
  pageNumber: integer("page_number"),
  x: real("x"),
  y: real("y"),
  w: real("w"),
  h: real("h"),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'sign' | 'spec' | 'proof'
  entityId: varchar("entity_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  pinnedX: real("pinned_x"),
  pinnedY: real("pinned_y"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const romPricing = pgTable("rom_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  summaryTotal: real("summary_total").notNull(),
  breakdownJson: json("breakdown_json"),
  assumptions: text("assumptions"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const codeSummaries = pgTable("code_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  jurisdiction: text("jurisdiction").notNull(),
  requiredJson: json("required_json"),
  restrictionsJson: json("restrictions_json"),
  allowancesJson: json("allowances_json"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const examplePackages = pgTable("example_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  priceMin: real("price_min").notNull(),
  priceMax: real("price_max").notNull(),
  templateJson: json("template_json"),
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  org: text("org").notNull(),
  regionsJson: json("regions_json"),
  capabilitiesJson: json("capabilities_json"),
  contactEmail: text("contact_email").notNull(),
  rating: real("rating"),
  reviewCount: integer("review_count"),
});

export const rfqs = pgTable("rfqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  scopeJson: json("scope_json"),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default('open'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfqId: varchar("rfq_id").notNull().references(() => rfqs.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  price: real("price").notNull(),
  leadTimeWeeks: integer("lead_time_weeks").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New tables for takeoffs functionality
export const takeoffPages = pgTable("takeoff_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  drawingSetId: varchar("drawing_set_id").notNull().references(() => drawingSets.id),
  pageNumber: integer("page_number").notNull(),
  isIncluded: boolean("is_included").notNull().default(false),
});

export const masterSignTypes = pgTable("master_sign_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  defaultSpecsJson: json("default_specs_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectSignTypes = pgTable("project_sign_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  specsJson: json("specs_json"),
  sourceMasterId: varchar("source_master_id").references(() => masterSignTypes.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const takeoffMarkers = pgTable("takeoff_markers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  drawingSetId: varchar("drawing_set_id").notNull().references(() => drawingSets.id),
  pageNumber: integer("page_number").notNull(),
  xNorm: real("x_norm").notNull(), // Normalized 0-1 coordinates
  yNorm: real("y_norm").notNull(),
  signTypeId: varchar("sign_type_id").references(() => projectSignTypes.id),
  stage: text("stage").notNull().default('draft'), // 'draft' | 'review' | 'approved'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertDrawingSetSchema = createInsertSchema(drawingSets).omit({
  id: true,
  uploadedAt: true,
});

export const insertSignTypeSchema = createInsertSchema(signTypes).omit({
  id: true,
  createdAt: true,
});

export const insertSpecPageSchema = createInsertSchema(specPages).omit({
  id: true,
  updatedAt: true,
});

export const insertSignSchema = createInsertSchema(signs).omit({
  id: true,
  updatedAt: true,
});

export const insertTileArtworkSchema = createInsertSchema(tileArtworks).omit({
  id: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertRfqSchema = createInsertSchema(rfqs).omit({
  id: true,
  createdAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

// New insert schemas
export const insertTakeoffPageSchema = createInsertSchema(takeoffPages).omit({
  id: true,
});

export const insertMasterSignTypeSchema = createInsertSchema(masterSignTypes).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSignTypeSchema = createInsertSchema(projectSignTypes).omit({
  id: true,
  createdAt: true,
});

export const insertTakeoffMarkerSchema = createInsertSchema(takeoffMarkers).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type DrawingSet = typeof drawingSets.$inferSelect;
export type InsertDrawingSet = z.infer<typeof insertDrawingSetSchema>;
export type SignType = typeof signTypes.$inferSelect;
export type InsertSignType = z.infer<typeof insertSignTypeSchema>;
export type SpecPage = typeof specPages.$inferSelect;
export type InsertSpecPage = z.infer<typeof insertSpecPageSchema>;
export type Sign = typeof signs.$inferSelect;
export type InsertSign = z.infer<typeof insertSignSchema>;
export type TileArtwork = typeof tileArtworks.$inferSelect;
export type InsertTileArtwork = z.infer<typeof insertTileArtworkSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type RomPricing = typeof romPricing.$inferSelect;
export type CodeSummary = typeof codeSummaries.$inferSelect;
export type ExamplePackage = typeof examplePackages.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Rfq = typeof rfqs.$inferSelect;
export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Proof = typeof proofs.$inferSelect;
export type ProofItem = typeof proofItems.$inferSelect;

// New types
export type TakeoffPage = typeof takeoffPages.$inferSelect;
export type InsertTakeoffPage = z.infer<typeof insertTakeoffPageSchema>;
export type MasterSignType = typeof masterSignTypes.$inferSelect;
export type InsertMasterSignType = z.infer<typeof insertMasterSignTypeSchema>;
export type ProjectSignType = typeof projectSignTypes.$inferSelect;
export type InsertProjectSignType = z.infer<typeof insertProjectSignTypeSchema>;
export type TakeoffMarker = typeof takeoffMarkers.$inferSelect;
export type InsertTakeoffMarker = z.infer<typeof insertTakeoffMarkerSchema>;
