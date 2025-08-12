import path from 'node:path';
import fs from 'fs';
import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || 'server/db/signforge.db';
const resolvedPath = path.resolve(process.cwd(), dbPath);
const dbDir = path.dirname(resolvedPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqlite = new Database(resolvedPath);

// Idempotent schema initialization
sqlite.exec(`
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  status TEXT,
  client_org TEXT,
  logo_path TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drawing_sets (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  name TEXT,
  filename TEXT,
  file_path TEXT,
  total_pages INTEGER,
  included_pages_json TEXT,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_sign_types (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  name TEXT,
  category TEXT,
  specs_json TEXT,
  source_master_id INTEGER
);

CREATE TABLE IF NOT EXISTS takeoff_markers (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  drawing_set_id INTEGER,
  page_number INTEGER,
  x_norm REAL,
  y_norm REAL,
  sign_type_id INTEGER,
  stage TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

export function run<T = unknown>(sql: string, params?: any[]): void {
  sqlite.prepare(sql).run(params ?? []);
}

export function get<T = unknown>(sql: string, params?: any[]): T | undefined {
  return sqlite.prepare(sql).get(params ?? []) as T | undefined;
}

export function all<T = unknown>(sql: string, params?: any[]): T[] {
  return sqlite.prepare(sql).all(params ?? []) as T[];
}


