import { useState, useEffect, useRef } from 'react';
import { AssetDepreciationWidget, VendorProcurementWidget } from '../components/FinancialWidgets';
import { BiometricCSVParserWidget, IoTUtilityMeterWidget } from '../components/InfrastructureWidgets';
import { EmergencyBroadcastWidget } from '../components/CommsWidgets';
import { AppStoreHub } from '../components/AppStoreHub';
import { AIDirectorConsole } from '../components/AIDirectorConsole';
import { AdminRequisitionsWidget } from '../components/Phase2Widgets';
import { RbacMatrixConsole, PtaAnnouncementsBoard } from '../components/Phase3Widgets';
import { BillingInvoicingDeskWidget } from '../components/Phase7Widgets';

export function CCTVFeed({ label }: { label: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;
    
    const draw = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 2;
      const sweepY = (frame * 1.5) % canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(canvas.width, sweepY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1.5;
      const targetX = 30 + Math.sin(frame * 0.02) * 50 + (canvas.width - 100)/2;
      const targetY = 20 + Math.cos(frame * 0.03) * 20 + (canvas.height - 60)/2;
      ctx.strokeRect(targetX, targetY, 30, 30);
      
      ctx.fillStyle = '#10b981';
      ctx.font = '7px monospace';
      ctx.fillText('SCAN TRK: LOCK', targetX + 2, targetY - 4);

      if (Math.floor(frame / 30) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(canvas.width - 15, 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#10b981';
      ctx.font = '8px monospace';
      ctx.fillText(`● REC [${label}]`, 10, 18);
      ctx.fillText(`TS: ${new Date().toLocaleTimeString()}`, 10, canvas.height - 10);
      
      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [label]);

  const handleSnapshot = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
    alert(`📸 Snapshot frame from [${label}] captured and saved to disk cache!`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={240}
        height={120}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.05)',
          display: 'block'
        }}
      />
      <button
        style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', padding: '0.15rem 0.35rem', fontSize: '0.6rem', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
        onClick={handleSnapshot}
      >
        📷 SNAP
      </button>
    </div>
  );
}

interface AdminDashboardProps {
  token: string;
  defaultSubTab?: 'overview' | 'classes' | 'finance' | 'operations' | 'appstore' | 'aidirector' | 'security';
}

