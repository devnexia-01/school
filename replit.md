# School ERP SaaS System

## Overview

A comprehensive multi-tenant School ERP (Enterprise Resource Planning) system built as a SaaS platform. The application serves K-12 educational institutions (50-5000+ students) with modules for student management, attendance tracking, academics, fee management, examinations, communication, faculty management, payroll, and reporting. The system supports multiple user roles (super admin, admin, principal, faculty, student, parent) with role-based access control and tenant isolation.

## Recent Changes

### MongoDB Migration (October 29, 2025)
- **Database Migration**: Successfully migrated from PostgreSQL (Drizzle ORM) to MongoDB (Mongoose)
- **Schema Conversion**: Converted all database schemas from Drizzle pgTable definitions to Mongoose schemas
- **Storage Layer Refactor**: Updated entire storage layer to use Mongoose models with proper ObjectId handling
- **Real Data Implementation**: Removed all dummy/mock data from dashboard stats endpoint
- **New Analytics Methods**: Added `getFacultyCount`, `getMonthlyRevenue`, and `getPendingFees` methods using MongoDB aggregations
- **Authentication Updates**: Fixed all API routes to use MongoDB `_id` instead of PostgreSQL `id`
- **Database Seeding**: Updated seed script to work with MongoDB and populate demo data

### Performance Optimizations (October 29, 2025)
- **Fixed N+1 Query Problem**: Replaced sequential database queries in `/api/students` endpoint with optimized Mongoose populate queries
- **Lazy Route Loading**: Implemented React.lazy() and Suspense for all frontend routes to reduce initial bundle size and improve page load times
- **Database Indexes**: Added indexes to frequently queried fields (tenantId, userId, classId, email) across all major collections
- **Pagination Support**: Added limit/offset pagination to student list endpoint with parameter validation (capped at 1000, rejects invalid values)
- **Deterministic Ordering**: Added orderBy clause to student queries for consistent pagination results
- **Optimized Dashboard Stats**: Using MongoDB aggregations and count queries for real-time statistics

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
- Protected route pattern using `ProtectedRoute` wrapper component with Suspense for lazy loading
- Path aliases configured for cleaner imports (`@/`, `@shared/`, `@assets/`)
- Lazy loading for all routes to reduce initial bundle size and improve page load performance

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

**Database ORM**: Mongoose ODM (Object Document Mapper) for MongoDB with schema-based modeling.

**Key Architectural Decisions**:
- Separation of concerns with storage layer abstraction (`storage.ts` interface)
- Middleware pipeline for logging, authentication, and tenant isolation
- Type-safe schema definitions shared between client and server (`shared/schema.ts`)
- Mongoose models with Zod validation for request data
- Optimized populate queries to eliminate N+1 query patterns
- MongoDB aggregations for analytics and statistics
- Pagination support with parameter validation for list endpoints

### Data Storage

**Database**: MongoDB (cloud-hosted via MongoDB Atlas or similar)

**Connection**: 
- Mongoose ODM for MongoDB
- Connection string via `MONGODB_URI` environment variable
- Automatic reconnection handling with connection pooling
- Environment-based configuration

**Schema Design**:
- Multi-tenant architecture with `tenants` collection as root
- User roles managed via string enums: `super_admin`, `admin`, `principal`, `faculty`, `student`, `parent`
- Core collections: tenants, users, students, classes, subjects, attendance, exams, examResults, feeStructures, feePayments, announcements
- Document references using ObjectId for relationships
- Embedded documents where appropriate for performance

**Schema Validation**: 
- Mongoose schema definitions with built-in validation
- Zod schemas for API request validation
- Type-safe TypeScript interfaces exported from schema

**Key Design Decisions**:
- MongoDB ObjectId (`_id`) as primary keys for all documents
- Timestamp tracking (`createdAt`, `updatedAt` where needed) on all collections
- String enums for standardized values (user roles, attendance status, gender, fee status, exam types)
- Mongoose schema references with populate for relational data
- Database indexes on frequently queried fields (tenantId, userId, classId, email, composite indexes for date-based queries)
- MongoDB aggregations for analytics and dashboard statistics

### External Dependencies

**Database Services**:
- MongoDB - NoSQL document database
- Mongoose - MongoDB object modeling for Node.js
- MongoDB Atlas (or compatible) - cloud-hosted MongoDB service

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