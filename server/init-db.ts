import Database from 'better-sqlite3';
import { seedDatabase } from "./db/seed";

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
    
    CREATE TABLE IF NOT EXISTS sign_types (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      spec_page_id TEXT,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
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
    
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      org TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      rating REAL NOT NULL,
      review_count INTEGER NOT NULL,
      regions_json TEXT,
      capabilities_json TEXT,
      created_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS master_sign_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      default_specs_json TEXT,
      created_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS drawing_sets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      filename TEXT NOT NULL,
      total_pages INTEGER NOT NULL,
      included_pages_json TEXT,
      notes TEXT,
      uploaded_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS takeoff_pages (
      id TEXT PRIMARY KEY,
      drawing_set_id TEXT NOT NULL,
      page_number INTEGER NOT NULL,
      is_included INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (drawing_set_id) REFERENCES drawing_sets(id)
    );
    
    CREATE TABLE IF NOT EXISTS rom_pricing (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      total REAL NOT NULL,
      breakdown_json TEXT,
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS code_summaries (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      summary_json TEXT,
      updated_at INTEGER,
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
    
    CREATE TABLE IF NOT EXISTS rfqs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      scope_json TEXT,
      due_date INTEGER,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS bids (
      id TEXT PRIMARY KEY,
      rfq_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      price REAL NOT NULL,
      lead_time_weeks INTEGER NOT NULL,
      notes TEXT,
      created_at INTEGER,
      FOREIGN KEY (rfq_id) REFERENCES rfqs(id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(id)
    );
    
    CREATE TABLE IF NOT EXISTS project_sign_types (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      master_sign_type_id TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      custom_specs_json TEXT,
      created_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (master_sign_type_id) REFERENCES master_sign_types(id)
    );
    
    CREATE TABLE IF NOT EXISTS takeoff_markers (
      id TEXT PRIMARY KEY,
      drawing_set_id TEXT NOT NULL,
      page_number INTEGER NOT NULL,
      project_sign_type_id TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at INTEGER,
      FOREIGN KEY (drawing_set_id) REFERENCES drawing_sets(id),
      FOREIGN KEY (project_sign_type_id) REFERENCES project_sign_types(id)
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
