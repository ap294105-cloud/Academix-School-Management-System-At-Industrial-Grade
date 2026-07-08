import { useState, useEffect } from 'react';

interface WidgetProps {
  token: string;
  studentId?: string;
  teacherId?: string;
}

// ==========================================
// 1. MEDICAL HEALTH CARD WIDGET
// ==========================================
export function MedicalProfileWidget({ token, studentId }: WidgetProps) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [immunizations, setImmunizations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentId) fetchHealthData();
  }, [studentId]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/medical/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAllergies(data.allergies);
      setMedicalHistory(data.medicalHistory);
      try {
        setImmunizations(JSON.parse(data.immunizationChecks || '{}'));
      } catch {
        setImmunizations({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/medical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          allergies,
          medicalHistory,
          immunizationChecks: JSON.stringify(immunizations)
        })
      });
      if (res.ok) {
        setEditing(false);
        fetchHealthData();
      }
    } catch (err) {
      alert('Error updating medical status: ' + err);
    }
  };

  const toggleVaccine = (key: string) => {
    setImmunizations(prev => ({
      ...prev,
      [key]: prev[key] === 'CHECKED' ? 'PENDING' : 'CHECKED'
    }));
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading health profiles...</div>;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🏥</span> Student Medical & Health Card
        </h3>
        {!editing && (
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setEditing(true)}>
            Edit Record
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Food & Drug Allergies</label>
            <input
              type="text"
              className="form-control"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Peanut allergy, Penicillin"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Chronic Medical History</label>
            <textarea
              className="form-control"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Asthma registry (carries inhaler)"
              rows={2}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Immunization Vaccines Checklists</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {['MMR', 'DTaP', 'Polio', 'HepB', 'Varicella'].map(v => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={immunizations[v] === 'CHECKED'}
                    onChange={() => toggleVaccine(v)}
                  />
                  {v} Vaccine
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              Save Card
            </button>
            <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Allergen Alerts</span>
            <strong style={{ color: allergies.toLowerCase() !== 'none' && allergies.toLowerCase() !== 'none reported' ? '#ef4444' : 'var(--text-primary)', fontSize: '0.85rem' }}>
              {allergies}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Clinical History Log</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{medicalHistory}</p>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Immunization Ledger</span>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {Object.entries(immunizations).map(([vaccine, status]) => (
                <span
                  key={vaccine}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: status === 'CHECKED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: status === 'CHECKED' ? 'var(--success)' : '#ef4444',
                    border: `1px solid ${status === 'CHECKED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}
                >
                  {vaccine}: {status}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. RESOURCE REQUISITION WIDGET (TEACHER)
// ==========================================
export function TeacherRequisitionWidget({ token }: WidgetProps) {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const res = await fetch('/api/logistics/requisitions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setRequisitions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !quantity || !cost) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/logistics/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemName, quantity, estimatedCost: cost })
      });
      if (res.ok) {
        setItemName('');
        setQuantity('1');
        setCost('');
        fetchRequisitions();
      }
    } catch (err) {
      alert('Error creating requisition: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem' }} className="responsive-grid-1-2">
      {/* File new Requisition */}
      <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>📦</span> File Supply Requisition
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Item Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Science Lab Beakers, Math Textbooks"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Quantity</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Total Cost ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="150.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} disabled={submitting}>
            {submitting ? 'Filing Requisition...' : 'Submit Requisition'}
          </button>
        </form>
      </div>

      {/* History Ledger */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>Logistics History Ledger</h3>
        {requisitions.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No requisition requests filed yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.5rem' }}>Item</th>
                  <th style={{ padding: '0.5rem' }}>Qty</th>
                  <th style={{ padding: '0.5rem' }}>Est. Cost</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem' }}>{r.itemName}</td>
                    <td style={{ padding: '0.5rem' }}>{r.quantity}</td>
                    <td style={{ padding: '0.5rem' }}>${r.estimatedCost.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span className={`badge ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. REQUISITIONS MANAGEMENT (ADMIN)
// ==========================================
export function AdminRequisitionsWidget({ token }: WidgetProps) {
  const [requisitions, setRequisitions] = useState<any[]>([]);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const res = await fetch('/api/logistics/requisitions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setRequisitions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/logistics/requisitions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequisitions();
      }
    } catch (err) {
      alert('Error updating status: ' + err);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>📋 Faculty Logistics Requisitions</h3>
      {requisitions.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No requisition requests registered in log.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.5rem' }}>Teacher</th>
                <th style={{ padding: '0.5rem' }}>Resource Requested</th>
                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.5rem' }}>Cost</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <strong>{r.teacher?.user?.name || 'Faculty Staff'}</strong>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.teacher?.department}</span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>{r.itemName}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>{r.quantity}</td>
                  <td style={{ padding: '0.5rem' }}>${r.estimatedCost.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span className={`badge ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    {r.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleUpdateStatus(r.id, 'APPROVED')}>
                          Approve
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleUpdateStatus(r.id, 'REJECTED')}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. PROFESSIONAL DEVELOPMENT CREDITS WIDGET
// ==========================================
export function ProfessionalDevelopmentWidget({ token, teacherId }: WidgetProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);

  const [courseTitle, setCourseTitle] = useState('');
  const [credits, setCredits] = useState('2');
  const [completionDate, setCompletionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (teacherId) fetchCredits();
  }, [teacherId]);

  const fetchCredits = async () => {
    try {
      const res = await fetch(`/api/faculty/development/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data.courses || []);
      setTotalCredits(data.totalCredits || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !credits || !completionDate) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/faculty/development', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseTitle,
          creditsEarned: credits,
          completionDate,
          status: 'COMPLETED'
        })
      });
      if (res.ok) {
        setCourseTitle('');
        setCredits('2');
        setCompletionDate('');
        fetchCredits();
      }
    } catch (err) {
      alert('Error logging training credit: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  const getAppraisalLevel = (cred: number) => {
    if (cred >= 20) return { title: '⭐ Master Pedagogue', color: 'var(--success)' };
    if (cred >= 10) return { title: '👍 Senior Practitioner', color: 'var(--primary)' };
    return { title: '🌱 Active Training', color: 'var(--text-muted)' };
  };

  const appraisal = getAppraisalLevel(totalCredits);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 2fr', gap: '2rem' }} className="responsive-grid-1-2">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Appraisal Level</h3>
          <h2 style={{ fontFamily: 'var(--font-display)', color: appraisal.color, fontSize: '1.4rem', margin: '0.25rem 0' }}>{appraisal.title}</h2>
          <div style={{ margin: '1rem 0' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalCredits}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> / 20 credits</span>
          </div>
          <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (totalCredits / 20) * 100)}%`, height: '100%', background: appraisal.color, borderRadius: '4px' }}></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Log Training Entry</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Course / Seminar Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. AI-Assisted Pedagogy, STEM Design"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Credits</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="10"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Date Completed</label>
                <input
                  type="date"
                  className="form-control"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
              {submitting ? 'Registering...' : 'Add Credit'}
            </button>
          </form>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>Professional Development History</h3>
        {courses.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No development training entries logged.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courses.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem' }}>{c.courseTitle}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed: {new Date(c.completionDate).toLocaleDateString()}</span>
                </div>
                <span className="badge badge-primary" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.25rem 0.5rem' }}>
                  +{c.creditsEarned} Credits
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
