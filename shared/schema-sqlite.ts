import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'developer' | 'gc' | 'architect' | 'pm' | 'vendor'
  org: text("org").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  address: text("address"),
  clientOrg: text("client_org"),
  status: text("status").notNull().default('active'),
  logoPath: text("logo_path"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const drawingSets = sqliteTable("drawing_sets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  filePath: text("file_path").notNull(),
  filename: text("filename").notNull(),
  totalPages: integer("total_pages").notNull(),
  includedPagesJson: text("included_pages_json"),
  notes: text("notes"),
  uploadedAt: integer("uploaded_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const signTypes = sqliteTable("sign_types", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  specPageId: text("spec_page_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const specPages = sqliteTable("spec_pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  signTypeId: text("sign_type_id").notNull().references(() => signTypes.id),
  title: text("title").notNull(),
  jsonSpecs: text("json_specs"), // JSON stored as text in SQLite
  filePath: text("file_path"),
  version: text("version").notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const signs = sqliteTable("signs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  signTypeId: text("sign_type_id").notNull().references(() => signTypes.id),
  locationRef: text("location_ref").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
  unitPrice: real("unit_price").notNull(),
  qty: integer("qty").notNull(),
  status: text("status").notNull().default('draft'),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const tileArtworks = sqliteTable("tile_artworks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  signId: text("sign_id").notNull().references(() => signs.id),
  filePath: text("file_path"),
  paramsJson: text("params_json"), // JSON stored as text in SQLite
  version: text("version").notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const proofs = sqliteTable("proofs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  currentVersion: text("current_version").notNull(),
  status: text("status").notNull().default('draft'),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const proofItems = sqliteTable("proof_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  proofId: text("proof_id").notNull().references(() => proofs.id),
  signId: text("sign_id").notNull().references(() => signs.id),
  pageNumber: integer("page_number"),
  x: real("x"),
  y: real("y"),
  w: real("w"),
  h: real("h"),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  entityType: text("entity_type").notNull(), // 'sign' | 'spec' | 'proof'
  entityId: text("entity_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  pinnedX: real("pinned_x"),
  pinnedY: real("pinned_y"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const romPricing = sqliteTable("rom_pricing", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  total: real("total").notNull(),
  breakdownJson: text("breakdown_json"), // JSON stored as text in SQLite
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const codeSummaries = sqliteTable("code_summaries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  summaryJson: text("summary_json"), // JSON stored as text in SQLite
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const examplePackages = sqliteTable("example_packages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  priceMin: real("price_min").notNull(),
  priceMax: real("price_max").notNull(),
  templateJson: text("template_json"), // JSON stored as text in SQLite
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  org: text("org").notNull(),
  contactEmail: text("contact_email").notNull(),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  regionsJson: text("regions_json"), // JSON stored as text in SQLite
  capabilitiesJson: text("capabilities_json"), // JSON stored as text in SQLite
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const rfqs = sqliteTable("rfqs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  scopeJson: text("scope_json"), // JSON stored as text in SQLite
  dueDate: integer("due_date", { mode: 'timestamp' }),
  status: text("status").notNull().default('draft'),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const bids = sqliteTable("bids", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  rfqId: text("rfq_id").notNull().references(() => rfqs.id),
  vendorId: text("vendor_id").notNull().references(() => vendors.id),
  price: real("price").notNull(),
  leadTimeWeeks: integer("lead_time_weeks").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const takeoffPages = sqliteTable("takeoff_pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  drawingSetId: text("drawing_set_id").notNull().references(() => drawingSets.id),
  pageNumber: integer("page_number").notNull(),
  isIncluded: integer("is_included", { mode: 'boolean' }).notNull().default(false),
});

export const masterSignTypes = sqliteTable("master_sign_types", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(),
  defaultSpecsJson: text("default_specs_json"), // JSON stored as text in SQLite
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const projectSignTypes = sqliteTable("project_sign_types", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  masterSignTypeId: text("master_sign_type_id").references(() => masterSignTypes.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  customSpecsJson: text("custom_specs_json"), // JSON stored as text in SQLite
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const takeoffMarkers = sqliteTable("takeoff_markers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  drawingSetId: text("drawing_set_id").notNull().references(() => drawingSets.id),
  pageNumber: integer("page_number").notNull(),
  projectSignTypeId: text("project_sign_type_id").notNull().references(() => projectSignTypes.id),
  x: real("x").notNull(),
  y: real("y").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
  qty: integer("qty").notNull().default(1),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type DrawingSet = typeof drawingSets.$inferSelect;
export type InsertDrawingSet = typeof drawingSets.$inferInsert;
export type SignType = typeof signTypes.$inferSelect;
export type InsertSignType = typeof signTypes.$inferInsert;
export type SpecPage = typeof specPages.$inferSelect;
export type InsertSpecPage = typeof specPages.$inferInsert;
export type Sign = typeof signs.$inferSelect;
export type InsertSign = typeof signs.$inferInsert;
export type TileArtwork = typeof tileArtworks.$inferSelect;
export type InsertTileArtwork = typeof tileArtworks.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type RomPricing = typeof romPricing.$inferSelect;
export type CodeSummary = typeof codeSummaries.$inferSelect;
export type ExamplePackage = typeof examplePackages.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Rfq = typeof rfqs.$inferSelect;
export type InsertRfq = typeof rfqs.$inferInsert;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = typeof bids.$inferInsert;
export type Proof = typeof proofs.$inferSelect;
export type ProofItem = typeof proofItems.$inferSelect;
export type TakeoffPage = typeof takeoffPages.$inferSelect;
export type InsertTakeoffPage = typeof takeoffPages.$inferInsert;
export type MasterSignType = typeof masterSignTypes.$inferSelect;
export type InsertMasterSignType = typeof masterSignTypes.$inferInsert;
export type ProjectSignType = typeof projectSignTypes.$inferSelect;
export type InsertProjectSignType = typeof projectSignTypes.$inferInsert;
export type TakeoffMarker = typeof takeoffMarkers.$inferSelect;
export type InsertTakeoffMarker = typeof takeoffMarkers.$inferInsert;

// Insert schemas
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
