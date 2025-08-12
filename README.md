# SignForge - Multifamily Signage Platform

A clean, stable platform for managing multifamily signage projects.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 📁 Project Structure

```
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Route components
│   │   └── App.tsx        # Main app with routing
├── server/                # Express.js backend
│   └── src/
│       └── index.ts       # Server entry point
├── shared/                # Shared types and schemas
└── env.example           # Environment variables template
```

## 🛣️ Routes

### Frontend Routes
- `/` - Dashboard
- `/projects` - Project list
- `/projects/:id` - Project overview with tabs
- `/projects/:id/drawings` - PDF upload & metadata
- `/projects/:id/rom` - ROM estimates
- `/projects/:id/code` - Code summary
- `/projects/:id/rfqs` - Vendor RFQs

### Backend Routes
- `GET /health` - Health check endpoint

## 🛠️ Available Scripts

- `npm run dev` - Start both frontend and backend in development
- `npm run server:dev` - Start backend only with nodemon
- `npm run web:dev` - Start frontend only with Vite
- `npm run build` - Build both frontend and backend
- `npm run start` - Start production server

## 🎯 Features

- **Clean Architecture**: Stripped of Plasmic dependencies
- **Modern Stack**: React 18 + Vite + Express + TypeScript
- **Responsive UI**: Tailwind CSS + shadcn/ui components
- **Type Safety**: Full TypeScript support
- **Development Ready**: Hot reload for both frontend and backend

## 🔧 Environment Variables

Copy `env.example` to `.env` and configure:

```env
PORT=3001
NODE_ENV=development
VITE_API_URL=http://localhost:3001
```

## 📝 Next Steps

This is a clean foundation ready for:
- Database integration
- Authentication
- File upload functionality
- API endpoints for each feature
- Enhanced UI components


