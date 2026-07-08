import { useState, useEffect } from 'react';
import { PlagiarismScannerWidget, LibraryCheckoutWidget, AdaptivePathWidget } from '../components/AcademicWidgets';
import { MedicalProfileWidget } from '../components/Phase2Widgets';
import { QuizTakerWidget, LibraryCatalogWidget, QuizPerformanceChart } from '../components/Phase4Widgets';
import { StudentLeaderboardWidget, SubjectAveragesBarChart } from '../components/Phase6Widgets';

interface StudentDashboardProps {
  token: string;
}

export function StudentDashboard({ token }: StudentDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 20 features states
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'EN' | 'ES' | 'FR'>('EN');
  const [avatar, setAvatar] = useState('🦊');
  const [gpaGoal, setGpaGoal] = useState(3.8);
  const [notepadContent, setNotepadContent] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(12); // default middle desk
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'campus-life' | 'library-quizzes'>('overview');

  // Cafeteria states
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  const menuItems = [
    { id: '1', name: 'Veggie Salad Bowl', price: 6.50, icon: '🥗' },
    { id: '2', name: 'Grilled Chicken Burger', price: 8.50, icon: '🍔' },
    { id: '3', name: 'Fresh Apple Juice', price: 3.00, icon: '🥤' },
    { id: '4', name: 'Chocolate Muffin', price: 2.50, icon: '🧁' },
  ];

  useEffect(() => {
    fetchStats();
    fetchCafeteriaOrders();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentData = await res.json();
      setData(studentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCafeteriaOrders = async () => {
    try {
      const res = await fetch('/api/enterprise/cafeteria', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setPastOrders(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleItem = (name: string) => {
    setSelectedItems(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    setProcessingOrder(true);
    setOrderSuccessMsg('');

    const totalPrice = selectedItems.reduce((acc, name) => {
      const item = menuItems.find(m => m.name === name);
      return acc + (item ? item.price : 0);
    }, 0);

    try {
      const res = await fetch('/api/enterprise/cafeteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemNames: selectedItems.join(', '),
          totalPrice
        })
      });

      if (!res.ok) throw new Error('Order placement failed');

      setOrderSuccessMsg('🎉 Lunch pre-ordered successfully! Scan digital token at counter.');
      setSelectedItems([]);
      fetchCafeteriaOrders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Entering digital campus workspace...
      </div>
    );
  }

  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const marks = data?.marks || [];
  const invoices = data?.invoices || [];
  const badges = data?.badges || [];

  return (
    <div className="animate-fade-in">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', cursor: 'pointer' }} onClick={() => setAvatar(prev => prev === '🦊' ? '🐼' : prev === '🐼' ? '🦁' : prev === '🦁' ? '🐻' : '🦊')}>
            {avatar}
          </div>
          <div className="dashboard-title-group">
            <h1>{lang === 'EN' ? 'My Desk' : lang === 'ES' ? 'Mi Escritorio' : 'Mon Bureau'}</h1>
            <p>Admission: {profile.admissionNo} — Class: {profile.class?.name || 'Assigned Class'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('overview')}>
            📋 Overview
          </button>
          <button className={`btn ${activeTab === 'grades' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('grades')}>
            ✍️ Scores & Scanner
          </button>
          <button className={`btn ${activeTab === 'campus-life' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('campus-life')}>
            🍔 Campus Life
          </button>
          <button className={`btn ${activeTab === 'library-quizzes' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('library-quizzes')}>
            📚 Library & Quizzes
          </button>

          {/* Theme Switcher Toggle */}
          <button
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
              document.documentElement.setAttribute('data-theme', next);
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          {/* Language Switcher Bar */}
          <div style={{ display: 'flex', gap: '0.2rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {(['EN', 'ES', 'FR'] as const).map(l => (
              <button
                key={l}
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', background: lang === l ? 'var(--primary)' : 'transparent', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === 'overview' && (
        <>
          <section className="stats-grid">
            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>My Attendance Rate</span>
                <span className="stat-icon">📈</span>
              </div>
              <div className="stat-value">{stats.attendanceRate}%</div>
              <div className="stat-footer">
                <span>🟢 Safe Standing</span>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>Outstanding Dues</span>
                <span className="stat-icon">💳</span>
              </div>
              <div className="stat-value" style={{ color: stats.outstandingFees > 0 ? 'var(--danger)' : 'var(--success)' }}>
                ${stats.outstandingFees}
              </div>
              <div className="stat-footer">
                <span>📄 Current Term Invoices</span>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>My Honors & Badges</span>
                <span className="stat-icon">🏆</span>
              </div>
              <div className="stat-value">{badges.length}</div>
              <div className="stat-footer">
                <span>🟢 Digital credentials</span>
              </div>
            </div>
          </section>

          <div className="dashboard-grid">
            <div className="dashboard-main">
              {/* Badges Cabinet */}
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>🏆 My Accomplishments Cabinet</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Digital badges earned through outstanding attendance, curricular milestones, and athletics events.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {badges.map((b: any) => (
                    <div key={b.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center', transition: 'all 0.2s hover' }} className="stat-card">
                      <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{b.icon}</div>
                      <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>{b.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{b.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <StudentLeaderboardWidget />

              {/* Invoices */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Outstanding Billings Statements</h3>
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Particulars Description</th>
                        <th>Status</th>
                        <th>Amount Due</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 600 }}>{inv.description}</td>
                          <td>
                            <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'OVERDUE' ? 'badge-danger' : 'badge-warning'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>${inv.amount}</td>
                          <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* notepad notes scratchpad & GPA target goal slider calculator */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '1.5rem', marginTop: '2rem' }} className="responsive-grid-1-1">
                {/* GPA goals slider calculator */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>🎯 GPA Target Goals Calculator</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Adjust slider to compute required scores for next exam term.</p>
                  <input
                    type="range"
                    min="3.0"
                    max="4.0"
                    step="0.05"
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                    value={gpaGoal}
                    onChange={(e) => setGpaGoal(parseFloat(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem' }}>
                    <span>Target: {gpaGoal.toFixed(2)} GPA</span>
                    <span style={{ color: 'var(--primary)' }}>
                      Requires: {Math.round((gpaGoal - 3.0) * 100) + 70}% Avg
                    </span>
                  </div>
                </div>

                {/* Notepad Scratchpad widget */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>📝 Personal Notepad scratchpad</h4>
                  <textarea
                    className="form-control"
                    style={{ height: '60px', padding: '0.35rem', fontSize: '0.75rem', resize: 'none', background: '#020617', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    placeholder="Jot down quick homework notes, goals..."
                    value={notepadContent}
                    onChange={(e) => setNotepadContent(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-side">
              <QuizPerformanceChart token={token} />

               {/* Avatar selection switcher */}
              <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>👤 Select Profile Avatar</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['🦊', '🐼', '🦁', '🐻', '🐯', '🐙'].map(a => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      style={{ fontSize: '1.5rem', background: avatar === a ? 'rgba(59,130,246,0.15)' : 'transparent', border: avatar === a ? '1px solid var(--primary)' : '1px solid transparent', borderRadius: '4px', cursor: 'pointer', padding: '0.2rem 0.4rem' }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disciplinary advisory notice */}
              <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>🛡️ Student Conduct Ledger</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  A clean conduct ledger is required for sports matches and scholarship participation eligibility.
                </p>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--success-glow)', border: '1px solid hsla(142,72%,45%,0.2)', color: 'var(--success)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 }}>
                  🟢 Standing status: Good. Zero warnings filed.
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <MedicalProfileWidget token={token} studentId={profile.id} />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="responsive-grid-2-15">
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>My Term Scorecard</h3>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Course Subject</th>
                      <th>Assessment Name</th>
                      <th>Secured Score</th>
                      <th>Percentage</th>
                      <th>Date Declared</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m: any) => {
                      const rate = Math.round((m.score / m.maxScore) * 100);
                      return (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{m.subject.name}</td>
                          <td><span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{m.examType}</span></td>
                          <td style={{ fontWeight: 600 }}>{m.score} / {m.maxScore}</td>
                          <td style={{ fontWeight: 700, color: rate >= 85 ? 'var(--success)' : 'var(--text-primary)' }}>{rate}%</td>
                          <td>{new Date(m.date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <AdaptivePathWidget token={token} />
              <SubjectAveragesBarChart marks={marks} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '2rem' }} className="responsive-grid-1-1">
            <PlagiarismScannerWidget token={token} />
            
            {/* Classroom seating grid widget */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>🗄️ Classroom Seating Chart Arrangement</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Interactive map of classmate desk seat allocations. Click to select your desk slot.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', background: '#020617', padding: '1rem', borderRadius: '8px' }}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedSeat(i)}
                    style={{
                      aspectRatio: '1',
                      background: selectedSeat === i ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedSeat === i ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: selectedSeat === i ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                    title={selectedSeat === i ? 'Your seat allocation' : `Desk seat #${i + 1}`}
                  >
                    {selectedSeat === i ? 'Me' : i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campus-life' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="responsive-grid-125-2">
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>🍔 Pre-Order Daily Lunch</h3>

              {orderSuccessMsg && (
                <div style={{ padding: '0.75rem', background: 'var(--success-glow)', border: '1px solid hsla(142,72%,45%,0.2)', color: 'var(--success)', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 500 }}>
                  {orderSuccessMsg}
                </div>
              )}

              <form onSubmit={handlePlaceOrder}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {menuItems.map(item => (
                    <div
                      key={item.id}
                      style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => handleToggleItem(item.name)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>{item.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.name)}
                        onChange={() => {}} // handled by outer div click
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cart Subtotal:</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                    ${selectedItems.reduce((acc, name) => acc + (menuItems.find(m => m.name === name)?.price || 0), 0).toFixed(2)}
                  </strong>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={processingOrder || selectedItems.length === 0}>
                  {processingOrder ? 'Submitting order request...' : 'Secure Order Token'}
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Cafeteria Pre-Orders Ledger</h3>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Items Pre-ordered</th>
                      <th>Total Charged</th>
                      <th>Order Date</th>
                      <th>Token Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent cafeteria purchases.</td>
                      </tr>
                    ) : (
                      pastOrders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 600 }}>{order.itemNames}</td>
                          <td style={{ fontWeight: 600 }}>${order.totalPrice.toFixed(2)}</td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <LibraryCheckoutWidget token={token} />
        </div>
      )}

      {activeTab === 'library-quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <QuizTakerWidget token={token} />
          <LibraryCatalogWidget token={token} />
        </div>
      )}
    </div>
  );
}
