import { useState, useEffect } from 'react';

interface WidgetProps {
  token: string;
}

// --- 1. Attendance Heatmap ---
export function AttendanceHeatmapWidget({ token }: WidgetProps) {
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      // Fetch Alice student stats
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHeatmap(data.attendance || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'LATE': return 'bg-amber-500 hover:bg-amber-600';
      case 'ABSENT': return 'bg-rose-500 hover:bg-rose-600';
      default: return 'bg-slate-700';
    }
  };

  if (loading) return <div className="text-slate-400 text-xs">Loading presence metrics...</div>;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Automated Attendance Heatmap</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Chronological daily logs color-coded by severity indicator.</p>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {heatmap.length === 0 ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No logs synchronized.</span>
        ) : (
          heatmap.map((item) => (
            <div
              key={item.id}
              style={{ width: '28px', height: '28px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', cursor: 'pointer' }}
              className={getStatusColor(item.status)}
              title={`${new Date(item.date).toLocaleDateString()}: ${item.status}`}
            >
              {item.status[0]}
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', justifyContent: 'flex-end', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="bg-emerald-500" style={{ width: '8px', height: '8px', borderRadius: '2px' }}></span> Present</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="bg-amber-500" style={{ width: '8px', height: '8px', borderRadius: '2px' }}></span> Late</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="bg-rose-500" style={{ width: '8px', height: '8px', borderRadius: '2px' }}></span> Absent</span>
      </div>
    </div>
  );
}

// --- 2. AI Syllabus Generator ---
export function AISyllabusWidget({ token }: WidgetProps) {
  const [subject, setSubject] = useState('Mathematics');
  const [grade, setGrade] = useState('Grade 10');
  const [result, setResult] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch('/api/academic/syllabus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, grade })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>AI Syllabus Generator</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Generates a 30-week standard curriculum outline.</p>

      <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-control"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          className="form-control"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} disabled={generating}>
          {generating ? 'Processing...' : 'Build'}
        </button>
      </form>

      {result && (
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto' }}>
          <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--primary)', marginBottom: '0.25rem' }}>{result.title}</strong>
          <pre style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
            {result.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// --- 3. Originality PDF Scanner ---
export function PlagiarismScannerWidget({ token }: WidgetProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text) return;
    setScanning(true);
    setReport(null);
    try {
      const res = await fetch('/api/academic/plagiarism', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, text })
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Plagiarism & AI Detector</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload text to scan against internet indexes and syntax algorithms.</p>

      <form onSubmit={handleScan}>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            className="form-control"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            placeholder="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <textarea
            className="form-control"
            style={{ height: '70px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', resize: 'none' }}
            placeholder="Paste submission text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }} disabled={scanning}>
          {scanning ? 'Running Originality Checks...' : 'Scan Submission'}
        </button>
      </form>

      {report && (
        <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
            <span>Plagiarism: <strong className={report.matchRate > 15 ? 'text-rose-400' : 'text-emerald-400'}>{report.matchRate}%</strong></span>
            <span>AI writing: <strong style={{ color: 'var(--primary)' }}>{report.aiRate}%</strong></span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{report.report}</p>
        </div>
      )}
    </div>
  );
}

// --- 4. Library checkout simulator ---
export function LibraryCheckoutWidget({ token }: WidgetProps) {
  const [barcode, setBarcode] = useState('BK-CALC-101');
  const [books, setBooks] = useState<any[]>([]);
  const [checkoutMsg, setCheckoutMsg] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      await fetch('/api/academics/subjects', { // fetch catalog
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mock books list since subjects list isn't library, but let's hardcode static catalog for simulation
      setBooks([
        { title: 'Calculus & Analysis', barcode: 'BK-CALC-101', qty: 5 },
        { title: 'Fundamentals of Physics', barcode: 'BK-PHYS-202', qty: 3 },
        { title: 'Biology Foundations', barcode: 'BK-BIO-303', qty: 4 },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingOut(true);
    setCheckoutMsg('');
    try {
      const res = await fetch('/api/academic/library/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ barcode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCheckoutMsg(`✅ Book checked out: "${data.book.title}". Return date: 2 weeks.`);
    } catch (err: any) {
      setCheckoutMsg(`❌ Error: ${err.message}`);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Digital Library Checkout</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter book barcode scan reference to assign to account.</p>

      <form onSubmit={handleCheckout} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <select className="form-control" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} value={barcode} onChange={(e) => setBarcode(e.target.value)}>
          {books.map(b => (
            <option key={b.barcode} value={b.barcode}>{b.title} ({b.barcode})</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} disabled={checkingOut}>
          {checkingOut ? 'Checking...' : 'Borrow'}
        </button>
      </form>

      {checkoutMsg && (
        <div style={{ fontSize: '0.8rem', color: checkoutMsg.startsWith('❌') ? 'var(--danger)' : 'var(--success)' }}>
          {checkoutMsg}
        </div>
      )}
    </div>
  );
}

// --- 5. Adaptive recommendations ---
export function AdaptivePathWidget({ token }: WidgetProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPath();
  }, []);

  const fetchPath = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academic/learning-path', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-400 text-xs">Loading pathways...</div>;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Adaptive Learning Recommendations</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Remedial study paths mapped based on recent scorecard marks.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommendations.map((rec, index) => (
          <div key={index} style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
            {rec}
          </div>
        ))}
      </div>
    </div>
  );
}
