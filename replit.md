# School ERP SaaS System

## Overview

A comprehensive multi-tenant School ERP (Enterprise Resource Planning) system built as a SaaS platform. The application serves K-12 educational institutions (50-5000+ students) with modules for student management, attendance tracking, academics, fee management, examinations, communication, faculty management, payroll, and reporting. The system supports multiple user roles (super admin, admin, principal, faculty, student, parent) with role-based access control and tenant isolation.

## Recent Changes

### Bug Fixes and Feature Enhancements (October 31, 2025 - Session 2)
- **Attendance Status Fix**: Fixed attendance marking buttons stuck on 'present' - modified handleStatusChange to immutably update state when clicking absent/late/half-day status buttons
- **Add Exam Feature**: Implemented complete exam creation UI for admin/principal roles with dialog form, validation, React Query mutation, cache invalidation, and data-testid attributes for testing
- **Add Fee Structure Feature**: Made "Add Fee Structure" button functional with complete dialog, form with class selection dropdown, backend integration, and proper mutation handling
- **Payroll Generation Fix**: Fixed 500 error during payroll generation by correcting faculty object property access (changed `faculty._id` to `faculty.id || faculty._id` to handle both MongoDB and API formats)
- **Transport Route Management**: Added complete transport management system:
  - Backend: `getAllTransportRoutes` and `createTransportRoute` storage methods
  - API Routes: `GET /api/transport/routes` and `POST /api/transport/routes` with authentication and authorization
  - Frontend: Dialog with comprehensive form for creating routes (route name/number, vehicle, driver, capacity, stops, fare) with all data-testid attributes
- **Faculty Leave Requests Fix**: Resolved issue where faculty users couldn't see their own leave requests - removed redundant frontend filtering since backend already filters by user role, and fixed mutation bug by removing incorrect `.json()` calls on apiRequest results

### Timetable and Attendance System Enhancements (October 31, 2025 - Session 1)
- **Timetable UI Redesign**: Completely redesigned timetable page with modern day-wise layout showing colored time slot blocks organized by day with time ranges, durations, subject names, teacher names, and room locations
- **Bulk Attendance API**: Implemented secure bulk attendance endpoint (`POST /api/attendance/bulk`) with comprehensive tenant isolation validation through storage layer
- **Security Enhancement**: Added `bulkCreateAttendance` method to storage layer that validates every student and class belongs to the tenant before any database operations, preventing cross-tenant data access
- **Timetable Data Population**: Verified timetable query properly populates subject (name, code) and teacher (firstName, lastName) information for complete contextual data display
- **Attendance Data Loading**: Fixed attendance system to properly load and save different data for different dates (previously defaulted to "present" for all dates)
- **Type Safety Improvements**: Added missing type exports (Payroll, LeaveRequest) to shared/schema.ts for better type checking across the application
- **API Route Optimization**: Simplified bulk attendance route from ~35 lines of direct model manipulation to a clean 3-line storage call maintaining security

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

### Dummy Data Removal (October 29, 2025)
- **Complete Dummy Data Elimination**: Removed all hardcoded/dummy data from all dashboards and reports
- **SuperAdmin Dashboard**: Added `getTenantsWithStats()` storage method and `/api/tenants/with-stats` endpoint to fetch real student counts and revenue for each tenant
- **Admin Dashboard**: Created storage methods and API routes for real-time data:
  - `getRecentAdmissions()` - fetches latest student enrollments with class and parent information
  - `getFeeCollectionTrends()` - aggregates monthly fee collection data for trend charts
  - `getRecentActivities()` - tracks recent system activities (admissions, fee payments, exam results)
- **Reports Page**: Implemented comprehensive analytics methods:
  - `getAttendanceStats()` - calculates attendance percentages by class
  - `getPerformanceData()` - aggregates exam results and grade distributions
  - `getClassDistribution()` - provides student counts by class and section
  - `getFeeCollectionStats()` - summarizes fee collection status (total, collected, pending)
- **All Frontend Components Updated**: SuperAdminDashboard, AdminDashboard, and Reports page now fetch and display only real database values
- **API Endpoints Created**: All new endpoints protected with `authenticateToken`, `tenantIsolation`, and `requireRole` middleware
- **MongoDB Aggregations**: Utilized MongoDB aggregation pipelines for efficient analytics and statistics calculation

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