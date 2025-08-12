import Database from 'better-sqlite3';
import { seedDatabase } from "./db/seed.js";

async function initDatabase() {
  console.log("Initializing database...");
  
  // Create SQLite database
  const sqlite = new Database('local.db');
  
  // Create all tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      org TEXT NOT NULL,
      created_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      client_org TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      logo_path TEXT,
      created_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS drawing_sets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0',
      uploaded_by TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS drawing_files (
      id TEXT PRIMARY KEY,
      drawing_set_id TEXT NOT NULL,
      storage_url TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      display_name TEXT NOT NULL,
      scale TEXT,
      short_code TEXT,
      page_count INTEGER,
      created_at INTEGER,
      FOREIGN KEY (drawing_set_id) REFERENCES drawing_sets(id)
    );
    
    CREATE TABLE IF NOT EXISTS sign_types (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS sign_items (
      id TEXT PRIMARY KEY,
      sign_type_id TEXT NOT NULL,
      label TEXT NOT NULL,
      verbiage TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at INTEGER,
      FOREIGN KEY (sign_type_id) REFERENCES sign_types(id)
    );
    
    CREATE TABLE IF NOT EXISTS takeoffs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'human',
      created_by TEXT NOT NULL,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS takeoff_lines (
      id TEXT PRIMARY KEY,
      takeoff_id TEXT NOT NULL,
      sign_type_id TEXT,
      sign_item_id TEXT,
      description TEXT NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'ea',
      unit_price REAL NOT NULL,
      notes TEXT,
      created_at INTEGER,
      FOREIGN KEY (takeoff_id) REFERENCES takeoffs(id),
      FOREIGN KEY (sign_type_id) REFERENCES sign_types(id),
      FOREIGN KEY (sign_item_id) REFERENCES sign_items(id)
    );
    
    CREATE TABLE IF NOT EXISTS rom_estimates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      takeoff_id TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL,
      total REAL NOT NULL,
      category_breakdown_json TEXT,
      examples_ref TEXT,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (takeoff_id) REFERENCES takeoffs(id)
    );
    
    CREATE TABLE IF NOT EXISTS code_summaries (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      required_json TEXT,
      allowances_json TEXT,
      restrictions_json TEXT,
      reviewer TEXT,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      org_name TEXT NOT NULL,
      capabilities TEXT NOT NULL,
      regions_json TEXT,
      contact_email TEXT NOT NULL,
      created_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS rfqs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      package_ref TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      sent_at INTEGER,
      response_meta_json TEXT,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(id)
    );
    
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      date INTEGER NOT NULL,
      notes TEXT,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS example_packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_min REAL NOT NULL,
      price_max REAL NOT NULL,
      template_json TEXT,
      created_at INTEGER
    );
    
    -- Legacy tables (keeping for compatibility)
    CREATE TABLE IF NOT EXISTS spec_pages (
      id TEXT PRIMARY KEY,
      sign_type_id TEXT NOT NULL,
      title TEXT NOT NULL,
      json_specs TEXT,
      file_path TEXT,
      version TEXT NOT NULL,
      updated_at INTEGER,
      FOREIGN KEY (sign_type_id) REFERENCES sign_types(id)
    );
    
    CREATE TABLE IF NOT EXISTS signs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      sign_type_id TEXT NOT NULL,
      location_ref TEXT NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      unit_price REAL NOT NULL,
      qty INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (sign_type_id) REFERENCES sign_types(id)
    );
    
    CREATE TABLE IF NOT EXISTS tile_artworks (
      id TEXT PRIMARY KEY,
      sign_id TEXT NOT NULL,
      file_path TEXT,
      params_json TEXT,
      version TEXT NOT NULL,
      updated_at INTEGER,
      FOREIGN KEY (sign_id) REFERENCES signs(id)
    );
    
    CREATE TABLE IF NOT EXISTS proofs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      current_version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS proof_items (
      id TEXT PRIMARY KEY,
      proof_id TEXT NOT NULL,
      sign_id TEXT NOT NULL,
      page_number INTEGER,
      x REAL,
      y REAL,
      w REAL,
      h REAL,
      FOREIGN KEY (proof_id) REFERENCES proofs(id),
      FOREIGN KEY (sign_id) REFERENCES signs(id)
    );
    
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      pinned_x REAL,
      pinned_y REAL,
      created_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  
  console.log("Database tables created successfully!");
  
  // Close the database connection
  sqlite.close();
  
  // Seed the database
  await seedDatabase();
  
  console.log("Database initialization complete!");
}

initDatabase().catch(console.error);
