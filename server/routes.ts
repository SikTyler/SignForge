import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSignSchema, insertCommentSchema, insertDrawingSetSchema, insertSpecPageSchema, 
  insertRfqSchema, insertBidSchema, insertProjectSchema, insertMasterSignTypeSchema,
  insertProjectSignTypeSchema, insertTakeoffMarkerSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./db/seed";

// Ensure uploads directories exist
const uploadsDir = path.resolve(process.cwd(), "uploads");
const logosDir = path.resolve(uploadsDir, "logos");
const drawingsDir = path.resolve(uploadsDir, "drawings");

[uploadsDir, logosDir, drawingsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for different file types
const logoUpload = multer({
  dest: logosDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for logos
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and GIF files are allowed for logos.'));
    }
  }
});

const drawingUpload = multer({
  dest: drawingsDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for PDFs
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed for drawings.'));
    }
  }
});

const generalUpload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 },
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

  app.post("/api/projects", logoUpload.single('logo'), async (req, res) => {
    try {
      const { name, address, clientOrg, status = "active" } = req.body;
      
      if (!name || !address || !clientOrg) {
        return res.status(400).json({ message: "Missing required fields: name, address, clientOrg" });
      }

      const projectData = {
        name, 
        address, 
        clientOrg, 
        status,
        logoPath: req.file ? `/uploads/logos/${req.file.filename}` : null
      };

      const validatedData = insertProjectSchema.parse(projectData);
      const project = await storage.createProject(validatedData);
      
      res.json(project);
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ message: "Failed to create project" });
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

  app.post("/api/projects/:id/drawings", drawingUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // For PDF files, we'll process them to extract page count
      const isPdf = req.file.originalname.toLowerCase().endsWith('.pdf');
      let totalPages = 1;
      
      // TODO: Add PDF processing with pdfjs-dist to extract actual page count
      if (isPdf) {
        totalPages = parseInt(req.body.totalPages) || 1;
      }

      const drawingSetData = {
        projectId: req.params.id,
        name: req.body.name || req.file.originalname,
        filePath: `/uploads/drawings/${req.file.filename}`,
        totalPages: totalPages,
        notes: req.body.notes || null
      };

      const validatedData = insertDrawingSetSchema.parse(drawingSetData);
      const drawingSet = await storage.createDrawingSet(validatedData);

      res.json(drawingSet);
    } catch (error) {
      console.error("Upload drawing error:", error);
      res.status(500).json({ message: "Failed to upload drawing" });
    }
  });

  // Update drawing set pages (for takeoffs)
  app.patch("/api/drawings/:id/pages", async (req, res) => {
    try {
      const { includedPages } = req.body;
      
      if (!Array.isArray(includedPages)) {
        return res.status(400).json({ message: "includedPages must be an array" });
      }

      const updatedDrawingSet = await storage.updateDrawingSetPages(req.params.id, includedPages);
      res.json(updatedDrawingSet);
    } catch (error) {
      console.error("Update drawing pages error:", error);
      res.status(500).json({ message: "Failed to update drawing pages" });
    }
  });

  // Get takeoff pages for a drawing set
  app.get("/api/drawings/:id/pages", async (req, res) => {
    try {
      const takeoffPages = await storage.getTakeoffPages(req.params.id);
      res.json(takeoffPages);
    } catch (error) {
      console.error("Get takeoff pages error:", error);
      res.status(500).json({ message: "Failed to fetch takeoff pages" });
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

  app.post("/api/sign-types/:id/spec", generalUpload.single('file'), async (req, res) => {
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

  app.post("/api/signs/:id/tile-art", generalUpload.single('file'), async (req, res) => {
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

  // Master Sign Types routes
  app.get("/api/master-sign-types", async (req, res) => {
    try {
      const masterSignTypes = await storage.getMasterSignTypes();
      res.json(masterSignTypes);
    } catch (error) {
      console.error("Get master sign types error:", error);
      res.status(500).json({ message: "Failed to fetch master sign types" });
    }
  });

  app.post("/api/master-sign-types", async (req, res) => {
    try {
      const validatedData = insertMasterSignTypeSchema.parse(req.body);
      const masterSignType = await storage.createMasterSignType(validatedData);
      res.json(masterSignType);
    } catch (error) {
      console.error("Create master sign type error:", error);
      res.status(500).json({ message: "Failed to create master sign type" });
    }
  });

  // Project Sign Types routes
  app.get("/api/projects/:id/sign-types-takeoff", async (req, res) => {
    try {
      const projectSignTypes = await storage.getProjectSignTypes(req.params.id);
      res.json(projectSignTypes);
    } catch (error) {
      console.error("Get project sign types error:", error);
      res.status(500).json({ message: "Failed to fetch project sign types" });
    }
  });

  app.post("/api/projects/:id/sign-types-takeoff", async (req, res) => {
    try {
      const projectSignTypeData = {
        projectId: req.params.id,
        ...req.body
      };
      
      const validatedData = insertProjectSignTypeSchema.parse(projectSignTypeData);
      const projectSignType = await storage.createProjectSignType(validatedData);
      res.json(projectSignType);
    } catch (error) {
      console.error("Create project sign type error:", error);
      res.status(500).json({ message: "Failed to create project sign type" });
    }
  });

  app.post("/api/projects/:id/copy-master-sign-types", async (req, res) => {
    try {
      const { masterIds } = req.body;
      
      if (!Array.isArray(masterIds) || masterIds.length === 0) {
        return res.status(400).json({ message: "masterIds must be a non-empty array" });
      }

      const copiedSignTypes = await storage.copyMasterSignTypesToProject(req.params.id, masterIds);
      res.json(copiedSignTypes);
    } catch (error) {
      console.error("Copy master sign types error:", error);
      res.status(500).json({ message: "Failed to copy master sign types" });
    }
  });

  app.patch("/api/sign-types-takeoff/:id", async (req, res) => {
    try {
      const updatedProjectSignType = await storage.updateProjectSignType(req.params.id, req.body);
      res.json(updatedProjectSignType);
    } catch (error) {
      console.error("Update project sign type error:", error);
      res.status(500).json({ message: "Failed to update project sign type" });
    }
  });

  app.delete("/api/sign-types-takeoff/:id", async (req, res) => {
    try {
      await storage.deleteProjectSignType(req.params.id);
      res.json({ message: "Project sign type deleted successfully" });
    } catch (error) {
      console.error("Delete project sign type error:", error);
      res.status(500).json({ message: "Failed to delete project sign type" });
    }
  });

  // Takeoff Markers routes
  app.get("/api/projects/:id/takeoff-markers", async (req, res) => {
    try {
      const markers = await storage.getTakeoffMarkers(req.params.id);
      res.json(markers);
    } catch (error) {
      console.error("Get takeoff markers error:", error);
      res.status(500).json({ message: "Failed to fetch takeoff markers" });
    }
  });

  app.get("/api/drawings/:drawingSetId/pages/:pageNumber/markers", async (req, res) => {
    try {
      const { drawingSetId, pageNumber } = req.params;
      const markers = await storage.getTakeoffMarkersForPage(drawingSetId, parseInt(pageNumber));
      res.json(markers);
    } catch (error) {
      console.error("Get page markers error:", error);
      res.status(500).json({ message: "Failed to fetch page markers" });
    }
  });

  app.post("/api/takeoff-markers", async (req, res) => {
    try {
      const validatedData = insertTakeoffMarkerSchema.parse(req.body);
      const marker = await storage.createTakeoffMarker(validatedData);
      res.json(marker);
    } catch (error) {
      console.error("Create takeoff marker error:", error);
      res.status(500).json({ message: "Failed to create takeoff marker" });
    }
  });

  app.patch("/api/takeoff-markers/:id", async (req, res) => {
    try {
      const updatedMarker = await storage.updateTakeoffMarker(req.params.id, req.body);
      res.json(updatedMarker);
    } catch (error) {
      console.error("Update takeoff marker error:", error);
      res.status(500).json({ message: "Failed to update takeoff marker" });
    }
  });

  app.delete("/api/takeoff-markers/:id", async (req, res) => {
    try {
      await storage.deleteTakeoffMarker(req.params.id);
      res.json({ message: "Takeoff marker deleted successfully" });
    } catch (error) {
      console.error("Delete takeoff marker error:", error);
      res.status(500).json({ message: "Failed to delete takeoff marker" });
    }
  });

  // Combined takeoffs data endpoint
  app.get("/api/projects/:id/takeoffs", async (req, res) => {
    try {
      const takeoffsData = await storage.getTakeoffsData(req.params.id);
      res.json(takeoffsData);
    } catch (error) {
      console.error("Get takeoffs data error:", error);
      res.status(500).json({ message: "Failed to fetch takeoffs data" });
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
