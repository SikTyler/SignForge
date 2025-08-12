# Overview

SignForge is a comprehensive signage project management application designed for construction and development teams. The platform streamlines the entire signage lifecycle from initial design specifications to vendor procurement and installation. It enables project managers, developers, architects, and vendors to collaborate effectively on signage projects by providing centralized document management, specification tracking, digital proofing, and vendor bidding capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built using **React 18** with **TypeScript** for type safety. The architecture follows a modern React pattern with functional components and hooks:

- **Routing**: Uses `wouter` as a lightweight routing solution instead of React Router
- **State Management**: Leverages **TanStack Query** (React Query) for server state management, eliminating the need for complex client-side state management solutions
- **UI Components**: Built on **shadcn/ui** component library with **Radix UI** primitives for accessibility
- **Styling**: Uses **Tailwind CSS** with custom CSS variables for theming and design consistency
- **Forms**: Integrates **React Hook Form** with **Zod** validation for robust form handling

The frontend follows a feature-based folder structure with pages, components, and shared utilities organized logically.

## Backend Architecture

The server is implemented using **Express.js** with **TypeScript** running on **Node.js**:

- **API Design**: RESTful API endpoints organized by resource (projects, signs, drawings, etc.)
- **Session Management**: Uses **express-session** with PostgreSQL session storage for authentication
- **File Handling**: **Multer** middleware for file uploads with validation and storage management
- **Database Layer**: **Drizzle ORM** provides type-safe database operations with schema-first approach

The backend follows a modular architecture with separate route handlers, storage abstractions, and utility functions.

## Database Design

**PostgreSQL** serves as the primary database with **Drizzle ORM** handling schema definition and migrations:

- **Schema-First Approach**: Database schemas defined in TypeScript with automatic type generation
- **Relational Structure**: Normalized tables for projects, sign types, specifications, comments, and user management
- **File Management**: File paths stored in database with actual files managed on filesystem
- **Migration System**: Drizzle Kit handles schema migrations and version control

Key entities include users, projects, drawing sets, sign types, specifications, signs, and vendor-related tables.

## Authentication & Authorization

Session-based authentication system:

- **Password Security**: Uses **bcrypt** for password hashing
- **Session Storage**: PostgreSQL-backed session storage for scalability
- **Role-Based Access**: User roles (developer, gc, architect, pm, vendor) control feature access
- **Protected Routes**: Client-side route protection with server-side validation

## Build & Development Tools

- **Vite**: Primary build tool for fast development and optimized production builds
- **TypeScript**: Full type coverage across frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **Development Environment**: Hot module replacement and error overlays for development efficiency

# External Dependencies

## Database & ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **Drizzle ORM**: Type-safe database operations and schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI & Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe variant API for component styling
- **Lucide React**: Icon library for consistent iconography

## Authentication & Security
- **bcrypt**: Password hashing and validation
- **express-session**: Session management middleware

## File Management
- **Multer**: File upload handling with validation and storage

## Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

## Frontend State & Forms
- **@tanstack/react-query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers
- **Zod**: Runtime type validation and schema definition

## Utility Libraries
- **date-fns**: Date formatting and manipulation
- **clsx & tailwind-merge**: Conditional CSS class handling