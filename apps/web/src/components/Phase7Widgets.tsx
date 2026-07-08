import { useState, useEffect } from 'react';

interface WidgetProps {
  token: string;
}

export function BillingInvoicingDeskWidget({ token }: WidgetProps) {
  // Common states
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoicing states
  const [targetStudentId, setTargetStudentId] = useState('');
  const [tuition, setTuition] = useState('');
  const [transport, setTransport] = useState('');
  const [cafeteria, setCafeteria] = useState('');
  const [description, setDescription] = useState('');
  const [billingMsg, setBillingMsg] = useState('');
  const [billingSubmitting, setBillingSubmitting] = useState(false);

  // Waiver states
  const [waiverStudentId, setWaiverStudentId] = useState('');
  const [waiverAmount, setWaiverAmount] = useState('');
  const [waiverReason, setWaiverReason] = useState('');
  const [waiverMsg, setWaiverMsg] = useState('');
  const [waiverSubmitting, setWaiverSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Seed default list of students to select from
      const defaultStudents = [
        { id: 'student-alice-id', name: 'Alice Smith (ADM-2026-001)' },
        { id: 'student-bob-id', name: 'Bob Jones (ADM-2026-002)' }
      ];
      setStudents(defaultStudents);
      setTargetStudentId(defaultStudents[0].id);
      setWaiverStudentId(defaultStudents[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !tuition) return;

    setBillingSubmitting(true);
    setBillingMsg('');
    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: targetStudentId,
          tuition: parseFloat(tuition),
          transport: parseFloat(transport) || 0,
          cafeteria: parseFloat(cafeteria) || 0,
          description: description || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBillingMsg('✅ Invoice successfully generated and synchronized to parent ledger!');
        setTuition('');
        setTransport('');
        setCafeteria('');
        setDescription('');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setBillingMsg('❌ Error: ' + err.message);
    } finally {
      setBillingSubmitting(false);
    }
  };

  const handleApplyWaiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverStudentId || !waiverAmount || !waiverReason) return;

    setWaiverSubmitting(true);
    setWaiverMsg('');
    try {
      const res = await fetch('/api/finance/waivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: waiverStudentId,
          amount: parseFloat(waiverAmount),
          reason: waiverReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWaiverMsg(`✅ Success: ${data.message}`);
        setWaiverAmount('');
        setWaiverReason('');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setWaiverMsg('❌ Error: ' + err.message);
    } finally {
      setWaiverSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading billing catalog registries...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="responsive-grid-1-1">
      {/* 1. Multi-Tier Invoice Generator */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🧾</span> Dispatch Student Invoice
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Generate itemized invoices comprising tuition, transportation, and cafeteria subscriptions.
        </p>

        {billingMsg && (
          <div
            style={{
              padding: '0.75rem',
              background: billingMsg.startsWith('❌') ? 'var(--danger-glow)' : 'var(--success-glow)',
              border: `1px solid ${billingMsg.startsWith('❌') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              color: billingMsg.startsWith('❌') ? 'var(--danger)' : 'var(--success)',
              fontSize: '0.8rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}
          >
            {billingMsg}
          </div>
        )}

        <form onSubmit={handleGenerateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Select Student Profile</label>
            <select className="form-control" value={targetStudentId} onChange={(e) => setTargetStudentId(e.target.value)}>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>Tuition ($)</label>
              <input type="number" className="form-control" placeholder="1000" value={tuition} onChange={(e) => setTuition(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>Transit ($)</label>
              <input type="number" className="form-control" placeholder="150" value={transport} onChange={(e) => setTransport(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem' }}>Cafeteria ($)</label>
              <input type="number" className="form-control" placeholder="80" value={cafeteria} onChange={(e) => setCafeteria(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Billing Statement Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Term 2 General Registration & Labs Fee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={billingSubmitting}>
            {billingSubmitting ? 'Creating Invoice...' : 'Generate billing invoice'}
          </button>
        </form>
      </div>

      {/* 2. Waiver Discount Desk */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>💸</span> Balance Waiver Discount Desk
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Apply scholarship balance credits or athletic fee discounts to reduce current student outstanding balances.
        </p>

        {waiverMsg && (
          <div
            style={{
              padding: '0.75rem',
              background: waiverMsg.startsWith('❌') ? 'var(--danger-glow)' : 'var(--success-glow)',
              border: `1px solid ${waiverMsg.startsWith('❌') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              color: waiverMsg.startsWith('❌') ? 'var(--danger)' : 'var(--success)',
              fontSize: '0.8rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}
          >
            {waiverMsg}
          </div>
        )}

        <form onSubmit={handleApplyWaiver} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Select Student Profile</label>
            <select className="form-control" value={waiverStudentId} onChange={(e) => setWaiverStudentId(e.target.value)}>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Waiver Discount Credit ($)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 150"
              value={waiverAmount}
              onChange={(e) => setWaiverAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Waiver Authorization Reason</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Meritorious Academic Scholarship"
              value={waiverReason}
              onChange={(e) => setWaiverReason(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '0.5rem' }} disabled={waiverSubmitting}>
            {waiverSubmitting ? 'Applying Waiver...' : 'Approve Balance waiver'}
          </button>
        </form>
      </div>
    </div>
  );
}
