import { storage } from "../storage";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if already seeded
  const existingUser = await storage.getUserByEmail("pm@demo.com");
  if (existingUser) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Create demo users
  const pmUser = await storage.createUser({
    email: "pm@demo.com",
    passwordHash: "password", // Will be hashed in createUser
    name: "John Doe",
    role: "pm",
    org: "SignForge PM"
  });

  const devUser = await storage.createUser({
    email: "dev@demo.com", 
    passwordHash: "password",
    name: "Sarah Johnson",
    role: "developer",
    org: "Westfield Development"
  });

  const vendorUser = await storage.createUser({
    email: "vendor@demo.com",
    passwordHash: "password", 
    name: "Mike Chen",
    role: "vendor",
    org: "ProSign Industries"
  });

  // Create demo project
  const project = await storage.createProject({
    name: "Westfield Commons Phase 2",
    address: "1234 Main Street, Seattle, WA 98101",
    clientOrg: "Westfield Development",
    status: "active"
  });

  // Create sign types
  const adaSignType = await storage.createSignType({
    projectId: project.id,
    name: "ADA Room ID", 
    category: "Interior"
  });

  const parkingSignType = await storage.createSignType({
    projectId: project.id,
    name: "Parking Signs",
    category: "Exterior"
  });

  const monumentSignType = await storage.createSignType({
    projectId: project.id,
    name: "Monument Sign",
    category: "Monument"
  });

  // Create spec pages
  const adaSpec = await storage.createSpecPage({
    signTypeId: adaSignType.id,
    title: "ADA Room ID Specifications",
    version: "v2.1",
    jsonSpecs: {
      material: "Acrylic with Braille",
      mounting: "Wall mounted with standoffs",
      fontSize: "18pt minimum",
      contrast: "70% minimum"
    }
  });

  const parkingSpec = await storage.createSpecPage({
    signTypeId: parkingSignType.id,
    title: "Parking Sign Specifications", 
    version: "v1.0",
    jsonSpecs: {
      material: "Aluminum composite",
      mounting: "Post mounted",
      reflectivity: "Engineer grade"
    }
  });

  const monumentSpec = await storage.createSpecPage({
    signTypeId: monumentSignType.id,
    title: "Monument Sign Specifications",
    version: "v3.2", 
    jsonSpecs: {
      material: "Natural stone with LED lighting",
      height: "8 feet maximum",
      foundation: "Concrete footer required"
    }
  });

  // Update sign types with spec page IDs
  adaSignType.specPageId = adaSpec.id;
  parkingSignType.specPageId = parkingSpec.id;
  monumentSignType.specPageId = monumentSpec.id;

  // Create demo signs
  const signs = [
    // ADA signs
    { locationRef: "Building A - Lobby Entrance", signTypeId: adaSignType.id, width: 12, height: 8, unitPrice: 485, qty: 2 },
    { locationRef: "Building A - Conference Room 101", signTypeId: adaSignType.id, width: 10, height: 6, unitPrice: 385, qty: 1 },
    { locationRef: "Building A - Restroom East", signTypeId: adaSignType.id, width: 8, height: 6, unitPrice: 325, qty: 2 },
    { locationRef: "Building B - Main Entrance", signTypeId: adaSignType.id, width: 12, height: 8, unitPrice: 485, qty: 1 },
    
    // Parking signs
    { locationRef: "Parking Lot North - Visitor", signTypeId: parkingSignType.id, width: 18, height: 24, unitPrice: 145, qty: 4 },
    { locationRef: "Parking Lot South - Resident", signTypeId: parkingSignType.id, width: 18, height: 24, unitPrice: 145, qty: 8 },
    { locationRef: "Parking Garage - Level 1", signTypeId: parkingSignType.id, width: 24, height: 18, unitPrice: 185, qty: 3 },
    
    // Monument signs  
    { locationRef: "Main Entrance", signTypeId: monumentSignType.id, width: 96, height: 72, unitPrice: 15500, qty: 1 },
    { locationRef: "Secondary Entrance", signTypeId: monumentSignType.id, width: 72, height: 60, unitPrice: 12800, qty: 1 },
    { locationRef: "Leasing Office", signTypeId: monumentSignType.id, width: 60, height: 48, unitPrice: 9800, qty: 1 }
  ];

  for (const signData of signs) {
    await storage.createSign({
      projectId: project.id,
      signTypeId: signData.signTypeId,
      locationRef: signData.locationRef,
      width: signData.width,
      height: signData.height,
      unitPrice: signData.unitPrice,
      qty: signData.qty,
      status: "in_review"
    });
  }

  // Create tile artworks with some marked as stale
  const projectSigns = await storage.getSigns(project.id);
  for (const sign of projectSigns.slice(0, 6)) {
    await storage.createTileArtwork({
      signId: sign.id,
      filePath: `/uploads/artwork-${sign.id}.png`,
      version: "v1.0",
      paramsJson: {
        stale: sign.signTypeName === "ADA Room ID" // Mark ADA signs as stale
      }
    });
  }

  // Create code summary  
  // TODO: Implement code summary creation through DatabaseStorage

  // Create example packages
  const packages = [
    { name: "Essential Package", priceMin: 180000, priceMax: 220000, templateJson: { description: "Basic ADA compliance, parking signs, simple monument" }},
    { name: "Premium Package", priceMin: 280000, priceMax: 350000, templateJson: { description: "Full wayfinding, illuminated monument, branded elements" }},
    { name: "Luxury Package", priceMin: 420000, priceMax: 500000, templateJson: { description: "Digital displays, custom metalwork, architectural integration" }}
  ];

  for (const pkg of packages) {
    (storage as any).examplePackages.set(pkg.name, {
      id: pkg.name,
      ...pkg
    });
  }

  // Create vendors
  const vendors = [
    { 
      org: "ProSign Industries", 
      contactEmail: "info@prosign.com",
      rating: 4.8,
      reviewCount: 24,
      regionsJson: ["Pacific Northwest"],
      capabilitiesJson: ["Monument", "ADA", "Parking"]
    },
    {
      org: "Elite Signage Co.",
      contactEmail: "sales@elitesigns.com", 
      rating: 4.6,
      reviewCount: 18,
      regionsJson: ["West Coast"],
      capabilitiesJson: ["Digital", "Wayfinding", "Custom"]
    },
    {
      org: "Northwest Signs",
      contactEmail: "contact@nwsigns.com",
      rating: 4.9, 
      reviewCount: 12,
      regionsJson: ["Pacific Northwest"],
      capabilitiesJson: ["Traditional", "Monument"]
    }
  ];

  for (const vendor of vendors) {
    (storage as any).vendors.set(vendor.org, {
      id: vendor.org,
      ...vendor
    });
  }

  // Create RFQ and bids
  const rfq = await storage.createRfq({
    projectId: project.id,
    scopeJson: {
      title: "Exterior Signage Package - Westfield Commons",
      description: "Monument sign, parking signs, and wayfinding elements"
    },
    dueDate: new Date("2024-03-15"),
    status: "open"
  });

  // Create bids from vendors
  await storage.createBid({
    rfqId: rfq.id,
    vendorId: "ProSign Industries",
    price: 245000,
    leadTimeWeeks: 8,
    notes: "Includes installation and 2-year warranty"
  });

  await storage.createBid({
    rfqId: rfq.id, 
    vendorId: "Elite Signage Co.",
    price: 268500,
    leadTimeWeeks: 6,
    notes: "Premium materials with digital integration"
  });

  await storage.createBid({
    rfqId: rfq.id,
    vendorId: "Northwest Signs", 
    price: 285750,
    leadTimeWeeks: 10,
    notes: "Traditional craftsmanship with natural stone"
  });

  // Create proof with proof items
  const proof = await storage.createProof(project.id);
  const proofSigns = projectSigns.slice(0, 6);
  
  for (let i = 0; i < proofSigns.length; i++) {
    (storage as any).proofItems.set(`item${i}`, {
      id: `item${i}`,
      proofId: proof.id,
      signId: proofSigns[i].id,
      pageNumber: 1,
      x: 0.1 + (i % 3) * 0.3,
      y: 0.2 + Math.floor(i / 3) * 0.4,
      w: 0.2,
      h: 0.15
    });
  }

  // Create sample comments
  await storage.createComment({
    entityType: "sign",
    entityId: projectSigns[0].id,
    userId: devUser.id,
    body: "The font size needs to be larger to meet ADA compliance. Please update to 18pt minimum.",
    pinnedX: 0.3,
    pinnedY: 0.4
  });

  await storage.createComment({
    entityType: "sign", 
    entityId: projectSigns[0].id,
    userId: vendorUser.id,
    body: "Approved the color scheme. Looks good!"
  });

  await storage.createComment({
    entityType: "proof",
    entityId: proof.id,
    userId: devUser.id, 
    body: "This sign needs to be moved 2 feet to the left for better visibility.",
    pinnedX: 0.48,
    pinnedY: 0.52
  });

  await storage.createComment({
    entityType: "proof",
    entityId: proof.id,
    userId: vendorUser.id,
    body: "Parking sign looks perfect here. Approved!",
    pinnedX: 0.75,
    pinnedY: 0.32
  });

  // Create master sign types for takeoffs
  const masterSignTypes = [
    {
      name: "ADA Room ID",
      category: "Interior",
      defaultSpecsJson: {
        material: "Acrylic",
        mounting: "Wall-mounted",
        braille: true,
        contrast: "Light on Dark"
      }
    },
    {
      name: "Exit Signs",
      category: "Safety",
      defaultSpecsJson: {
        material: "LED",
        mounting: "Ceiling/Wall",
        illuminated: true,
        emergency: true
      }
    },
    {
      name: "Directional Wayfinding",
      category: "Wayfinding", 
      defaultSpecsJson: {
        material: "Aluminum",
        mounting: "Post-mounted",
        finish: "Powder-coated"
      }
    },
    {
      name: "Monument Sign",
      category: "Exterior",
      defaultSpecsJson: {
        material: "Stone/Metal",
        mounting: "Ground-mounted",
        illuminated: true,
        foundation: "Required"
      }
    },
    {
      name: "Parking Signs", 
      category: "Traffic",
      defaultSpecsJson: {
        material: "Aluminum",
        mounting: "Post-mounted",
        reflective: true
      }
    },
    {
      name: "Building Directory",
      category: "Information",
      defaultSpecsJson: {
        material: "Metal/Glass",
        mounting: "Wall-mounted",
        changeable: true
      }
    }
  ];

  for (const masterType of masterSignTypes) {
    await storage.createMasterSignType(masterType);
  }

  console.log("Database seeded successfully with master sign types!");
}
