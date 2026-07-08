import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with expanded enterprise details...');
  // Clean tables in correct order
  await prisma.appInstance.deleteMany({});
  await prisma.appPackage.deleteMany({});
  await prisma.parentTeacherMeeting.deleteMany({});
  await prisma.disciplinaryIncident.deleteMany({});
  await prisma.biometricLog.deleteMany({});
  await prisma.procurementQuote.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.bookCheckout.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.assignmentSubmission.deleteMany({});
  await prisma.syllabus.deleteMany({});
  await prisma.event.deleteMany({});

  await prisma.cafeteriaOrder.deleteMany({});
  await prisma.maintenanceTicket.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.lessonPlan.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.disciplinaryRecord.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.feeInvoice.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.parentProfile.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.teacherProfile.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      passwordHash: await bcrypt.hash('admin123', salt),
      name: 'Principal Sarah Jenkins',
      role: 'ADMIN',
    },
  });

  // 2. Create Teachers
  const teacher1User = await prisma.user.create({
    data: {
      email: 'teacher.john@school.com',
      passwordHash: await bcrypt.hash('teacher123', salt),
      name: 'John Doe',
      role: 'TEACHER',
    },
  });

  const teacher1 = await prisma.teacherProfile.create({
    data: {
      userId: teacher1User.id,
      employeeId: 'EMP-101',
      department: 'Mathematics',
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'teacher.jane@school.com',
      passwordHash: await bcrypt.hash('teacher123', salt),
      name: 'Jane Smith',
      role: 'TEACHER',
    },
  });

  const teacher2 = await prisma.teacherProfile.create({
    data: {
      userId: teacher2User.id,
      employeeId: 'EMP-102',
      department: 'Science',
    },
  });

  // 3. Create Classes
  const classA = await prisma.class.create({
    data: {
      name: 'Grade 10',
      section: 'A',
      teacherId: teacher1.id,
    },
  });

  const classB = await prisma.class.create({
    data: {
      name: 'Grade 8',
      section: 'B',
      teacherId: teacher2.id,
    },
  });

  // 4. Create Parent
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@school.com',
      passwordHash: await bcrypt.hash('parent123', salt),
      name: 'Robert Johnson',
      role: 'PARENT',
    },
  });

  const parent = await prisma.parentProfile.create({
    data: {
      userId: parentUser.id,
      phone: '+1 (555) 019-2834',
    },
  });

  // 5. Create Students
  const student1User = await prisma.user.create({
    data: {
      email: 'student.alice@school.com',
      passwordHash: await bcrypt.hash('student123', salt),
      name: 'Alice Johnson',
      role: 'STUDENT',
    },
  });

  const student1 = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      admissionNo: 'ADM-2026-001',
      classId: classA.id,
      parentId: parent.id,
    },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'student.charlie@school.com',
      passwordHash: await bcrypt.hash('student123', salt),
      name: 'Charlie Johnson',
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      admissionNo: 'ADM-2026-002',
      classId: classB.id,
      parentId: parent.id,
    },
  });

  // 6. Create Subjects
  const math = await prisma.subject.create({
    data: { name: 'Mathematics', code: 'MATH-101' },
  });
  const science = await prisma.subject.create({
    data: { name: 'General Science', code: 'SCI-202' },
  });
  const history = await prisma.subject.create({
    data: { name: 'World History', code: 'HIST-303' },
  });

  // 7. Create Marks
  await prisma.mark.createMany({
    data: [
      { studentId: student1.id, subjectId: math.id, examType: 'MIDTERM', score: 88.5, maxScore: 100, date: new Date('2026-05-15') },
      { studentId: student1.id, subjectId: math.id, examType: 'QUIZ', score: 18, maxScore: 20, date: new Date('2026-06-01') },
      { studentId: student1.id, subjectId: science.id, examType: 'MIDTERM', score: 92, maxScore: 100, date: new Date('2026-05-18') },
      { studentId: student1.id, subjectId: history.id, examType: 'MIDTERM', score: 75, maxScore: 100, date: new Date('2026-05-20') },
      { studentId: student2.id, subjectId: math.id, examType: 'MIDTERM', score: 72, maxScore: 100, date: new Date('2026-05-15') },
      { studentId: student2.id, subjectId: science.id, examType: 'MIDTERM', score: 85, maxScore: 100, date: new Date('2026-05-18') },
      { studentId: student2.id, subjectId: history.id, examType: 'MIDTERM', score: 81.5, maxScore: 100, date: new Date('2026-05-20') },
    ],
  });

  // 8. Create Attendance
  const days = [
    new Date('2026-06-23T08:00:00Z'),
    new Date('2026-06-24T08:00:00Z'),
    new Date('2026-06-25T08:00:00Z'),
    new Date('2026-06-26T08:00:00Z'),
    new Date('2026-06-29T08:00:00Z'),
  ];

  for (const day of days) {
    await prisma.attendance.create({
      data: {
        studentId: student1.id,
        classId: classA.id,
        date: day,
        status: 'PRESENT',
      },
    });
    const isAbsent = day.getTime() === new Date('2026-06-25T08:00:00Z').getTime();
    await prisma.attendance.create({
      data: {
        studentId: student2.id,
        classId: classB.id,
        date: day,
        status: isAbsent ? 'ABSENT' : 'PRESENT',
        remarks: isAbsent ? 'Medical leave requested' : undefined,
      },
    });
  }

  // 9. Create Fee Invoices
  await prisma.feeInvoice.createMany({
    data: [
      {
        studentId: student1.id,
        amount: 1500.0,
        dueDate: new Date('2026-05-01T23:59:59Z'),
        status: 'PAID',
        paidAt: new Date('2026-04-28T10:30:00Z'),
        transactionId: 'TXN-90284021',
        description: 'Term 1 Tuition Fees',
      },
      {
        studentId: student1.id,
        amount: 1500.0,
        dueDate: new Date('2026-09-01T23:59:59Z'),
        status: 'UNPAID',
        description: 'Term 2 Tuition Fees',
      },
      {
        studentId: student2.id,
        amount: 1200.0,
        dueDate: new Date('2026-05-01T23:59:59Z'),
        status: 'PAID',
        paidAt: new Date('2026-04-29T14:15:00Z'),
        transactionId: 'TXN-90284034',
        description: 'Term 1 Tuition Fees',
      },
      {
        studentId: student2.id,
        amount: 1200.0,
        dueDate: new Date('2026-09-01T23:59:59Z'),
        status: 'UNPAID',
        description: 'Term 2 Tuition Fees',
      },
      {
        studentId: student1.id,
        amount: 250.0,
        dueDate: new Date('2026-06-15T23:59:59Z'),
        status: 'OVERDUE',
        description: 'Annual Library & Lab Fees',
      },
    ],
  });

  // 10. Seed New Enterprise Modules
  await prisma.badge.createMany({
    data: [
      { studentId: student1.id, title: 'Perfect Attendance', description: 'Maintained 100% presence during this term.', icon: '⭐' },
      { studentId: student1.id, title: 'Math Olympiad Gold', description: 'Secured first place in the regional tournament.', icon: '🏆' },
      { studentId: student1.id, title: 'Lab Master', description: 'Demonstrated outstanding chemistry lab protocols.', icon: '🧪' },
    ],
  });

  await prisma.disciplinaryRecord.create({
    data: {
      studentId: student2.id,
      title: 'Class Distraction',
      description: 'Repeatedly speaking during history seminar. Resolved after verbal advisory.',
      status: 'RESOLVED',
      date: new Date('2026-06-24'),
    },
  });

  await prisma.leaveRequest.createMany({
    data: [
      { teacherId: teacher1.id, startDate: new Date('2026-05-10'), endDate: new Date('2026-05-12'), reason: 'Family engagement leave', status: 'APPROVED' },
      { teacherId: teacher1.id, startDate: new Date('2026-07-15'), endDate: new Date('2026-07-18'), reason: 'Routine medical assessment', status: 'PENDING' },
    ],
  });

  await prisma.lessonPlan.create({
    data: {
      teacherId: teacher2.id,
      title: 'Introduction to Cellular Division & Mitosis',
      className: 'Grade 8',
      subjectName: 'General Science',
      content: 'Learning objectives:\n1. Describe the key differences between mitosis and meiosis.\n2. Sketch the stages: Prophase, Metaphase, Anaphase, Telophase.\n3. Discuss cell cycle regulation checkpoints.',
    },
  });

  await prisma.expense.createMany({
    data: [
      { amount: 18500.0, category: 'SALARY', description: 'Monthly payroll processing for all academic staff' },
      { amount: 1250.0, category: 'UTILITIES', description: 'Central campus electricity and water utility bills' },
      { amount: 850.0, category: 'MAINTENANCE', description: 'Air conditioner system maintenance in block C' },
      { amount: 430.0, category: 'SUPPLIES', description: 'Office supplies, printing papers, markers, chalks' },
      { amount: 350.0, category: 'OTHER', description: 'Fuel and routine checkup for school transit bus fleet' },
    ],
  });

  await prisma.maintenanceTicket.createMany({
    data: [
      { title: 'Broken ceiling fan in Room 3B', description: 'Regulator speed regulator is unresponsive and fan emits humming sounds.', location: 'Room 3B, Block A', status: 'IN_PROGRESS' },
      { title: 'Science Lab water faucet leakage', description: 'Drainage pipe under tap 4 is dripping continuously.', location: 'Chemistry Lab, Block C', status: 'PENDING' },
    ],
  });

  await prisma.cafeteriaOrder.create({
    data: {
      studentId: student1.id,
      itemNames: 'Chicken Burger, Fruit Salad, Apple Juice',
      totalPrice: 8.50,
      status: 'DELIVERED',
      orderDate: new Date('2026-06-29'),
    },
  });

  await prisma.event.createMany({
    data: [
      { title: 'Annual Athletics Meet', description: 'Inter-house field events and track sprints.', location: 'Main School Stadium', startDate: new Date('2026-07-04T09:00:00Z'), endDate: new Date('2026-07-04T17:00:00Z') },
      { title: 'Parent-Teacher Consultations', description: 'Discuss Term 1 marksheet reports and growth areas.', location: 'Auditorium Hall', startDate: new Date('2026-07-01T14:00:00Z'), endDate: new Date('2026-07-01T18:00:00Z') },
      { title: 'Science Fair Exhibition', description: 'Students present robotics and solar system projects.', location: 'Exhibition Hall B', startDate: new Date('2026-07-20T10:00:00Z'), endDate: new Date('2026-07-20T16:00:00Z') },
    ],
  });

  // 11. Seed Library Books Catalog
  await prisma.book.createMany({
    data: [
      { title: 'Introduction to Calculus & Analysis', author: 'Richard Courant', barcode: 'BK-CALC-101', quantity: 5, pdfUrl: '/library/courant_calculus.pdf' },
      { title: 'Fundamentals of General Physics', author: 'David Halliday', barcode: 'BK-PHYS-202', quantity: 3, pdfUrl: '/library/halliday_physics.pdf' },
      { title: 'Biology: The Unity and Diversity of Life', author: 'Cecie Starr', barcode: 'BK-BIO-303', quantity: 4, pdfUrl: '/library/starr_biology.pdf' },
    ]
  });

  // 12. Seed Institutional Assets Registry
  await prisma.asset.createMany({
    data: [
      { name: 'Dell Latitude 3440 Admin Laptops', barcode: 'AST-LAP-901', category: 'IT', purchaseDate: new Date('2024-01-15'), cost: 850.0, depreciationRate: 0.20, maintenanceSchedule: 'Bi-annual hardware checks' },
      { name: 'BlueBird Transit Campus Bus Fleet', barcode: 'AST-BUS-402', category: 'FLEET', purchaseDate: new Date('2022-06-20'), cost: 42000.0, depreciationRate: 0.12, maintenanceSchedule: 'Monthly mechanical tuning' },
      { name: 'Polymerase Chain Reaction Lab Machine', barcode: 'AST-LAB-303', category: 'FACILITY', purchaseDate: new Date('2025-02-10'), cost: 3500.0, depreciationRate: 0.15, maintenanceSchedule: 'Annual validation check' },
    ]
  });

  // 13. Seed initial procurement quotes
  await prisma.procurementQuote.createMany({
    data: [
      { vendorName: 'Apex Food Services Ltd', particulars: 'Daily organic cafeteria lunches supply contract', amount: 15400.0, status: 'PENDING' },
      { vendorName: 'Global Stationary Wholesale', particulars: 'Supply of chalks, whiteboards, paper reams', amount: 2100.0, status: 'APPROVED' },
    ]
  });

  // 14. Seed parent teacher meetings
  await prisma.parentTeacherMeeting.create({
    data: {
      parentId: parent.id,
      teacherId: teacher1.id,
      studentId: student1.id,
      date: new Date('2026-07-01'),
      timeSlot: '14:30',
      status: 'BOOKED'
    }
  });

  // 15. Seed AppStore Packages catalog
  await prisma.appPackage.createMany({
    data: [
      {
        name: 'Locker Assign Coordinator',
        category: 'LOGISTICS',
        description: 'Auto allocation algorithms mapping lockers capacity constraints.',
        icon: '🔐',
        isInstalled: false,
        configSchema: JSON.stringify([
          { label: 'Total Cabinet Lockers Available', name: 'lockersCount', type: 'number', placeholder: 'e.g. 150' },
          { label: 'Warning Capacity Alert Level (%)', name: 'threshold', type: 'number', placeholder: 'e.g. 90' }
        ])
      },
      {
        name: 'Student Bus Seat Balancer',
        category: 'LOGISTICS',
        description: 'Predictive occupancy balancing to optimize bus seating limits.',
        icon: '🚌',
        isInstalled: false,
        configSchema: JSON.stringify([
          { label: 'Bus Route Code Reference', name: 'routeCode', type: 'text', placeholder: 'e.g. ROUTE-14B' },
          { label: 'Maximum Occupancy Cap', name: 'maxOccupants', type: 'number', placeholder: 'e.g. 45' }
        ])
      },
      {
        name: 'Asset Lifecycle Auditor',
        category: 'ERP',
        description: 'Calculates asset degradation and mechanical wear-and-tear warnings.',
        icon: '📈',
        isInstalled: false,
        configSchema: JSON.stringify([
          { label: 'Expected Useful Life (Years)', name: 'usefulLife', type: 'number', placeholder: 'e.g. 5' },
          { label: 'Residual salvage value ($)', name: 'residualValue', type: 'number', placeholder: 'e.g. 1000' }
        ])
      },
      {
        name: 'Faculty Substitution Matcher',
        category: 'ACADEMIC',
        description: 'Intelligent substitution scheduler matching teacher availability constraints.',
        icon: '🧑‍🏫',
        isInstalled: false,
        configSchema: JSON.stringify([
          { label: 'Emergency Contact Phone', name: 'contactPhone', type: 'text', placeholder: '+1 (555) 019-2834' }
        ])
      }
    ]
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
