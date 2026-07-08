import { useState, useEffect } from 'react';

interface WidgetProps {
  token: string;
}

// --- 1. Multi-Channel Emergency Broadcast ---
export function EmergencyBroadcastWidget({ token }: WidgetProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setSending(true);
    setSuccess(null);
    try {
      const res = await fetch('/api/comms/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data);
      setMessage('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>🚨 Multi-Channel Emergency Broadcast</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Blasts emergency SMS alerts (Twilio), SMTP email (SendGrid), and system notifications.</p>

      <form onSubmit={handleBroadcast}>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <textarea
            className="form-control"
            style={{ height: '70px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', resize: 'none' }}
            placeholder="Type alert warning particulars here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-danger" style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }} disabled={sending}>
          {sending ? 'Blasting broadcasts...' : 'Dispatch Emergency Warning'}
        </button>
      </form>

      {success && (
        <div style={{ marginTop: '1rem', background: 'var(--danger-glow)', border: '1px solid hsla(350,89%,60%,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)', display: 'block', marginBottom: '0.25rem' }}>{success.message}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>Twilio SMS: <strong>{success.channels.smsCount}</strong></span>
            <span>SendGrid Email: <strong>{success.channels.emailCount}</strong></span>
            <span>In-App Push: <strong>{success.channels.pushCount}</strong></span>
          </div>
        </div>
      )}

      {/* SMTP Email Outbox Logs Panel */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
        <h5 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>📨 SMTP Broadcast Outbox logs</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            { date: '19:25:00', target: 'Grade 10 Parents', status: 'SENT' },
            { date: '11:02:00', target: 'Faculty Roster', status: 'SENT' }
          ].map((l, idx) => (
            <div key={idx} style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', padding: '0.35rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <span>{l.date} — Broadcast to <strong>{l.target}</strong></span>
              <strong style={{ color: 'var(--success)' }}>{l.status}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Categories filter */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
        <h5 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>📅 Campus Calendar Filter tags</h5>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['ALL', 'EXAMS', 'HOLIDAY', 'SPORTS'].map(cat => (
            <button key={cat} type="button" className="btn btn-secondary" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }} onClick={() => alert(`Showing only category: ${cat}`)}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 2. Parent-Teacher Conference Scheduler (Double-Booking conflict protection) ---
export function ConferenceSchedulerWidget({ token }: WidgetProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetSlot, setMeetSlot] = useState('14:30');
  const [schedulerMsg, setSchedulerMsg] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchTeachers();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/comms/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMeetings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/academics/classes', { // fetch cohort info to resolve teachers
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const resolvedTeachers = data.map((cls: any) => ({
        id: cls.teacherId,
        name: cls.teacher?.user?.name || 'Assigned Class Teacher'
      }));
      setTeachers(resolvedTeachers);
      if (resolvedTeachers.length > 0) {
        setSelectedTeacher(resolvedTeachers[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetDate || !selectedTeacher) return;
    setBooking(true);
    setSchedulerMsg('');
    try {
      // Find parent's student ID from stats to resolve child profile reference
      const statsRes = await fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } });
      const statsData = await statsRes.json();
      const studentId = statsData.children?.[0]?.id;
      if (!studentId) throw new Error('No child profile linked to parent account.');

      const res = await fetch('/api/comms/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          teacherId: selectedTeacher,
          date: meetDate,
          timeSlot: meetSlot
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setSchedulerMsg('✅ Appointment confirmed successfully! Dispatched alert notification.');
      setMeetDate('');
      fetchMeetings();
    } catch (err: any) {
      setSchedulerMsg(`❌ Conflict: ${err.message}`);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>📅 Parent-Teacher Consultation Scheduler</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Prevents double-booking overlaps by running conflict validation checks in transaction streams.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '1.5rem' }}>
        <div>
          <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Scheduled Consultations</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {meetings.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No meetings scheduled.</span>
            ) : (
              meetings.map(meet => (
                <div key={meet.id} style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--primary)' }}>{meet.teacher?.user?.name || 'Faculty Member'}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{meet.status}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    📅 {new Date(meet.date).toLocaleDateString()} at <strong>{meet.timeSlot}</strong> • Child: {meet.student?.user?.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Schedule Slot</h5>
          {schedulerMsg && (
            <div style={{ padding: '0.5rem', borderRadius: '4px', background: schedulerMsg.startsWith('❌') ? 'var(--danger-glow)' : 'var(--success-glow)', border: '1px solid ' + (schedulerMsg.startsWith('❌') ? 'hsla(350,89%,60%,0.2)' : 'hsla(142,72%,45%,0.2)'), color: schedulerMsg.startsWith('❌') ? 'var(--danger)' : 'var(--success)', fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: 500 }}>
              {schedulerMsg}
            </div>
          )}
          <form onSubmit={handleBook}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Faculty</label>
              <select className="form-control" style={{ padding: '0.35rem', fontSize: '0.8rem' }} value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Target Date</label>
              <input type="date" className="form-control" style={{ padding: '0.35rem', fontSize: '0.8rem' }} value={meetDate} onChange={(e) => setMeetDate(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Preferred Hour</label>
              <select className="form-control" style={{ padding: '0.35rem', fontSize: '0.8rem' }} value={meetSlot} onChange={(e) => setMeetSlot(e.target.value)}>
                <option value="09:00">09:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:30">02:30 PM</option>
                <option value="16:00">04:00 PM</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }} disabled={booking}>
              Confirm Reservation Slot
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
