import { z } from "zod";

// Organization schema
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().optional(),
});

export type Organization = z.infer<typeof organizationSchema>;

// Vendor schema
export const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["production", "install"]),
  contact: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).optional(),
  leadTimeDays: z.number().optional(),
});

export type Vendor = z.infer<typeof vendorSchema>;

// Project schemas
export const projectLocationSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  timezone: z.string().optional(),
});

export const projectVendorsSchema = z.object({
  productionVendorId: z.string().optional(),
  installVendorId: z.string().optional(),
});

export const projectStatsSchema = z.object({
  signsTotal: z.number(),
  signsInstalled: z.number(),
});

export const projectEstimateSchema = z.object({
  subtotal: z.number(),
  taxRate: z.number(),
  total: z.number(),
});

export const projectSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  logoUrl: z.string().optional(),
  clientName: z.string().optional(),
  location: projectLocationSchema,
  status: z.enum(["planning", "active", "on_hold", "closed"]),
  vendors: projectVendorsSchema.optional(),
  stats: projectStatsSchema,
  estimate: projectEstimateSchema,
  updatedAt: z.string(),
});

export type Project = z.infer<typeof projectSchema>;

// Drawing schema
export const drawingScaleSchema = z.object({
  units: z.enum(["imperial", "metric"]),
  ratioText: z.string(),
});

export const drawingSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  shortCode: z.string(),
  fileUrl: z.string(),
  pages: z.number(),
  scale: drawingScaleSchema,
  version: z.number(),
});

export type Drawing = z.infer<typeof drawingSchema>;

// SignType schema
export const signTypeSizeSchema = z.object({
  w: z.number(),
  h: z.number(),
  units: z.enum(["in", "ft", "mm", "cm"]),
});

export const signTypeSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  code: z.string(),
  name: z.string(),
  specPdfUrl: z.string().optional(),
  size: signTypeSizeSchema,
  materials: z.string(),
  basePrice: z.number(),
  artworkTemplateUrl: z.string().optional(),
  color: z.string().optional(),
});

export type SignType = z.infer<typeof signTypeSchema>;

// Comment schema
export const commentSchema = z.object({
  id: z.string(),
  author: z.string(),
  message: z.string(),
  createdAt: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;

// Sign schema
export const signVersionHistorySchema = z.object({
  artworkUrl: z.string(),
  updatedAt: z.string(),
});

export const signSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  signTypeId: z.string(),
  drawingId: z.string().optional(),
  page: z.number().optional(),
  xNorm: z.number().optional(),
  yNorm: z.number().optional(),
  stage: z.string(),
  reviewStatus: z.enum(["pending", "in_review", "approved", "changes_requested"]),
  comments: z.array(commentSchema),
  artworkUrl: z.string().optional(),
  size: signTypeSizeSchema.optional(),
  materials: z.string().optional(),
  specs: z.string().optional(),
  versionHistory: z.array(signVersionHistorySchema).optional(),
});

export type Sign = z.infer<typeof signSchema>;

// RFQ schema
export const rfqSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  vendorId: z.string(),
  status: z.enum(["draft", "sent", "received", "awarded"]),
  quotedPrice: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RFQ = z.infer<typeof rfqSchema>;

// Invoice schema
export const invoiceSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  vendorId: z.string().optional(),
  number: z.string(),
  amount: z.number(),
  status: z.enum(["draft", "sent", "paid"]),
  dueDate: z.string(),
  createdAt: z.string(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// Activity schema
export const activitySchema = z.object({
  id: z.string(),
  type: z.enum(["upload", "placement", "approval", "comment", "status_change"]),
  projectId: z.string(),
  userId: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
});

export type Activity = z.infer<typeof activitySchema>;
