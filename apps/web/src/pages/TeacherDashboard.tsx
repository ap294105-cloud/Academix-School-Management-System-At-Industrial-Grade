import { useState, useEffect } from 'react';
import { AISyllabusWidget } from '../components/AcademicWidgets';
import { PayrollCalculatorWidget } from '../components/FinancialWidgets';
import { DisciplinaryIncidentWidget } from '../components/InfrastructureWidgets';
import { TeacherRequisitionWidget, ProfessionalDevelopmentWidget } from '../components/Phase2Widgets';
import { QuizBuilderWidget } from '../components/Phase4Widgets';
import { TeacherConsultationWidget } from '../components/Phase5Widgets';

interface TeacherDashboardProps {
  token: string;
  defaultTab?: 'overview' | 'attendance' | 'grading' | 'leaves' | 'lessons' | 'requisitions' | 'development' | 'quizzes' | 'conferences';
}

export function TeacherDashboard({ token, defaultTab = 'overview' }: TeacherDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'grading' | 'leaves' | 'lessons' | 'requisitions' | 'development' | 'quizzes' | 'conferences'>(defaultTab as any);

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

  // Attendance state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }>>({});
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attMessage, setAttMessage] = useState('');

  // Grading state
  const [subjects, setSubjects] = useState<any[]>([]);
  const [gradingClass, setGradingClass] = useState<string>('');
  const [gradingStudents, setGradingStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [examType, setExamType] = useState<string>('QUIZ');
  const [score, setScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('100');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradeMessage, setGradeMessage] = useState('');

  // Leaves state
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState('');

  // Lessons state
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonClass, setLessonClass] = useState('');
  const [lessonSubject, setLessonSubject] = useState('');
  const [submittingLesson, setSubmittingLesson] = useState(false);
  const [lessonMessage, setLessonMessage] = useState('');

  useEffect(() => {
    setActiveTab(defaultTab as any);
  }, [defaultTab]);

  useEffect(() => {
    fetchStats();
    fetchSubjects();
    fetchLeaveRequests();
    fetchLessonPlans();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stats = await res.json();
      setData(stats);

      if (stats.classes && stats.classes.length > 0) {
        setSelectedClass(stats.classes[0].id);
        setGradingClass(stats.classes[0].id);
        setLessonClass(stats.classes[0].name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/academics/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setSubjects(list);
      if (list.length > 0) {
        setSelectedSubject(list[0].id);
        setLessonSubject(list[0].name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch('/api/enterprise/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setLeaveRequests(list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessonPlans = async () => {
    try {
      const res = await fetch('/api/enterprise/lessons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setLessonPlans(list);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch student rosters when class selections change
  useEffect(() => {
    if (selectedClass) {
      fetchClassStudentsForAttendance(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (gradingClass) {
      fetchClassStudentsForGrading(gradingClass);
    }
  }, [gradingClass]);

  const fetchClassStudentsForAttendance = async (classId: string) => {
    try {
      const res = await fetch(`/api/academics/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setClassStudents(list);

      const records: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }> = {};
      list.forEach((s: any) => {
        records[s.id] = { status: 'PRESENT', remarks: '' };
      });
      setAttendanceRecords(records);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClassStudentsForGrading = async (classId: string) => {
    try {
      const res = await fetch(`/api/academics/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      setGradingStudents(list);
      if (list.length > 0) {
        setSelectedStudent(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleAttendanceRemarks = (studentId: string, remarks: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const submitAttendance = async () => {
    setSubmittingAttendance(true);
    setAttMessage('');
    try {
      const recordsArray = Object.keys(attendanceRecords).map(studentId => ({
        studentId,
        status: attendanceRecords[studentId].status,
        remarks: attendanceRecords[studentId].remarks || undefined,
      }));

      const res = await fetch('/api/academics/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: selectedClass,
          date: attDate,
          attendanceRecords: recordsArray,
        }),
      });

      if (!res.ok) throw new Error('Failed to post attendance');
      setAttMessage('✅ Attendance record saved and parent updates dispatched!');
    } catch (err: any) {
      setAttMessage('❌ Error: ' + err.message);
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const handlePostGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGrade(true);
    setGradeMessage('');
    try {
      const res = await fetch('/api/academics/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          subjectId: selectedSubject,
          examType,
          score,
          maxScore,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit marks');
      }

      setGradeMessage('✅ Grade published successfully to parent & student feeds!');
      setScore('');
    } catch (err: any) {
      setGradeMessage('❌ Error: ' + err.message);
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setLeaveMessage('');
    try {
      const res = await fetch('/api/enterprise/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startDate: leaveStart, endDate: leaveEnd, reason: leaveReason }),
      });

      if (!res.ok) throw new Error('Failed to submit leave request');
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
      setLeaveMessage('✅ Leave application registered for administrator review.');
      fetchLeaveRequests();
    } catch (err: any) {
      setLeaveMessage('❌ Error: ' + err.message);
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLesson(true);
    setLessonMessage('');
    try {
      const res = await fetch('/api/enterprise/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: lessonTitle, content: lessonContent, className: lessonClass, subjectName: lessonSubject }),
      });

      if (!res.ok) throw new Error('Failed to save lesson plan');
      setLessonTitle('');
      setLessonContent('');
      setLessonMessage('✅ Lesson plan saved successfully to cohort ledger.');
      fetchLessonPlans();
    } catch (err: any) {
      setLessonMessage('❌ Error: ' + err.message);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const applyTemplate = (mode: 'LECTURE' | 'LAB' | 'REVISION') => {
    let tpl = '';
    if (mode === 'LECTURE') {
      tpl = `📖 LECTURE TEMPLATE\n-----------------\n📌 Objectives:\n- Introduce key concept of...\n- Analyze primary examples of...\n\n⏳ Agenda:\n1. 10m Hook & Quick Review\n2. 20m Main Concept presentation\n3. 15m Guided class practice\n\n📚 Resources: Chalkboard, digital slides\n📝 Homework: Complete worksheet chapter 4.`;
    } else if (mode === 'LAB') {
      tpl = `🔬 LAB WORKSHOP TEMPLATE\n------------------------\n📌 Objectives:\n- Conduct practical testing of...\n- Observe key reaction patterns...\n\n⏳ Agenda:\n1. 5m Safety brief & instruction\n2. 35m Interactive group lab activity\n3. 10m Cleanup & notes collation\n\n📚 Resources: Laboratory instruments, safety goggles\n📝 Homework: Compile laboratory observation sheet.`;
    } else {
      tpl = `📝 EXAM REVISION TEMPLATE\n-------------------------\n📌 Objectives:\n- Synthesize chapters 1-3 content\n- Conduct diagnostic mock test\n\n⏳ Agenda:\n1. 15m Question/Answer review\n2. 25m Practice exam sprint\n3. 10m Peer grading discussion\n\n📚 Resources: Printed mock tests packets\n📝 Homework: Correct wrong answers.`;
    }
    setLessonContent(tpl);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading Faculty Portal...
      </div>
    );
  }

  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const recentMarks = data?.recentMarks || [];
  const teacherClasses = data?.classes || [];

  return (
    <div className="animate-fade-in">
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Faculty Portal</h1>
          <p>Logged in: {profile.department} Dept. — Employee ID: {profile.employeeId}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button
            className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('attendance')}
          >
            ✍️ Attendance
          </button>
          <button
            className={`btn ${activeTab === 'grading' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('grading')}
          >
            📝 Grades
          </button>
          <button
            className={`btn ${activeTab === 'lessons' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('lessons')}
          >
            📚 Lessons
          </button>
          <button
            className={`btn ${activeTab === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('leaves')}
          >
            🌴 Leaves & Payroll
          </button>
          <button
            className={`btn ${activeTab === 'requisitions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('requisitions')}
          >
            📦 Requisitions
          </button>
          <button
            className={`btn ${activeTab === 'development' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('development')}
          >
            🎓 Training Dev
          </button>
          <button
            className={`btn ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('quizzes')}
          >
            📝 MCQ Quizzes
          </button>
          <button
            className={`btn ${activeTab === 'conferences' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('conferences')}
          >
            📅 Conferences
          </button>
        </div>
      </header>

      {activeTab === 'overview' && (
        <>
          <section className="stats-grid">
            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>My Classes</span>
                <span className="stat-icon">🏫</span>
              </div>
              <div className="stat-value">{stats.totalClasses}</div>
              <div className="stat-footer">
                <span>🟢 Direct Cohorts</span>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-header">
                <span>Total Students Taught</span>
                <span className="stat-icon">🎓</span>
              </div>
              <div className="stat-value">{stats.totalStudents}</div>
              <div className="stat-footer">
                <span>🟢 Under Direct Instruction</span>
              </div>
            </div>
          </section>

          <div className="dashboard-grid">
            <div className="dashboard-main">
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 0 }}>My Cohort Assignments</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => exportToCSV(teacherClasses.map((c: any) => ({ name: c.name, section: c.section, students: c.studentCount })), 'cohort_classes')}>
                    📥 Export CSV
                  </button>
                </div>
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Class Name</th>
                        <th>Section</th>
                        <th>Student Count</th>
                        <th>Action Quick-links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherClasses.map((cls: any) => (
                        <tr key={cls.id}>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{cls.name}</td>
                          <td><span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>{cls.section}</span></td>
                          <td>{cls.studentCount} students</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                onClick={() => {
                                  setSelectedClass(cls.id);
                                  setActiveTab('attendance');
                                }}
                              >
                                Attendance
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                onClick={() => {
                                  setGradingClass(cls.id);
                                  setActiveTab('grading');
                                }}
                              >
                                Grade Marks
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="dashboard-side">
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>Recent Scores Posted</h3>
                <div className="notification-feed">
                  {recentMarks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No grading data found.</p>
                  ) : (
                    recentMarks.map((mark: any) => (
                      <div key={mark.id} className="notification-item" style={{ padding: '0.85rem 1rem' }}>
                        <div className="notification-content">
                          <div className="notification-title" style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{mark.student.user.name}</span>
                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>{mark.score}/{mark.maxScore}</span>
                          </div>
                          <p className="notification-msg" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                            {mark.subject.name} — <span style={{ textTransform: 'lowercase' }}>{mark.examType}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Teacher Appraisal & Class Attendance Gauge */}
              <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>🌟</span> Faculty Appraisal & Performance
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  {/* Appraisal Stars */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Appraisal Rating</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      ⭐⭐⭐⭐★ <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>(4.8)</span>
                    </strong>
                  </div>
                  {/* Circular Gauge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="45" height="45" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--success)"
                        strokeWidth="3.5"
                        strokeDasharray="94, 100"
                      />
                      <text x="18" y="21.5" fill="#fff" fontSize="8" fontWeight="600" textAnchor="middle">94%</text>
                    </svg>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Class Attendance</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--success)' }}>Optimal Standing</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'attendance' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Take Cohort Attendance</h3>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => exportToCSV(classStudents.map((s: any) => ({ name: s.user.name, admissionNo: s.admissionNo, status: attendanceRecords[s.id]?.status || 'PRESENT', remarks: attendanceRecords[s.id]?.remarks || '' })), 'attendance_report')}>
                📥 Export CSV
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.8rem' }}>Target Class</label>
                <select
                  className="form-control"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '160px' }}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {teacherClasses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.8rem' }}>Date</label>
                <input
                  type="date"
                  className="form-control"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {attMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: attMessage.startsWith('❌') ? 'var(--danger-glow)' : 'var(--success-glow)',
                border: '1px solid ' + (attMessage.startsWith('❌') ? 'hsla(350, 89%, 60%, 0.2)' : 'hsla(142, 72%, 45%, 0.2)'),
                color: attMessage.startsWith('❌') ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                fontWeight: 500,
              }}
            >
              {attMessage}
            </div>
          )}

          <div className="table-wrapper" style={{ marginBottom: '2rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status Toggle</th>
                  <th>Observations / Remarks</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled.</td>
                  </tr>
                ) : (
                  classStudents.map((student: any) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600 }}>{student.user.name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className={`btn ${attendanceRecords[student.id]?.status === 'PRESENT' ? 'btn-success' : 'btn-secondary'}`}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            className={`btn ${attendanceRecords[student.id]?.status === 'ABSENT' ? 'btn-danger' : 'btn-secondary'}`}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            className={`btn ${attendanceRecords[student.id]?.status === 'LATE' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleAttendanceChange(student.id, 'LATE')}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. excused medical leave"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          value={attendanceRecords[student.id]?.remarks || ''}
                          onChange={(e) => handleAttendanceRemarks(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={submitAttendance} disabled={submittingAttendance || classStudents.length === 0}>
              {submittingAttendance ? 'Saving Records...' : 'Submit Class Attendance'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'grading' && (
        <div className="responsive-grid-2-15">
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Submit Academic Marks & Scores</h3>

            {gradeMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: gradeMessage.startsWith('❌') ? 'var(--danger-glow)' : 'var(--success-glow)',
                  border: '1px solid ' + (gradeMessage.startsWith('❌') ? 'hsla(350, 89%, 60%, 0.2)' : 'hsla(142, 72%, 45%, 0.2)'),
                  color: gradeMessage.startsWith('❌') ? 'var(--danger)' : 'var(--success)',
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                  fontWeight: 500,
                }}
              >
                {gradeMessage}
              </div>
            )}

            <form onSubmit={handlePostGrade} style={{ maxWidth: '550px' }}>
              <div className="form-group">
                <label className="form-label">Cohort Class</label>
                <select
                  className="form-control"
                  value={gradingClass}
                  onChange={(e) => setGradingClass(e.target.value)}
                >
                  {teacherClasses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select
                  className="form-control"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {gradingStudents.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.user.name} ({s.admissionNo})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  className="form-control"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Exam Type</label>
                <select
                  className="form-control"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                >
                  <option value="QUIZ">Quiz / Pop Test</option>
                  <option value="ASSIGNMENT">Homework / Project</option>
                  <option value="MIDTERM">Midterm Examination</option>
                  <option value="FINAL">Final Examination</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Score Secured</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 88.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Maximum Mark</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 100"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submittingGrade || gradingStudents.length === 0}>
                {submittingGrade ? 'Publishing Grades...' : 'Publish Academic Grade'}
              </button>
            </form>
          </div>

          <DisciplinaryIncidentWidget token={token} />
        </div>
      )}

      {activeTab === 'lessons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="responsive-grid-1-1">
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>My Structured Lesson Plans</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {lessonPlans.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No lesson plans archived.</p>
                ) : (
                  lessonPlans.map(plan => (
                    <div key={plan.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--primary)' }}>{plan.title}</strong>
                        <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{plan.className} - {plan.subjectName}</span>
                      </div>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {plan.content}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Create Lesson Plan</h3>
              {lessonMessage && (
                <div style={{ padding: '0.75rem', background: 'var(--success-glow)', border: '1px solid hsla(142,72%,45%,0.2)', color: 'var(--success)', fontSize: '0.8rem', borderRadius: '6px', marginBottom: '1rem' }}>
                  {lessonMessage}
                </div>
              )}
              <form onSubmit={handleCreateLesson}>
                <div className="form-group">
                  <label className="form-label">Lesson Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mitosis Cycle Checkpoints"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Cohort Target</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Grade 10"
                      value={lessonClass}
                      onChange={(e) => setLessonClass(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Mathematics"
                      value={lessonSubject}
                      onChange={(e) => setLessonSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Lesson Content Outline</label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }} onClick={() => applyTemplate('LECTURE')}>Lecture</button>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }} onClick={() => applyTemplate('LAB')}>Lab</button>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }} onClick={() => applyTemplate('REVISION')}>Revision</button>
                    </div>
                  </div>
                  <textarea
                    className="form-control"
                    style={{ height: '140px', resize: 'none' }}
                    placeholder="Enter lesson guidelines, goals, and sketches..."
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingLesson}>
                  {submittingLesson ? 'Archiving...' : 'Save Lesson Plan'}
                </button>
              </form>
            </div>
          </div>

          <AISyllabusWidget token={token} />
        </div>
      )}

      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="responsive-grid-15-1">
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 0 }}>My Leave Application History</h3>
                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => exportToCSV(leaveRequests.map((l: any) => ({ start: new Date(l.startDate).toLocaleDateString(), end: new Date(l.endDate).toLocaleDateString(), reason: l.reason, status: l.status })), 'leave_history')}>
                  📥 Export CSV
                </button>
              </div>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Absence Period</th>
                      <th>Reason Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No leaves filed.</td>
                      </tr>
                    ) : (
                      leaveRequests.map(leave => (
                        <tr key={leave.id}>
                          <td>
                            <strong>{new Date(leave.startDate).toLocaleDateString()}</strong> to <strong>{new Date(leave.endDate).toLocaleDateString()}</strong>
                          </td>
                          <td>{leave.reason}</td>
                          <td>
                            <span className={`badge ${leave.status === 'APPROVED' ? 'badge-success' : leave.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Submit Leave Application</h3>
              {leaveMessage && (
                <div style={{ padding: '0.75rem', background: leaveMessage.startsWith('❌') ? 'var(--danger-glow)' : 'var(--success-glow)', border: '1px solid ' + (leaveMessage.startsWith('❌') ? 'hsla(350,89%,60%,0.2)' : 'hsla(142,72%,45%,0.2)'), color: leaveMessage.startsWith('❌') ? 'var(--danger)' : 'var(--success)', fontSize: '0.8rem', borderRadius: '6px', marginBottom: '1rem' }}>
                  {leaveMessage}
                </div>
              )}
              <form onSubmit={handleSubmitLeave}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Particulars</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dental checkup appointment"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingLeave}>
                  {submittingLeave ? 'Submitting...' : 'File Application'}
                </button>
              </form>
            </div>
          </div>

          <PayrollCalculatorWidget token={token} />
        </div>
      )}

      {activeTab === 'requisitions' && (
        <TeacherRequisitionWidget token={token} />
      )}

      {activeTab === 'development' && (
        <ProfessionalDevelopmentWidget token={token} teacherId={profile.id} />
      )}

      {activeTab === 'quizzes' && (
        <QuizBuilderWidget token={token} classes={teacherClasses} />
      )}

      {activeTab === 'conferences' && (
        <TeacherConsultationWidget token={token} />
      )}
    </div>
  );
}
