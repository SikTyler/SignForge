import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
<<<<<<< HEAD
import { 
  insertSignSchema, insertCommentSchema, insertDrawingSetSchema, insertSpecPageSchema, 
  insertRfqSchema, insertBidSchema, insertProjectSchema, insertMasterSignTypeSchema,
  insertProjectSignTypeSchema, insertTakeoffMarkerSchema
} from "@shared/schema-sqlite";
=======
import { insertSignSchema, insertCommentSchema, insertDrawingSetSchema, insertSpecPageSchema, insertRfqSchema, insertBidSchema } from "@shared/schema";
>>>>>>> parent of 27122f1 (Add takeoff functionality for project sign management)
import multer from "multer";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./db/seed";

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  }
});

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed database on startup
  await seedDatabase();

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, org: user.org } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, org: user.org } });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Drawing sets routes
  app.get("/api/projects/:id/drawings", async (req, res) => {
    try {
      const drawings = await storage.getDrawingSets(req.params.id);
      res.json(drawings);
    } catch (error) {
      console.error("Get drawings error:", error);
      res.status(500).json({ message: "Failed to fetch drawings" });
    }
  });

  app.post("/api/projects/:id/drawings", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const drawingSet = await storage.createDrawingSet({
        projectId: req.params.id,
        filePath: `/uploads/${req.file.filename}`,
        notes: req.body.notes || null
      });

      res.json(drawingSet);
    } catch (error) {
      console.error("Upload drawing error:", error);
      res.status(500).json({ message: "Failed to upload drawing" });
    }
  });

  // ROM pricing routes
  app.get("/api/projects/:id/rom", async (req, res) => {
    try {
      const romPricing = await storage.getRomPricing(req.params.id);
      if (!romPricing) {
        return res.status(404).json({ message: "ROM pricing not found" });
      }
      res.json(romPricing);
    } catch (error) {
      console.error("Get ROM error:", error);
      res.status(500).json({ message: "Failed to fetch ROM pricing" });
    }
  });

  // Code summary routes
  app.get("/api/projects/:id/code-summary", async (req, res) => {
    try {
      const codeSummary = await storage.getCodeSummary(req.params.id);
      if (!codeSummary) {
        return res.status(404).json({ message: "Code summary not found" });
      }
      res.json(codeSummary);
    } catch (error) {
      console.error("Get code summary error:", error);
      res.status(500).json({ message: "Failed to fetch code summary" });
    }
  });

  // Sign types routes
  app.get("/api/projects/:id/sign-types", async (req, res) => {
    try {
      const signTypes = await storage.getSignTypes(req.params.id);
      res.json(signTypes);
    } catch (error) {
      console.error("Get sign types error:", error);
      res.status(500).json({ message: "Failed to fetch sign types" });
    }
  });

  app.get("/api/sign-types/:id", async (req, res) => {
    try {
      const signType = await storage.getSignType(req.params.id);
      if (!signType) {
        return res.status(404).json({ message: "Sign type not found" });
      }
      
      const specPage = signType.specPageId ? await storage.getSpecPage(signType.id) : null;
      res.json({ ...signType, specPage });
    } catch (error) {
      console.error("Get sign type error:", error);
      res.status(500).json({ message: "Failed to fetch sign type" });
    }
  });

  app.post("/api/sign-types/:id/spec", upload.single('file'), async (req, res) => {
    try {
      const signType = await storage.getSignType(req.params.id);
      if (!signType) {
        return res.status(404).json({ message: "Sign type not found" });
      }

      const existingSpec = await storage.getSpecPage(signType.id);
      const newVersion = existingSpec ? `v${parseFloat(existingSpec.version.slice(1)) + 0.1}` : 'v1.0';

      let specData = {
        signTypeId: signType.id,
        title: req.body.title || `${signType.name} Specifications`,
        version: newVersion,
        jsonSpecs: req.body.jsonSpecs ? JSON.parse(req.body.jsonSpecs) : null,
        filePath: req.file ? `/uploads/${req.file.filename}` : null
      };

      const validatedData = insertSpecPageSchema.parse(specData);
      
      if (existingSpec) {
        const updatedSpec = await storage.updateSpecPage(existingSpec.id, validatedData);
        res.json(updatedSpec);
      } else {
        const newSpec = await storage.createSpecPage(validatedData);
        res.json(newSpec);
      }
    } catch (error) {
      console.error("Update spec error:", error);
      res.status(500).json({ message: "Failed to update specification" });
    }
  });

  // Signs routes
  app.get("/api/projects/:id/signs", async (req, res) => {
    try {
      const signs = await storage.getSigns(req.params.id);
      res.json(signs);
    } catch (error) {
      console.error("Get signs error:", error);
      res.status(500).json({ message: "Failed to fetch signs" });
    }
  });

  app.get("/api/signs/:id", async (req, res) => {
    try {
      const sign = await storage.getSign(req.params.id);
      if (!sign) {
        return res.status(404).json({ message: "Sign not found" });
      }

      const tileArtwork = await storage.getTileArtwork(sign.id);
      const signType = await storage.getSignType(sign.signTypeId);
      
      res.json({ 
        ...sign, 
        tileArtwork,
        signType
      });
    } catch (error) {
      console.error("Get sign error:", error);
      res.status(500).json({ message: "Failed to fetch sign" });
    }
  });

  app.put("/api/signs/:id", async (req, res) => {
    try {
      const updateData = insertSignSchema.partial().parse(req.body);
      const updatedSign = await storage.updateSign(req.params.id, updateData);
      res.json(updatedSign);
    } catch (error) {
      console.error("Update sign error:", error);
      res.status(500).json({ message: "Failed to update sign" });
    }
  });

  app.post("/api/signs/:id/tile-art", upload.single('file'), async (req, res) => {
    try {
      const sign = await storage.getSign(req.params.id);
      if (!sign) {
        return res.status(404).json({ message: "Sign not found" });
      }

      const existingArtwork = await storage.getTileArtwork(sign.id);
      const newVersion = existingArtwork ? `v${parseFloat(existingArtwork.version.slice(1)) + 0.1}` : 'v1.0';

      let artworkData = {
        signId: sign.id,
        version: newVersion,
        filePath: req.file ? `/uploads/${req.file.filename}` : null,
        paramsJson: req.body.paramsJson ? JSON.parse(req.body.paramsJson) : { stale: false }
      };

      if (existingArtwork) {
        const updatedArtwork = await storage.updateTileArtwork(existingArtwork.id, artworkData);
        res.json(updatedArtwork);
      } else {
        const newArtwork = await storage.createTileArtwork(artworkData);
        res.json(newArtwork);
      }
    } catch (error) {
      console.error("Update tile art error:", error);
      res.status(500).json({ message: "Failed to update tile artwork" });
    }
  });

  // Comments routes
  app.get("/api/comments", async (req, res) => {
    try {
      const { entity_type, entity_id } = req.query;
      
      if (!entity_type || !entity_id) {
        return res.status(400).json({ message: "entity_type and entity_id are required" });
      }

      const comments = await storage.getComments(entity_type as string, entity_id as string);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const commentData = {
        ...req.body,
        userId: req.session.userId
      };
      
      const validatedData = insertCommentSchema.parse(commentData);
      const comment = await storage.createComment(validatedData);
      res.json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Proof routes
  app.get("/api/projects/:id/proof", async (req, res) => {
    try {
      const proof = await storage.getProof(req.params.id);
      if (!proof) {
        // Create a proof if none exists
        const newProof = await storage.createProof(req.params.id);
        return res.json({ ...newProof, items: [] });
      }
      res.json(proof);
    } catch (error) {
      console.error("Get proof error:", error);
      res.status(500).json({ message: "Failed to fetch proof" });
    }
  });

  // Example packages routes
  app.get("/api/projects/:id/example-packages", async (req, res) => {
    try {
      const packages = await storage.getExamplePackages();
      res.json(packages);
    } catch (error) {
      console.error("Get example packages error:", error);
      res.status(500).json({ message: "Failed to fetch example packages" });
    }
  });

  // RFQ routes
  app.post("/api/projects/:id/rfqs", async (req, res) => {
    try {
      const rfqData = {
        projectId: req.params.id,
        ...req.body
      };
      
      const validatedData = insertRfqSchema.parse(rfqData);
      const rfq = await storage.createRfq(validatedData);
      res.json(rfq);
    } catch (error) {
      console.error("Create RFQ error:", error);
      res.status(500).json({ message: "Failed to create RFQ" });
    }
  });

  app.get("/api/projects/:id/rfqs", async (req, res) => {
    try {
      const rfqs = await storage.getRfqs(req.params.id);
      res.json(rfqs);
    } catch (error) {
      console.error("Get RFQs error:", error);
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  });

  app.get("/api/rfqs/:id/bids", async (req, res) => {
    try {
      const bids = await storage.getBids(req.params.id);
      res.json(bids);
    } catch (error) {
      console.error("Get bids error:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  app.post("/api/rfqs/:id/bids", async (req, res) => {
    try {
      const bidData = {
        rfqId: req.params.id,
        ...req.body
      };
      
      const validatedData = insertBidSchema.parse(bidData);
      const bid = await storage.createBid(validatedData);
      res.json(bid);
    } catch (error) {
      console.error("Create bid error:", error);
      res.status(500).json({ message: "Failed to create bid" });
    }
  });

  // Vendors route
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Get vendors error:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  const httpServer = createServer(app);
  return httpServer;
}
