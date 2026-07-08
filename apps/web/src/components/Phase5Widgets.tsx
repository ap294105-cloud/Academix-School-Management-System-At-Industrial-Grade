import { useState, useEffect } from 'react';

interface WidgetProps {
  token: string;
}

// ==========================================
// 1. TEACHER CONSULTATION MEETINGS WIDGET
// ==========================================
export function TeacherConsultationWidget({ token }: WidgetProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UPCOMING'>('UPCOMING');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/comms/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMeetings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading consultation schedule registry...</div>;

  const now = new Date();
  const filtered = meetings.filter(m => {
    if (filterMode === 'ALL') return true;
    const meetDate = new Date(m.date);
    return meetDate >= new Date(now.setHours(0,0,0,0));
  });

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
            <span>📅</span> Parent-Teacher Consultation Schedule
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Booked appointments scheduled by parents to sync student progress.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${filterMode === 'UPCOMING' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            onClick={() => setFilterMode('UPCOMING')}
          >
            Upcoming
          </button>
          <button
            className={`btn ${filterMode === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            onClick={() => setFilterMode('ALL')}
          >
            All Logs
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
          No consultations scheduled.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }} className="responsive-grid-1-1">
          {filtered.map(m => (
            <div
              key={m.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.25rem',
                background: 'rgba(2, 6, 23, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    🕒 Slot: {m.timeSlot}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--success)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Parent: {m.parent?.user?.name || 'Parent Member'}
                </strong>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Student: <strong>{m.student?.user?.name}</strong> (Adm: {m.student?.admissionNo})
                </span>
              </div>
              <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '0.75rem', paddingTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Date: {new Date(m.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
