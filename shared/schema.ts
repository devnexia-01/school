import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Enums
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
} as const;

export const AttendanceStatus = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
} as const;

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export const FeeStatus = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
} as const;

export const ExamType = {
  UNIT_TEST: 'unit_test',
  MID_TERM: 'mid_term',
  FINAL: 'final',
  PRACTICAL: 'practical',
} as const;

export const DayOfWeek = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
} as const;

export const PayrollStatus = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  PAID: 'paid',
} as const;

export const LeaveType = {
  SICK: 'sick',
  CASUAL: 'casual',
  EARNED: 'earned',
  MATERNITY: 'maternity',
  OTHER: 'other',
} as const;

export const LeaveStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const TicketStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const SubscriptionStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
} as const;

// Mongoose Schemas

const TenantSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  email: String,
  phone: String,
  address: String,
  logo: String,
  active: { type: Boolean, default: true, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const UserSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  avatar: String,
  active: { type: Boolean, default: true, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

UserSchema.index({ email: 1 });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ role: 1 });

const ClassSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  grade: { type: Number, required: true },
  section: { type: String, required: true },
  capacity: { type: Number, default: 40 },
  classTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  academicYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

ClassSchema.index({ tenantId: 1 });

const SubjectSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now, required: true },
});

SubjectSchema.index({ tenantId: 1 });

const StudentSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class' },
  admissionNumber: { type: String, required: true },
  rollNumber: String,
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: Object.values(Gender), required: true },
  bloodGroup: String,
  parentId: { type: Schema.Types.ObjectId, ref: 'User' },
  fatherName: String,
  motherName: String,
  parentContact: String,
  address: String,
  emergencyContact: String,
  admissionDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

StudentSchema.index({ tenantId: 1 });
StudentSchema.index({ userId: 1 });
StudentSchema.index({ classId: 1 });

const AttendanceSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: Object.values(AttendanceStatus), required: true },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  remarks: String,
  createdAt: { type: Date, default: Date.now, required: true },
});

AttendanceSchema.index({ tenantId: 1 });
AttendanceSchema.index({ classId: 1, date: 1 });

const ExamSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(ExamType), required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  academicYear: { type: String, required: true },
  description: String,
  published: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

ExamSchema.index({ tenantId: 1 });

const ExamResultSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: String,
  remarks: String,
  createdAt: { type: Date, default: Date.now, required: true },
});

const FeeStructureSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  academicYear: { type: String, required: true },
  dueDate: Date,
  description: String,
  createdAt: { type: Date, default: Date.now, required: true },
});

const FeePaymentSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructureId: { type: Schema.Types.ObjectId, ref: 'FeeStructure' },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMode: { type: String, required: true },
  transactionId: String,
  status: { type: String, enum: Object.values(FeeStatus), required: true },
  receiptNumber: String,
  remarks: String,
  createdAt: { type: Date, default: Date.now, required: true },
});

const AnnouncementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetRole: { type: String, enum: Object.values(UserRole) },
  classId: { type: Schema.Types.ObjectId, ref: 'Class' },
  priority: { type: String, default: 'normal' },
  publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date, default: Date.now, required: true },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now, required: true },
});

AnnouncementSchema.index({ tenantId: 1 });

const ClassSubjectSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, required: true },
});

const TimetableSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  dayOfWeek: { type: String, enum: Object.values(DayOfWeek), required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  roomNumber: String,
  academicYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const TransportRouteSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  routeName: { type: String, required: true },
  routeNumber: { type: String, required: true },
  driverName: String,
  driverPhone: String,
  vehicleNumber: String,
  capacity: Number,
  fare: Number,
  stops: String,
  active: { type: Boolean, default: true, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const StudentTransportSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  routeId: { type: Schema.Types.ObjectId, ref: 'TransportRoute', required: true },
  pickupStop: String,
  dropStop: String,
  active: { type: Boolean, default: true, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const PayrollSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: Object.values(PayrollStatus), default: 'draft', required: true },
  paidOn: Date,
  remarks: String,
  createdAt: { type: Date, default: Date.now, required: true },
});

const LeaveRequestSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: Object.values(LeaveType), required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: Object.values(LeaveStatus), default: 'pending', required: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  reviewNotes: String,
  createdAt: { type: Date, default: Date.now, required: true },
});

const SupportTicketSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: Object.values(TicketPriority), default: 'medium', required: true },
  status: { type: String, enum: Object.values(TicketStatus), default: 'open', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now, required: true },
});

const SubscriptionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  planName: { type: String, required: true },
  maxStudents: { type: Number, required: true },
  maxFaculty: { type: Number, required: true },
  price: { type: Number, required: true },
  billingCycle: { type: String, required: true },
  status: { type: String, enum: Object.values(SubscriptionStatus), default: 'trial', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const UserPreferenceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  theme: { type: String, default: 'system' },
  language: { type: String, default: 'en' },
  emailNotifications: { type: Boolean, default: true, required: true },
  pushNotifications: { type: Boolean, default: true, required: true },
  timezone: { type: String, default: 'UTC' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const MessageSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const NotificationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

// Models
export const TenantModel = mongoose.model('Tenant', TenantSchema);
export const UserModel = mongoose.model('User', UserSchema);
export const ClassModel = mongoose.model('Class', ClassSchema);
export const SubjectModel = mongoose.model('Subject', SubjectSchema);
export const StudentModel = mongoose.model('Student', StudentSchema);
export const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);
export const ExamModel = mongoose.model('Exam', ExamSchema);
export const ExamResultModel = mongoose.model('ExamResult', ExamResultSchema);
export const FeeStructureModel = mongoose.model('FeeStructure', FeeStructureSchema);
export const FeePaymentModel = mongoose.model('FeePayment', FeePaymentSchema);
export const AnnouncementModel = mongoose.model('Announcement', AnnouncementSchema);
export const ClassSubjectModel = mongoose.model('ClassSubject', ClassSubjectSchema);
export const TimetableModel = mongoose.model('Timetable', TimetableSchema);
export const TransportRouteModel = mongoose.model('TransportRoute', TransportRouteSchema);
export const StudentTransportModel = mongoose.model('StudentTransport', StudentTransportSchema);
export const PayrollModel = mongoose.model('Payroll', PayrollSchema);
export const LeaveRequestModel = mongoose.model('LeaveRequest', LeaveRequestSchema);
export const SupportTicketModel = mongoose.model('SupportTicket', SupportTicketSchema);
export const SubscriptionModel = mongoose.model('Subscription', SubscriptionSchema);
export const UserPreferenceModel = mongoose.model('UserPreference', UserPreferenceSchema);
export const MessageModel = mongoose.model('Message', MessageSchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);

// Types
export type Tenant = {
  _id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  active: boolean;
  createdAt: Date;
};

export type User = {
  _id: string;
  tenantId?: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  createdAt: Date;
};

export type Class = {
  _id: string;
  tenantId: string;
  name: string;
  grade: number;
  section: string;
  capacity?: number;
  classTeacherId?: string;
  academicYear: string;
  createdAt: Date;
};

export type Subject = {
  _id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
};

export type Student = {
  _id: string;
  tenantId: string;
  userId: string;
  classId?: string;
  admissionNumber: string;
  rollNumber?: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup?: string;
  parentId?: string;
  fatherName?: string;
  motherName?: string;
  parentContact?: string;
  address?: string;
  emergencyContact?: string;
  admissionDate: Date;
  createdAt: Date;
};

export type Attendance = {
  _id: string;
  tenantId: string;
  studentId: string;
  classId: string;
  date: Date;
  status: string;
  markedBy?: string;
  remarks?: string;
  createdAt: Date;
};

export type Exam = {
  _id: string;
  tenantId: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  academicYear: string;
  description?: string;
  published: boolean;
  createdAt: Date;
};

export type ExamResult = {
  _id: string;
  tenantId: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  remarks?: string;
  createdAt: Date;
};

export type FeeStructure = {
  _id: string;
  tenantId: string;
  classId: string;
  name: string;
  amount: number;
  academicYear: string;
  dueDate?: Date;
  description?: string;
  createdAt: Date;
};

export type FeePayment = {
  _id: string;
  tenantId: string;
  studentId: string;
  feeStructureId?: string;
  amount: number;
  paymentDate: Date;
  paymentMode: string;
  transactionId?: string;
  status: string;
  receiptNumber?: string;
  remarks?: string;
  createdAt: Date;
};

export type Announcement = {
  _id: string;
  tenantId: string;
  title: string;
  content: string;
  targetRole?: string;
  classId?: string;
  priority?: string;
  publishedBy?: string;
  publishedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
};

export type ClassSubject = {
  _id: string;
  tenantId: string;
  classId: string;
  subjectId: string;
  teacherId?: string;
  createdAt: Date;
};

export type UserPreference = {
  _id: string;
  userId: string;
  theme?: string;
  language?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  timezone?: string;
  dateFormat?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  _id: string;
  tenantId: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: Date;
};

export type Notification = {
  _id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: Date;
};

export type Payroll = {
  _id: string;
  tenantId: string;
  userId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  paidOn?: Date;
  remarks?: string;
  createdAt: Date;
};

export type LeaveRequest = {
  _id: string;
  tenantId: string;
  userId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
};

// Insert types (omit _id and fields with defaults)
export type InsertTenant = Omit<Tenant, '_id' | 'createdAt' | 'active'> & { active?: boolean };
export type InsertUser = Omit<User, '_id' | 'createdAt' | 'active'> & { active?: boolean };
export type InsertClass = Omit<Class, '_id' | 'createdAt'>;
export type InsertSubject = Omit<Subject, '_id' | 'createdAt'>;
export type InsertStudent = Omit<Student, '_id' | 'createdAt'>;
export type InsertAttendance = Omit<Attendance, '_id' | 'createdAt'>;
export type InsertExam = Omit<Exam, '_id' | 'createdAt' | 'published'> & { published?: boolean };
export type InsertExamResult = Omit<ExamResult, '_id' | 'createdAt'>;
export type InsertFeeStructure = Omit<FeeStructure, '_id' | 'createdAt'>;
export type InsertFeePayment = Omit<FeePayment, '_id' | 'createdAt'>;
export type InsertAnnouncement = Omit<Announcement, '_id' | 'createdAt' | 'publishedAt'> & { publishedAt?: Date };
export type InsertClassSubject = Omit<ClassSubject, '_id' | 'createdAt'>;
export type InsertUserPreference = Omit<UserPreference, '_id' | 'createdAt' | 'updatedAt'>;

// Zod schemas for validation
export const insertTenantSchema = z.object({
  name: z.string(),
  code: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  active: z.boolean().optional(),
});

export const insertUserSchema = z.object({
  tenantId: z.string().optional(),
  email: z.string().email(),
  password: z.string(),
  role: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  active: z.boolean().optional(),
});

export const insertClassSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  grade: z.number(),
  section: z.string(),
  capacity: z.number().optional(),
  classTeacherId: z.string().optional(),
  academicYear: z.string(),
});

