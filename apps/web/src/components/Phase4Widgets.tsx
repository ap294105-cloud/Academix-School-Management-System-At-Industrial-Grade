import { useState, useEffect, useRef } from 'react';

interface WidgetProps {
  token: string;
  classes?: any[];
}

// ==========================================
// 1. QUIZ BUILDER WIDGET (TEACHER)
// ==========================================
export function QuizBuilderWidget({ token, classes }: WidgetProps) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currQ, setCurrQ] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correct, setCorrect] = useState('A');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    if (classes && classes.length > 0) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currQ || !optA || !optB || !optC || !optD) {
      alert('Please fill in the question text and all 4 options');
      return;
    }
    const qItem = {
      question: currQ,
      options: [optA, optB, optC, optD],
      answer: correct === 'A' ? optA : correct === 'B' ? optB : correct === 'C' ? optC : optD
    };
    setQuestions(prev => [...prev, qItem]);
    setCurrQ('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrect('A');
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || questions.length === 0 || !selectedClass) {
      alert('Please specify a quiz title, select a cohort class, and add at least 1 question.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          classId: selectedClass,
          questions
        })
      });
      if (res.ok) {
        setTitle('');
        setQuestions([]);
        fetchQuizzes();
      }
    } catch (err) {
      alert('Error creating quiz: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 2fr', gap: '2rem' }} className="responsive-grid-1-2">
      {/* Build quiz card */}
      <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>📝</span> Create Formative Quiz
        </h3>
        <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Quiz Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Biology Cell Mitosis Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Class Cohort</label>
            <select className="form-control" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes?.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Add Question ({questions.length} added)</strong>
            <input
              type="text"
              className="form-control"
              placeholder="Enter question text..."
              value={currQ}
              onChange={(e) => setCurrQ(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" className="form-control" placeholder="Option A" value={optA} onChange={(e) => setOptA(e.target.value)} />
              <input type="text" className="form-control" placeholder="Option B" value={optB} onChange={(e) => setOptB(e.target.value)} />
              <input type="text" className="form-control" placeholder="Option C" value={optC} onChange={(e) => setOptC(e.target.value)} />
              <input type="text" className="form-control" placeholder="Option D" value={optD} onChange={(e) => setOptD(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Correct Option:</span>
              <select className="form-control" style={{ width: '80px', padding: '0.25rem' }} value={correct} onChange={(e) => setCorrect(e.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={handleAddQuestion}>
                + Add Q
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Publishing...' : 'Broadcast Quiz Assessment'}
          </button>
        </form>
      </div>

      {/* Quizzes list ledger */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>Published Assessment Quizzes</h3>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No quizzes published.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {quizzes.map(q => (
              <div key={q.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{q.title}</strong>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Questions: {q.questions?.length} MCQs</span>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#020617', padding: '0.5rem', borderRadius: '4px' }}>
                  {q.questions?.map((item: any, i: number) => (
                    <div key={item.id} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Q{i+1}: {item.question} <span style={{ color: 'var(--success)' }}>[Ans: {item.answer}]</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. QUIZ TAKER WIDGET WITH COUNTDOWN TIMER
// ==========================================
export function QuizTakerWidget({ token }: { token: string }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(90);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchQuizzes();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer tick down effect
  useEffect(() => {
    if (activeQuiz && !result) {
      setTimeLeft(90);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            autoSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuiz, result]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    setResult(null);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/academics/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ submissions: answers })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error submitting answers: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  const autoSubmitQuiz = () => {
    handleSubmit();
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading active quizzes...</div>;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      {!activeQuiz ? (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>✍️ Assigned Assessments</h3>
          {quizzes.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No active quizzes currently assigned.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="responsive-grid-1-1">
              {quizzes.map(q => (
                <div key={q.id} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{q.title}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2' }}>MCQs Count: {q.questions?.length}</span>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginTop: '1rem', width: 'fit-content' }} onClick={() => { setActiveQuiz(q); setAnswers({}); setResult(null); }}>
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>📝 Quiz: {activeQuiz.title}</h3>
              {!result && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: timeLeft <= 15 ? '#ef4444' : 'var(--text-secondary)' }}>
                    ⏱️ Time Remaining: <strong>{timeLeft}s</strong>
                  </span>
                  <div style={{ width: '80px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(timeLeft / 90) * 100}%`, height: '100%', background: timeLeft <= 15 ? '#ef4444' : 'var(--primary)' }}></div>
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setActiveQuiz(null)}>
              ✕ Exit Quiz
            </button>
          </div>

          {result ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{result.rate >= 50 ? '🎉' : '⚠️'}</div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{result.message}</h2>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: result.rate >= 80 ? 'var(--success)' : 'var(--text-primary)' }}>
                Result: {result.rate}% Correct
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '1.5rem', padding: '0.5rem 1rem' }} onClick={() => { setActiveQuiz(null); setResult(null); }}>
                Back to List
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeQuiz.questions?.map((q: any, idx: number) => {
                let options: string[] = [];
                try {
                  options = JSON.parse(q.options);
                } catch {
                  options = [];
                }
                return (
                  <div key={q.id} style={{ background: 'rgba(2, 6, 23, 0.2)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.75rem' }}>Q{idx + 1}: {q.question}</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {options.map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px', background: answers[q.id] === opt ? 'rgba(59,130,246,0.1)' : 'transparent', border: answers[q.id] === opt ? '1px solid var(--primary)' : '1px solid transparent' }}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[q.id] === opt}
                            onChange={() => handleSelectOption(q.id, opt)}
                            style={{ cursor: 'pointer' }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <button className="btn btn-success" style={{ width: '100%', padding: '0.6rem', fontWeight: 600 }} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Grading Answers...' : 'Submit Assessment Answers'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. E-BOOK DIGITAL LIBRARY SHELF WIDGET
// ==========================================
export function LibraryCatalogWidget({ token }: { token: string }) {
  const [books, setBooks] = useState<any[]>([]);
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState('');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/library/books', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBooks(data.books || []);
      setCheckouts(data.checkouts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (bookId: string) => {
    if (checkouts.length >= 3) {
      alert('⚠️ Borrow Limit Exceeded: You cannot check out more than 3 active books simultaneously.');
      return;
    }

    setActioningId(bookId);
    try {
      const res = await fetch('/api/library/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });
      if (res.ok) {
        fetchBooks();
      } else {
        const d = await res.json();
        alert(d.error);
      }
    } catch (err) {
      alert('Error during checkout: ' + err);
    } finally {
      setActioningId('');
    }
  };

  const handleReturn = async (checkoutId: string) => {
    setActioningId(checkoutId);
    try {
      const res = await fetch('/api/library/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ checkoutId })
      });
      if (res.ok) {
        fetchBooks();
      }
    } catch (err) {
      alert('Error during return: ' + err);
    } finally {
      setActioningId('');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading Library E-Books Catalog...</div>;

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }} className="responsive-grid-2-1">
      {/* Books catalog shelf */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📚</span> Digital E-Book Library Shelf
          </h3>
          <input
            type="text"
            className="form-control"
            placeholder="Search title/author..."
            style={{ width: '180px', padding: '0.35rem', fontSize: '0.75rem', background: '#020617', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBooks.map(b => {
            const hasCheckedOut = checkouts.some(c => c.bookId === b.id);
            const reachCap = checkouts.length >= 3;
            return (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem' }}>{b.title}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Author: {b.author} | Code: {b.barcode}</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: b.quantity > 0 ? 'var(--success)' : '#ef4444', marginTop: '0.15rem' }}>
                    {b.quantity > 0 ? `🟢 Available: ${b.quantity} copies` : '🔴 All checked out'}
                  </span>
                </div>
                <button
                  className={`btn ${hasCheckedOut ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => !hasCheckedOut && handleCheckout(b.id)}
                  disabled={hasCheckedOut || b.quantity <= 0 || actioningId === b.id || (reachCap && !hasCheckedOut)}
                  title={reachCap && !hasCheckedOut ? 'Borrow limit reached' : ''}
                >
                  {hasCheckedOut ? 'Checked Out' : actioningId === b.id ? 'Loading...' : 'Checkout'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Checkouts shelf */}
      <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>🔖 Active Checkout Shelf</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Borrowing count: <strong style={{ color: checkouts.length >= 3 ? '#ef4444' : 'var(--success)' }}>{checkouts.length} / 3 books</strong>
        </p>

        {checkouts.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No digital checkouts currently active.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {checkouts.map(c => (
              <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem', background: 'rgba(2, 6, 23, 0.25)' }}>
                <strong style={{ fontSize: '0.8rem', display: 'block' }}>{c.book?.title}</strong>
                <a href={c.book?.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', marginTop: '0.25rem' }}>
                  📖 Read Digital PDF
                </a>
                <button
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', marginTop: '0.75rem' }}
                  onClick={() => {
                    try {
                      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain); gain.connect(ctx.destination);
                      osc.frequency.setValueAtTime(800, ctx.currentTime);
                      gain.gain.setValueAtTime(0.05, ctx.currentTime);
                      osc.start(); osc.stop(ctx.currentTime + 0.08);
                    } catch (e) {}
                    handleReturn(c.id);
                  }}
                  disabled={actioningId === c.id}
                >
                  Return Book
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Returned Books history logs archive */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>📚 Return Logs Archive</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { title: 'Introduction to Calculus', returnedAt: '2026-06-12', status: 'RETURNED' },
              { title: 'Organic Chemistry Volume II', returnedAt: '2026-05-30', status: 'RETURNED' }
            ].map((p, idx) => (
              <div key={idx} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem' }}>
                  <strong style={{ display: 'block' }}>{p.title}</strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Returned on: {p.returnedAt}</span>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem' }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. QUIZ PERFORMANCE SVG GRAPH CHART
// ==========================================
export function QuizPerformanceChart({ token }: { token: string }) {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizMarks();
  }, []);

  const fetchQuizMarks = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = data.marks || [];
      // Filter only QUIZ scores
      const quizMarks = list.filter((m: any) => m.examType === 'QUIZ');
      setMarks(quizMarks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Drawing grading trends...</div>;
  if (marks.length === 0) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No graded quiz submissions recorded to plot trends.</div>;

  // Render SVG points line graph
  const width = 360;
  const height = 120;
  const padding = 20;

  // Plot coordinates: map points to SVG viewport
  const points = marks.map((m, i) => {
    const rate = (m.score / m.maxScore) * 100;
    const x = padding + (i / Math.max(1, marks.length - 1)) * (width - padding * 2);
    const y = height - padding - (rate / 100) * (height - padding * 2);
    return { x, y, score: rate, date: new Date(m.date).toLocaleDateString() };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
  }, '');

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>📈</span> Quiz Performance Grading Curve
      </h3>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="0.5" />

          {/* Plotted Line */}
          {points.length > 1 && (
            <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Plotted Node Dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="var(--primary)" stroke="#020617" strokeWidth="2" />
              <text x={p.x} y={p.y - 8} fill="var(--text-primary)" fontSize="7" fontFamily="monospace" textAnchor="middle">
                {Math.round(p.score)}%
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>First Assessment</span>
        <span>Latest Activity</span>
      </div>
    </div>
  );
}
