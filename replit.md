# School ERP SaaS System

## Overview

A comprehensive multi-tenant School ERP (Enterprise Resource Planning) system built as a SaaS platform. It is designed to serve K-12 educational institutions (50-5000+ students) by offering modules for student management, attendance tracking, academics, fee management, examinations, communication, faculty management, payroll, and reporting. The system supports various user roles (super admin, admin, principal, faculty, student, parent) with robust role-based access control and tenant isolation, aiming to streamline school operations and enhance administrative efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite for development and build.
**Routing**: Wouter for client-side navigation.
**State Management**: TanStack Query for server state and caching; React Context API for authentication; React hooks for local component state.
**UI Component System**: shadcn/ui and Radix UI primitives, styled with Tailwind CSS. Design adheres to an Enterprise Application Pattern, emphasizing clarity and efficient data entry. Typography uses Inter and JetBrains Mono fonts.
**Form Handling**: React Hook Form with Zod for type-safe validation.
**Key Architectural Decisions**: Component-based design, role-based dashboard rendering, protected routes, path aliases, and lazy loading for optimized performance.

### Backend Architecture

**Framework**: Express.js (Node.js) with TypeScript, running in ESM mode.
**API Design**: RESTful API structure.
**Authentication & Authorization**: JWT for stateless authentication, bcryptjs for password hashing, and httpOnly cookie-based token storage. Custom middleware (`authenticateToken`, `requireRole`, `tenantIsolation`) ensures secure request validation.
**Multi-tenancy Strategy**: Database-level tenant isolation using `tenantId` and middleware-enforced filtering, with super admin role bypassing isolation.
**Database ORM**: Mongoose ODM for MongoDB.
**Key Architectural Decisions**: Separation of concerns via a storage layer, middleware pipeline for security, type-safe schema definitions shared across client and server, Mongoose models with Zod validation, optimized populate queries, MongoDB aggregations for analytics, and paginated endpoints.

### Data Storage

**Database**: MongoDB, typically cloud-hosted (e.g., MongoDB Atlas).
**Connection**: Mongoose ODM manages MongoDB connections, utilizing environment variables for connection strings and handling automatic reconnection.
**Schema Design**: Multi-tenant architecture with a `tenants` collection. Core collections include users, students, classes, subjects, attendance, exams, fee structures, and announcements. Relationships are managed using ObjectId references.
**Schema Validation**: Mongoose schema definitions combined with Zod schemas for API request validation, ensuring type-safe TypeScript interfaces.
**Key Design Decisions**: MongoDB ObjectId (`_id`) as primary keys, timestamping on collections, string enums for standardized values, and extensive indexing on frequently queried fields to optimize performance. MongoDB aggregations are heavily used for analytics.

## External Dependencies

**Database Services**:
- MongoDB (NoSQL document database)
- Mongoose (MongoDB object modeling for Node.js)

**Authentication**:
- jsonwebtoken (JWT token generation/verification)
- bcryptjs (password hashing)
- cookie-parser (cookie parsing middleware)

**UI Libraries**:
- Radix UI (accessible component primitives)
- Tailwind CSS (utility-first CSS framework)
- class-variance-authority, clsx, tailwind-merge (styling utilities)
- cmdk (command palette)
- Recharts (charting library)

**Development Tools**:
- TypeScript
- Vite (frontend build tool)
- ESBuild (backend bundling)
- tsx (TypeScript execution for development)

**Fonts**:
- Google Fonts API (Inter, JetBrains Mono)