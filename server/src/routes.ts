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
const uploadDrawings = multer({ dest: drawingsDir, limits: { fileSize: 100 * 1024 * 1024 } });

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
    const projects = all<any>(`SELECT id, name, address, status, client_org AS clientOrg, logo_path AS logoPath, created_at AS createdAt FROM projects ORDER BY created_at DESC`);
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
    const id = req.params.id;
    const project = get<any>(`SELECT id, name, address, status, client_org AS clientOrg, logo_path AS logoPath, created_at AS createdAt FROM projects WHERE id = ?`, [id]);
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  });

  // Drawing Sets & Files (Enhanced PDF Upload)
  app.post('/api/projects/:id/drawing-sets', (req, res) => {
    const projectId = req.params.id;
    const { version, notes } = req.body as any;
    const uploadedBy = 'local-user'; // From auth in real app
    
    run(
      `INSERT INTO drawing_sets (project_id, version, uploaded_by, notes) VALUES (?, ?, ?, ?)`,
      [projectId, version ?? '1.0', uploadedBy, notes ?? null]
    );
    const drawingSet = get<any>(`SELECT * FROM drawing_sets WHERE rowid = last_insert_rowid()`);
    res.json(drawingSet);
  });

  app.post('/api/drawing-sets/:id/files', uploadDrawings.array('files', 10), (req, res) => {
    const drawingSetId = req.params.id;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const createdFiles = [];
    for (const file of files) {
      const storageUrl = `/uploads/drawings/${file.filename}`;
      const displayName = file.originalname?.replace(/\.[^/.]+$/, '') || 'Untitled';
      
      run(
        `INSERT INTO drawing_files (drawing_set_id, storage_url, original_filename, display_name, page_count) VALUES (?, ?, ?, ?, ?)`,
        [drawingSetId, storageUrl, file.originalname || 'unknown', displayName, 1]
      );
      
      const createdFile = get<any>(`SELECT * FROM drawing_files WHERE rowid = last_insert_rowid()`);
      createdFiles.push(createdFile);
    }
    
    res.json(createdFiles);
  });

  app.patch('/api/drawing-files/:id', (req, res) => {
    const fileId = req.params.id;
    const { displayName, scale, shortCode } = req.body as any;
    
    const updates = [];
    const values = [];
    
    if (displayName !== undefined) {
      updates.push('display_name = ?');
      values.push(displayName);
    }
    if (scale !== undefined) {
      updates.push('scale = ?');
      values.push(scale);
    }
    if (shortCode !== undefined) {
      updates.push('short_code = ?');
      values.push(shortCode);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    values.push(fileId);
    run(`UPDATE drawing_files SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const updated = get<any>(`SELECT * FROM drawing_files WHERE id = ?`, [fileId]);
    res.json(updated);
  });

  app.get('/api/projects/:id/drawings', (req, res) => {
    const projectId = req.params.id;
    const drawingSets = all<any>(`
      SELECT 
        ds.id, ds.project_id AS projectId, ds.version, ds.uploaded_by AS uploadedBy, 
        ds.notes, ds.created_at AS createdAt,
        COUNT(df.id) as fileCount
      FROM drawing_sets ds
      LEFT JOIN drawing_files df ON ds.id = df.drawing_set_id
      WHERE ds.project_id = ?
      GROUP BY ds.id
      ORDER BY ds.created_at DESC
    `, [projectId]);
    
    // Get files for each set
    const result = drawingSets.map(set => ({
      ...set,
      files: all<any>(`
        SELECT id, drawing_set_id AS drawingSetId, storage_url AS storageUrl, 
               original_filename AS originalFilename, display_name AS displayName,
               scale, short_code AS shortCode, page_count AS pageCount, created_at AS createdAt
        FROM drawing_files 
        WHERE drawing_set_id = ?
        ORDER BY created_at ASC
      `, [set.id])
    }));
    
    res.json(result);
  });

  // Sign Types & Items
  app.get('/api/projects/:id/sign-types', (req, res) => {
    const projectId = req.params.id;
    const signTypes = all<any>(`
      SELECT id, project_id AS projectId, name, status, created_at AS createdAt
      FROM sign_types 
      WHERE project_id = ?
      ORDER BY name ASC
    `, [projectId]);
    res.json(signTypes);
  });

  app.post('/api/projects/:id/sign-types', (req, res) => {
    const projectId = req.params.id;
    const { name } = req.body as any;
    
    if (!name) return res.status(400).json({ message: 'name is required' });
    
    run(
      `INSERT INTO sign_types (project_id, name) VALUES (?, ?)`,
      [projectId, name]
    );
    
    const signType = get<any>(`SELECT * FROM sign_types WHERE rowid = last_insert_rowid()`);
    res.json(signType);
  });

  app.get('/api/sign-types/:id/sign-items', (req, res) => {
    const signTypeId = req.params.id;
    const signItems = all<any>(`
      SELECT id, sign_type_id AS signTypeId, label, verbiage, quantity, 
             unit_price AS unitPrice, status, created_at AS createdAt
      FROM sign_items 
      WHERE sign_type_id = ?
      ORDER BY label ASC
    `, [signTypeId]);
    res.json(signItems);
  });

  app.post('/api/sign-types/:id/sign-items', (req, res) => {
    const signTypeId = req.params.id;
    const { label, verbiage, quantity, unitPrice } = req.body as any;
    
    if (!label || !unitPrice) {
      return res.status(400).json({ message: 'label and unitPrice are required' });
    }
    
    run(
      `INSERT INTO sign_items (sign_type_id, label, verbiage, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
      [signTypeId, label, verbiage ?? null, quantity ?? 1, unitPrice]
    );
    
    const signItem = get<any>(`SELECT * FROM sign_items WHERE rowid = last_insert_rowid()`);
    res.json(signItem);
  });

  // Takeoffs & ROM
  app.post('/api/projects/:id/takeoffs', (req, res) => {
    const projectId = req.params.id;
    const { lines } = req.body as any;
    const createdBy = 'local-user'; // From auth in real app
    
    if (!lines || !Array.isArray(lines)) {
      return res.status(400).json({ message: 'lines array is required' });
    }
    
    // Create takeoff
    run(
      `INSERT INTO takeoffs (project_id, method, created_by) VALUES (?, 'human', ?)`,
      [projectId, createdBy]
    );
    
    const takeoff = get<any>(`SELECT * FROM takeoffs WHERE rowid = last_insert_rowid()`);
    
    // Create takeoff lines
    const createdLines = [];
    for (const line of lines) {
      const { signTypeId, signItemId, description, qty, unit, unitPrice, notes } = line;
      
      run(
        `INSERT INTO takeoff_lines (takeoff_id, sign_type_id, sign_item_id, description, qty, unit, unit_price, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [takeoff.id, signTypeId ?? null, signItemId ?? null, description, qty ?? 1, unit ?? 'ea', unitPrice, notes ?? null]
      );
      
      const createdLine = get<any>(`SELECT * FROM takeoff_lines WHERE rowid = last_insert_rowid()`);
      createdLines.push(createdLine);
    }
    
    res.json({ takeoff, lines: createdLines });
  });

  app.post('/api/projects/:id/rom', (req, res) => {
    const projectId = req.params.id;
    const { takeoffId } = req.body as any;
    
    if (!takeoffId) {
      return res.status(400).json({ message: 'takeoffId is required' });
    }
    
    // Get takeoff lines
    const lines = all<any>(`
      SELECT description, qty, unit, unit_price AS unitPrice, notes
      FROM takeoff_lines 
      WHERE takeoff_id = ?
    `, [takeoffId]);
    
    // Calculate totals
    const subtotal = lines.reduce((sum, line) => sum + (line.qty * line.unitPrice), 0);
    const tax = subtotal * 0.085; // 8.5% tax rate
    const total = subtotal + tax;
    
    // Simple category breakdown (in real app, this would be more sophisticated)
    const categoryBreakdown = {
      'ADA/Room IDs': lines.filter(l => l.description.toLowerCase().includes('ada') || l.description.toLowerCase().includes('room')).reduce((sum, l) => sum + (l.qty * l.unitPrice), 0),
      'Life Safety': lines.filter(l => l.description.toLowerCase().includes('exit') || l.description.toLowerCase().includes('emergency')).reduce((sum, l) => sum + (l.qty * l.unitPrice), 0),
      'Exterior ID/Branding': lines.filter(l => l.description.toLowerCase().includes('monument') || l.description.toLowerCase().includes('exterior')).reduce((sum, l) => sum + (l.qty * l.unitPrice), 0),
      'Wayfinding': lines.filter(l => l.description.toLowerCase().includes('directional') || l.description.toLowerCase().includes('wayfinding')).reduce((sum, l) => sum + (l.qty * l.unitPrice), 0),
    };
    
    // Get example packages within ±20% of total
    const minPrice = total * 0.8;
    const maxPrice = total * 1.2;
    const examples = all<any>(`
      SELECT id, name, price_min AS priceMin, price_max AS priceMax, template_json AS templateJson
      FROM example_packages 
      WHERE price_min <= ? AND price_max >= ?
      ORDER BY ABS(price_min - ?) ASC
      LIMIT 3
    `, [maxPrice, minPrice, total]);
    
    // Create ROM estimate
    run(
      `INSERT INTO rom_estimates (project_id, takeoff_id, subtotal, tax, total, category_breakdown_json, examples_ref) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [projectId, takeoffId, subtotal, tax, total, JSON.stringify(categoryBreakdown), JSON.stringify(examples.map(e => e.id))]
    );
    
    const romEstimate = get<any>(`SELECT * FROM rom_estimates WHERE rowid = last_insert_rowid()`);
    
    res.json({
      ...romEstimate,
      categoryBreakdown,
      examples: examples.map(e => ({
        ...e,
        templateJson: e.templateJson ? JSON.parse(e.templateJson) : {}
      }))
    });
  });

  app.get('/api/projects/:id/rom', (req, res) => {
    const projectId = req.params.id;
    const romEstimate = get<any>(`
      SELECT * FROM rom_estimates 
      WHERE project_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [projectId]);
    
    if (!romEstimate) {
      return res.json({ summaryTotal: 0, breakdownJson: { signCount: 0, avgPrice: 0 } });
    }
    
    const examples = all<any>(`
      SELECT id, name, price_min AS priceMin, price_max AS priceMax, template_json AS templateJson
      FROM example_packages 
      WHERE id IN (${romEstimate.examples_ref ? JSON.parse(romEstimate.examples_ref).map(() => '?').join(',') : ''})
    `, romEstimate.examples_ref ? JSON.parse(romEstimate.examples_ref) : []);
    
    res.json({
      ...romEstimate,
      categoryBreakdownJson: romEstimate.category_breakdown_json ? JSON.parse(romEstimate.category_breakdown_json) : {},
      examples: examples.map(e => ({
        ...e,
        templateJson: e.templateJson ? JSON.parse(e.templateJson) : {}
      }))
    });
  });

  // Code Summary
  app.post('/api/projects/:id/code-summary', (req, res) => {
    const projectId = req.params.id;
    const { jurisdiction, required, allowances, restrictions, reviewer } = req.body as any;
    
    if (!jurisdiction) {
      return res.status(400).json({ message: 'jurisdiction is required' });
    }
    
    run(
      `INSERT INTO code_summaries (project_id, jurisdiction, required_json, allowances_json, restrictions_json, reviewer) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, jurisdiction, JSON.stringify(required ?? []), JSON.stringify(allowances ?? []), JSON.stringify(restrictions ?? []), reviewer ?? null]
    );
    
    const codeSummary = get<any>(`SELECT * FROM code_summaries WHERE rowid = last_insert_rowid()`);
    res.json({
      ...codeSummary,
      requiredJson: codeSummary.required_json ? JSON.parse(codeSummary.required_json) : [],
      allowancesJson: codeSummary.allowances_json ? JSON.parse(codeSummary.allowances_json) : [],
      restrictionsJson: codeSummary.restrictions_json ? JSON.parse(codeSummary.restrictions_json) : []
    });
  });

  app.get('/api/projects/:id/code-summary', (req, res) => {
    const projectId = req.params.id;
    const codeSummary = get<any>(`
      SELECT * FROM code_summaries 
      WHERE project_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [projectId]);
    
    if (!codeSummary) {
      return res.json({ jurisdiction: 'Local', requiredJson: [], restrictionsJson: [], allowancesJson: [] });
    }
    
    res.json({
      ...codeSummary,
      requiredJson: codeSummary.required_json ? JSON.parse(codeSummary.required_json) : [],
      allowancesJson: codeSummary.allowances_json ? JSON.parse(codeSummary.allowances_json) : [],
      restrictionsJson: codeSummary.restrictions_json ? JSON.parse(codeSummary.restrictions_json) : []
    });
  });

  app.get('/api/projects/:id/code-summary.pdf', (req, res) => {
    const projectId = req.params.id;
    const codeSummary = get<any>(`
      SELECT * FROM code_summaries 
      WHERE project_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [projectId]);
    
    if (!codeSummary) {
      return res.status(404).json({ message: 'No code summary found' });
    }
    
    // Simple HTML to PDF conversion (in production, use a proper PDF library)
    const required = codeSummary.required_json ? JSON.parse(codeSummary.required_json) : [];
    const allowances = codeSummary.allowances_json ? JSON.parse(codeSummary.allowances_json) : [];
    const restrictions = codeSummary.restrictions_json ? JSON.parse(codeSummary.restrictions_json) : [];
    
    const html = `
      <html>
        <head>
          <title>Code Summary - ${codeSummary.jurisdiction}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 30px; }
            ul { margin: 10px 0; }
            li { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Code Summary</h1>
          <p><strong>Jurisdiction:</strong> ${codeSummary.jurisdiction}</p>
          <p><strong>Reviewer:</strong> ${codeSummary.reviewer || 'Not specified'}</p>
          <p><strong>Date:</strong> ${new Date(codeSummary.created_at).toLocaleDateString()}</p>
          
          <h2>Required Signage</h2>
          <ul>
            ${required.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
          
          <h2>Allowances</h2>
          <ul>
            ${allowances.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
          
          <h2>Restrictions</h2>
          <ul>
            ${restrictions.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="code-summary-${codeSummary.jurisdiction}.html"`);
    res.send(html);
  });

  // Vendors & RFQs
  app.get('/api/vendors', (_req, res) => {
    const vendors = all<any>(`
      SELECT id, org_name AS orgName, capabilities, regions_json AS regionsJson, 
             contact_email AS contactEmail, created_at AS createdAt
      FROM vendors 
      ORDER BY org_name ASC
    `);
    
    if (vendors.length === 0) {
      // Return seeded vendors if none exist
      res.json([
        { id: 'v1', orgName: 'ProSign Industries', capabilities: 'both', contactEmail: 'info@prosign.com', regionsJson: JSON.stringify(['Pacific Northwest']) },
        { id: 'v2', orgName: 'Elite Signage Co.', capabilities: 'build', contactEmail: 'sales@elitesigns.com', regionsJson: JSON.stringify(['West Coast']) },
        { id: 'v3', orgName: 'Northwest Signs', capabilities: 'install', contactEmail: 'contact@nwsigns.com', regionsJson: JSON.stringify(['Pacific Northwest']) },
      ]);
    } else {
      res.json(vendors.map(v => ({
        ...v,
        regionsJson: v.regionsJson ? JSON.parse(v.regionsJson) : []
      })));
    }
  });

  app.post('/api/projects/:id/rfqs', (req, res) => {
    const projectId = req.params.id;
    const { vendorIds, packageRef } = req.body as any;
    
    if (!vendorIds || !Array.isArray(vendorIds)) {
      return res.status(400).json({ message: 'vendorIds array is required' });
    }
    
    const createdRfqs = [];
    for (const vendorId of vendorIds) {
      run(
        `INSERT INTO rfqs (project_id, vendor_id, package_ref, status) VALUES (?, ?, ?, 'draft')`,
        [projectId, vendorId, packageRef ?? null]
      );
      
      const rfq = get<any>(`SELECT * FROM rfqs WHERE rowid = last_insert_rowid()`);
      createdRfqs.push(rfq);
    }
    
    res.json(createdRfqs);
  });

  app.patch('/api/rfqs/:id', (req, res) => {
    const rfqId = req.params.id;
    const { status, responseMeta } = req.body as any;
    
    const updates = [];
    const values = [];
    
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      if (status === 'sent') {
        updates.push('sent_at = ?');
        values.push(Date.now());
      }
    }
    if (responseMeta !== undefined) {
      updates.push('response_meta_json = ?');
      values.push(JSON.stringify(responseMeta));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    values.push(rfqId);
    run(`UPDATE rfqs SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const updated = get<any>(`SELECT * FROM rfqs WHERE id = ?`, [rfqId]);
    res.json(updated);
  });

  app.get('/api/projects/:id/rfqs', (req, res) => {
    const projectId = req.params.id;
    const rfqs = all<any>(`
      SELECT r.id, r.project_id AS projectId, r.vendor_id AS vendorId, r.package_ref AS packageRef,
             r.status, r.sent_at AS sentAt, r.response_meta_json AS responseMetaJson, r.created_at AS createdAt,
             v.org_name AS vendorName, v.contact_email AS vendorEmail
      FROM rfqs r
      JOIN vendors v ON r.vendor_id = v.id
      WHERE r.project_id = ?
      ORDER BY r.created_at DESC
    `, [projectId]);
    
    res.json(rfqs.map(r => ({
      ...r,
      responseMetaJson: r.responseMetaJson ? JSON.parse(r.responseMetaJson) : null
    })));
  });

  // Milestones
  app.post('/api/projects/:id/milestones', (req, res) => {
    const projectId = req.params.id;
    const { kind, date, notes } = req.body as any;
    
    if (!kind || !date) {
      return res.status(400).json({ message: 'kind and date are required' });
    }
    
    run(
      `INSERT INTO milestones (project_id, kind, date, notes) VALUES (?, ?, ?, ?)`,
      [projectId, kind, new Date(date).getTime(), notes ?? null]
    );
    
    const milestone = get<any>(`SELECT * FROM milestones WHERE rowid = last_insert_rowid()`);
    res.json(milestone);
  });

  app.get('/api/projects/:id/milestones', (req, res) => {
    const projectId = req.params.id;
    const milestones = all<any>(`
      SELECT id, project_id AS projectId, kind, date, notes, created_at AS createdAt
      FROM milestones 
      WHERE project_id = ?
      ORDER BY date ASC
    `, [projectId]);
    res.json(milestones);
  });

  // Example Packages
  app.get('/api/projects/:id/example-packages', (_req, res) => {
    const packages = all<any>(`
      SELECT id, name, price_min AS priceMin, price_max AS priceMax, template_json AS templateJson, created_at AS createdAt
      FROM example_packages 
      ORDER BY price_min ASC
    `);
    
    if (packages.length === 0) {
      // Return seeded packages if none exist
      res.json([
        { id: 'pkg1', name: 'Essential Package', priceMin: 180000, priceMax: 220000, templateJson: JSON.stringify({ description: 'Basic ADA compliance, parking signs, simple monument' }) },
        { id: 'pkg2', name: 'Premium Package', priceMin: 280000, priceMax: 350000, templateJson: JSON.stringify({ description: 'Full wayfinding, illuminated monument, branded elements' }) },
        { id: 'pkg3', name: 'Luxury Package', priceMin: 420000, priceMax: 500000, templateJson: JSON.stringify({ description: 'Digital displays, custom metalwork, architectural integration' }) }
      ]);
    } else {
      res.json(packages.map(p => ({
        ...p,
        templateJson: p.templateJson ? JSON.parse(p.templateJson) : {}
      })));
    }
  });

  return app;
}


