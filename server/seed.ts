import { connectToDatabase } from './db';
import { storage } from './storage';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Starting database seed...');

  try {
    await connectToDatabase();
    // Create demo tenant
    const tenant = await storage.createTenant({
      name: 'Springfield High School',
      code: 'SHS001',
      email: 'admin@springfield.edu',
      phone: '+1-555-0100',
      address: '123 Education Lane, Springfield',
      active: true,
    });
    console.log('Created tenant:', tenant.name);

    // Create users for different roles
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const adminUser = await storage.createUser({
      tenantId: tenant._id,
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0101',
      active: true,
    });
    console.log('Created admin user');

    const principalUser = await storage.createUser({
      tenantId: tenant._id,
      email: 'principal@school.com',
      password: hashedPassword,
      role: 'principal',
      firstName: 'John',
      lastName: 'Principal',
      phone: '+1-555-0102',
      active: true,
    });
    console.log('Created principal user');

    const facultyUser = await storage.createUser({
      tenantId: tenant._id,
      email: 'teacher@school.com',
      password: hashedPassword,
      role: 'faculty',
      firstName: 'Ms.',
      lastName: 'Anderson',
      phone: '+1-555-0103',
      active: true,
    });
    console.log('Created faculty user');

    // Create classes
    const class10A = await storage.createClass({
      tenantId: tenant._id,
      name: 'Grade 10-A',
      grade: 10,
      section: 'A',
      capacity: 40,
      classTeacherId: facultyUser._id,
      academicYear: '2024-2025',
    });

    const class9B = await storage.createClass({
      tenantId: tenant._id,
      name: 'Grade 9-B',
      grade: 9,
      section: 'B',
      capacity: 45,
      classTeacherId: facultyUser._id,
      academicYear: '2024-2025',
    });
    console.log('Created classes');

    // Create subjects
    const mathSubject = await storage.createSubject({
      tenantId: tenant._id,
      name: 'Mathematics',
      code: 'MATH101',
      description: 'Core mathematics curriculum',
    });

    const physicsSubject = await storage.createSubject({
      tenantId: tenant._id,
      name: 'Physics',
      code: 'PHY101',
      description: 'Introduction to physics',
    });
    console.log('Created subjects');

    // Create parent user
    const parentUser = await storage.createUser({
      tenantId: tenant._id,
      email: 'parent@school.com',
      password: hashedPassword,
      role: 'parent',
      firstName: 'Jane',
      lastName: 'Johnson',
      phone: '+1-555-0104',
      active: true,
    });
    console.log('Created parent user');

    // Create student user
    const studentUserAccount = await storage.createUser({
      tenantId: tenant._id,
      email: 'student@school.com',
      password: hashedPassword,
      role: 'student',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0105',
      active: true,
    });

    // Create student profile
    const student = await storage.createStudent({
      tenantId: tenant._id,
      userId: studentUserAccount._id,
      classId: class10A._id,
      admissionNumber: 'STD001',
      rollNumber: '15',
      dateOfBirth: '2008-05-15',
      gender: 'female',
      bloodGroup: 'A+',
      parentId: parentUser._id,
      address: '456 Student Street, Springfield',
      emergencyContact: '+1-555-0104',
      admissionDate: '2020-04-01',
    });
    console.log('Created student');

    // Create exam
    const exam = await storage.createExam({
      tenantId: tenant._id,
      name: 'Mid-term Examination',
      type: 'mid_term',
      startDate: '2025-02-01',
      endDate: '2025-02-10',
      academicYear: '2024-2025',
      description: 'First semester mid-term exams',
      published: false,
    });
    console.log('Created exam');

    // Create fee structure
    const feeStructure = await storage.createFeeStructure({
      tenantId: tenant._id,
      classId: class10A._id,
      name: 'Annual Tuition Fee',
      amount: '5000',
      academicYear: '2024-2025',
      dueDate: '2025-04-01',
      description: 'Annual tuition fee for Grade 10',
    });
    console.log('Created fee structure');

    // Create announcement
    const announcement = await storage.createAnnouncement({
      tenantId: tenant._id,
      title: 'Welcome to Springfield High School',
      content: 'We are excited to have you here. This is a demo announcement.',
      targetRole: null,
      priority: 'high',
      publishedBy: adminUser._id,
      expiresAt: null,
    });
    console.log('Created announcement');

    // Create super admin (not tied to any tenant)
    const superAdminUser = await storage.createUser({
      tenantId: null,
      email: 'superadmin@school.com',
      password: hashedPassword,
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1-555-0100',
      active: true,
    });
    console.log('Created super admin user');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('Super Admin: superadmin@school.com / demo123');
    console.log('Admin: admin@school.com / demo123');
    console.log('Principal: principal@school.com / demo123');
    console.log('Teacher: teacher@school.com / demo123');
    console.log('Student: student@school.com / demo123');
    console.log('Parent: parent@school.com / demo123');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
