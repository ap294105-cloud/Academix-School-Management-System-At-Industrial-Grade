import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// --- AI Syllabus Generator ---
export async function createSyllabus(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can access this module' });

  const { subject, grade } = req.body;
  if (!subject || !grade) return res.status(400).json({ error: 'Subject and Grade are required' });

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    // Generate simulated 30-week syllabus outline
    const content = `30-Week Syllabus: ${subject} (${grade})\n` +
      `----------------------------------------\n` +
      `Weeks 1-5: Foundational concepts & core vocabulary check\n` +
      `Weeks 6-10: Advanced applications & practical lab workshops\n` +
      `Weeks 11-15: Midterm evaluation review & research seminar\n` +
      `Weeks 16-20: Intermediate theories & class group case study reviews\n` +
      `Weeks 21-25: Specialized subjects deep dives & essay writing\n` +
      `Weeks 26-30: Final examinations revisions & portfolio evaluations`;

    const syllabus = await prisma.syllabus.create({
      data: {
        teacherId: teacher.id,
        title: `${subject} Curriculum Plan`,
        grade,
        weeks: 30,
        content
      }
    });

    return res.json(syllabus);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getSyllabi(req: Request, res: Response) {
  try {
    const list = await prisma.syllabus.findMany({
      include: { teacher: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Plagiarism & AI-Content Scanner ---
export async function scanPlagiarism(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can submit assignments' });

  const { title, text } = req.body;
  if (!title || !text) return res.status(400).json({ error: 'Title and content text are required' });

  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Simulated scanner math
    const matchRate = parseFloat((Math.random() * 25).toFixed(1)); // 0% - 25% match
    const aiRate = parseFloat((Math.random() * 40).toFixed(1));    // 0% - 40% AI rate
    const report = `Plagiarism Check Result: ${matchRate}% match with internet assets. AI Writing Probability: ${aiRate}%. Text analyzed: ${text.slice(0, 100)}...`;

    const submission = await prisma.assignmentSubmission.create({
      data: {
        studentId: student.id,
        title,
        filePath: 'assignment_doc.pdf',
        matchRate,
        aiRate,
        report
      }
    });

    return res.json(submission);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getSubmissions(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      const list = await prisma.assignmentSubmission.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(list);
    } else {
      const list = await prisma.assignmentSubmission.findMany({
        include: { student: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(list);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Quiz Engine ---
export async function createQuiz(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can create quizzes' });

  const { title, classId, questions } = req.body; 
  // questions: Array of { question: string, options: string[], answer: string }

  if (!title || !classId || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const quiz = await prisma.quiz.create({
      data: {
        teacherId: teacher.id,
        classId,
        title,
        questions: {
          create: questions.map(q => ({
            question: q.question,
            options: JSON.stringify(q.options),
            answer: q.answer
          }))
        }
      },
      include: { questions: true }
    });

    return res.json(quiz);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getQuizzes(req: Request, res: Response) {
  const { classId } = req.query;
  try {
    const quizzes = await prisma.quiz.findMany({
      where: classId ? { classId: String(classId) } : undefined,
      include: { questions: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(quizzes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Library Checkout ---
export async function checkoutBook(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can check out books' });

  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: 'Barcode is required' });

  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const book = await prisma.book.findUnique({ where: { barcode } });
    if (!book) return res.status(404).json({ error: 'Book barcode not found in catalog' });
    if (book.quantity <= 0) return res.status(400).json({ error: 'Book currently out of stock' });

    // Decrement stock & create checkout
    await prisma.book.update({
      where: { id: book.id },
      data: { quantity: book.quantity - 1 }
    });

    const checkout = await prisma.bookCheckout.create({
      data: {
        bookId: book.id,
        studentId: student.id,
        status: 'ACTIVE'
      },
      include: { book: true }
    });

    return res.json(checkout);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// --- Adaptive Learning Recommendations ---
export async function getLearningPath(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can access study paths' });

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { marks: { include: { subject: true } } }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Check subjects where student has low score
    const marks = student.marks;
    const lowSubjects = marks.filter(m => (m.score / m.maxScore) < 0.8).map(m => m.subject.name);

    let recommendations: string[] = [];
    if (lowSubjects.length === 0) {
      recommendations = [
        "🌟 Outstanding grades detected! Keep it up. Try advanced curriculum sheets: 'MATH-102: Vector Space Calculus'",
        "💡 Review advanced syllabus reading material: 'HIST-304: Modern World Revolutions'"
      ];
    } else {
      recommendations = lowSubjects.map(sub => {
        return `⚠️ Review recommendation for ${sub}: Complete worksheet 'Remedial ${sub} foundations exercise' and view matching standard textbooks chapters.`;
      });
    }

    return res.json({ gpaScore: 3.9, recommendations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
