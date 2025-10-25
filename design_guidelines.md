# School ERP SaaS - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Enterprise Application Pattern

**Justification:** This is a utility-focused, information-dense enterprise application where efficiency, data clarity, and learnability are paramount. The system serves multiple user roles managing complex educational operations requiring consistent, professional UI patterns.

**Design System Reference:** Ant Design principles with Material Design data visualization patterns

**Key Design Principles:**
1. **Clarity Over Aesthetics** - Information hierarchy and data readability take precedence
2. **Consistency Across Roles** - Unified interface patterns regardless of user role
3. **Efficient Data Entry** - Streamlined forms and bulk operations
4. **Scannable Information** - Tables, cards, and lists optimized for quick comprehension
5. **Professional Restraint** - Enterprise-grade polish without distracting embellishments

---

## Typography System

**Font Family:**
- Primary: Inter (via Google Fonts CDN) - excellent for data-heavy interfaces
- Monospace: 'JetBrains Mono' for numerical data, IDs, codes

**Type Scale:**
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Secondary Text: text-sm (14px)
- Captions/Labels: text-xs font-medium uppercase tracking-wide (12px)
- Table Headers: text-sm font-semibold (14px)
- Data Values: text-base font-medium (16px)

**Hierarchy Rules:**
- Page titles always accompanied by breadcrumb navigation
- Section headers use consistent bottom border treatment
- Form labels: text-sm font-medium with mb-2
- Helper text: text-xs with reduced opacity

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6
- Card padding: p-6
- Section gaps: gap-6 or gap-8
- Form field spacing: mb-6
- Grid gaps: gap-4 or gap-6
- Table cell padding: px-4 py-3
- Button padding: px-6 py-2.5

**Grid System:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Data tables: Full width with horizontal scroll on mobile
- Forms: Single column on mobile, max-w-2xl on desktop
- Settings panels: Two-column (sidebar + content) on desktop

**Container Strategy:**
- App shell: Fixed sidebar (w-64) + main content area with max-w-7xl
- Page content: px-6 py-8
- Modals: max-w-2xl for forms, max-w-4xl for data views, max-w-6xl for complex wizards

**Layout Patterns:**

**Dashboard Layout:**
- Top stats bar (4 metric cards in grid)
- Quick action buttons row
- Recent activities/notifications cards (2-column)
- Data visualization section (charts, graphs)
- Recent records table

**List/Table Views:**
- Filter bar at top (search + filter dropdowns + actions)
- Data table with sortable columns
- Pagination at bottom
- Bulk action toolbar when rows selected

**Form Views:**
- Sticky header with title + action buttons
- Form sections with clear dividers
- Two-column layout for related fields on desktop
- Fixed footer with Cancel/Save buttons on long forms

---

## Component Library

### Navigation Components

**Top Navigation Bar:**
- Fixed at top, h-16
- School logo/name (left), global search (center), notifications + user menu (right)
- Divider below

**Sidebar Navigation:**
- Fixed left sidebar, w-64
- Grouped menu items with icons (Heroicons outline)
- Active state with subtle background treatment
- Collapsible on mobile (hamburger menu)
- Role-based menu visibility

**Breadcrumbs:**
- Below top nav on every page except dashboard
- Home icon + text links with chevron separators
- Current page not clickable

### Data Display Components

**Stat Cards:**
- Compact height (h-24 to h-32)
- Large number (text-3xl font-bold)
- Label (text-sm)
- Optional trend indicator (+/- percentage with icon)
- Optional icon in top-right corner

**Data Tables:**
- Striped rows for readability
- Hover state on rows
- Sortable columns (icon appears on hover)
- Checkbox column for bulk selection
- Action column (right-aligned) with icon buttons/dropdown
- Empty state with illustration + call-to-action
- Loading state with skeleton rows

**Cards:**
- Standard: rounded-lg border with shadow-sm
- Header section with title + optional action buttons
- Content section with p-6
- Optional footer section for meta info

**Lists:**
- Avatar/icon + title + description pattern
- Clear hover states
- Dividers between items
- Grouped lists with subheaders

### Form Components

**Input Fields:**
- Full width within containers
- Label above (text-sm font-medium)
- Input height h-10
- Clear focus states (ring treatment)
- Error states with red treatment + error message below
- Helper text (text-xs) below when needed
- Required indicator (*) in label

**Dropdowns/Selects:**
- Match input field height (h-10)
- Chevron icon right-aligned
- Searchable for long lists
- Multi-select with tag display

**Date/Time Pickers:**
- Calendar popup for date selection
- Time dropdown for time selection
- Range pickers for from-to dates

**File Upload:**
- Drag-and-drop zone with dashed border
- File type icons
- Progress bars during upload
- Preview thumbnails for images
- File size and name display

