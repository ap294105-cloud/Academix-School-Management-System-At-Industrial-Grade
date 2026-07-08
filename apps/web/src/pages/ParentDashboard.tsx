import { useState, useEffect } from 'react';
import { ConferenceSchedulerWidget } from '../components/CommsWidgets';
import { MedicalProfileWidget } from '../components/Phase2Widgets';
import { PtaAnnouncementsBoard } from '../components/Phase3Widgets';

interface ParentDashboardProps {
  token: string;
}

export function ParentDashboard({ token }: ParentDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Child selection
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);
  
  // Payment simulator
  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');

  // GPS bus tracking simulator
  const [busPosition, setBusPosition] = useState<number>(20);
  const [busDirection, setBusDirection] = useState<1 | -1>(1);

  // Parent advanced options
  const [activeTab, setActiveTab] = useState<'hub' | 'scheduler' | 'progress' | 'pta'>('hub');

  useEffect(() => {
    fetchStats();
  }, []);

  // Animate the school bus GPS tracker every second
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPosition(prev => {
        let next = prev + 5 * busDirection;
        if (next >= 80) {
          setBusDirection(-1);
          return 80;
        }
        if (next <= 20) {
          setBusDirection(1);
          return 20;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [busDirection]);
  // Coordinates helper along winding path
  const getBusCoordinates = (pct: number) => {
    const school = { x: 30, y: 70 };
    const turn1 = { x: 160, y: 40 };
    const turn2 = { x: 260, y: 90 };
    const home = { x: 370, y: 60 };

    if (pct < 33) {
      const t = pct / 33;
      return {
        x: school.x + (turn1.x - school.x) * t,
        y: school.y + (turn1.y - school.y) * t
      };
    } else if (pct < 66) {
      const t = (pct - 33) / 33;
      return {
        x: turn1.x + (turn2.x - turn1.x) * t,
        y: turn1.y + (turn2.y - turn1.y) * t
      };
    } else {
      const t = (pct - 66) / 34;
      return {
        x: turn2.x + (home.x - turn2.x) * t,
        y: turn2.y + (home.y - turn2.y) * t
      };
    }
  };

  const busCoord = getBusCoordinates(busPosition);
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const parentData = await res.json();
      setData(parentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (invoiceId: string) => {
    setProcessingPayment(true);
    setPaymentSuccessMessage('');
    try {
      const res = await fetch('/api/finance/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoiceId })
      });

      if (!res.ok) throw new Error('Payment failed');

      setPaymentSuccessMessage('🎉 Payment processed successfully! Receipt generated.');
      setPayingInvoice(null);
      fetchStats();
    } catch (err: any) {
      alert('Error processing payment: ' + err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Connecting to student safety feeds...
      </div>
    );
  }

  const children = data?.children || [];
  const currentChild = children[selectedChildIndex];

  // Progression analytics (mock values derived dynamically)
  const gpa = currentChild ? 3.9 : 0.0;
  const isScholarshipEligible = gpa >= 3.8;

  return (
    <div className="animate-fade-in">
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Parent Workspace</h1>
          <p>Real-Time Student Performance, Safety, & Fee Management</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginRight: '0.5rem' }}>Child:</span>
            {children.map((child: any, idx: number) => (
              <button
                key={child.id}
                className={`btn ${selectedChildIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', marginRight: '0.25rem' }}
                onClick={() => {
                  setSelectedChildIndex(idx);
                  setPayingInvoice(null);
                  setPaymentSuccessMessage('');
                }}
              >
                🎓 {child.name}
              </button>
            ))}
          </div>

          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem', display: 'flex', gap: '0.25rem' }}>
            <button className={`btn ${activeTab === 'hub' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('hub')}>
              📍 Safety & Fees
            </button>
            <button className={`btn ${activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('progress')}>
              📈 Progress Cards
            </button>
            <button className={`btn ${activeTab === 'scheduler' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('scheduler')}>
              📅 Consultations
            </button>
            <button className={`btn ${activeTab === 'pta' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('pta')}>
              👪 PTA Board
            </button>
          </div>
        </div>
      </header>

      {currentChild ? (
        <>
          {activeTab === 'hub' && (
            <>
              <section className="stats-grid">
                <div className="glass-card stat-card">
                  <div className="stat-header">
                    <span>Class Roster</span>
                    <span className="stat-icon">🏫</span>
                  </div>
                  <div className="stat-value" style={{ fontSize: '1.75rem' }}>{currentChild.class}</div>
                  <div className="stat-footer">
                    <span>🟢 Enrolled and Active</span>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-header">
                    <span>Attendance Rate</span>
                    <span className="stat-icon">📈</span>
                  </div>
                  <div className="stat-value">{currentChild.attendanceRate}%</div>
                  <div className="stat-footer">
                    <span>🟢 Minimum requirement: 75%</span>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-header">
                    <span>Outstanding Dues</span>
                    <span className="stat-icon">💳</span>
                  </div>
                  <div className="stat-value" style={{ color: currentChild.outstandingFees > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    ${currentChild.outstandingFees}
                  </div>
                  <div className="stat-footer">
                    <span>📄 Invoices & Levies</span>
                  </div>
                </div>
              </section>

              <div className="dashboard-grid">
                <div className="dashboard-main">
                  {/* GPS HUD */}
                  <div className="glass-card">
                    <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📍</span> Real-time School Bus GPS Tracker
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Student vehicle transponder is online. Bus route 14B home tracking.
                    </p>

                    <div className="map-placeholder" style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#020617', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <svg width="100%" height="100%" viewBox="0 0 400 150">
                        {/* Road path */}
                        <path d="M 30,70 L 160,40 L 260,90 L 370,60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M 30,70 L 160,40 L 260,90 L 370,60" fill="none" stroke="var(--warning)" strokeWidth="1" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {/* Landmarks */}
                        <text x="35" y="90" fill="var(--text-secondary)" fontSize="8" textAnchor="middle">🏫 Academix Core</text>
                        <text x="365" y="80" fill="var(--text-secondary)" fontSize="8" textAnchor="middle">🏡 Home Station</text>
                        <text x="160" y="25" fill="var(--text-muted)" fontSize="7" textAnchor="middle">Academic Pkwy</text>
                        <text x="280" y="110" fill="var(--text-muted)" fontSize="7" textAnchor="middle">EduOS Blvd</text>
                        
                        {/* Bus marker */}
                        <g transform={`translate(${busCoord.x - 10}, ${busCoord.y - 6})`}>
                          <rect width="20" height="12" rx="3" fill="#eab308" />
                          <circle cx="5" cy="12" r="2.5" fill="#000" />
                          <circle cx="15" cy="12" r="2.5" fill="#000" />
                          <rect x="14" y="2" width="4" height="4" fill="#38bdf8" />
                          <rect x="3" y="2" width="8" height="4" fill="#38bdf8" />
                        </g>
                      </svg>
                      
                      <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(2,6,23,0.85)', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
                        Status: <strong style={{ color: 'var(--success)' }}>Bus 14B ({Math.round(busPosition)}% distance)</strong>
                      </div>

                      <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'rgba(2,6,23,0.85)', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                        <span>⚡ Speed: <strong>42 km/h</strong></span>
                        <span>⛽ Fuel: <strong>78%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Grades Table */}
                  <div className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Recent Evaluation Marks</h3>
                    <div className="table-wrapper">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Exam Type</th>
                            <th>Grade / Score</th>
                            <th>Secured Rate</th>
                            <th>Date Posted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentChild.marks.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No academic records found.</td>
                            </tr>
                          ) : (
                            currentChild.marks.map((m: any) => {
                              const rate = Math.round((m.score / m.maxScore) * 100);
                              return (
                                <tr key={m.id}>
                                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{m.subject}</td>
                                  <td><span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{m.examType}</span></td>
                                  <td style={{ fontWeight: 600 }}>{m.score} / {m.maxScore}</td>
                                  <td style={{ fontWeight: 700, color: rate >= 85 ? 'var(--success)' : 'var(--text-primary)' }}>{rate}%</td>
                                  <td>{new Date(m.date).toLocaleDateString()}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="dashboard-side">
                  {/* Fee Invoices & Payment Gateway simulator */}
                  <div className="glass-card">
                    <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>Billings & Fees</h3>
                    
                    {paymentSuccessMessage && (
                      <div style={{ padding: '0.75rem', background: 'var(--success-glow)', border: '1px solid hsla(142,72%,45%,0.2)', color: 'var(--success)', fontSize: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontWeight: 500 }}>
                        {paymentSuccessMessage}
                      </div>
                    )}

                    <div className="notification-feed">
                      {currentChild.feeInvoices.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No bills generated.</p>
                      ) : (
                        currentChild.feeInvoices.map((inv: any) => (
                          <div key={inv.id} className={`notification-item ${inv.status !== 'PAID' ? 'unread' : ''}`} style={{ flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inv.description}</span>
                              <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'OVERDUE' ? 'badge-danger' : 'badge-warning'}`}>
                                {inv.status}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>${inv.amount}</strong>
                            </div>

                            {inv.status !== 'PAID' && (
                              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
                                  onClick={() => setPayingInvoice(inv)}
                                >
                                  💳 Secure Payment
                                </button>
                              </div>
                            )}
                            {inv.transactionId && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Txn Ref: <code>{inv.transactionId}</code>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Child Medical Health Card */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <MedicalProfileWidget token={token} studentId={currentChild.id} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'progress' && (
            <div className="responsive-grid-125-2">
              
              <div className="glass-card" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', alignSelf: 'flex-start' }}>GPA & Rank Indicator</h3>
                
                {/* SVG Progress Circle for GPA */}
                <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1.5rem' }}>
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle cx="75" cy="75" r="60" fill="none" stroke="var(--primary)" strokeWidth="10"
                      strokeDasharray="377" strokeDashoffset={377 - (377 * gpa) / 4.0} strokeLinecap="round" transform="rotate(-90 75 75)" />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{gpa.toFixed(2)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>GPA Scale / 4.0</span>
                  </div>
                </div>

                <div style={{ width: '100%', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CLASS PERCENTILE RANK</div>
                  <strong style={{ fontSize: '1.3rem', color: 'var(--success)' }}>Top 8% in Cohort</strong>
                </div>

                {isScholarshipEligible ? (
                  <div style={{ padding: '0.85rem', background: 'var(--success-glow)', border: '1px solid hsla(142,72%,45%,0.2)', color: 'var(--success)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                    🎓 Scholarship Status: Qualified! Grade average meets the academic waiver criteria.
                  </div>
                ) : (
                  <div style={{ padding: '0.85rem', background: 'var(--danger-glow)', border: '1px solid hsla(350,89%,60%,0.2)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                    ⚠️ Scholarship Status: Ineligible (average grade falls below the 3.8 criteria waiver limit).
                  </div>
                )}
              </div>

              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Comprehensive Academic Evaluation Progression</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Detailed scorecard showing cumulative subject weights and assessment progression.</p>
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Subject Name</th>
                        <th>Tests Cleared</th>
                        <th>Mean Securance</th>
                        <th>Status Evaluation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentChild.marks.reduce((acc: any[], m: any) => {
                        const existing = acc.find(x => x.subject === m.subject);
                        if (existing) {
                          existing.scores.push(m.score);
                          existing.maxes.push(m.maxScore);
                        } else {
                          acc.push({ subject: m.subject, scores: [m.score], maxes: [m.maxScore] });
                        }
                        return acc;
                      }, []).map((row: any, index: number) => {
                        const sumScore = row.scores.reduce((a: number, b: number) => a + b, 0);
                        const sumMax = row.maxes.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((sumScore / sumMax) * 100);

                        return (
                          <tr key={index}>
                            <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.subject}</td>
                            <td>{row.scores.length} exams</td>
                            <td style={{ fontWeight: 600 }}>{percentage}% average</td>
                            <td>
                              <span className={`badge ${percentage >= 85 ? 'badge-success' : percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                                {percentage >= 85 ? 'EXCELLENT' : percentage >= 50 ? 'ON TRACK' : 'NEEDS ACTION'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scheduler' && (
            <ConferenceSchedulerWidget token={token} />
          )}

          {activeTab === 'pta' && (
            <PtaAnnouncementsBoard token={token} role="PARENT" />
          )}

          {/* Secure Payment Simulator Modal */}
          {payingInvoice && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
              <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>💳 Gateways Payment</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Simulating Stripe/Razorpay secure transaction.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>INVOICE ITEM</div>
                  <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.5rem' }}>{payingInvoice.description}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount Due</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>${payingInvoice.amount}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setPayingInvoice(null)} disabled={processingPayment}>
                    Cancel
                  </button>
                  <button className="btn btn-success" onClick={() => handlePay(payingInvoice.id)} disabled={processingPayment}>
                    {processingPayment ? 'Authorizing...' : 'Authorize Charge'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ color: 'var(--text-secondary)' }}>No children profiles linked.</div>
      )}
    </div>
  );
}
