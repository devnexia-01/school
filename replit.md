# School ERP SaaS System

## Overview

A comprehensive multi-tenant School ERP (Enterprise Resource Planning) system built as a SaaS platform. It is designed to serve K-12 educational institutions (50-5000+ students) by offering modules for student management, attendance tracking, academics, fee management, examinations, communication, faculty management, payroll, and reporting. The system supports various user roles (super admin, admin, principal, faculty, student, parent) with robust role-based access control and tenant isolation, aiming to streamline school operations and enhance administrative efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Feature Enhancements & Bug Fixes (November 10, 2025)
- **Attendance Export**: Added CSV export functionality to Attendance page
  - Export button added with proper data-testid attributes for testing
  - CSV generation includes student name, roll number, class, date, and status
  - Instant download with proper filename format
- **Communication Role-Based Filtering**: Implemented announcement filtering by user role
  - Announcements now filtered based on targetRole field
  - Users only see announcements for their role or announcements with no targetRole (for all users)
  - Applied to both Communication page and dashboard notifications
- **Faculty Dashboard Navigation**: Fixed Salary Slip button redirect
  - Wrapped Salary Slip card in Link component to navigate to /payroll page
  - Maintains consistent navigation pattern with other dashboard cards
- **Student Dashboard Notifications**: Enhanced notification bell functionality
  - Added role-based filtering to announcements in notification popover
  - Only relevant announcements displayed based on user role
  - Consistent filtering logic across all pages
- **Verified Working Features**: Confirmed the following features are operational
  - Students page Export/View/Edit functionality already working
  - Faculty Payroll filtering using /api/payroll/my endpoint
  - Profile page works correctly for all roles (admin, faculty, student)
  - Real-time data synchronization via React Query cache invalidation

### Critical Bug Fixes (November 9, 2025)
- **Support Ticket Permissions Fixed**: Resolved 403 Forbidden error preventing admin users from viewing their ticket history
  - Modified GET `/api/support-tickets` route to allow both 'super_admin' and 'admin' roles
  - Implemented role-based filtering: super_admin sees all tickets, admin sees only their own tickets (filtered by createdBy)
  - Updated getSupportTickets() storage method to accept optional userId parameter for secure filtering
  - No cross-tenant data leaks - proper tenant isolation maintained
- **Add School Error Handling Improved**: Replaced generic 500 errors with user-friendly messages
  - Enhanced POST `/api/tenants` route with MongoDB duplicate key error detection (error.code === 11000)
  - Returns 409 Conflict status with clear messages ("School code already exists" or "School name already exists")
  - Users now get actionable feedback when creating schools with duplicate information
- **Preferences Feature Removed Completely**: Eliminated all preferences-related code from the application
  - Deleted client/src/pages/Preferences.tsx page
  - Removed all Preferences routes from App.tsx
  - Removed Preferences menu items from AppLayout.tsx sidebar
  - Removed duplicate Preferences API routes from server/routes.ts
  - No orphaned code references remain in the codebase

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