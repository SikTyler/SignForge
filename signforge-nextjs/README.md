# SignForge - Signage Program Manager

A production-ready, navigable MVP for a signage program manager built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### 🏗️ Core Architecture
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** with shadcn/ui components
- **Zustand** for state management with localStorage persistence
- **Zod** for schema validation and type inference
- **React Hook Form** with Zod resolver for form handling

### 📊 Dashboard & Analytics
- KPI cards with sparklines and timeframe selection
- Recent activity feed
- Project overview with metrics and progress tracking
- Live estimate calculations

### 🏢 Project Management
- Project listing with advanced filters and pagination
- Project detail pages with tabbed navigation
- Drawing upload and management (PDF support)
- Sign placement with normalized coordinates
- Stage and status tracking

### 🎨 Design & Proof Management
- PDF viewer with pin placement overlay
- Artwork grid optimized for 11×17 printing
- Version history tracking
- Approval/rejection workflow
- Print-optimized layouts

### 💰 Pricing & Billing
- Live estimate calculations
- Tax rate management (default 8%)
- CSV/PDF export functionality
- Vendor bill tracking
- Cost code management

### 🔍 Global Search
- Command palette (⌘+K) for quick navigation
- Search across projects, signs, and sign types
- Keyboard shortcuts and accessibility

### 🎯 Universal Sign Management
- Global sign type library
- Pin color management
- Preset configurations
- Cross-project sign type sharing

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd signforge-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Data

The application comes with realistic seed data including:
- 3 organizations
- 6 vendors (production and installation)
- 5 demo projects with varying complexity
- Sample drawings and sign types
- Mock invoices and billing data

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication page
│   ├── app/               # Protected application routes
│   │   ├── projects/      # Project management
│   │   ├── signs/         # Global sign management
│   │   └── billing/       # Billing and invoicing
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── common/           # Shared components
├── lib/                  # Utilities and configurations
│   ├── store/            # Zustand stores
│   ├── zod/              # Zod schemas
│   └── utils/            # Utility functions
└── data/                 # Seed data and mock data
```

## Key Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Validation**: Zod
- **Icons**: Lucide React
- **Search**: CMDK (Command Menu)
- **Theme**: next-themes

## Features in Detail

### Authentication
- Simple fake login (no real validation)
- Protected routes under `/app/*`
- Automatic redirection to login

### Dashboard
- Real-time KPI calculations
- Timeframe selection (7/30/90 days)
- Activity feed with user actions
- Project status overview

### Project Management
- **Overview**: Metrics, activity feed, notes
- **Drawings**: PDF upload, pin placement, layers
- **Pricing**: Live estimates, tax management, exports
- **Signs**: Message schedule, inline editing, grouping
- **Proof**: Design review, approval workflow, printing

### Drawing Engine
- PDF upload and management
- Normalized coordinate system (0-1)
- Pin placement with sign type selection
- Layer visibility controls
- Bulk selection and editing

### Billing System
- Client invoice management
- Purchase order tracking
- Vendor bill management
- Cost code system
- Export functionality (CSV/PDF)

## Development Notes

### State Management
- Zustand stores with localStorage persistence
- Feature-scoped stores (projects, signs, UI)
- SSR-safe with `typeof window` checks

### Data Flow
- Zod schemas for type safety
- Repository pattern for data access
- Mock data with realistic scenarios
- Async operations simulated with `Promise.resolve()`

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### Performance
- Component memoization where appropriate
- Lazy loading for heavy components
- Optimized re-renders with Zustand selectors
- Efficient list rendering

## Roadmap

### Phase 1 (Current MVP)
- ✅ Basic project management
- ✅ Drawing upload and pin placement
- ✅ Pricing calculations
- ✅ Sign schedule management
- ✅ Design proof workflow

### Phase 2 (Future Enhancements)
- 🔄 Real PDF rendering with react-pdf
- 🔄 Advanced pin placement robustness
- 🔄 Vendor RFQ modeling
- 🔄 AI search semantic upgrade
- 🔄 Mobile installer workflow

### Phase 3 (Advanced Features)
- 🔄 Real-time collaboration
- 🔄 Advanced reporting and analytics
- 🔄 Integration with CAD software
- 🔄 Mobile app for field work
- 🔄 Advanced role-based permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
