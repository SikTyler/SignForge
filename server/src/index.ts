import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { registerRoutes } from './routes';
import fs from 'fs';
import './db'; // Initialize database

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploads statically
const uploadsPath = path.resolve(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
if (!fs.existsSync(path.join(uploadsPath, 'drawings'))) fs.mkdirSync(path.join(uploadsPath, 'drawings'), { recursive: true });
if (!fs.existsSync(path.join(uploadsPath, 'logos'))) fs.mkdirSync(path.join(uploadsPath, 'logos'), { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// API routes
registerRoutes(app);

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API on http://localhost:${PORT}`);
});