**Form Layouts:**
- Single column on mobile
- Two-column for related fields on desktop (grid-cols-2)
- Full-width for textarea and complex inputs
- Fieldset grouping with visual separation

### Action Components

**Buttons:**
- Primary: Solid fill, font-medium, px-6 py-2.5
- Secondary: Outlined, font-medium, px-6 py-2.5
- Tertiary/Ghost: Text only with hover background
- Icon buttons: Square (w-10 h-10) for actions
- Loading state with spinner
- Disabled state with reduced opacity

**Button Groups:**
- Segmented controls for toggles
- Action button clusters with gap-2

**Floating Action Button (FAB):**
- Fixed bottom-right for primary actions (Add Student, etc.)
- Large circular button (w-14 h-14)
- Icon centered

### Feedback Components

**Alerts/Notifications:**
- Toast notifications (top-right)
- Inline alerts within forms/pages
- Icons for success/error/warning/info states
- Dismissable with close icon

**Modals:**
- Overlay with backdrop blur
- Centered positioning
- Header with title + close button
- Content section with p-6
- Footer with action buttons (right-aligned)

**Progress Indicators:**
- Loading spinners for async operations
- Progress bars for multi-step processes
- Skeleton screens for initial page loads

### Navigation Overlays

**Dropdown Menus:**
- Shadow-lg with rounded corners
- Menu items with icons (left) and labels
- Hover states
- Dividers between groups
- Submenus with chevron indicator

**User Profile Menu:**
- Avatar + name + role
- Quick links (Profile, Settings)
- Logout option

### Specialized Components

**Attendance Grid:**
- Calendar view with cells for each student/day
- Status indicators (Present/Absent/Late) as colored badges
- Bulk marking controls

**Timetable View:**
- Weekly grid layout
- Time slots (rows) × Days (columns)
- Subject cards in cells with teacher name
- Room number indicator

**Fee Receipt:**
- Professional invoice-style layout
- School header with logo
- Receipt details table
- Payment summary section
- Print-optimized styling

**Student ID Card:**
- Standard ID card dimensions
- Photo placeholder
- Student details (Name, ID, Class, Blood Group)
- Barcode/QR code for scanning
- Print-optimized

**Report Cards:**
- Header with school branding
- Student info section
- Grades table (Subject, Marks, Grade, Remarks)
- Overall performance summary
- Signature sections

---

## Dashboard Specifications

**Role-Specific Dashboards:**

**Admin Dashboard:**
- 4 metric cards: Total Students, Total Faculty, Monthly Revenue, Pending Fees
- Quick Actions: Add Student, Mark Attendance, Process Payroll, Send Announcement
- 2-column section: Recent Admissions (table) + Fee Collection Chart
- Recent Activities timeline

**Principal Dashboard:**
- 4 metric cards: Overall Attendance %, Exam Performance, Faculty Count, Pending Approvals
- Charts: Class-wise performance comparison, Monthly attendance trends
- Pending Approvals list (clickable items)
- School announcements feed

**Faculty Dashboard:**
- Today's classes list with time slots
- Attendance marking quick access
- Pending assignments to grade (list)
- Student performance trends (their subjects)
- Communication center (messages)

**Student Dashboard:**
- Today's timetable
- Attendance summary (current month)
- Recent exam results
- Pending assignments list
- Fee status indicator
- Announcements

**Parent Dashboard:**
- Child selector dropdown (if multiple children)
- Child's attendance summary
- Recent exam results
- Fee payment status with Pay Now button
- Communication center (messages from teachers)
- Upcoming events calendar

---

## Icons

**Icon Library:** Heroicons (via CDN) - Use outline style for navigation, solid for emphasis

**Icon Usage:**
- Navigation menu items: 20×20px icons
- Action buttons: 16×16px icons
- Stat cards: 24×24px icons
- Table actions: 16×16px icons
- Empty states: 48×48px illustrations

---

## Animations

**Minimal Animation Strategy:**
- Page transitions: None (instant)
- Modal open/close: Simple fade + scale (150ms)
- Dropdown menus: Fade in (100ms)
- Toast notifications: Slide from top (200ms)
- Loading states: Spinner rotation only
- NO scroll-triggered animations
- NO complex hover effects beyond color/shadow changes

---

## Images

**Image Usage:**
This is an enterprise application - images are functional, not decorative:

1. **Login Page:** Clean illustration of school building or students (top third of page)
2. **User Avatars:** Circular profile photos throughout (32×32px in lists, 64×64px in profiles)
3. **School Logo:** Displayed in sidebar and header
4. **Empty States:** Simple illustrations for "No students found," "No results," etc.
5. **Student ID Cards:** Student photo upload (required)
6. **Documents:** PDF/image previews for uploaded certificates

**NO hero sections or large decorative imagery** - this is a data-focused application.