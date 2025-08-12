# SignForge

A local-only development setup for SignForge - a sign management and takeoff application.

## Prerequisites

- Node.js 18+ 
- npm

## Quick Start

1. **Install dependencies** (first time only):
   ```bash
   npm run setup
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```

3. **Open the application**:
   - API: http://localhost:3001
   - Frontend: http://localhost:5173 (or next available port)
   - Test API health: http://localhost:3001/api/health

## Development

- **API Server**: Express.js with SQLite database
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Database**: SQLite (stored in `server/db/signforge.db`)
- **Uploads**: Stored in `server/uploads/`

## Available Scripts

- `npm run dev` - Start both client and server
- `npm run dev:server` - Start server only
- `npm run dev:client` - Start client only
- `npm run setup` - Install dependencies for both client and server
- `npm run doctor` - Check development environment integrity
- `npm run build` - Build for production
- `npm run start` - Start production server

## Project Structure

```
SignForge/
├── client/          # React frontend
├── server/          # Express API
├── server/uploads/  # File uploads
├── server/db/       # SQLite database
└── scripts/         # Development utilities
```

## Troubleshooting

Run the doctor script to check your setup:
```bash
npm run doctor
```

If you encounter port conflicts, kill existing processes:
```powershell
# Windows PowerShell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```


