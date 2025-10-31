import {
  TenantModel,
  UserModel,
  StudentModel,
  ClassModel,
  SubjectModel,
  AttendanceModel,
  ExamModel,
  ExamResultModel,
  FeeStructureModel,
  FeePaymentModel,
  AnnouncementModel,
  ClassSubjectModel,
  UserPreferenceModel,
  MessageModel,
  NotificationModel,
  TimetableModel,
  StudentTransportModel,
  TransportRouteModel,
  PayrollModel,
  LeaveRequestModel,
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
  type Message,
  type Notification,
  type Payroll,
  type LeaveRequest,
} from "@shared/schema";

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
  bulkCreateAttendance(attendanceRecords: any[], tenantId: string, markedBy: string): Promise<{ success: boolean; count: number }>;
  
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
  getFeePaymentsByTenant(tenantId: string, limit?: number): Promise<any[]>;
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
  
  // Dashboard Stats
  getFacultyCount(tenantId: string): Promise<number>;
  getMonthlyRevenue(tenantId: string): Promise<number>;
  getPendingFees(tenantId: string): Promise<number>;
  
  // SuperAdmin Dashboard Stats
  getTotalUsersCount(): Promise<number>;
  getTotalTenantsCount(): Promise<number>;
  getTotalMRR(): Promise<number>;
  getTenantsWithStats(): Promise<any[]>;
  
  // Admin Dashboard Data
  getRecentAdmissions(tenantId: string, limit?: number): Promise<any[]>;
  getFeeCollectionTrends(tenantId: string, months?: number): Promise<any[]>;
  getRecentActivities(tenantId: string, limit?: number): Promise<any[]>;
  
  // Reports Data
  getAttendanceStats(tenantId: string, months?: number): Promise<any[]>;
  getPerformanceData(tenantId: string): Promise<any[]>;
  getClassDistribution(tenantId: string): Promise<any[]>;
  getFeeCollectionStats(tenantId: string, months?: number): Promise<any>;
  
  // Messages
  getMessagesByUser(userId: string, tenantId: string): Promise<Message[]>;
  getUnreadMessagesCount(userId: string, tenantId: string): Promise<number>;
  createMessage(message: Partial<Message>): Promise<Message>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  
  // Notifications
  getNotificationsByUser(userId: string, tenantId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: string, tenantId: string): Promise<number>;
  createNotification(notification: Partial<Notification>): Promise<Notification>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  
  // Student specific queries
  getStudentTimetable(studentId: string, tenantId: string): Promise<any[]>;
  getStudentExamResults(studentId: string, tenantId: string): Promise<any[]>;
  getStudentTransportDetails(studentId: string, tenantId: string): Promise<any>;
  getStudentByUserId(userId: string, tenantId: string): Promise<Student | undefined>;
  
  // Timetable Management
  getTimetableByClass(classId: string, tenantId: string): Promise<any[]>;
  
  // Faculty Management
  getFacultyByTenant(tenantId: string): Promise<any[]>;
  updateUser(userId: string, tenantId: string, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(userId: string, tenantId: string): Promise<void>;
  
  // Payroll Management
  getPayrollByUser(userId: string, tenantId: string): Promise<Payroll[]>;
  getPayrollByTenant(tenantId: string, month?: string, year?: number): Promise<any[]>;
  createPayroll(payroll: Partial<Payroll>): Promise<Payroll>;
  updatePayroll(payrollId: string, tenantId: string, payrollData: Partial<Payroll>): Promise<Payroll>;
  
  // Leave Management
  getLeaveRequestsByUser(userId: string, tenantId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsByTenant(tenantId: string, status?: string): Promise<any[]>;
  createLeaveRequest(leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest>;
  updateLeaveRequest(leaveId: string, tenantId: string, updateData: Partial<LeaveRequest>): Promise<LeaveRequest>;
  deleteLeaveRequest(leaveId: string, tenantId: string): Promise<void>;
}

function toPlainObject(doc: any): any {
  if (!doc) return undefined;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj._id = obj._id.toString();
  }
  if (obj.tenantId && typeof obj.tenantId === 'object') {
    obj.tenantId = obj.tenantId.toString();
  }
  if (obj.userId && typeof obj.userId === 'object') {
    obj.userId = obj.userId.toString();
  }
  if (obj.classId && typeof obj.classId === 'object') {
    obj.classId = obj.classId.toString();
  }
  return obj;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user ? toPlainObject(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? toPlainObject(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return toPlainObject(user);
  }

  // Tenants
  async getTenant(id: string): Promise<Tenant | undefined> {
    const tenant = await TenantModel.findById(id).lean();
    return tenant ? toPlainObject(tenant) : undefined;
  }

  async getAllTenants(): Promise<Tenant[]> {
    const tenants = await TenantModel.find().lean();
    return tenants.map(toPlainObject);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const tenant = await TenantModel.create(insertTenant);
    return toPlainObject(tenant);
  }

  // Students
  async getStudent(id: string, tenantId?: string): Promise<Student | undefined> {
    const query = tenantId ? { _id: id, tenantId } : { _id: id };
    const student = await StudentModel.findOne(query).lean();
    return student ? toPlainObject(student) : undefined;
  }

  async getStudentsByClass(classId: string, tenantId: string): Promise<Student[]> {
    const students = await StudentModel.find({ classId, tenantId }).lean();
    return students.map(toPlainObject);
  }

  async getStudentsByTenant(tenantId: string): Promise<Student[]> {
    const students = await StudentModel.find({ tenantId }).lean();
    return students.map(toPlainObject);
  }

  async getStudentsWithDetailsOptimized(tenantId: string, limit?: number, offset?: number): Promise<any[]> {
    let query = StudentModel.find({ tenantId })
      .populate('userId', 'firstName lastName email phone active avatar')
      .populate('classId', 'name')
      .sort({ admissionNumber: 1 });
    
    if (offset !== undefined) {
      query = query.skip(offset);
    }
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    
    const students = await query.lean();
    
    return students.map(student => {
      const user = student.userId as any;
      const classInfo = student.classId as any;
      
      return {
        id: student._id.toString(),
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
        admissionNumber: student.admissionNumber,
        class: classInfo ? classInfo.name : 'Not assigned',
        rollNumber: student.rollNumber || '',
        email: user?.email || '',
        phone: user?.phone || '',
        status: user?.active ? 'active' : 'inactive',
        avatar: user?.avatar || null,
      };
    });
  }

  async getStudentsCount(tenantId: string): Promise<number> {
    return await StudentModel.countDocuments({ tenantId });
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const student = await StudentModel.create(insertStudent);
    return toPlainObject(student);
  }

  // Classes
  async getClass(id: string, tenantId?: string): Promise<Class | undefined> {
    const query = tenantId ? { _id: id, tenantId } : { _id: id };
    const classData = await ClassModel.findOne(query).lean();
    return classData ? toPlainObject(classData) : undefined;
  }

  async getClassesByTenant(tenantId: string): Promise<Class[]> {
    const classes = await ClassModel.find({ tenantId }).lean();
    return classes.map(toPlainObject);
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const classData = await ClassModel.create(insertClass);
    return toPlainObject(classData);
  }

  // Subjects
  async getSubjectsByTenant(tenantId: string): Promise<Subject[]> {
    const subjects = await SubjectModel.find({ tenantId }).lean();
    return subjects.map(toPlainObject);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const subject = await SubjectModel.create(insertSubject);
    return toPlainObject(subject);
  }

  // Attendance
  async getAttendanceByDate(classId: string, date: string, tenantId: string): Promise<Attendance[]> {
    const attendance = await AttendanceModel.find({
      classId,
      date: new Date(date),
      tenantId,
    }).lean();
    return attendance.map(toPlainObject);
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const attendanceRecord = await AttendanceModel.create(insertAttendance);
    return toPlainObject(attendanceRecord);
  }

  async bulkCreateAttendance(attendanceRecords: any[], tenantId: string, markedBy: string): Promise<{ success: boolean; count: number }> {
    let processedCount = 0;

    for (const record of attendanceRecords) {
      const student = await StudentModel.findOne({ 
        _id: record.studentId, 
        tenantId 
      }).lean();
      
      if (!student) {
        throw new Error(`Student ${record.studentId} not found or does not belong to tenant ${tenantId}`);
      }

      const classData = await ClassModel.findOne({ 
        _id: record.classId, 
        tenantId 
      }).lean();
      
      if (!classData) {
        throw new Error(`Class ${record.classId} not found or does not belong to tenant ${tenantId}`);
      }

      const existingRecord = await AttendanceModel.findOne({
        studentId: record.studentId,
        classId: record.classId,
        date: new Date(record.date),
        tenantId,
      });

      if (existingRecord) {
        await AttendanceModel.findOneAndUpdate(
          {
            studentId: record.studentId,
            classId: record.classId,
            date: new Date(record.date),
            tenantId,
          },
          {
            status: record.status,
            markedBy: markedBy,
            remarks: record.remarks || undefined,
          },
          { new: true }
        );
      } else {
        await AttendanceModel.create({
          studentId: record.studentId,
          classId: record.classId,
          date: new Date(record.date),
          status: record.status,
          tenantId,
          markedBy: markedBy,
          remarks: record.remarks || undefined,
        });
      }

      processedCount++;
    }

    return { success: true, count: processedCount };
  }

  // Exams
  async getExamsByTenant(tenantId: string): Promise<Exam[]> {
    const exams = await ExamModel.find({ tenantId })
      .sort({ startDate: -1 })
      .lean();
    return exams.map(toPlainObject);
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const exam = await ExamModel.create(insertExam);
    return toPlainObject(exam);
  }

  // Exam Results
  async getResultsByExam(examId: string, tenantId: string): Promise<ExamResult[]> {
    const results = await ExamResultModel.find({ examId, tenantId }).lean();
    return results.map(toPlainObject);
  }

  async createExamResult(insertResult: InsertExamResult): Promise<ExamResult> {
    const result = await ExamResultModel.create(insertResult);
    return toPlainObject(result);
  }

  // Fee Structures
  async getFeeStructuresByTenant(tenantId: string): Promise<FeeStructure[]> {
    const feeStructures = await FeeStructureModel.find({ tenantId }).lean();
    return feeStructures.map(toPlainObject);
  }

  async createFeeStructure(insertFeeStructure: InsertFeeStructure): Promise<FeeStructure> {
    const feeStructure = await FeeStructureModel.create(insertFeeStructure);
    return toPlainObject(feeStructure);
  }

  // Fee Payments
  async getFeePaymentsByStudent(studentId: string, tenantId: string): Promise<FeePayment[]> {
    const payments = await FeePaymentModel.find({ studentId, tenantId }).lean();
    return payments.map(toPlainObject);
  }

  async getFeePaymentsByTenant(tenantId: string, limit: number = 50): Promise<any[]> {
    const payments = await FeePaymentModel.find({ tenantId })
      .populate('studentId', 'userId')
      .sort({ paymentDate: -1 })
      .limit(limit)
      .lean();
    
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const student = await StudentModel.findById(payment.studentId).populate('userId', 'firstName lastName').populate('classId', 'name').lean();
        return {
          id: payment._id.toString(),
          student: student ? `${(student.userId as any)?.firstName} ${(student.userId as any)?.lastName}` : 'Unknown',
          class: student ? (student.classId as any)?.name || 'N/A' : 'N/A',
          amount: payment.amount,
          status: payment.status,
          date: payment.paymentDate.toISOString().split('T')[0],
          receipt: payment.receiptNumber || '',
        };
      })
    );
    
    return paymentsWithDetails;
  }

  async createFeePayment(insertPayment: InsertFeePayment): Promise<FeePayment> {
    const payment = await FeePaymentModel.create(insertPayment);
    return toPlainObject(payment);
  }

  // Announcements
  async getAnnouncementsByTenant(tenantId: string): Promise<Announcement[]> {
    const announcements = await AnnouncementModel.find({ tenantId })
      .sort({ publishedAt: -1 })
      .lean();
    return announcements.map(toPlainObject);
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const announcement = await AnnouncementModel.create(insertAnnouncement);
    return toPlainObject(announcement);
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreference | undefined> {
    const prefs = await UserPreferenceModel.findOne({ userId }).lean();
    return prefs ? toPlainObject(prefs) : undefined;
  }

  async createUserPreferences(insertPrefs: InsertUserPreference): Promise<UserPreference> {
    const prefs = await UserPreferenceModel.create(insertPrefs);
    return toPlainObject(prefs);
  }

  async updateUserPreferences(userId: string, updatePrefs: Partial<InsertUserPreference>): Promise<UserPreference> {
    const prefs = await UserPreferenceModel.findOneAndUpdate(
      { userId },
      { ...updatePrefs, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (!prefs) {
      throw new Error('User preferences not found');
    }
    
    return toPlainObject(prefs);
  }

  // User Profile
  async updateUserProfile(userId: string, profileData: Partial<InsertUser>): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      profileData,
      { new: true }
    ).lean();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return toPlainObject(user);
  }
  
  // Dashboard Stats
  async getFacultyCount(tenantId: string): Promise<number> {
    return await UserModel.countDocuments({ 
      tenantId, 
      role: { $in: ['faculty', 'principal'] }
    });
  }
  
  async getMonthlyRevenue(tenantId: string): Promise<number> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const result = await FeePaymentModel.aggregate([
      {
        $match: {
          tenantId: tenantId as any,
          paymentDate: { $gte: currentMonth, $lt: nextMonth },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }
  
  async getPendingFees(tenantId: string): Promise<number> {
    const result = await FeePaymentModel.aggregate([
      {
        $match: {
          tenantId: tenantId as any,
          status: { $in: ['pending', 'overdue'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }
  
  // SuperAdmin Dashboard Stats
  async getTotalUsersCount(): Promise<number> {
    return await UserModel.countDocuments();
  }
  
  async getTotalTenantsCount(): Promise<number> {
    return await TenantModel.countDocuments();
  }
  
  async getTotalMRR(): Promise<number> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const result = await FeePaymentModel.aggregate([
      {
        $match: {
          paymentDate: { $gte: currentMonth, $lt: nextMonth },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }
  
  async getTenantsWithStats(): Promise<any[]> {
    const tenants = await TenantModel.find().lean();
    
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const tenantId = tenant._id.toString();
        const [studentCount, monthlyRevenue] = await Promise.all([
          StudentModel.countDocuments({ tenantId }),
          this.getMonthlyRevenue(tenantId)
        ]);
        
        return {
          id: tenantId,
          name: tenant.name,
          students: studentCount,
          plan: 'Standard',
          status: tenant.active ? 'active' : 'inactive',
          revenue: monthlyRevenue,
        };
      })
    );
    
    return tenantsWithStats;
  }
  
  // Admin Dashboard Data
  async getRecentAdmissions(tenantId: string, limit: number = 5): Promise<any[]> {
    const students = await StudentModel.find({ tenantId })
      .populate('userId', 'firstName lastName email phone active')
      .populate('classId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return students.map(student => {
      const user = student.userId as any;
      const classInfo = student.classId as any;
      
      return {
        id: student._id.toString(),
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
        class: classInfo ? classInfo.name : 'Not assigned',
        admissionDate: student.createdAt ? new Date(student.createdAt).toISOString().split('T')[0] : '',
        status: user?.active ? 'active' : 'inactive',
      };
    });
  }
  
  async getFeeCollectionTrends(tenantId: string, months: number = 6): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends: any[] = [];
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (months - 1 - i));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const result = await FeePaymentModel.aggregate([
        {
          $match: {
            tenantId: tenantId as any,
            paymentDate: { $gte: monthStart, $lt: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$amount' }
          }
        }
      ]);
      
      trends.push({
        month: monthNames[monthStart.getMonth()],
        amount: result.length > 0 ? result[0].amount : 0
      });
    }
    
    return trends;
  }
  
  async getRecentActivities(tenantId: string, limit: number = 5): Promise<any[]> {
    const activities: any[] = [];
    
    const recentAnnouncements = await AnnouncementModel.find({ tenantId })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    
    for (const announcement of recentAnnouncements) {
      activities.push({
        id: announcement._id.toString(),
        action: 'New announcement posted',
        user: 'Admin',
        time: this.getRelativeTime(announcement.publishedAt)
      });
    }
    
    const recentPayments = await FeePaymentModel.find({ tenantId, status: 'paid' })
      .populate('studentId', 'userId')
      .sort({ paymentDate: -1 })
      .limit(2)
      .lean();
    
    for (const payment of recentPayments) {
      activities.push({
        id: payment._id.toString(),
        action: 'Fee payment received',
        user: 'Student',
        time: this.getRelativeTime(payment.paymentDate)
      });
    }
    
    return activities.slice(0, limit);
  }
  
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }
  
  // Reports Data
  async getAttendanceStats(tenantId: string, months: number = 6): Promise<any[]> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const stats: any[] = [];
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (months - 1 - i));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const result = await AttendanceModel.aggregate([
        {
          $match: {
            tenantId: tenantId as any,
            date: { $gte: monthStart, $lt: monthEnd }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const present = result.find(r => r._id === 'present')?.count || 0;
      const absent = result.find(r => r._id === 'absent')?.count || 0;
      const total = present + absent;
      
      stats.push({
        month: monthNames[monthStart.getMonth()],
        present: total > 0 ? Math.round((present / total) * 100) : 0,
        absent: total > 0 ? Math.round((absent / total) * 100) : 0
      });
    }
    
    return stats;
  }
  
  async getPerformanceData(tenantId: string): Promise<any[]> {
    const results = await ExamResultModel.aggregate([
      {
        $match: {
          tenantId: tenantId as any
        }
      },
      {
        $lookup: {
          from: 'exams',
          localField: 'examId',
          foreignField: '_id',
          as: 'exam'
        }
      },
      {
        $unwind: '$exam'
      },
      {
        $group: {
          _id: '$exam.subject',
          avgMarks: { $avg: '$marksObtained' }
        }
      }
    ]);
    
    const subjects = await SubjectModel.find({ tenantId }).lean();
    
    return subjects.map(subject => {
      const subjectResult = results.find(r => r._id?.toString() === subject._id.toString());
      return {
        subject: subject.name,
        average: subjectResult ? Math.round(subjectResult.avgMarks) : 0
      };
    });
  }
  
  async getClassDistribution(tenantId: string): Promise<any[]> {
    const distribution = await StudentModel.aggregate([
      {
        $match: {
          tenantId: tenantId as any
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      {
        $unwind: '$class'
      },
      {
        $group: {
          _id: '$class.name',
          value: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return distribution.map(item => ({
      name: item._id,
      value: item.value
    }));
  }
  
  async getFeeCollectionStats(tenantId: string, months: number = 6): Promise<any> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends: any[] = [];
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (months - 1 - i));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const result = await FeePaymentModel.aggregate([
        {
          $match: {
            tenantId: tenantId as any,
            paymentDate: { $gte: monthStart, $lt: monthEnd }
          }
        },
        {
          $group: {
            _id: '$status',
            amount: { $sum: '$amount' }
          }
        }
      ]);
      
      const collected = result.find(r => r._id === 'paid')?.amount || 0;
      const pending = result.filter(r => r._id !== 'paid').reduce((sum, r) => sum + r.amount, 0);
      
      trends.push({
        month: monthNames[monthStart.getMonth()],
        collected,
        pending
      });
    }
    
    const totalRevenue = await FeePaymentModel.aggregate([
      {
        $match: {
          tenantId: tenantId as any
        }
      },
      {
        $group: {
          _id: '$status',
          amount: { $sum: '$amount' }
        }
      }
    ]);
    
    const collectedTotal = totalRevenue.find(r => r._id === 'paid')?.amount || 0;
    const pendingTotal = totalRevenue.filter(r => r._id !== 'paid').reduce((sum, r) => sum + r.amount, 0);
    
    return {
      trends,
      totalRevenue: collectedTotal + pendingTotal,
      collected: collectedTotal,
      pending: pendingTotal
    };
  }
  
  // Faculty Management
  async getFacultyByTenant(tenantId: string): Promise<any[]> {
    const faculty = await UserModel.find({ 
      tenantId, 
      role: { $in: ['faculty', 'principal'] },
      active: true
    })
    .populate('tenantId', 'name')
    .sort({ firstName: 1 })
    .lean();
    
    return faculty.map(user => ({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar,
      active: user.active,
      createdAt: user.createdAt
    }));
  }
  
  async updateUser(userId: string, tenantId: string, userData: Partial<InsertUser>): Promise<User> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, tenantId },
      userData,
      { new: true }
    ).lean();
    
    if (!user) {
      throw new Error('User not found or access denied');
    }
    
    return toPlainObject(user);
  }
  
  async deleteUser(userId: string, tenantId: string): Promise<void> {
    const result = await UserModel.findOneAndDelete({ _id: userId, tenantId });
    
    if (!result) {
      throw new Error('User not found or access denied');
    }
  }
  
  // Messages
  async getMessagesByUser(userId: string, tenantId: string): Promise<Message[]> {
    const messages = await MessageModel.find({
      tenantId,
      recipientId: userId
    })
    .populate('senderId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
    
    return messages.map(toPlainObject);
  }
  
  async getUnreadMessagesCount(userId: string, tenantId: string): Promise<number> {
    return await MessageModel.countDocuments({
      tenantId,
      recipientId: userId,
      read: false
    });
  }
  
  async createMessage(message: Partial<Message>): Promise<Message> {
    const newMessage = await MessageModel.create(message);
    return toPlainObject(newMessage.toObject());
  }
  
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await MessageModel.findOneAndUpdate(
      { _id: messageId, recipientId: userId },
      { read: true }
    );
  }
  
  // Notifications
  async getNotificationsByUser(userId: string, tenantId: string, limit: number = 20): Promise<Notification[]> {
    const notifications = await NotificationModel.find({
      tenantId,
      userId
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
    return notifications.map(toPlainObject);
  }
  
  async getUnreadNotificationsCount(userId: string, tenantId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      tenantId,
      userId,
      read: false
    });
  }
  
  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    const newNotification = await NotificationModel.create(notification);
    return toPlainObject(newNotification.toObject());
  }
  
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true }
    );
  }
  
  // Student specific queries
  async getStudentByUserId(userId: string, tenantId: string): Promise<Student | undefined> {
    const student = await StudentModel.findOne({ userId, tenantId }).lean();
    return student ? toPlainObject(student) : undefined;
  }
  
  async getStudentTimetable(studentId: string, tenantId: string): Promise<any[]> {
    const student = await StudentModel.findOne({ _id: studentId, tenantId });
    if (!student || !student.classId) {
      return [];
    }
    
    const timetable = await TimetableModel.find({
      tenantId,
      classId: student.classId
    })
    .populate('subjectId', 'name code')
    .populate('teacherId', 'firstName lastName')
    .sort({ day: 1, startTime: 1 })
    .lean();
    
    return timetable.map(toPlainObject);
  }
  
  async getTimetableByClass(classId: string, tenantId: string): Promise<any[]> {
    const timetable = await TimetableModel.find({
      tenantId,
      classId
    })
    .populate('subjectId', 'name code')
    .populate('teacherId', 'firstName lastName')
    .populate('classId', 'name grade section')
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();
    
    return timetable.map(toPlainObject);
  }

  async createTimetable(data: any): Promise<any> {
    const timetable = await TimetableModel.create(data);
    const populated = await TimetableModel.findById(timetable._id)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name grade section')
      .lean();
    return toPlainObject(populated);
  }

  async updateTimetable(id: string, data: any, tenantId: string): Promise<any> {
    const updated = await TimetableModel.findOneAndUpdate(
      { _id: id, tenantId },
      data,
      { new: true }
    )
    .populate('subjectId', 'name code')
    .populate('teacherId', 'firstName lastName')
    .populate('classId', 'name grade section')
    .lean();
    
    return updated ? toPlainObject(updated) : null;
  }

  async deleteTimetable(id: string, tenantId: string): Promise<boolean> {
    const result = await TimetableModel.findOneAndDelete({ _id: id, tenantId });
    return !!result;
  }

  async checkTimetableConflict(
    classId: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    tenantId: string,
    excludeId: string | null
  ): Promise<boolean> {
    const query: any = {
      tenantId,
      classId,
      dayOfWeek
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingEntries = await TimetableModel.find(query).lean();

    for (const entry of existingEntries) {
      const existingStart = entry.startTime;
      const existingEnd = entry.endTime;

      if (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      ) {
        return true;
      }
    }

    return false;
  }
  
  async getStudentExamResults(studentId: string, tenantId: string): Promise<any[]> {
    const results = await ExamResultModel.find({
      tenantId,
      studentId
    })
    .populate('examId', 'name type startDate endDate')
    .populate('subjectId', 'name code')
    .sort({ createdAt: -1 })
    .lean();
    
    return results.map(toPlainObject);
  }
  
  async getStudentTransportDetails(studentId: string, tenantId: string): Promise<any> {
    const transport = await StudentTransportModel.findOne({
      tenantId,
      studentId
    })
    .populate('routeId')
    .lean();
    
    if (!transport) {
      return null;
    }
    
    return toPlainObject(transport);
  }
  
  // Payroll Management
  async getPayrollByUser(userId: string, tenantId: string): Promise<Payroll[]> {
    const payrolls = await PayrollModel.find({
      tenantId,
      userId
    })
    .sort({ year: -1, month: -1 })
    .lean();
    
    return payrolls.map(toPlainObject);
  }
  
  async getPayrollByTenant(tenantId: string, month?: string, year?: number): Promise<any[]> {
    const query: any = { tenantId };
    if (month) query.month = month;
    if (year) query.year = year;
    
    const payrolls = await PayrollModel.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ year: -1, month: -1 })
    .lean();
    
    return payrolls.map(toPlainObject);
  }
  
  async createPayroll(payroll: Partial<Payroll>): Promise<Payroll> {
    const newPayroll = await PayrollModel.create(payroll);
    return toPlainObject(newPayroll.toObject());
  }
  
  async updatePayroll(payrollId: string, tenantId: string, payrollData: Partial<Payroll>): Promise<Payroll> {
    const payroll = await PayrollModel.findOneAndUpdate(
      { _id: payrollId, tenantId },
      payrollData,
      { new: true }
    ).lean();
    
    if (!payroll) {
      throw new Error('Payroll not found or access denied');
    }
    
    return toPlainObject(payroll);
  }
  
  // Leave Management
  async getLeaveRequestsByUser(userId: string, tenantId: string): Promise<LeaveRequest[]> {
    const leaveRequests = await LeaveRequestModel.find({
      tenantId,
      userId
    })
    .populate('userId', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .lean();
    
    return leaveRequests.map(toPlainObject);
  }
  
  async getLeaveRequestsByTenant(tenantId: string, status?: string): Promise<any[]> {
    const query: any = { tenantId };
    if (status) query.status = status;
    
    const leaveRequests = await LeaveRequestModel.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .lean();
    
    return leaveRequests.map(toPlainObject);
  }
  
  async createLeaveRequest(leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const newLeaveRequest = await LeaveRequestModel.create(leaveRequest);
    return toPlainObject(newLeaveRequest.toObject());
  }
  
  async updateLeaveRequest(leaveId: string, tenantId: string, updateData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const leaveRequest = await LeaveRequestModel.findOneAndUpdate(
      { _id: leaveId, tenantId },
      updateData,
      { new: true }
    ).lean();
    
    if (!leaveRequest) {
      throw new Error('Leave request not found or access denied');
    }
    
    return toPlainObject(leaveRequest);
  }
  
  async deleteLeaveRequest(leaveId: string, tenantId: string): Promise<void> {
    const result = await LeaveRequestModel.findOneAndDelete({ _id: leaveId, tenantId });
    
    if (!result) {
      throw new Error('Leave request not found or access denied');
    }
  }
}

export const storage = new DatabaseStorage();
