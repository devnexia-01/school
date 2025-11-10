import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireRole, tenantIsolation, generateToken, type AuthRequest } from "./middleware/auth";
import { insertTenantSchema, AttendanceModel } from "@shared/schema";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ============ Authentication Routes ============
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || null,
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId,
          avatar: user.avatar,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  });

  // ============ Dashboard Stats Routes ============
  app.get('/api/dashboard/admin/stats', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const [totalStudents, totalFaculty, monthlyRevenue, pendingFees] = await Promise.all([
        storage.getStudentsCount(tenantId),
        storage.getFacultyCount(tenantId),
        storage.getMonthlyRevenue(tenantId),
        storage.getPendingFees(tenantId),
      ]);
      
      res.json({
        totalStudents,
        totalFaculty,
        monthlyRevenue,
        pendingFees,
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/dashboard/superadmin/stats', authenticateToken, requireRole(['super_admin']), async (_req: AuthRequest, res) => {
    try {
      const [totalSchools, totalUsers, totalMRR] = await Promise.all([
        storage.getTotalTenantsCount(),
        storage.getTotalUsersCount(),
        storage.getTotalMRR(),
      ]);
      
      res.json({
        totalSchools,
        totalUsers,
        totalMRR,
      });
    } catch (error) {
      console.error('SuperAdmin dashboard stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/tenants/with-stats', authenticateToken, requireRole(['super_admin']), async (_req: AuthRequest, res) => {
    try {
      const tenants = await storage.getTenantsWithStats();
      res.json({ tenants });
    } catch (error) {
      console.error('Get tenants with stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/dashboard/admin/recent-admissions', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const admissions = await storage.getRecentAdmissions(tenantId, limit);
      res.json({ admissions });
    } catch (error) {
      console.error('Recent admissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/dashboard/admin/fee-collection-trends', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const trends = await storage.getFeeCollectionTrends(tenantId, months);
      res.json({ trends });
    } catch (error) {
      console.error('Fee collection trends error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/dashboard/admin/recent-activities', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const activities = await storage.getRecentActivities(tenantId, limit);
      res.json({ activities });
    } catch (error) {
      console.error('Recent activities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Reports Routes ============
  app.get('/api/reports/attendance', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const data = await storage.getAttendanceStats(tenantId, months);
      res.json({ data });
    } catch (error) {
      console.error('Attendance stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/reports/performance', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const data = await storage.getPerformanceData(tenantId);
      res.json({ data });
    } catch (error) {
      console.error('Performance data error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/reports/class-distribution', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const data = await storage.getClassDistribution(tenantId);
      res.json({ data });
    } catch (error) {
      console.error('Class distribution error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/reports/fee-collection', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const data = await storage.getFeeCollectionStats(tenantId, months);
      res.json(data);
    } catch (error) {
      console.error('Fee collection stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Faculty Routes ============
  app.get('/api/faculty', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const faculty = await storage.getFacultyByTenant(tenantId);
      res.json({ faculty });
    } catch (error) {
      console.error('Get faculty error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/faculty', authenticateToken, requireRole(['admin', 'principal']), tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { email, password, firstName, lastName, phone, role } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        tenantId,
        email,
        password: hashedPassword,
        role: role || 'faculty',
        firstName,
        lastName,
        phone,
        active: true,
      });

      res.status(201).json({ user });
    } catch (error) {
      console.error('Create faculty error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/faculty/:id', authenticateToken, requireRole(['admin', 'principal']), tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const updateData = req.body;
      
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const user = await storage.updateUser(id, tenantId, updateData);
      res.json({ user });
    } catch (error) {
      console.error('Update faculty error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/faculty/:id', authenticateToken, requireRole(['admin', 'principal']), tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      await storage.deleteUser(id, tenantId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete faculty error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Students Routes ============
  app.get('/api/students', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      
      // Sanitize pagination parameters
      let limit: number | undefined = undefined;
      let offset: number | undefined = undefined;
      
      if (req.query.limit) {
        const parsedLimit = parseInt(req.query.limit as string);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limit = Math.min(parsedLimit, 1000); // Cap at 1000
        }
      }
      
      if (req.query.offset) {
        const parsedOffset = parseInt(req.query.offset as string);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          offset = parsedOffset;
        }
      }
      
      const [students, total] = await Promise.all([
        storage.getStudentsWithDetailsOptimized(tenantId, limit, offset),
        storage.getStudentsCount(tenantId)
      ]);
      
      res.json({ students, total });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/students', authenticateToken, requireRole(['admin']), tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { email, password, firstName, lastName, ...studentData } = req.body;

      // Create user account first
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        tenantId,
        email,
        password: hashedPassword,
        role: 'student',
        firstName,
        lastName,
        phone: studentData.emergencyContact || null,
        active: true,
      });

      // Create student profile
      const student = await storage.createStudent({
        ...studentData,
        tenantId,
        userId: user._id,
      });

      res.status(201).json(student);
    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/students/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const student = await storage.getStudent(req.params.id, tenantId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/students/:id', authenticateToken, requireRole(['admin', 'principal']), tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const updatedStudent = await storage.updateStudent(id, tenantId, req.body);
      res.json(updatedStudent);
    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Classes Routes ============
  app.get('/api/classes', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const classes = await storage.getClassesByTenant(tenantId);
      res.json({ classes });
    } catch (error) {
      console.error('Get classes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/classes', authenticateToken, tenantIsolation, requireRole(['admin', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const classData = { ...req.body, tenantId };
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      console.error('Create class error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/classes/:id', authenticateToken, tenantIsolation, requireRole(['admin', 'principal']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const updatedClass = await storage.updateClass(id, tenantId, req.body);
      res.json(updatedClass);
    } catch (error) {
      console.error('Update class error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Subjects Routes ============
  app.get('/api/subjects', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const subjects = await storage.getSubjectsByTenant(tenantId);
      res.json({ subjects });
    } catch (error) {
      console.error('Get subjects error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/subjects', authenticateToken, tenantIsolation, requireRole(['admin', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const subjectData = { ...req.body, tenantId };
      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      console.error('Create subject error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/subjects/:id', authenticateToken, tenantIsolation, requireRole(['admin', 'principal']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const updatedSubject = await storage.updateSubject(id, tenantId, req.body);
      res.json(updatedSubject);
    } catch (error) {
      console.error('Update subject error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Attendance Routes ============
  app.get('/api/attendance', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { classId, date } = req.query;
      const attendanceRecords = await storage.getAttendanceByDate(
        classId as string,
        date as string,
        tenantId
      );
      res.json({ attendance: attendanceRecords });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/attendance', authenticateToken, tenantIsolation, requireRole(['admin', 'faculty', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const attendanceData = { ...req.body, tenantId, markedBy: req.user!.id };
      const attendance = await storage.createAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error('Create attendance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/attendance/bulk', authenticateToken, tenantIsolation, requireRole(['admin', 'faculty', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { attendanceRecords } = req.body;
      
      if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
        return res.status(400).json({ error: 'attendanceRecords must be a non-empty array' });
      }

      const result = await storage.bulkCreateAttendance(
        attendanceRecords,
        tenantId,
        req.user!.id
      );

      res.status(201).json(result);
    } catch (error) {
      console.error('Bulk attendance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Timetable Routes ============
  app.get('/api/timetable', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { classId } = req.query;
      
      if (!classId) {
        return res.status(400).json({ error: 'classId is required' });
      }

      const timetable = await storage.getTimetableByClass(classId as string, tenantId);
      res.json({ timetable });
    } catch (error) {
      console.error('Get timetable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/timetable', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const timetableData = { ...req.body, tenantId };
      
      const conflictCheck = await storage.checkTimetableConflict(
        timetableData.classId,
        timetableData.dayOfWeek,
        timetableData.startTime,
        timetableData.endTime,
        tenantId,
        null
      );
      
      if (conflictCheck) {
        return res.status(409).json({ error: 'Time slot conflict detected for this class' });
      }

      const timetable = await storage.createTimetable(timetableData);
      res.status(201).json(timetable);
    } catch (error) {
      console.error('Create timetable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/timetable/:id', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const updateData = req.body;
      
      const conflictCheck = await storage.checkTimetableConflict(
        updateData.classId,
        updateData.dayOfWeek,
        updateData.startTime,
        updateData.endTime,
        tenantId,
        id
      );
      
      if (conflictCheck) {
        return res.status(409).json({ error: 'Time slot conflict detected for this class' });
      }

      const updatedTimetable = await storage.updateTimetable(id, updateData, tenantId);
      if (!updatedTimetable) {
        return res.status(404).json({ error: 'Timetable entry not found' });
      }
      res.json(updatedTimetable);
    } catch (error) {
      console.error('Update timetable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/timetable/:id', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      
      const deleted = await storage.deleteTimetable(id, tenantId);
      if (!deleted) {
        return res.status(404).json({ error: 'Timetable entry not found' });
      }
      res.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
      console.error('Delete timetable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Exams Routes ============
  app.get('/api/exams', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const exams = await storage.getExamsByTenant(tenantId);
      res.json({ exams });
    } catch (error) {
      console.error('Get exams error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/exams/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const exam = await storage.getExamById(id, tenantId);
      res.json(exam);
    } catch (error) {
      console.error('Get exam by id error:', error);
      res.status(404).json({ error: error instanceof Error ? error.message : 'Exam not found' });
    }
  });

  app.post('/api/exams', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const examData = { ...req.body, tenantId };
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      console.error('Create exam error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Exam Results Routes ============
  app.get('/api/exam-results/:examId', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const results = await storage.getResultsByExam(req.params.examId, tenantId);
      res.json({ results });
    } catch (error) {
      console.error('Get exam results error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/exam-results', authenticateToken, tenantIsolation, requireRole(['admin', 'faculty', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const resultData = { ...req.body, tenantId };
      const result = await storage.createExamResult(resultData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create exam result error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Fee Structures Routes ============
  app.get('/api/fee-structures', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const feeStructures = await storage.getFeeStructuresByTenant(tenantId);
      res.json({ feeStructures });
    } catch (error) {
      console.error('Get fee structures error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/fee-structures', authenticateToken, tenantIsolation, requireRole(['admin', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const feeStructureData = { ...req.body, tenantId };
      const feeStructure = await storage.createFeeStructure(feeStructureData);
      res.status(201).json(feeStructure);
    } catch (error) {
      console.error('Create fee structure error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Fee Payments Routes ============
  app.get('/api/fee-payments/all', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenants = await storage.getAllTenants();
      let allPayments: any[] = [];
      
      for (const tenant of tenants) {
        const payments = await storage.getFeePaymentsByTenant(tenant._id, 500);
        allPayments = [...allPayments, ...payments.map(payment => ({
          ...payment,
          tenantId: tenant._id,
          tenantName: tenant.name,
        }))];
      }
      
      const { school, status, startDate, endDate } = req.query;
      
      let filteredPayments = allPayments;
      
      if (school) {
        filteredPayments = filteredPayments.filter(p => p.tenantId === school);
      }
      
      if (status) {
        filteredPayments = filteredPayments.filter(p => p.status === status);
      }
      
      if (startDate) {
        filteredPayments = filteredPayments.filter(p => new Date(p.paymentDate) >= new Date(startDate as string));
      }
      
      if (endDate) {
        filteredPayments = filteredPayments.filter(p => new Date(p.paymentDate) <= new Date(endDate as string));
      }
      
      filteredPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      
      res.json({ payments: filteredPayments });
    } catch (error) {
      console.error('Get all fee payments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/fee-payments', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const payments = await storage.getFeePaymentsByTenant(tenantId, limit);
      res.json({ payments });
    } catch (error) {
      console.error('Get fee payments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/fee-payments/student/:studentId', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const payments = await storage.getFeePaymentsByStudent(req.params.studentId, tenantId);
      res.json({ payments });
    } catch (error) {
      console.error('Get fee payments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/fee-payments', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const paymentData = { ...req.body, tenantId };
      const payment = await storage.createFeePayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error('Create fee payment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/fee-payments/search', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const query = req.query.q as string || '';
      const status = req.query.status as string || '';
      const payments = await storage.searchFeePayments(tenantId, query, status);
      res.json({ payments });
    } catch (error) {
      console.error('Search fee payments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/fee-payments/export', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const userRole = req.user!.role;
      let payments: any[] = [];
      
      if (userRole === 'student') {
        const userId = req.user!.id;
        const student = await storage.getStudentByUserId(userId, tenantId);
        if (student) {
          const studentPayments = await storage.getFeePaymentsByStudent(student._id, tenantId);
          payments = await Promise.all(
            studentPayments.map(async (payment: any) => {
              const studentData = await storage.getStudent(payment.studentId, tenantId);
              const user = studentData ? await storage.getUser(studentData.userId) : null;
              const classData = studentData && studentData.classId ? await storage.getClass(studentData.classId, tenantId) : null;
              
              return {
                id: payment._id,
                student: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
                admissionNumber: studentData?.admissionNumber || '',
                class: classData?.name || 'N/A',
                amount: payment.amount,
                status: payment.status,
                date: new Date(payment.paymentDate).toISOString().split('T')[0],
                receipt: payment.receiptNumber || '',
                paymentMode: payment.paymentMode || '',
              };
            })
          );
        }
      } else {
        payments = await storage.searchFeePayments(tenantId, '', '');
      }
      
      const csvHeaders = 'Student,Admission Number,Class,Amount,Status,Date,Receipt Number,Payment Mode\n';
      const csvRows = payments.map(p => 
        `"${p.student}","${p.admissionNumber}","${p.class}",${p.amount},"${p.status}","${p.date}","${p.receipt}","${p.paymentMode}"`
      ).join('\n');
      const csv = csvHeaders + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fee-payments.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export fee payments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Announcements Routes ============
  app.get('/api/announcements', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const announcements = await storage.getAnnouncementsByTenant(tenantId);
      res.json({ announcements });
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/announcements', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const announcementData = { ...req.body, tenantId, publishedBy: req.user!.id };
      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ User Profile Routes ============
  app.get('/api/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, phone, avatar } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        phone,
        avatar,
      });
      
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Tenants Routes (Super Admin only) ============
  app.get('/api/tenants', authenticateToken, requireRole(['super_admin']), async (_req: AuthRequest, res) => {
    try {
      const tenantsData = await storage.getAllTenants();
      res.json({ tenants: tenantsData });
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/tenants/:id', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenant = await storage.getTenant(id);
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      const studentsCount = await storage.getStudentsCount(id);
      
      const payments = await storage.getFeePaymentsByTenant(id);
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      res.json({
        tenant,
        stats: {
          studentsCount,
          totalRevenue,
          paymentsCount: payments.length,
        },
      });
    } catch (error) {
      console.error('Get tenant details error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/tenants', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const validatedData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(validatedData);
      res.status(201).json(tenant);
    } catch (error: any) {
      console.error('Create tenant error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {})[0];
        let errorMessage = 'A school with this information already exists';
        
        if (duplicateField === 'code') {
          errorMessage = 'School code already exists';
        } else if (duplicateField === 'name') {
          errorMessage = 'School name already exists';
        }
        
        return res.status(409).json({ error: errorMessage });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/tenants/:id', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const tenant = await storage.updateTenant(id, updateData);
      res.json(tenant);
    } catch (error: any) {
      console.error('Update tenant error:', error);
      if (error.message === 'Tenant not found') {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Messages Routes ============
  app.get('/api/messages', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      const messages = await storage.getMessagesByUser(userId, tenantId);
      res.json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/messages/unread-count', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      const count = await storage.getUnreadMessagesCount(userId, tenantId);
      res.json({ count });
    } catch (error) {
      console.error('Get unread messages count error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/messages', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const senderId = req.user!.id;
      const { recipientId, subject, content } = req.body;
      
      const message = await storage.createMessage({
        tenantId,
        senderId,
        recipientId,
        subject,
        content,
        read: false,
        createdAt: new Date(),
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Create message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/messages/:id/read', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.markMessageAsRead(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark message as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Notifications Routes ============
  app.get('/api/notifications', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const notifications = await storage.getNotificationsByUser(userId, tenantId, limit);
      res.json({ notifications });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/notifications/unread-count', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      const count = await storage.getUnreadNotificationsCount(userId, tenantId);
      res.json({ count });
    } catch (error) {
      console.error('Get unread notifications count error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.markNotificationAsRead(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Student Dashboard Routes ============
  app.get('/api/student/timetable', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      
      const student = await storage.getStudentByUserId(userId, tenantId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const timetable = await storage.getStudentTimetable(student._id, tenantId);
      res.json({ timetable });
    } catch (error) {
      console.error('Get student timetable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/exam-results', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      
      const student = await storage.getStudentByUserId(userId, tenantId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const results = await storage.getStudentExamResults(student._id, tenantId);
      res.json({ results });
    } catch (error) {
      console.error('Get student exam results error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/transport', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      
      const student = await storage.getStudentByUserId(userId, tenantId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const transport = await storage.getStudentTransportDetails(student._id, tenantId);
      res.json({ transport });
    } catch (error) {
      console.error('Get student transport error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Transport Management Routes ============
  app.get('/api/transport/routes', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const routes = await storage.getAllTransportRoutes(tenantId);
      res.json({ routes });
    } catch (error) {
      console.error('Get transport routes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/transport/routes', authenticateToken, tenantIsolation, requireRole(['admin', 'principal']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const routeData = { ...req.body, tenantId };
      const route = await storage.createTransportRoute(routeData);
      res.status(201).json(route);
    } catch (error) {
      console.error('Create transport route error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/transport/assignments', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { studentId, routeId, pickupStop, dropStop } = req.body;
      
      const student = await storage.getStudent(studentId);
      if (!student || student.tenantId !== tenantId) {
        return res.status(403).json({ error: 'Access denied: Student not in your tenant' });
      }
      
      const assignmentData = {
        tenantId,
        studentId,
        routeId,
        pickupStop,
        dropStop,
        active: true,
        createdAt: new Date(),
      };
      
      const assignment = await storage.createStudentTransport(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Create transport assignment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/transport/assignments/:id', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      
      await storage.deleteStudentTransport(id, tenantId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete transport assignment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/transport/assignments/:routeId', authenticateToken, tenantIsolation, requireRole(['admin', 'principal', 'super_admin']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { routeId } = req.params;
      
      const students = await storage.getRouteStudents(routeId, tenantId);
      res.json({ students });
    } catch (error) {
      console.error('Get route students error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/profile', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      
      const student = await storage.getStudentByUserId(userId, tenantId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get transport details
      const transport = await storage.getStudentTransportDetails(student._id, tenantId);
      
      // Get fee summary
      const feeClass = student.classId ? await storage.getClass(student.classId, tenantId) : null;
      const feeStructures = await storage.getFeeStructuresByTenant(tenantId);
      const classFeeStructures = student.classId ? feeStructures.filter((fs: any) => fs.classId === student.classId) : [];
      const totalFees = classFeeStructures.reduce((sum: number, fs: any) => sum + (fs.amount || 0), 0);
      
      const feePayments = await storage.getFeePaymentsByStudent(student._id, tenantId);
      const paidAmount = feePayments
        .filter((fp: any) => fp.status === 'paid')
        .reduce((sum: number, fp: any) => sum + (fp.amount || 0), 0);
      const pendingAmount = totalFees - paidAmount;
      
      // Get recent 5 payments
      const recentPayments = feePayments
        .sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
        .slice(0, 5);
      
      const { password, ...userWithoutPassword } = user;
      res.json({ 
        student, 
        user: userWithoutPassword,
        transport: transport ? {
          routeName: transport.routeId?.routeName,
          routeNumber: transport.routeId?.routeNumber,
          vehicleNumber: transport.routeId?.vehicleNumber,
          pickupStop: transport.pickupStop,
          dropStop: transport.dropStop,
          fare: transport.routeId?.fare
        } : null,
        fees: {
          totalFees,
          paidAmount,
          pendingAmount,
          recentPayments: recentPayments.map((fp: any) => ({
            _id: fp._id,
            amount: fp.amount,
            paymentDate: fp.paymentDate,
            paymentMode: fp.paymentMode,
            status: fp.status,
            receiptNumber: fp.receiptNumber,
            remarks: fp.remarks
          }))
        }
      });
    } catch (error) {
      console.error('Get student profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/attendance', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      
      const student = await storage.getStudentByUserId(userId, tenantId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const attendance = await storage.getStudentAttendanceRecords(student._id, tenantId);
      res.json({ attendance });
    } catch (error) {
      console.error('Get student attendance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/student/teachers', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      
      const student = await storage.getStudentByUserId(userId, tenantId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const teachers = await storage.getTeachersForStudentClass(student._id, tenantId);
      res.json({ teachers });
    } catch (error) {
      console.error('Get student teachers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Payroll Routes ============
  app.get('/api/payroll', authenticateToken, tenantIsolation, requireRole(['admin', 'principal']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { month, year } = req.query;
      const payrolls = await storage.getPayrollByTenant(tenantId, month as string, year ? Number(year) : undefined);
      res.json({ payrolls });
    } catch (error) {
      console.error('Get payrolls error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/payroll/my', authenticateToken, tenantIsolation, requireRole(['faculty']), async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      const payrolls = await storage.getPayrollByUser(userId, tenantId);
      res.json({ payrolls });
    } catch (error) {
      console.error('Get my payrolls error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/payroll', authenticateToken, tenantIsolation, requireRole(['admin', 'principal']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { userId, month, year, basicSalary, allowances, deductions, netSalary, remarks } = req.body;
      
      const payroll = await storage.createPayroll({
        tenantId,
        userId,
        month,
        year,
        basicSalary,
        allowances: allowances || 0,
        deductions: deductions || 0,
        netSalary,
        status: 'draft',
        remarks,
        createdAt: new Date(),
      });
      
      res.status(201).json(payroll);
    } catch (error) {
      console.error('Create payroll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/payroll/:id', authenticateToken, tenantIsolation, requireRole(['admin', 'principal']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const updateData = req.body;
      
      const payroll = await storage.updatePayroll(id, tenantId, updateData);
      res.json(payroll);
    } catch (error) {
      console.error('Update payroll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/payroll/:id', authenticateToken, tenantIsolation, requireRole(['admin', 'principal']), async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      
      await storage.deletePayroll(id, tenantId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete payroll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============ Leave Management Routes ============
  app.get('/api/leave-requests', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      const userRole = req.user!.role;
      
      // Faculty sees only their own leave requests
      if (userRole === 'faculty') {
        const leaveRequests = await storage.getLeaveRequestsByUser(userId, tenantId);
        return res.json({ leaveRequests });
      }
      
      // Admin/Principal see all leave requests in their tenant
      const { status } = req.query;
      const leaveRequests = await storage.getLeaveRequestsByTenant(tenantId, status as string);
      res.json({ leaveRequests });
    } catch (error) {
      console.error('Get leave requests error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/leave-requests', authenticateToken, tenantIsolation, requireRole(['faculty']), async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId!;
      const { leaveType, startDate, endDate, reason } = req.body;
      
      const leaveRequest = await storage.createLeaveRequest({
        tenantId,
        userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'pending',
        createdAt: new Date(),
      });
      
      res.status(201).json(leaveRequest);
    } catch (error) {
      console.error('Create leave request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/leave-requests/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const updateData = req.body;
      
      // If approving/rejecting, add reviewer info
      if (updateData.status && updateData.status !== 'pending') {
        updateData.reviewedBy = req.user!.id;
        updateData.reviewedAt = new Date();
      }
      
      const leaveRequest = await storage.updateLeaveRequest(id, tenantId, updateData);
      res.json(leaveRequest);
    } catch (error) {
      console.error('Update leave request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/leave-requests/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.tenantId!;
      const userId = req.user!.id;
      const { id } = req.params;
      
      // Only allow deleting own pending leave requests
      await storage.deleteLeaveRequest(id, tenantId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete leave request error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to withdraw leave request' });
    }
  });

  // ============ Support Tickets Routes ============
  app.get('/api/support-tickets', authenticateToken, requireRole(['super_admin', 'admin']), async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;
      const userId = req.user!.id;
      
      // Super admin sees all tickets, admin sees only their own tickets
      const tickets = userRole === 'super_admin' 
        ? await storage.getSupportTickets() 
        : await storage.getSupportTickets(userId);
      
      const formattedTickets = tickets.map((ticket: any) => ({
        id: ticket._id,
        ticketId: `TKT-${ticket._id.substring(0, 6).toUpperCase()}`,
        school: ticket.tenantId?.name || 'Unknown',
        tenantId: ticket.tenantId?._id || null,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdBy: ticket.createdBy ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}` : 'Unknown',
        createdByEmail: ticket.createdBy?.email || '',
        createdAt: ticket.createdAt,
        assignedTo: ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : null,
        resolvedAt: ticket.resolvedAt,
      }));
      
      res.json({ tickets: formattedTickets });
    } catch (error) {
      console.error('Get support tickets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/support-tickets', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const tenantId = req.tenantId || undefined;
      const { title, description, category, priority } = req.body;
      
      if (!title || !description || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const ticket = await storage.createSupportTicket({
        tenantId,
        createdBy: userId,
        title,
        description,
        category,
        priority: priority || 'medium',
      });
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error('Create support ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/support-tickets/:id', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const ticket = await storage.updateSupportTicket(id, updateData);
      res.json(ticket);
    } catch (error) {
      console.error('Update support ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/support-tickets/:id/approve', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const ticket = await storage.updateSupportTicket(id, {
        status: 'in_progress',
        assignedTo: req.user!.id,
      });
      
      res.json(ticket);
    } catch (error) {
      console.error('Approve support ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/support-tickets/:id/reject', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const ticket = await storage.updateSupportTicket(id, {
        status: 'closed',
      });
      
      res.json(ticket);
    } catch (error) {
      console.error('Reject support ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/support-tickets/:id/resolve', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const ticket = await storage.updateSupportTicket(id, {
        status: 'resolved',
        resolvedAt: new Date(),
      });
      
      res.json(ticket);
    } catch (error) {
      console.error('Resolve support ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
