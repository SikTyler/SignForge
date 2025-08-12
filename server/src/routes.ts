import type { Express } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'fs';
import { all, get, run } from './db';

const uploadsRoot = path.resolve(process.cwd(), 'server', 'uploads');
const drawingsDir = path.join(uploadsRoot, 'drawings');
const logosDir = path.join(uploadsRoot, 'logos');

[uploadsRoot, drawingsDir, logosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const uploadLogo = multer({ dest: logosDir, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadDrawings = multer({ dest: drawingsDir, limits: { fileSize: 50 * 1024 * 1024 } });

export function registerRoutes(app: Express) {
  // Minimal auth stubs for local dev
  app.post('/api/auth/login', (_req, res) => {
    res.json({ user: { id: 'local-user', email: 'local@example.com', name: 'Local User', role: 'pm', org: 'LocalOrg' } });
  });
  app.post('/api/auth/logout', (_req, res) => {
    res.json({ ok: true });
  });
  app.get('/api/auth/me', (_req, res) => {
    res.json({ user: { id: 'local-user', email: 'local@example.com', name: 'Local User', role: 'pm', org: 'LocalOrg' } });
  });
  // Projects
  app.get('/api/projects', (_req, res) => {
    const projects = all<any>(`SELECT id, name, address, status, client_org AS clientOrg, logo_path AS logoPath, created_at AS createdAt FROM projects ORDER BY id DESC`);
    res.json(projects);
  });

  app.post('/api/projects', uploadLogo.single('logo'), (req, res) => {
    const { name, address, status, clientOrg } = req.body as any;
    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : null;
    if (!name) return res.status(400).json({ message: 'name is required' });
    run(
      `INSERT INTO projects (name, address, status, client_org, logo_path) VALUES (?, ?, ?, ?, ?)`,
      [name, address ?? null, status ?? 'active', clientOrg ?? null, logoPath]
    );
    const project = get<any>(`SELECT id, name, address, status, client_org AS clientOrg, logo_path AS logoPath, created_at AS createdAt FROM projects WHERE rowid = last_insert_rowid()`);
    res.json(project);
  });

  app.get('/api/projects/:id', (req, res) => {
    const id = Number(req.params.id);
    const project = get<any>(`SELECT id, name, address, status, client_org AS clientOrg, logo_path AS logoPath, created_at AS createdAt FROM projects WHERE id = ?`, [id]);
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  });

  // Minimal sign types listing to satisfy Sign Types page
  app.get('/api/projects/:id/sign-types', (_req, res) => {
    res.json([]);
  });

  // Master sign types for Takeoffs (static)
  app.get('/api/master-sign-types', (_req, res) => {
    res.json([
      { id: 'mst-1', name: 'ADA Room ID', category: 'Interior', defaultSpecsJson: { material: 'Acrylic', braille: true }, createdAt: new Date().toISOString() },
      { id: 'mst-2', name: 'Monument Sign', category: 'Exterior', defaultSpecsJson: { illuminated: true }, createdAt: new Date().toISOString() },
      { id: 'mst-3', name: 'Parking Sign', category: 'Traffic', defaultSpecsJson: { reflective: true }, createdAt: new Date().toISOString() },
    ]);
  });

  // Drawing sets
  app.post('/api/projects/:id/drawings', uploadDrawings.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const projectId = Number(req.params.id);
    const filename = req.file.originalname;
    const filePath = `/uploads/drawings/${req.file.filename}`;
    const totalPages = Number((req.body as any)?.totalPages ?? 1);
    const notes = (req.body as any)?.notes ?? null;
    run(
      `INSERT INTO drawing_sets (project_id, filename, file_path, total_pages, included_pages_json, notes, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [projectId, filename, filePath, totalPages, JSON.stringify([]), notes]
    );
    const drawing = get<any>(`SELECT * FROM drawing_sets ORDER BY id DESC LIMIT 1`);
    res.json(drawing);
  });

  app.put('/api/drawing-sets/:id/pages', (req, res) => {
    const drawingSetId = Number(req.params.id);
    const { includedPages } = req.body as { includedPages: number[] };
    run(`UPDATE drawing_sets SET included_pages_json = ? WHERE id = ?`, [JSON.stringify(includedPages ?? []), drawingSetId]);
    const updated = get<any>(`SELECT * FROM drawing_sets WHERE id = ?`, [drawingSetId]);
    res.json(updated);
  });

  // simple list drawings for a project
  app.get('/api/projects/:id/drawings', (req, res) => {
    const projectId = Number(req.params.id);
    const drawings = all<any>(
      `SELECT id, project_id AS projectId, filename, file_path AS filePath, total_pages AS totalPages, included_pages_json AS includedPagesJson, notes, uploaded_at AS uploadedAt FROM drawing_sets WHERE project_id = ? ORDER BY id DESC`,
      [projectId]
    ).map((d) => ({
      ...d,
      includedPages: d.includedPagesJson ? JSON.parse(d.includedPagesJson) : [],
    }));
    res.json(drawings);
  });

  // ROM + Code Summary + Example Packages (stub data to satisfy client)
  app.get('/api/projects/:id/rom', (_req, res) => {
    res.json({ summaryTotal: 0, breakdownJson: { signCount: 0, avgPrice: 0 } });
  });
  app.get('/api/projects/:id/code-summary', (_req, res) => {
    res.json({ jurisdiction: 'Local', requiredJson: [], restrictionsJson: [], allowancesJson: [] });
  });
  app.get('/api/projects/:id/example-packages', (_req, res) => {
    res.json([
      { id: 'pkg1', name: 'Essential Package', priceMin: 100000, priceMax: 150000, templateJson: { description: 'Basic package' } },
      { id: 'pkg2', name: 'Premium Package', priceMin: 200000, priceMax: 300000, templateJson: { description: 'Premium package' } },
      { id: 'pkg3', name: 'Luxury Package', priceMin: 350000, priceMax: 500000, templateJson: { description: 'Luxury package' } },
    ]);
  });

  // Markers
  app.get('/api/projects/:id/takeoffs/markers', (req, res) => {
    const projectId = Number(req.params.id);
    const markers = all<any>(
      `SELECT id, project_id AS projectId, drawing_set_id AS drawingSetId, page_number AS pageNumber, x_norm AS xNorm, y_norm AS yNorm, sign_type_id AS signTypeId, stage, notes, created_at AS createdAt FROM takeoff_markers WHERE project_id = ? ORDER BY id DESC`,
      [projectId]
    );
    res.json(markers);
  });

  // Combined takeoffs payload
  app.get('/api/projects/:id/takeoffs', (req, res) => {
    const projectId = Number(req.params.id);
    const drawings = all<any>(
      `SELECT id, project_id AS projectId, filename, file_path AS filePath, total_pages AS totalPages, included_pages_json AS includedPagesJson, notes, uploaded_at AS uploadedAt FROM drawing_sets WHERE project_id = ? ORDER BY id DESC`,
      [projectId]
    ).map((d) => ({
      ...d,
      includedPages: d.includedPagesJson ? JSON.parse(d.includedPagesJson) : [],
    }));
    const projectSignTypes = all<any>(
      `SELECT id, project_id AS projectId, name, category, specs_json AS specsJson, source_master_id AS sourceMasterId FROM project_sign_types WHERE project_id = ? ORDER BY id DESC`,
      [projectId]
    ).map((t) => ({ ...t, specsJson: t.specsJson ? JSON.parse(t.specsJson) : {} }));
    const markers = all<any>(
      `SELECT id, project_id AS projectId, drawing_set_id AS drawingSetId, page_number AS pageNumber, x_norm AS xNorm, y_norm AS yNorm, sign_type_id AS signTypeId, stage, notes, created_at AS createdAt FROM takeoff_markers WHERE project_id = ? ORDER BY id DESC`,
      [projectId]
    );
    res.json({ drawingSets: drawings, projectSignTypes, markers });
  });

  // Create project sign type used in takeoffs
  app.post('/api/projects/:id/sign-types-takeoff', (req, res) => {
    const projectId = Number(req.params.id);
    const { name, category, specsJson, unitPrice, notes } = req.body as any;
    if (!name || !category) return res.status(400).json({ message: 'name and category are required' });
    run(
      `INSERT INTO project_sign_types (project_id, name, category, specs_json, source_master_id) VALUES (?, ?, ?, ?, NULL)`,
      [projectId, name, category, JSON.stringify(specsJson ?? {})]
    );
    const created = get<any>(`SELECT id, project_id AS projectId, name, category, specs_json AS specsJson, source_master_id AS sourceMasterId FROM project_sign_types WHERE rowid = last_insert_rowid()`);
    res.json({ ...created, specsJson: created.specsJson ? JSON.parse(created.specsJson) : {} });
  });

  // Copy master sign types (no-op stub creating none)
  app.post('/api/projects/:id/copy-master-sign-types', (_req, res) => {
    res.json([]);
  });

  app.post('/api/projects/:id/takeoffs/markers', (req, res) => {
    const projectId = Number(req.params.id);
    const { drawingSetId, pageNumber, xNorm, yNorm, signTypeId, stage, notes } = req.body as any;
    run(
      `INSERT INTO takeoff_markers (project_id, drawing_set_id, page_number, x_norm, y_norm, sign_type_id, stage, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, drawingSetId, pageNumber, xNorm, yNorm, signTypeId ?? null, stage ?? 'draft', notes ?? null]
    );
    const marker = get<any>(`SELECT * FROM takeoff_markers ORDER BY id DESC LIMIT 1`);
    res.json(marker);
  });

  app.put('/api/takeoffs/markers/:markerId', (req, res) => {
    const markerId = Number(req.params.markerId);
    const { drawingSetId, pageNumber, xNorm, yNorm, signTypeId, stage, notes } = req.body as any;
    run(
      `UPDATE takeoff_markers SET drawing_set_id = COALESCE(?, drawing_set_id), page_number = COALESCE(?, page_number), x_norm = COALESCE(?, x_norm), y_norm = COALESCE(?, y_norm), sign_type_id = COALESCE(?, sign_type_id), stage = COALESCE(?, stage), notes = COALESCE(?, notes) WHERE id = ?`,
      [drawingSetId, pageNumber, xNorm, yNorm, signTypeId, stage, notes, markerId]
    );
    const updated = get<any>(`SELECT * FROM takeoff_markers WHERE id = ?`, [markerId]);
    res.json(updated);
  });

  app.delete('/api/takeoffs/markers/:markerId', (req, res) => {
    const markerId = Number(req.params.markerId);
    run(`DELETE FROM takeoff_markers WHERE id = ?`, [markerId]);
    res.json({ ok: true });
  });

  // Vendors and RFQs stubs used by Vendors page
  app.get('/api/vendors', (_req, res) => {
    res.json([
      { id: 'v1', org: 'ProSign Industries', contactEmail: 'info@prosign.com', rating: 4.8, reviewCount: 24 },
      { id: 'v2', org: 'Elite Signage Co.', contactEmail: 'sales@elitesigns.com', rating: 4.6, reviewCount: 18 },
    ]);
  });
  app.get('/api/projects/:id/rfqs', (_req, res) => {
    res.json([]);
  });
  // no-op return
  return app;
}