export function AdminDashboard({ token, defaultSubTab = 'overview' }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'classes' | 'finance' | 'operations' | 'appstore' | 'aidirector' | 'security'>(defaultSubTab as any);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);

  // CCTV & Audit search states
  const [cam1Channel, setCam1Channel] = useState('CAM-01 NORTH GATE');
  const [cam2Channel, setCam2Channel] = useState('CAM-02 LAB HALLWAY');
  const [auditQuery, setAuditQuery] = useState('');
  
  // Forms states
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('SALARY');
  const [expDesc, setExpDesc] = useState('');
  const [loggingExp, setLoggingExp] = useState(false);

  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintLocation, setMaintLocation] = useState('');
  const [loggingMaint, setLoggingMaint] = useState(false);

  // Broadcast toggle
  const [showBroadcast, setShowBroadcast] = useState(false);

  // Widget customizer & CSV exporter
  const [visibleWidgets, setVisibleWidgets] = useState({
    budget: true,
    payments: true,
    cctv: true,
    iot: true,
  });

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const val = row[header];
        const cleanVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${cleanVal.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setActiveSubTab(defaultSubTab as any);
  }, [defaultSubTab]);

  useEffect(() => {
    fetchStats();
    fetchExpenses();
    fetchMaintenance();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const resStats = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataStats = await resStats.json();
      setStats(dataStats);

      const resFinance = await fetch('/api/finance/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataFinance = await resFinance.json();
      setFinanceSummary(dataFinance);

      const resClasses = await fetch('/api/academics/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataClasses = await resClasses.json();
      setClassesList(dataClasses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/enterprise/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setExpenses(list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const res = await fetch('/api/enterprise/maintenance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setMaintenance(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingExp(true);
    try {
      const res = await fetch('/api/enterprise/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: expAmount, category: expCategory, description: expDesc }),
      });

      if (!res.ok) throw new Error('Failed to log expense');
      setExpAmount('');
      setExpDesc('');
      fetchExpenses();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingExp(false);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingMaint(true);
    try {
      const res = await fetch('/api/enterprise/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: maintTitle, description: maintDesc, location: maintLocation }),
      });

      if (!res.ok) throw new Error('Failed to log ticket');
      setMaintTitle('');
      setMaintDesc('');
      setMaintLocation('');
      fetchMaintenance();
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingMaint(false);
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      await fetch(`/api/enterprise/maintenance/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchMaintenance();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading Command Center...
      </div>
    );
  }

  const overview = stats?.stats || {};
  const recentLogs = stats?.recentLogs || [];
  const filteredLogs = recentLogs.filter((log: any) =>
    log.action?.toLowerCase().includes(auditQuery.toLowerCase()) ||
    log.details?.toLowerCase().includes(auditQuery.toLowerCase()) ||
    log.performedBy?.toLowerCase().includes(auditQuery.toLowerCase())
  );
  const recentPayments = stats?.recentPayments || [];

  return (
    <div className="animate-fade-in">
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Command Center</h1>
          <p>Institutional Oversight & Core School Registers</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-danger"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setShowBroadcast(true)}
          >
            🚨 Emergency Blast
          </button>
          <button
            className={`btn ${activeSubTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`btn ${activeSubTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('classes')}
          >
            🏫 Classes
          </button>
          <button
            className={`btn ${activeSubTab === 'finance' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('finance')}
          >
            💵 Financials
          </button>
          <button
            className={`btn ${activeSubTab === 'operations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('operations')}
          >
            ⚙️ Operations
          </button>
          <button
            className={`btn ${activeSubTab === 'appstore' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('appstore')}
          >
            🛍️ AppStore
          </button>
          <button
            className={`btn ${activeSubTab === 'aidirector' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('aidirector')}
          >
            🤖 AI Director
          </button>
          <button
            className={`btn ${activeSubTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('security')}
          >
            🛡️ Security RBAC
          </button>
        </div>
      </header>

      {activeSubTab === 'overview' && (
        <>
          {/* Custom widget layout customizer */}
          <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem 1.5rem' }}>
            <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>⚙️ Customize Overview Workspace Layout</strong>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={visibleWidgets.budget} onChange={(e) => setVisibleWidgets(prev => ({ ...prev, budget: e.target.checked }))} /> Show Performance Charts
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={visibleWidgets.payments} onChange={(e) => setVisibleWidgets(prev => ({ ...prev, payments: e.target.checked }))} /> Show Payments Table
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={visibleWidgets.cctv} onChange={(e) => setVisibleWidgets(prev => ({ ...prev, cctv: e.target.checked }))} /> Show CCTV Feeds
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={visibleWidgets.iot} onChange={(e) => setVisibleWidgets(prev => ({ ...prev, iot: e.target.checked }))} /> Show Smart Utility webhooks
              </label>
            </div>
          </div>

          <section className="stats-grid">
            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>Total Students</span>
                <span className="stat-icon">🎓</span>
              </div>
              <div className="stat-value">{overview.students}</div>
              <div className="stat-footer">
                <span>🟢 Active Enrolled</span>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>Faculty Members</span>
                <span className="stat-icon">🧑‍🏫</span>
              </div>
              <div className="stat-value">{overview.teachers}</div>
              <div className="stat-footer">
                <span>🟢 Academic Staff</span>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>Registered Classes</span>
                <span className="stat-icon">🏫</span>
              </div>
              <div className="stat-value">{overview.classes}</div>
              <div className="stat-footer">
                <span>🟢 Cohorts Scheduled</span>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>Fees Collected</span>
                <span className="stat-icon">💳</span>
              </div>
              <div className="stat-value">${overview.feesCollected}</div>
              <div className="stat-footer" style={{ color: 'var(--success)' }}>
                <span>💰 Total Revenue</span>
              </div>
            </div>
          </section>

          {visibleWidgets.budget && (
          <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>📊 School Operations & Academic Performance Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Annual Budget Projections (K USD)</h4>
                <svg width="240" height="140" viewBox="0 0 240 140">
                  <line x1="20" y1="120" x2="220" y2="120" stroke="var(--border-color)" strokeWidth="2" />
                  <rect x="50" y="30" width="30" height="90" fill="var(--primary)" rx="4" />
                  <text x="65" y="20" fill="var(--text-primary)" fontSize="10" textAnchor="middle">120K</text>
                  <text x="65" y="132" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Fees</text>
                  
                  <rect x="130" y="50" width="30" height="70" fill="var(--danger)" rx="4" />
                  <text x="145" y="40" fill="var(--text-primary)" fontSize="10" textAnchor="middle">92K</text>
                  <text x="145" y="132" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Expenses</text>
                </svg>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Grade Performance Cohort Trend</h4>
                <svg width="240" height="140" viewBox="0 0 240 140">
                  <line x1="20" y1="120" x2="220" y2="120" stroke="var(--border-color)" strokeWidth="1" />
                  <path d="M 30,100 Q 80,60 130,70 T 210,30" fill="none" stroke="var(--success)" strokeWidth="3" />
                  <circle cx="30" cy="100" r="4" fill="var(--success)" />
                  <circle cx="130" cy="70" r="4" fill="var(--success)" />
                  <circle cx="210" cy="30" r="4" fill="var(--success)" />
                  <text x="30" y="132" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Term 1</text>
                  <text x="130" y="132" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Term 2</text>
                  <text x="210" y="132" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Term 3</text>
                </svg>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Classroom Space Utilization</h4>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="70" cy="70" r="50" fill="none" stroke="var(--warning)" strokeWidth="12"
                    strokeDasharray="314" strokeDashoffset="75" strokeLinecap="round" transform="rotate(-90 70 70)" />
                  <text x="70" y="76" fill="var(--text-primary)" fontSize="18" fontWeight="800" textAnchor="middle">76%</text>
                </svg>
              </div>

            </div>
          </div>
          )}
          {visibleWidgets.payments ? (
            <div className="dashboard-grid">
              <div className="dashboard-main">
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                      <span>💸</span> Recent Fee Transactions
                    </h3>
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => exportToCSV(recentPayments.map((p: any) => ({ student: p.student.user.name, description: p.description, amount: p.amount, ref: p.transactionId, date: new Date(p.paidAt).toLocaleDateString() })), 'fee_transactions')}>
                      📥 Export CSV
                    </button>
                  </div>
                  <div className="table-wrapper">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Txn Ref</th>
                          <th>Date Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayments.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments registered.</td>
                          </tr>
                        ) : (
                          recentPayments.map((pay: any) => (
                            <tr key={pay.id}>
                              <td style={{ fontWeight: 600 }}>{pay.student.user.name}</td>
                              <td>{pay.description}</td>
                              <td style={{ color: 'var(--success)', fontWeight: 600 }}>${pay.amount}</td>
                              <td><code style={{ fontSize: '0.85rem' }}>{pay.transactionId}</code></td>
                              <td>{new Date(pay.paidAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="dashboard-side">
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                      <span>🔍</span> Security Audit Logs
                    </h3>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                      onClick={() => exportToCSV(filteredLogs.map((l: any) => ({ action: l.action, performedBy: l.performedBy, details: l.details, timestamp: new Date(l.timestamp).toLocaleString() })), 'security_audit_logs')}
                    >
                      Export
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search logs..."
                    style={{ marginBottom: '0.5rem', padding: '0.35rem', fontSize: '0.75rem', background: '#020617', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {['BIOMETRIC', 'RBAC', 'WAIVER', 'INVOICE'].map(tag => (
                      <span
                        key={tag}
                        onClick={() => setAuditQuery(tag)}
                        style={{ cursor: 'pointer', fontSize: '0.65rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.15rem 0.35rem', borderRadius: '4px', color: 'var(--text-secondary)' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="notification-feed">
                    {filteredLogs.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No audit trails matched.</p>
                    ) : (
                      filteredLogs.map((log: any) => (
                        <div key={log.id} className="notification-item" style={{ padding: '0.9rem 1.2rem', gap: '0.75rem' }}>
                          <div style={{ fontSize: '1.1rem' }}>🛡️</div>
                          <div className="notification-content">
                            <div className="notification-title" style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{log.action}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="notification-msg" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                              {log.details} - <strong style={{ color: 'var(--primary)' }}>{log.performedBy}</strong>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="dashboard-side">
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                      <span>🔍</span> Security Audit Logs
                    </h3>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                      onClick={() => exportToCSV(filteredLogs.map((l: any) => ({ action: l.action, performedBy: l.performedBy, details: l.details, timestamp: new Date(l.timestamp).toLocaleString() })), 'security_audit_logs')}
                    >
                      Export
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search logs..."
                    style={{ marginBottom: '0.5rem', padding: '0.35rem', fontSize: '0.75rem', background: '#020617', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {['BIOMETRIC', 'RBAC', 'WAIVER', 'INVOICE'].map(tag => (
                      <span
                        key={tag}
                        onClick={() => setAuditQuery(tag)}
                        style={{ cursor: 'pointer', fontSize: '0.65rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.15rem 0.35rem', borderRadius: '4px', color: 'var(--text-secondary)' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="notification-feed">
                    {filteredLogs.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No audit trails matched.</p>
                    ) : (
                      filteredLogs.map((log: any) => (
                        <div key={log.id} className="notification-item" style={{ padding: '0.9rem 1.2rem', gap: '0.75rem' }}>
                          <div style={{ fontSize: '1.1rem' }}>🛡️</div>
                          <div className="notification-content">
                            <div className="notification-title" style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{log.action}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="notification-msg" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                              {log.details} - <strong style={{ color: 'var(--primary)' }}>{log.performedBy}</strong>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'classes' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Academic Classes & Assignments</h3>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Section</th>
                  <th>Class Teacher</th>
                  <th>Department</th>
                  <th>Students Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {classesList.map((cls: any) => (
                  <tr key={cls.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{cls.name}</td>
                    <td><span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>{cls.section}</span></td>
                    <td style={{ fontWeight: 500 }}>{cls.teacher?.user?.name || 'N/A'}</td>
                    <td>{cls.teacher?.department || 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>{cls._count?.students || 0} students</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="responsive-grid-2-1">
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Campus Ledger (Billed vs Expenses)</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.7rem' }} onClick={() => exportToCSV(expenses.map(e => ({ category: e.category, description: e.description, amount: e.amount, date: new Date(e.date).toLocaleDateString() })), 'ledger_expenses')}>
                    📥 Export CSV
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--success)', fontSize: '0.75rem' }}>FEE REVENUE</div>
                    <strong style={{ color: 'var(--success)' }}>${financeSummary?.summary?.paid || 0}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>TOTAL SPENT</div>
                    <strong style={{ color: 'var(--danger)' }}>
                      ${expenses.reduce((sum, e) => sum + e.amount, 0)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Particulars / Description</th>
                      <th>Amount</th>
                      <th>Date Logged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp: any) => (
                      <tr key={exp.id}>
                        <td><span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{exp.category}</span></td>
                        <td>{exp.description}</td>
                        <td style={{ fontWeight: 600, color: 'var(--danger)' }}>-${exp.amount}</td>
                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card" style={{ height: 'fit-content' }}>
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Log New Expense</h3>
              <form onSubmit={handleLogExpense}>
                <div className="form-group">
                  <label className="form-label">Expense Amount ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Budget Category</label>
                  <select className="form-control" value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                    <option value="SALARY">Staff Salaries</option>
                    <option value="MAINTENANCE">Facilities Maintenance</option>
                    <option value="UTILITIES">Utility Bills</option>
                    <option value="SUPPLIES">Academic Supplies</option>
                    <option value="OTHER">Fleet / Other Expenses</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Science lab chemical supplies"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loggingExp}>
                  {loggingExp ? 'Logging...' : 'Authorize Transaction'}
                </button>
              </form>
            </div>
          </div>

          <div className="responsive-grid-1-125">
            <AssetDepreciationWidget token={token} />
            <VendorProcurementWidget token={token} />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <BillingInvoicingDeskWidget token={token} />
          </div>
        </div>
      )}

      {activeSubTab === 'operations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="responsive-grid-2-1">
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 0 }}>Facility & Maintenance Tickets</h3>
                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => exportToCSV(maintenance.map(t => ({ location: t.location, title: t.title, description: t.description, status: t.status, date: new Date(t.createdAt).toLocaleDateString() })), 'maintenance_tickets')}>
                  📥 Export CSV
                </button>
              </div>
              <div className="table-wrapper" style={{ marginBottom: '2rem' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Issue Description</th>
                      <th>Status</th>
                      <th>Review Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>All facilities operational.</td>
                      </tr>
                    ) : (
                      maintenance.map((ticket: any) => (
                        <tr key={ticket.id}>
                          <td style={{ fontWeight: 600 }}>{ticket.location}</td>
                          <td>
                            <strong>{ticket.title}</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{ticket.description}</p>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                ticket.status === 'RESOLVED'
                                  ? 'badge-success'
                                  : ticket.status === 'IN_PROGRESS'
                                  ? 'badge-primary'
                                  : 'badge-warning'
                              }`}
                              style={{ background: ticket.status === 'IN_PROGRESS' ? 'var(--primary-glow)' : undefined, color: ticket.status === 'IN_PROGRESS' ? 'var(--primary)' : undefined }}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td>
                            {ticket.status !== 'RESOLVED' && (
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                {ticket.status === 'PENDING' && (
                                  <button
                                    className="btn btn-primary"
                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                    onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                                  >
                                    Deploy Crew
                                  </button>
                                )}
                                <button
                                  className="btn btn-success"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                  onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED')}
                                >
                                  Resolve
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {visibleWidgets.cctv && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>📹 Security CCTV Integration feeds</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
                        <button className="btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', background: cam1Channel === 'CAM-01 NORTH GATE' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setCam1Channel('CAM-01 NORTH GATE')}>North Gate</button>
                        <button className="btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', background: cam1Channel === 'CAM-01 MAIN ENTRANCE' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setCam1Channel('CAM-01 MAIN ENTRANCE')}>Main Entrance</button>
                        <button className="btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', background: cam1Channel === 'CAM-01 AUDITORIUM' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setCam1Channel('CAM-01 AUDITORIUM')}>Auditorium</button>
                      </div>
                      <div style={{ height: '120px', position: 'relative' }}>
                        <CCTVFeed label={cam1Channel} />
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
                        <button className="btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', background: cam2Channel === 'CAM-02 LAB HALLWAY' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setCam2Channel('CAM-02 LAB HALLWAY')}>Lab Hallway</button>
                        <button className="btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', background: cam2Channel === 'CAM-02 PLAYGROUND' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setCam2Channel('CAM-02 PLAYGROUND')}>Playground</button>
                        <button className="btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', background: cam2Channel === 'CAM-02 CAFETERIA' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setCam2Channel('CAM-02 CAFETERIA')}>Cafeteria</button>
                      </div>
                      <div style={{ height: '120px', position: 'relative' }}>
                        <CCTVFeed label={cam2Channel} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ height: 'fit-content' }}>
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Log Maintenance Request</h3>
              <form onSubmit={handleCreateMaintenance}>
                <div className="form-group">
                  <label className="form-label">Location / Room</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Block C, Chemistry Lab"
                    value={maintLocation}
                    onChange={(e) => setMaintLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Issue Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Water tap dripping"
                    value={maintTitle}
                    onChange={(e) => setMaintTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Details</label>
                  <textarea
                    className="form-control"
                    style={{ height: '100px', resize: 'none' }}
                    placeholder="Describe the failure..."
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loggingMaint}>
                  {loggingMaint ? 'Logging...' : 'File Ticket'}
                </button>
              </form>
            </div>
          </div>

          <div className="responsive-grid-1-1">
            <BiometricCSVParserWidget token={token} />
            {visibleWidgets.iot && <IoTUtilityMeterWidget />}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <AdminRequisitionsWidget token={token} />
          </div>
        </div>
      )}

      {activeSubTab === 'appstore' && (
        <AppStoreHub token={token} />
      )}

      {activeSubTab === 'aidirector' && (
        <AIDirectorConsole token={token} />
      )}

      {activeSubTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <RbacMatrixConsole token={token} />
          <PtaAnnouncementsBoard token={token} role="ADMIN" />
        </div>
      )}

      {/* Emergency Blast Modal Overlay */}
      {showBroadcast && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--danger)' }}>🚨 Emergency Dispatch</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setShowBroadcast(false)}>
                ✕ Close
              </button>
            </div>
            <EmergencyBroadcastWidget token={token} />
          </div>
        </div>
      )}
    </div>
  );
}
