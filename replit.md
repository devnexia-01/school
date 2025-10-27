# School ERP SaaS System

## Overview

A comprehensive multi-tenant School ERP (Enterprise Resource Planning) system built as a SaaS platform. The application serves K-12 educational institutions (50-5000+ students) with modules for student management, attendance tracking, academics, fee management, examinations, communication, faculty management, payroll, and reporting. The system supports multiple user roles (super admin, admin, principal, faculty, student, parent) with role-based access control and tenant isolation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter - lightweight client-side routing solution for navigation between pages.

**State Management**: 
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Context API for authentication state (AuthContext)
- Local component state with React hooks

**UI Component System**:
- shadcn/ui components (customizable, accessible component library)
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for styling with custom design tokens
- Design philosophy: Enterprise Application Pattern with focus on clarity, consistency, and efficient data entry
- Typography: Inter font family for primary text, JetBrains Mono for monospace data

**Form Handling**: React Hook Form with Zod schema validation for type-safe form validation.

**Key Architectural Decisions**:
- Component-based architecture with reusable UI components (`StatCard`, `DataTable`, `Breadcrumb`)
- Role-based dashboard rendering - separate dashboard components for each user role
- Protected route pattern using `ProtectedRoute` wrapper component
- Path aliases configured for cleaner imports (`@/`, `@shared/`, `@assets/`)

### Backend Architecture

**Framework**: Express.js (Node.js) with TypeScript running in ESM mode.

**API Design**: RESTful API structure with resource-based endpoints.

**Authentication & Authorization**:
- JWT (JSON Web Tokens) for stateless authentication
- bcryptjs for password hashing
- Cookie-based token storage with httpOnly flag for security
- Custom middleware (`authenticateToken`, `requireRole`, `tenantIsolation`) for request validation
- Session management using cookies

**Multi-tenancy Strategy**:
- Tenant isolation at database level using `tenantId` foreign keys
- Middleware-enforced tenant filtering on all queries
- Super admin role bypasses tenant isolation for system-wide management

**Database ORM**: Drizzle ORM with schema-first approach.

**Key Architectural Decisions**:
- Separation of concerns with storage layer abstraction (`storage.ts` interface)
- Middleware pipeline for logging, authentication, and tenant isolation
- Type-safe schema definitions shared between client and server (`shared/schema.ts`)
- Database migrations managed through Drizzle Kit

### Data Storage

**Database**: PostgreSQL (via Neon serverless)

**Connection**: 
- Neon serverless driver with WebSocket support
- Connection pooling via `@neondatabase/serverless`
- Environment-based configuration (`DATABASE_URL`)

**Schema Design**:
- Multi-tenant architecture with `tenants` as root table
- User roles managed via enum: `super_admin`, `admin`, `principal`, `faculty`, `student`, `parent`
- Core entities: tenants, users, students, classes, subjects, attendance, exams, exam results, fee structures, fee payments, announcements
- Relationship modeling using Drizzle relations API
- Soft deletes implemented through cascade constraints

**Schema Validation**: Zod schemas generated from Drizzle schema definitions using `drizzle-zod`.

**Key Design Decisions**:
- UUID primary keys for all entities
- Timestamp tracking (`createdAt`) on all tables
- Enum types for standardized values (user roles, attendance status, gender, fee status, exam types)
- Foreign key constraints with cascade delete for data integrity

### External Dependencies

**Database Services**:
- Neon PostgreSQL - serverless PostgreSQL hosting
- Drizzle ORM - TypeScript ORM and query builder
- Drizzle Kit - schema migrations and database management

**Authentication**:
- jsonwebtoken - JWT token generation and verification
- bcryptjs - password hashing and comparison
- cookie-parser - cookie parsing middleware

**UI Libraries**:
- Radix UI - accessible component primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip)
- Tailwind CSS - utility-first CSS framework
- class-variance-authority - variant-based component styling
- clsx & tailwind-merge - conditional className utilities
- cmdk - command palette component
- Recharts - charting library for data visualization

**Development Tools**:
- TypeScript - type safety across frontend and backend
- Vite - frontend build tool and dev server
- ESBuild - backend bundling for production
- tsx - TypeScript execution for development

**Fonts**:
- Google Fonts API - Inter (primary) and JetBrains Mono (monospace) font families

**Session Management**:
- connect-pg-simple - PostgreSQL session store (dependency present but JWT is primary auth method)

**Key Integration Points**:
- No external payment gateways (fee management is internal tracking)
- No email service integration (future consideration for notifications)
- No SMS gateway (future consideration for parent communication)
- No file storage service (avatars/logos likely stored as URLs)