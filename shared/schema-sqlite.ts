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

// Drawing Sets (versions of uploaded PDFs)
export const drawingSets = sqliteTable("drawing_sets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  version: text("version").notNull().default('1.0'),
  uploadedBy: text("uploaded_by").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Individual Drawing Files (PDFs within a set)
export const drawingFiles = sqliteTable("drawing_files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  drawingSetId: text("drawing_set_id").notNull().references(() => drawingSets.id),
  storageUrl: text("storage_url").notNull(),
  originalFilename: text("original_filename").notNull(),
  displayName: text("display_name").notNull(),
  scale: text("scale"),
  shortCode: text("short_code"),
  pageCount: integer("page_count"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sign Types (categories of signs)
export const signTypes = sqliteTable("sign_types", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  status: text("status").notNull().default('active'),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sign Items (individual signs with quantities and pricing)
export const signItems = sqliteTable("sign_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  signTypeId: text("sign_type_id").notNull().references(() => signTypes.id),
  label: text("label").notNull(),
  verbiage: text("verbiage"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  status: text("status").notNull().default('draft'),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Takeoffs (manual takeoff sessions)
export const takeoffs = sqliteTable("takeoffs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  method: text("method").notNull().default('human'), // 'human' | 'automated'
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Takeoff Line Items
export const takeoffLines = sqliteTable("takeoff_lines", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  takeoffId: text("takeoff_id").notNull().references(() => takeoffs.id),
  signTypeId: text("sign_type_id").references(() => signTypes.id),
  signItemId: text("sign_item_id").references(() => signItems.id),
  description: text("description").notNull(),
  qty: integer("qty").notNull().default(1),
  unit: text("unit").notNull().default('ea'),
  unitPrice: real("unit_price").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ROM Estimates
export const romEstimates = sqliteTable("rom_estimates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  takeoffId: text("takeoff_id").notNull().references(() => takeoffs.id),
  subtotal: real("subtotal").notNull(),
  tax: real("tax"),
  total: real("total").notNull(),
  categoryBreakdownJson: text("category_breakdown_json"), // JSON stored as text
  examplesRef: text("examples_ref"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Code Summaries
export const codeSummaries = sqliteTable("code_summaries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  jurisdiction: text("jurisdiction").notNull(),
  requiredJson: text("required_json"), // JSON stored as text
  allowancesJson: text("allowances_json"), // JSON stored as text
  restrictionsJson: text("restrictions_json"), // JSON stored as text
  reviewer: text("reviewer"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Vendors
export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgName: text("org_name").notNull(),
  capabilities: text("capabilities").notNull(), // 'build' | 'install' | 'both'
  regionsJson: text("regions_json"), // JSON stored as text
  contactEmail: text("contact_email").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// RFQs
export const rfqs = sqliteTable("rfqs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  vendorId: text("vendor_id").notNull().references(() => vendors.id),
  packageRef: text("package_ref"),
  status: text("status").notNull().default('draft'), // 'draft' | 'sent' | 'responded' | 'awarded' | 'closed'
  sentAt: integer("sent_at", { mode: 'timestamp' }),
  responseMetaJson: text("response_meta_json"), // JSON stored as text
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Milestones
export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id),
  kind: text("kind").notNull(), // 'fab_start' | 'fab_done' | 'ship' | 'install' | 'inspection' | 'punch'
  date: integer("date", { mode: 'timestamp' }).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Example Packages (seeded historical data)
export const examplePackages = sqliteTable("example_packages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  priceMin: real("price_min").notNull(),
  priceMax: real("price_max").notNull(),
  templateJson: text("template_json"), // JSON stored as text
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Legacy tables (keeping for compatibility)
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

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type DrawingSet = typeof drawingSets.$inferSelect;
export type InsertDrawingSet = typeof drawingSets.$inferInsert;
export type DrawingFile = typeof drawingFiles.$inferSelect;
export type InsertDrawingFile = typeof drawingFiles.$inferInsert;
export type SignType = typeof signTypes.$inferSelect;
export type InsertSignType = typeof signTypes.$inferInsert;
export type SignItem = typeof signItems.$inferSelect;
export type InsertSignItem = typeof signItems.$inferInsert;
export type Takeoff = typeof takeoffs.$inferSelect;
export type InsertTakeoff = typeof takeoffs.$inferInsert;
export type TakeoffLine = typeof takeoffLines.$inferSelect;
export type InsertTakeoffLine = typeof takeoffLines.$inferInsert;
export type RomEstimate = typeof romEstimates.$inferSelect;
export type InsertRomEstimate = typeof romEstimates.$inferInsert;
export type CodeSummary = typeof codeSummaries.$inferSelect;
export type InsertCodeSummary = typeof codeSummaries.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;
export type Rfq = typeof rfqs.$inferSelect;
export type InsertRfq = typeof rfqs.$inferInsert;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;
export type ExamplePackage = typeof examplePackages.$inferSelect;
export type InsertExamplePackage = typeof examplePackages.$inferInsert;
export type SpecPage = typeof specPages.$inferSelect;
export type InsertSpecPage = typeof specPages.$inferInsert;
export type Sign = typeof signs.$inferSelect;
export type InsertSign = typeof signs.$inferInsert;
export type TileArtwork = typeof tileArtworks.$inferSelect;
export type InsertTileArtwork = typeof tileArtworks.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Proof = typeof proofs.$inferSelect;
export type ProofItem = typeof proofItems.$inferSelect;

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
  createdAt: true,
});

export const insertDrawingFileSchema = createInsertSchema(drawingFiles).omit({
  id: true,
  createdAt: true,
});

export const insertSignTypeSchema = createInsertSchema(signTypes).omit({
  id: true,
  createdAt: true,
});

export const insertSignItemSchema = createInsertSchema(signItems).omit({
  id: true,
  createdAt: true,
});

export const insertTakeoffSchema = createInsertSchema(takeoffs).omit({
  id: true,
  createdAt: true,
});

export const insertTakeoffLineSchema = createInsertSchema(takeoffLines).omit({
  id: true,
  createdAt: true,
});

export const insertRomEstimateSchema = createInsertSchema(romEstimates).omit({
  id: true,
  createdAt: true,
});

export const insertCodeSummarySchema = createInsertSchema(codeSummaries).omit({
  id: true,
  createdAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertRfqSchema = createInsertSchema(rfqs).omit({
  id: true,
  createdAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertExamplePackageSchema = createInsertSchema(examplePackages).omit({
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
