import { useState, useEffect } from 'react';

interface WidgetProps {
  token: string;
  role?: string;
}

// ==========================================
// 1. DYNAMIC RBAC MATRIX CONSOLE
// ==========================================
export function RbacMatrixConsole({ token }: WidgetProps) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/security/rbac', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string, field: 'canRead' | 'canWrite') => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: !p[field] } : p))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/security/rbac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ policies })
      });
      if (res.ok) {
        setMsg('✅ RBAC Security Policy Matrix successfully updated and committed to ledger!');
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMsg('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const resources = ['ACADEMICS', 'FINANCE', 'OPERATIONS', 'HEALTH'];
  const roles = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading Security Access Control Matrices...</div>;

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
          <span>🛡️</span> Security Access Control (RBAC Matrix)
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Define granular read/write authorization credentials for core subsystems. Custom policies are evaluated dynamically.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '0.75rem', background: 'var(--success-glow)', border: '1px solid hsla(142,72%,45%,0.2)', color: 'var(--success)', fontSize: '0.8rem', borderRadius: '6px', marginBottom: '1.25rem', fontWeight: 500 }}>
          {msg}
        </div>
      )}

      <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.75rem' }}>System Module</th>
              <th style={{ padding: '0.75rem' }}>Role Context</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Read Privilege</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Write Privilege</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resName =>
              roles.map(roleName => {
                const policy = policies.find(p => p.resource === resName && p.role === roleName);
                if (!policy) return null;
                return (
                  <tr key={policy.id} style={{ borderBottom: '1px solid var(--border-color)', height: '40px' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{resName}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${roleName === 'ADMIN' ? 'badge-primary' : roleName === 'TEACHER' ? 'badge-warning' : 'badge-secondary'}`}>
                        {roleName}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={policy.canRead}
                        onChange={() => handleToggle(policy.id, 'canRead')}
                        style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={policy.canWrite}
                        onChange={() => handleToggle(policy.id, 'canWrite')}
                        style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem' }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', padding: '0.6rem' }} onClick={handleSave} disabled={saving}>
        {saving ? 'Committing Security Matrix...' : '💾 Save Access Policies'}
      </button>
    </div>
  );
}

// ==========================================
// 2. PTA BOARD & ANNOUNCEMENTS HUB
// ==========================================
export function PtaAnnouncementsBoard({ token, role }: WidgetProps) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New announcement form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('NEWS');
  const [submitting, setSubmitting] = useState(false);

  // Comments map state
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/comms/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comms/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category })
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Error creating announcement: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostComment = async (announcementId: string) => {
    const comment = comments[announcementId];
    if (!comment || !comment.trim()) return;

    try {
      const res = await fetch(`/api/comms/announcements/${announcementId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment })
      });
      if (res.ok) {
        setComments(prev => ({ ...prev, [announcementId]: '' }));
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Error posting feedback comment: ' + err);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading PTA portal feeds...</div>;

  const canPost = role === 'ADMIN' || role === 'TEACHER';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: canPost ? '1.25fr 2fr' : '1fr', gap: '2rem' }} className="responsive-grid-1-2">
      
      {/* Creation form for Admin / Teachers */}
      {canPost && (
        <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📢</span> Dispatch Announcement
          </h3>
          <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Post Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. PTA Meeting: Term 2 Planning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Category Channel</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="NEWS">📰 School News</option>
                <option value="ALERT">🚨 Emergency Alert</option>
                <option value="PTA">👪 PTA Board Notice</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Announcement Message</label>
              <textarea
                className="form-control"
                placeholder="Type the message contents..."
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
              {submitting ? 'Dispatching...' : 'Broadcast Notice'}
            </button>
          </form>
        </div>
      )}

      {/* Announcements feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📰</span> Announcements & PTA Feed
          </h3>

          {announcements.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No posts registered on communication channels.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    background: 'rgba(2, 6, 23, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: ann.category === 'ALERT' ? 'rgba(239, 68, 68, 0.1)' : ann.category === 'PTA' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: ann.category === 'ALERT' ? '#ef4444' : ann.category === 'PTA' ? 'var(--primary)' : 'var(--success)',
                        border: `1px solid ${ann.category === 'ALERT' ? 'rgba(239, 68, 68, 0.2)' : ann.category === 'PTA' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                      }}
                    >
                      {ann.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '1rem' }}>{ann.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.4', marginBottom: '1.25rem' }}>
                    {ann.content}
                  </p>

                  {/* Feedbacks comments loop */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>PTA Comments & Feedback ({ann.feedback?.length || 0})</h5>
                    
                    {ann.feedback && ann.feedback.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                        {ann.feedback.map((f: any) => (
                          <div key={f.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                              <strong>{f.user?.name || 'Parent Member'} ({f.user?.role})</strong>
                              <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{f.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New comment input */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add community feedback..."
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: '#020617', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        value={comments[ann.id] || ''}
                        onChange={(e) => setComments(prev => ({ ...prev, [ann.id]: e.target.value }))}
                      />
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handlePostComment(ann.id)}>
                        Comment
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
