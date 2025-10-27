import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "principal",
  "faculty",
  "student",
  "parent"
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "half_day"
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const feeStatusEnum = pgEnum("fee_status", ["paid", "pending", "overdue", "partial"]);

export const examTypeEnum = pgEnum("exam_type", ["unit_test", "mid_term", "final", "practical"]);

// Tenants Table (Schools)
export const tenants = pgTable("tenants", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  logo: text("logo"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users Table
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Classes Table
export const classes = pgTable("classes", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  section: varchar("section", { length: 10 }).notNull(),
  capacity: integer("capacity").default(40),
  classTeacherId: varchar("class_teacher_id", { length: 255 }).references(() => users.id),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subjects Table
export const subjects = pgTable("subjects", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students Table
export const students = pgTable("students", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  classId: varchar("class_id", { length: 255 }).references(() => classes.id),
  admissionNumber: varchar("admission_number", { length: 50 }).notNull(),
  rollNumber: varchar("roll_number", { length: 20 }),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  bloodGroup: varchar("blood_group", { length: 5 }),
  parentId: varchar("parent_id", { length: 255 }).references(() => users.id),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 20 }),
  admissionDate: date("admission_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Attendance Table
export const attendance = pgTable("attendance", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  studentId: varchar("student_id", { length: 255 }).references(() => students.id, { onDelete: "cascade" }).notNull(),
  classId: varchar("class_id", { length: 255 }).references(() => classes.id).notNull(),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  markedBy: varchar("marked_by", { length: 255 }).references(() => users.id),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exams Table
export const exams = pgTable("exams", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: examTypeEnum("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  description: text("description"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exam Results Table
export const examResults = pgTable("exam_results", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  examId: varchar("exam_id", { length: 255 }).references(() => exams.id, { onDelete: "cascade" }).notNull(),
  studentId: varchar("student_id", { length: 255 }).references(() => students.id, { onDelete: "cascade" }).notNull(),
  subjectId: varchar("subject_id", { length: 255 }).references(() => subjects.id, { onDelete: "cascade" }).notNull(),
  marksObtained: decimal("marks_obtained", { precision: 5, scale: 2 }).notNull(),
  totalMarks: decimal("total_marks", { precision: 5, scale: 2 }).notNull(),
  grade: varchar("grade", { length: 5 }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fee Structures Table
export const feeStructures = pgTable("fee_structures", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  classId: varchar("class_id", { length: 255 }).references(() => classes.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  dueDate: date("due_date"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fee Payments Table
export const feePayments = pgTable("fee_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  studentId: varchar("student_id", { length: 255 }).references(() => students.id, { onDelete: "cascade" }).notNull(),
  feeStructureId: varchar("fee_structure_id", { length: 255 }).references(() => feeStructures.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMode: varchar("payment_mode", { length: 50 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  status: feeStatusEnum("status").notNull(),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Announcements Table
export const announcements = pgTable("announcements", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  targetRole: userRoleEnum("target_role"),
  classId: varchar("class_id", { length: 255 }).references(() => classes.id),
  priority: varchar("priority", { length: 20 }).default("normal"),
  publishedBy: varchar("published_by", { length: 255 }).references(() => users.id),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Class-Subject Mapping
export const classSubjects = pgTable("class_subjects", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  classId: varchar("class_id", { length: 255 }).references(() => classes.id, { onDelete: "cascade" }).notNull(),
  subjectId: varchar("subject_id", { length: 255 }).references(() => subjects.id, { onDelete: "cascade" }).notNull(),
  teacherId: varchar("teacher_id", { length: 255 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Timetable Table
export const timetableEnum = pgEnum("day_of_week", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);

export const timetable = pgTable("timetable", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  classId: varchar("class_id", { length: 255 }).references(() => classes.id, { onDelete: "cascade" }).notNull(),
  subjectId: varchar("subject_id", { length: 255 }).references(() => subjects.id, { onDelete: "cascade" }).notNull(),
  teacherId: varchar("teacher_id", { length: 255 }).references(() => users.id),
  dayOfWeek: timetableEnum("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  roomNumber: varchar("room_number", { length: 50 }),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transport Routes Table
export const transportRoutes = pgTable("transport_routes", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  routeName: text("route_name").notNull(),
  routeNumber: varchar("route_number", { length: 50 }).notNull(),
  driverName: text("driver_name"),
  driverPhone: varchar("driver_phone", { length: 20 }),
  vehicleNumber: varchar("vehicle_number", { length: 50 }),
  capacity: integer("capacity"),
  fare: decimal("fare", { precision: 10, scale: 2 }),
  stops: text("stops"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student Transport Mapping
export const studentTransport = pgTable("student_transport", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  studentId: varchar("student_id", { length: 255 }).references(() => students.id, { onDelete: "cascade" }).notNull(),
  routeId: varchar("route_id", { length: 255 }).references(() => transportRoutes.id, { onDelete: "cascade" }).notNull(),
  pickupStop: text("pickup_stop"),
  dropStop: text("drop_stop"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payroll Table
export const payrollStatusEnum = pgEnum("payroll_status", ["draft", "approved", "paid"]);

export const payroll = pgTable("payroll", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  month: varchar("month", { length: 20 }).notNull(),
  year: integer("year").notNull(),
  basicSalary: decimal("basic_salary", { precision: 10, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default('0'),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default('0'),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  status: payrollStatusEnum("status").default("draft").notNull(),
  paidOn: date("paid_on"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leave Requests Table
export const leaveTypeEnum = pgEnum("leave_type", ["sick", "casual", "earned", "maternity", "other"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);

export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").default("pending").notNull(),
  reviewedBy: varchar("reviewed_by", { length: 255 }).references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Support Tickets Table (for super admin)
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by", { length: 255 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  status: ticketStatusEnum("status").default("open").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }).references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions Table (for super admin)
export const subscriptionStatusEnum = pgEnum("subscription_status", ["trial", "active", "suspended", "cancelled"]);

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 255 }).references(() => tenants.id, { onDelete: "cascade" }).notNull().unique(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  maxStudents: integer("max_students").notNull(),
  maxFaculty: integer("max_faculty").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: varchar("billing_cycle", { length: 20 }).notNull(),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Preferences Table
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  theme: varchar("theme", { length: 20 }).default("system"),
  language: varchar("language", { length: 20 }).default("en"),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  dateFormat: varchar("date_format", { length: 20 }).default("MM/DD/YYYY"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  classes: many(classes),
  students: many(students),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  studentProfile: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  children: many(students, { relationName: "parent" }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [classes.tenantId],
    references: [tenants.id],
  }),
  classTeacher: one(users, {
    fields: [classes.classTeacherId],
    references: [users.id],
  }),
  students: many(students),
  subjects: many(classSubjects),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [students.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  parent: one(users, {
    fields: [students.parentId],
    references: [users.id],
    relationName: "parent",
  }),
  attendance: many(attendance),
  examResults: many(examResults),
  feePayments: many(feePayments),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [subjects.tenantId],
    references: [tenants.id],
  }),
  classes: many(classSubjects),
  examResults: many(examResults),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  tenant: one(tenants, {
    fields: [attendance.tenantId],
    references: [tenants.id],
  }),
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
  markedByUser: one(users, {
    fields: [attendance.markedBy],
    references: [users.id],
  }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [exams.tenantId],
    references: [tenants.id],
  }),
  results: many(examResults),
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  tenant: one(tenants, {
    fields: [examResults.tenantId],
    references: [tenants.id],
  }),
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id],
  }),
  student: one(students, {
    fields: [examResults.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [examResults.subjectId],
    references: [subjects.id],
  }),
}));

export const feeStructuresRelations = relations(feeStructures, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [feeStructures.tenantId],
    references: [tenants.id],
  }),
  class: one(classes, {
    fields: [feeStructures.classId],
    references: [classes.id],
  }),
  payments: many(feePayments),
}));

export const feePaymentsRelations = relations(feePayments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [feePayments.tenantId],
    references: [tenants.id],
  }),
  student: one(students, {
    fields: [feePayments.studentId],
    references: [students.id],
  }),
  feeStructure: one(feeStructures, {
    fields: [feePayments.feeStructureId],
    references: [feeStructures.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  tenant: one(tenants, {
    fields: [announcements.tenantId],
    references: [tenants.id],
  }),
  class: one(classes, {
    fields: [announcements.classId],
    references: [classes.id],
  }),
  publishedByUser: one(users, {
    fields: [announcements.publishedBy],
    references: [users.id],
  }),
}));

export const classSubjectsRelations = relations(classSubjects, ({ one }) => ({
  tenant: one(tenants, {
    fields: [classSubjects.tenantId],
    references: [tenants.id],
  }),
  class: one(classes, {
    fields: [classSubjects.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [classSubjects.subjectId],
    references: [subjects.id],
  }),
  teacher: one(users, {
    fields: [classSubjects.teacherId],
    references: [users.id],
  }),
}));

export const timetableRelations = relations(timetable, ({ one }) => ({
  tenant: one(tenants, {
    fields: [timetable.tenantId],
    references: [tenants.id],
  }),
  class: one(classes, {
    fields: [timetable.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [timetable.subjectId],
    references: [subjects.id],
  }),
  teacher: one(users, {
    fields: [timetable.teacherId],
    references: [users.id],
  }),
}));

export const transportRoutesRelations = relations(transportRoutes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [transportRoutes.tenantId],
    references: [tenants.id],
  }),
  studentTransports: many(studentTransport),
}));

export const studentTransportRelations = relations(studentTransport, ({ one }) => ({
  tenant: one(tenants, {
    fields: [studentTransport.tenantId],
    references: [tenants.id],
  }),
  student: one(students, {
    fields: [studentTransport.studentId],
    references: [students.id],
  }),
  route: one(transportRoutes, {
    fields: [studentTransport.routeId],
    references: [transportRoutes.id],
  }),
}));

export const payrollRelations = relations(payroll, ({ one }) => ({
  tenant: one(tenants, {
    fields: [payroll.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [payroll.userId],
    references: [users.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  tenant: one(tenants, {
    fields: [leaveRequests.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [leaveRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [leaveRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  tenant: one(tenants, {
    fields: [supportTickets.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [supportTickets.createdBy],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id],
  }),
}));

// Insert Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
});

export const insertExamResultSchema = createInsertSchema(examResults).omit({
  id: true,
  createdAt: true,
});

export const insertFeeStructureSchema = createInsertSchema(feeStructures).omit({
  id: true,
  createdAt: true,
});

export const insertFeePaymentSchema = createInsertSchema(feePayments).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export const insertClassSubjectSchema = createInsertSchema(classSubjects).omit({
  id: true,
  createdAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetable).omit({
  id: true,
  createdAt: true,
});

export const insertTransportRouteSchema = createInsertSchema(transportRoutes).omit({
  id: true,
  createdAt: true,
});

export const insertStudentTransportSchema = createInsertSchema(studentTransport).omit({
  id: true,
  createdAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;

export type ExamResult = typeof examResults.$inferSelect;
export type InsertExamResult = z.infer<typeof insertExamResultSchema>;

export type FeeStructure = typeof feeStructures.$inferSelect;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;

export type FeePayment = typeof feePayments.$inferSelect;
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type ClassSubject = typeof classSubjects.$inferSelect;
export type InsertClassSubject = z.infer<typeof insertClassSubjectSchema>;

export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;

export type TransportRoute = typeof transportRoutes.$inferSelect;
export type InsertTransportRoute = z.infer<typeof insertTransportRouteSchema>;

export type StudentTransport = typeof studentTransport.$inferSelect;
export type InsertStudentTransport = z.infer<typeof insertStudentTransportSchema>;

export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
