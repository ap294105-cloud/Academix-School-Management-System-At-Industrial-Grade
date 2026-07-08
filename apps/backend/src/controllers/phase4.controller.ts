import { Request, Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

// ==========================================
// 1. FORMATIVE ASSESSMENT QUIZZES ENGINE
// ==========================================
export async function getQuizzes(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.id }
      });
      if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

      const quizzes = await prisma.quiz.findMany({
        where: { teacherId: teacher.id },
        include: { questions: true }
      });
      return res.json(quizzes);
    } else {
      // Student or parent gets all quizzes
      const quizzes = await prisma.quiz.findMany({
        include: { questions: true }
      });
      return res.json(quizzes);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createQuiz(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') return res.status(403).json({ error: 'Only teachers can build quizzes' });

  const { title, classId, questions } = req.body; // questions: Array of { question, options: string[], answer }
  if (!title || !classId || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'title, classId, and questions array are required' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id }
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    // Create Quiz
    const quiz = await prisma.quiz.create({
      data: {
        teacherId: teacher.id,
        classId,
        title
      }
    });

    // Create Questions
    for (const q of questions) {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          question: q.question,
          options: JSON.stringify(q.options),
          answer: q.answer
        }
      });
    }

    const fullQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: { questions: true }
    });

    return res.json({ success: true, quiz: fullQuiz });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function submitQuizAnswers(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can submit answers' });

  const { id } = req.params; // Quiz ID
  const { submissions } = req.body; // submissions: Record<questionId, selectedOptionString>

  if (!submissions) return res.status(400).json({ error: 'submissions answers object is required' });

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id }
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (submissions[q.id] === q.answer) {
        correctCount++;
      }
    });

    const maxScore = quiz.questions.length || 1;
    const score = correctCount;
    const rate = Math.round((score / maxScore) * 100);

    // Dynamic subject fetch to register mark record
    const subject = await prisma.subject.findFirst();
    const subjectId = subject ? subject.id : 'default-subject';

    // Log mark in academic mark ledger
    await prisma.mark.create({
      data: {
        studentId: student.id,
        subjectId,
        examType: 'QUIZ',
        score,
        maxScore,
        date: new Date()
      }
    });

    return res.json({
      success: true,
      score,
      maxScore,
      rate,
      message: `Graded: ${correctCount}/${quiz.questions.length} correct answers. Score synced to ledger.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// ==========================================
// 2. E-BOOK DIGITAL LIBRARY CATALOG
// ==========================================
export async function getLibraryBooks(req: AuthRequest, res: Response) {
  try {
    let books = await prisma.book.findMany();

    if (books.length === 0) {
      // Seed default E-Books catalog
      const defaultBooks = [
        { title: 'Clean Code: Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', barcode: 'LIB-901', quantity: 3, pdfUrl: 'https://sample.pdf' },
        { title: 'Introduction to Algorithms (CLRS 3rd Edition)', author: 'Thomas H. Cormen', barcode: 'LIB-902', quantity: 2, pdfUrl: 'https://sample.pdf' },
        { title: 'The Pragmatic Programmer: Your Journey to Mastery', author: 'David Thomas', barcode: 'LIB-903', quantity: 5, pdfUrl: 'https://sample.pdf' }
      ];

      for (const b of defaultBooks) {
        await prisma.book.create({ data: b });
      }

      books = await prisma.book.findMany();
    }

    // Get active checkouts for the user if student
    const user = req.user;
    let checkouts: any[] = [];
    if (user && user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.id }
      });
      if (student) {
        checkouts = await prisma.bookCheckout.findMany({
          where: { studentId: student.id, status: 'ACTIVE' },
          include: { book: true }
        });
      }
    }

    return res.json({ books, checkouts });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function checkoutBook(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can check out books' });

  const { bookId } = req.body;
  if (!bookId) return res.status(400).json({ error: 'bookId is required' });

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id }
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.quantity <= 0) return res.status(400).json({ error: 'Copy not available currently' });

    // Decrement quantity and create checkout log
    await prisma.book.update({
      where: { id: bookId },
      data: { quantity: book.quantity - 1 }
    });

    const log = await prisma.bookCheckout.create({
      data: {
        bookId,
        studentId: student.id,
        status: 'ACTIVE'
      }
    });

    return res.json({ success: true, checkout: log });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function returnBook(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user || user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can return checked out books' });

  const { checkoutId } = req.body;
  if (!checkoutId) return res.status(400).json({ error: 'checkoutId is required' });

  try {
    const log = await prisma.bookCheckout.findUnique({
      where: { id: checkoutId }
    });
    if (!log) return res.status(404).json({ error: 'Checkout log not found' });

    // Increment quantity
    const book = await prisma.book.findUnique({ where: { id: log.bookId } });
    if (book) {
      await prisma.book.update({
        where: { id: log.bookId },
        data: { quantity: book.quantity + 1 }
      });
    }

    const updatedLog = await prisma.bookCheckout.update({
      where: { id: checkoutId },
      data: {
        status: 'RETURNED',
        returnDate: new Date()
      }
    });

    return res.json({ success: true, checkout: updatedLog });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