export const insertSubjectSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
});

export const insertStudentSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  classId: z.string().optional(),
  admissionNumber: z.string(),
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().or(z.date()),
  gender: z.string(),
  bloodGroup: z.string().optional(),
  parentId: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  admissionDate: z.string().or(z.date()),
});

export const insertAttendanceSchema = z.object({
  tenantId: z.string(),
  studentId: z.string(),
  classId: z.string(),
  date: z.string().or(z.date()),
  status: z.string(),
  markedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export const insertExamSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  type: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  academicYear: z.string(),
  description: z.string().optional(),
  published: z.boolean().optional(),
});

export const insertExamResultSchema = z.object({
  tenantId: z.string(),
  examId: z.string(),
  studentId: z.string(),
  subjectId: z.string(),
  marksObtained: z.number(),
  totalMarks: z.number(),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});

export const insertFeeStructureSchema = z.object({
  tenantId: z.string(),
  classId: z.string(),
  name: z.string(),
  amount: z.number(),
  academicYear: z.string(),
  dueDate: z.string().or(z.date()).optional(),
  description: z.string().optional(),
});

export const insertFeePaymentSchema = z.object({
  tenantId: z.string(),
  studentId: z.string(),
  feeStructureId: z.string().optional(),
  amount: z.number(),
  paymentDate: z.string().or(z.date()),
  paymentMode: z.string(),
  transactionId: z.string().optional(),
  status: z.string(),
  receiptNumber: z.string().optional(),
  remarks: z.string().optional(),
});

export const insertAnnouncementSchema = z.object({
  tenantId: z.string(),
  title: z.string(),
  content: z.string(),
  targetRole: z.string().optional(),
  classId: z.string().optional(),
  priority: z.string().optional(),
  publishedBy: z.string().optional(),
  publishedAt: z.date().optional(),
  expiresAt: z.string().or(z.date()).optional(),
});

export const insertClassSubjectSchema = z.object({
  tenantId: z.string(),
  classId: z.string(),
  subjectId: z.string(),
  teacherId: z.string().optional(),
});

export const insertUserPreferenceSchema = z.object({
  userId: z.string(),
  theme: z.string().optional(),
  language: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
});
