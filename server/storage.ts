import {
  users,
  tenants,
  students,
  classes,
  subjects,
  attendance,
  exams,
  examResults,
  feeStructures,
  feePayments,
  announcements,
  classSubjects,
  userPreferences,
  type User,
  type InsertUser,
  type Tenant,
  type InsertTenant,
  type Student,
  type InsertStudent,
  type Class,
  type InsertClass,
  type Subject,
  type InsertSubject,
  type Attendance,
  type InsertAttendance,
  type Exam,
  type InsertExam,
  type ExamResult,
  type InsertExamResult,
  type FeeStructure,
  type InsertFeeStructure,
  type FeePayment,
  type InsertFeePayment,
  type Announcement,
  type InsertAnnouncement,
  type ClassSubject,
  type InsertClassSubject,
  type UserPreference,
  type InsertUserPreference,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tenants
  getTenant(id: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  
  // Students
  getStudent(id: string, tenantId?: string): Promise<Student | undefined>;
  getStudentsByClass(classId: string, tenantId: string): Promise<Student[]>;
  getStudentsByTenant(tenantId: string): Promise<Student[]>;
  getStudentsWithDetailsOptimized(tenantId: string, limit?: number, offset?: number): Promise<any[]>;
  getStudentsCount(tenantId: string): Promise<number>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Classes
  getClass(id: string, tenantId?: string): Promise<Class | undefined>;
  getClassesByTenant(tenantId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  
  // Subjects
  getSubjectsByTenant(tenantId: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Attendance
  getAttendanceByDate(classId: string, date: string, tenantId: string): Promise<Attendance[]>;
  createAttendance(attendanceData: InsertAttendance): Promise<Attendance>;
  
  // Exams
  getExamsByTenant(tenantId: string): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  
  // Exam Results
  getResultsByExam(examId: string, tenantId: string): Promise<ExamResult[]>;
  createExamResult(result: InsertExamResult): Promise<ExamResult>;
  
  // Fee Structures
  getFeeStructuresByTenant(tenantId: string): Promise<FeeStructure[]>;
  createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure>;
  
  // Fee Payments
  getFeePaymentsByStudent(studentId: string, tenantId: string): Promise<FeePayment[]>;
  createFeePayment(payment: InsertFeePayment): Promise<FeePayment>;
  
  // Announcements
  getAnnouncementsByTenant(tenantId: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  
  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreference | undefined>;
  createUserPreferences(prefs: InsertUserPreference): Promise<UserPreference>;
  updateUserPreferences(userId: string, prefs: Partial<InsertUserPreference>): Promise<UserPreference>;
  
  // User Profile
  updateUserProfile(userId: string, profileData: Partial<InsertUser>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Tenants
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  // Students
  async getStudent(id: string, tenantId?: string): Promise<Student | undefined> {
    const conditions = tenantId
      ? and(eq(students.id, id), eq(students.tenantId, tenantId))
      : eq(students.id, id);
    const [student] = await db.select().from(students).where(conditions!);
    return student || undefined;
  }

  async getStudentsByClass(classId: string, tenantId: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(and(eq(students.classId, classId), eq(students.tenantId, tenantId)));
  }

  async getStudentsByTenant(tenantId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.tenantId, tenantId));
  }

  async getStudentsWithDetailsOptimized(tenantId: string, limit?: number, offset?: number): Promise<any[]> {
    let query = db
      .select({
        id: students.id,
        userId: students.userId,
        admissionNumber: students.admissionNumber,
        rollNumber: students.rollNumber,
        classId: students.classId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        active: users.active,
        avatar: users.avatar,
        className: classes.name,
      })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.tenantId, tenantId))
      .orderBy(students.admissionNumber);
    
    if (limit !== undefined) {
      query = query.limit(limit) as any;
    }
    if (offset !== undefined) {
      query = query.offset(offset) as any;
    }
    
    const result = await query;
    
    return result.map(row => ({
      id: row.id,
      name: `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown',
      admissionNumber: row.admissionNumber,
      class: row.className || 'Not assigned',
      rollNumber: row.rollNumber || '',
      email: row.email || '',
      phone: row.phone || '',
      status: row.active ? 'active' : 'inactive',
      avatar: row.avatar || null,
    }));
  }

  async getStudentsCount(tenantId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(students)
      .where(eq(students.tenantId, tenantId));
    return result[0]?.count || 0;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  // Classes
  async getClass(id: string, tenantId?: string): Promise<Class | undefined> {
    const conditions = tenantId
      ? and(eq(classes.id, id), eq(classes.tenantId, tenantId))
      : eq(classes.id, id);
    const [classData] = await db.select().from(classes).where(conditions!);
    return classData || undefined;
  }

  async getClassesByTenant(tenantId: string): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.tenantId, tenantId));
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const [classData] = await db.insert(classes).values(insertClass).returning();
    return classData;
  }

  // Subjects
  async getSubjectsByTenant(tenantId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.tenantId, tenantId));
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }

  // Attendance
  async getAttendanceByDate(classId: string, date: string, tenantId: string): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.classId, classId),
          eq(attendance.date, date),
          eq(attendance.tenantId, tenantId)
        )
      );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [attendanceRecord] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return attendanceRecord;
  }

  // Exams
  async getExamsByTenant(tenantId: string): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(eq(exams.tenantId, tenantId))
      .orderBy(desc(exams.startDate));
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const [exam] = await db.insert(exams).values(insertExam).returning();
    return exam;
  }

  // Exam Results
  async getResultsByExam(examId: string, tenantId: string): Promise<ExamResult[]> {
    return await db
      .select()
      .from(examResults)
      .where(and(eq(examResults.examId, examId), eq(examResults.tenantId, tenantId)));
  }

  async createExamResult(insertResult: InsertExamResult): Promise<ExamResult> {
    const [result] = await db.insert(examResults).values(insertResult).returning();
    return result;
  }

  // Fee Structures
  async getFeeStructuresByTenant(tenantId: string): Promise<FeeStructure[]> {
    return await db
      .select()
      .from(feeStructures)
      .where(eq(feeStructures.tenantId, tenantId));
  }

  async createFeeStructure(insertFeeStructure: InsertFeeStructure): Promise<FeeStructure> {
    const [feeStructure] = await db
      .insert(feeStructures)
      .values(insertFeeStructure)
      .returning();
    return feeStructure;
  }

  // Fee Payments
  async getFeePaymentsByStudent(studentId: string, tenantId: string): Promise<FeePayment[]> {
    return await db
      .select()
      .from(feePayments)
      .where(
        and(eq(feePayments.studentId, studentId), eq(feePayments.tenantId, tenantId))
      );
  }

  async createFeePayment(insertPayment: InsertFeePayment): Promise<FeePayment> {
    const [payment] = await db.insert(feePayments).values(insertPayment).returning();
    return payment;
  }

  // Announcements
  async getAnnouncementsByTenant(tenantId: string): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.tenantId, tenantId))
      .orderBy(desc(announcements.publishedAt));
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(insertAnnouncement)
      .returning();
    return announcement;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreference | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || undefined;
  }

  async createUserPreferences(insertPrefs: InsertUserPreference): Promise<UserPreference> {
    const [prefs] = await db
      .insert(userPreferences)
      .values(insertPrefs)
      .returning();
    return prefs;
  }

  async updateUserPreferences(userId: string, updatePrefs: Partial<InsertUserPreference>): Promise<UserPreference> {
    const [prefs] = await db
      .update(userPreferences)
      .set({ ...updatePrefs, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return prefs;
  }

  // User Profile
  async updateUserProfile(userId: string, profileData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
