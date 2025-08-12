import { DatabaseStorage } from "../database-storage";

const storage = new DatabaseStorage();
import bcrypt from "bcrypt";

export async function seedDatabase() {
  console.log("Seeding database...");

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

  // Create demo projects
  const project1 = await storage.createProject({
    name: "Westfield Commons Phase 2",
    address: "1234 Main Street, Seattle, WA 98101",
    clientOrg: "Westfield Development",
    status: "active"
  });

  const project2 = await storage.createProject({
    name: "Riverside Apartments",
    address: "5678 River Road, Portland, OR 97201",
    clientOrg: "Riverside Properties",
    status: "active"
  });

  const project3 = await storage.createProject({
    name: "Downtown Office Tower",
    address: "999 Business Blvd, San Francisco, CA 94102",
    clientOrg: "Urban Development Corp",
    status: "planning"
  });

  // Create sign types for each project
  const signTypes1 = [
    { name: "ADA Room ID", projectId: project1.id },
    { name: "Life Safety", projectId: project1.id },
    { name: "Wayfinding", projectId: project1.id },
    { name: "Exterior ID/Branding", projectId: project1.id }
  ];

  const signTypes2 = [
    { name: "ADA Room ID", projectId: project2.id },
    { name: "Parking Signs", projectId: project2.id },
    { name: "Monument Sign", projectId: project2.id }
  ];

  const signTypes3 = [
    { name: "Building Directory", projectId: project3.id },
    { name: "Floor ID", projectId: project3.id },
    { name: "Exterior ID/Branding", projectId: project3.id }
  ];

  const allSignTypes = [...signTypes1, ...signTypes2, ...signTypes3];
  const createdSignTypes = [];

  for (const signType of allSignTypes) {
    const created = await storage.createSignType(signType);
    createdSignTypes.push(created);
  }

  // Create sign items for each sign type
  const signItems = [
    // Project 1 - Westfield Commons
    { signTypeId: createdSignTypes[0].id, label: "Lobby Entrance", verbiage: "LOBBY", quantity: 2, unitPrice: 485 },
    { signTypeId: createdSignTypes[0].id, label: "Conference Room 101", verbiage: "CONFERENCE ROOM 101", quantity: 1, unitPrice: 385 },
    { signTypeId: createdSignTypes[0].id, label: "Restroom East", verbiage: "RESTROOM", quantity: 2, unitPrice: 325 },
    { signTypeId: createdSignTypes[1].id, label: "Exit Sign - North", verbiage: "EXIT", quantity: 4, unitPrice: 125 },
    { signTypeId: createdSignTypes[1].id, label: "Emergency Exit", verbiage: "EMERGENCY EXIT", quantity: 2, unitPrice: 145 },
    { signTypeId: createdSignTypes[2].id, label: "Elevator Lobby", verbiage: "ELEVATOR", quantity: 3, unitPrice: 225 },
    { signTypeId: createdSignTypes[2].id, label: "Stairwell", verbiage: "STAIRWELL", quantity: 2, unitPrice: 185 },
    { signTypeId: createdSignTypes[3].id, label: "Main Entrance", verbiage: "WESTFIELD COMMONS", quantity: 1, unitPrice: 15500 },
    { signTypeId: createdSignTypes[3].id, label: "Secondary Entrance", verbiage: "WESTFIELD COMMONS", quantity: 1, unitPrice: 12800 },

    // Project 2 - Riverside Apartments
    { signTypeId: createdSignTypes[4].id, label: "Building A - Lobby", verbiage: "LOBBY", quantity: 1, unitPrice: 485 },
    { signTypeId: createdSignTypes[4].id, label: "Building B - Lobby", verbiage: "LOBBY", quantity: 1, unitPrice: 485 },
    { signTypeId: createdSignTypes[5].id, label: "Visitor Parking", verbiage: "VISITOR PARKING", quantity: 4, unitPrice: 145 },
    { signTypeId: createdSignTypes[5].id, label: "Resident Parking", verbiage: "RESIDENT PARKING", quantity: 8, unitPrice: 145 },
    { signTypeId: createdSignTypes[6].id, label: "Main Entrance", verbiage: "RIVERSIDE APARTMENTS", quantity: 1, unitPrice: 9800 },

    // Project 3 - Downtown Office Tower
    { signTypeId: createdSignTypes[7].id, label: "Main Lobby Directory", verbiage: "BUILDING DIRECTORY", quantity: 1, unitPrice: 2500 },
    { signTypeId: createdSignTypes[8].id, label: "Floor 1", verbiage: "FLOOR 1", quantity: 2, unitPrice: 185 },
    { signTypeId: createdSignTypes[8].id, label: "Floor 2", verbiage: "FLOOR 2", quantity: 2, unitPrice: 185 },
    { signTypeId: createdSignTypes[9].id, label: "Building ID", verbiage: "DOWNTOWN OFFICE TOWER", quantity: 1, unitPrice: 12500 }
  ];

  for (const signItem of signItems) {
    await storage.createSignItem(signItem);
  }

  // Create takeoffs and ROM estimates for Project 1
  const takeoff1 = await storage.createTakeoff({
    projectId: project1.id,
    method: 'human',
    createdBy: pmUser.id
  });

  const takeoffLines1 = [
    { takeoffId: takeoff1.id, description: "ADA Room ID - Lobby Entrance", qty: 2, unit: "ea", unitPrice: 485, notes: "Braille required" },
    { takeoffId: takeoff1.id, description: "ADA Room ID - Conference Room 101", qty: 1, unit: "ea", unitPrice: 385, notes: "Braille required" },
    { takeoffId: takeoff1.id, description: "ADA Room ID - Restroom East", qty: 2, unit: "ea", unitPrice: 325, notes: "Braille required" },
    { takeoffId: takeoff1.id, description: "Life Safety - Exit Signs", qty: 4, unit: "ea", unitPrice: 125, notes: "LED illuminated" },
    { takeoffId: takeoff1.id, description: "Life Safety - Emergency Exit", qty: 2, unit: "ea", unitPrice: 145, notes: "LED illuminated" },
    { takeoffId: takeoff1.id, description: "Wayfinding - Elevator Lobby", qty: 3, unit: "ea", unitPrice: 225, notes: "Directional arrows" },
    { takeoffId: takeoff1.id, description: "Wayfinding - Stairwell", qty: 2, unit: "ea", unitPrice: 185, notes: "Directional arrows" },
    { takeoffId: takeoff1.id, description: "Exterior ID - Main Entrance Monument", qty: 1, unit: "ea", unitPrice: 15500, notes: "Illuminated, stone base" },
    { takeoffId: takeoff1.id, description: "Exterior ID - Secondary Entrance", qty: 1, unit: "ea", unitPrice: 12800, notes: "Illuminated, metal frame" }
  ];

  for (const line of takeoffLines1) {
    await storage.createTakeoffLine(line);
  }

  // Create ROM estimate for Project 1
  const subtotal1 = takeoffLines1.reduce((sum, line) => sum + (line.qty * line.unitPrice), 0);
  const tax1 = subtotal1 * 0.085;
  const total1 = subtotal1 + tax1;

  const categoryBreakdown1 = {
    'ADA/Room IDs': 1680, // 2*485 + 1*385 + 2*325
    'Life Safety': 630,   // 4*125 + 2*145
    'Wayfinding': 845,    // 3*225 + 2*185
    'Exterior ID/Branding': 28300 // 15500 + 12800
  };

  await storage.createRomEstimate({
    projectId: project1.id,
    takeoffId: takeoff1.id,
    subtotal: subtotal1,
    tax: tax1,
    total: total1,
    categoryBreakdownJson: JSON.stringify(categoryBreakdown1),
    examplesRef: JSON.stringify(['pkg1', 'pkg2'])
  });

  // Create code summaries
  await storage.createCodeSummary({
    projectId: project1.id,
    jurisdiction: "Seattle, WA",
    required: [
      "ADA Room Identification - All rooms must have tactile and visual identification",
      "Exit & Emergency Signage - Illuminated exit signs required in all corridors",
      "Life Safety - Emergency exit signs with directional arrows",
      "Building Identification - Exterior monument signs for main entrances"
    ],
    allowances: [
      "Illuminated signage permitted with automatic dimming after 10pm",
      "Multiple tenant panels on directory signs",
      "Digital displays for wayfinding (non-emergency use only)",
      "Custom branding elements on exterior signs"
    ],
    restrictions: [
      "Maximum sign height: 25 feet from ground level",
      "Setback requirement: 15 feet from property line",
      "No LED displays after 10pm in residential areas",
      "Monument signs must be architecturally integrated"
    ],
    reviewer: "City of Seattle Planning Department"
  });

  await storage.createCodeSummary({
    projectId: project2.id,
    jurisdiction: "Portland, OR",
    required: [
      "ADA Room Identification - Tactile and visual room numbers",
      "Parking Designations - Clear visitor vs resident parking",
      "Building Identification - Exterior signage for multi-building complexes"
    ],
    allowances: [
      "Reflective materials for parking signs",
      "Solar-powered illumination for exterior signs",
      "Multi-lingual signage permitted"
    ],
    restrictions: [
      "Maximum sign height: 20 feet",
      "No illuminated signs in residential zones after 11pm",
      "Signs must be setback 10 feet from property line"
    ],
    reviewer: "Portland Bureau of Planning and Sustainability"
  });

  // Create vendors
  const vendors = [
    {
      orgName: "ProSign Industries",
      capabilities: "both",
      regionsJson: JSON.stringify(["Pacific Northwest", "California"]),
      contactEmail: "info@prosign.com"
    },
    {
      orgName: "Elite Signage Co.",
      capabilities: "build",
      regionsJson: JSON.stringify(["West Coast", "Mountain States"]),
      contactEmail: "sales@elitesigns.com"
    },
    {
      orgName: "Northwest Signs",
      capabilities: "install",
      regionsJson: JSON.stringify(["Pacific Northwest"]),
      contactEmail: "contact@nwsigns.com"
    },
    {
      orgName: "Pacific Sign Solutions",
      capabilities: "both",
      regionsJson: JSON.stringify(["California", "Nevada"]),
      contactEmail: "info@pacificsigns.com"
    },
    {
      orgName: "Metro Sign & Display",
      capabilities: "build",
      regionsJson: JSON.stringify(["West Coast"]),
      contactEmail: "sales@metrosign.com"
    },
    {
      orgName: "Coastal Installation Services",
      capabilities: "install",
      regionsJson: JSON.stringify(["California", "Oregon", "Washington"]),
      contactEmail: "install@coastal.com"
    }
  ];

  for (const vendor of vendors) {
    await storage.createVendor(vendor);
  }

  // Create example packages
  const examplePackages = [
    {
      name: "Essential Package",
      priceMin: 180000,
      priceMax: 220000,
      templateJson: JSON.stringify({
        description: "Basic ADA compliance, parking signs, simple monument",
        includes: ["ADA Room IDs", "Basic Parking Signs", "Simple Monument Sign"],
        typicalProjects: "Small to medium apartment complexes"
      })
    },
    {
      name: "Premium Package",
      priceMin: 280000,
      priceMax: 350000,
      templateJson: JSON.stringify({
        description: "Full wayfinding, illuminated monument, branded elements",
        includes: ["Complete Wayfinding System", "Illuminated Monument", "Branded Elements", "Digital Directory"],
        typicalProjects: "Large residential developments, office buildings"
      })
    },
    {
      name: "Luxury Package",
      priceMin: 420000,
      priceMax: 500000,
      templateJson: JSON.stringify({
        description: "Digital displays, custom metalwork, architectural integration",
        includes: ["Digital Displays", "Custom Metalwork", "Architectural Integration", "Premium Materials"],
        typicalProjects: "High-end developments, corporate headquarters"
      })
    }
  ];

  for (const pkg of examplePackages) {
    await storage.createExamplePackage(pkg);
  }

  // Create RFQs for Project 1
  const allVendors = await storage.getVendors();
  const selectedVendors = allVendors.slice(0, 3); // Select first 3 vendors

  for (const vendor of selectedVendors) {
    await storage.createRfq({
      projectId: project1.id,
      vendorId: vendor.id,
      packageRef: "Premium Package",
      status: "sent"
    });
  }

  // Create milestones for Project 1
  const milestones = [
    { projectId: project1.id, kind: "fab_start", date: new Date("2024-03-15"), notes: "Begin fabrication of ADA signs" },
    { projectId: project1.id, kind: "fab_done", date: new Date("2024-04-15"), notes: "Complete fabrication of all signs" },
    { projectId: project1.id, kind: "ship", date: new Date("2024-04-20"), notes: "Ship all signs to site" },
    { projectId: project1.id, kind: "install", date: new Date("2024-05-01"), notes: "Begin installation" },
    { projectId: project1.id, kind: "inspection", date: new Date("2024-05-15"), notes: "City inspection" },
    { projectId: project1.id, kind: "punch", date: new Date("2024-05-20"), notes: "Punch list completion" }
  ];

  for (const milestone of milestones) {
    await storage.createMilestone(milestone);
  }

  console.log("Database seeded successfully with Phase 1 MVP data!");
}
