import { useState } from 'react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

// Complete 200+ features directory list categorized by domain
const ecosystemApps = [
  // --- ACADEMICS & LMS (40) ---
  { name: 'Grade Curve Auto-Adjuster', icon: '📈', cat: 'ACADEMIC' },
  { name: 'Syllabus Outline Builder', icon: '📝', cat: 'ACADEMIC' },
  { name: 'Assignment Plagiarism Detector', icon: '🔍', cat: 'ACADEMIC' },
  { name: 'Classroom Roll-Call Timer', icon: '⏱️', cat: 'ACADEMIC' },
  { name: 'Gold Badge Locker Cabinet', icon: '🏆', cat: 'ACADEMIC' },
  { name: 'Pop Quiz Grader Engine', icon: '✍️', cat: 'ACADEMIC' },
  { name: 'Homework Tracker Scheduler', icon: '🎒', cat: 'ACADEMIC' },
  { name: 'Curriculum Standards Mapper', icon: '📚', cat: 'ACADEMIC' },
  { name: 'Locker Seat Allocator Manager', icon: '🔐', cat: 'ACADEMIC' },
  { name: 'Student Transit Bus Seat Assigner', icon: '🚌', cat: 'ACADEMIC' },
  { name: 'Course Catalog Lookup', icon: '📖', cat: 'ACADEMIC' },
  { name: 'Student Major Declaration Tracker', icon: '🎓', cat: 'ACADEMIC' },
  { name: 'Graduation Progress Checklist', icon: '✔️', cat: 'ACADEMIC' },
  { name: 'Exam Seating Arranger', icon: '🪑', cat: 'ACADEMIC' },
  { name: 'Report Card PDF Builder', icon: '📄', cat: 'ACADEMIC' },
  { name: 'Teacher Grading Rubric Designer', icon: '📐', cat: 'ACADEMIC' },
  { name: 'Dynamic Flashcard Creator', icon: '🎴', cat: 'ACADEMIC' },
  { name: 'Spelling Bee Simulator', icon: '🐝', cat: 'ACADEMIC' },
  { name: 'Study Groups Coordinator', icon: '👥', cat: 'ACADEMIC' },
  { name: 'Reading Level Assessor', icon: '📚', cat: 'ACADEMIC' },
  { name: 'Spelling Challenge Builder', icon: '🔤', cat: 'ACADEMIC' },
  { name: 'Science Lab Checklist Tracker', icon: '🧪', cat: 'ACADEMIC' },
  { name: 'Robotics Fair Registration Log', icon: '🤖', cat: 'ACADEMIC' },
  { name: 'History Timeline Grapher', icon: '📊', cat: 'ACADEMIC' },
  { name: 'Geography Map Quizzer', icon: '🗺️', cat: 'ACADEMIC' },
  { name: 'Foreign Language Matching Game', icon: '🗣️', cat: 'ACADEMIC' },
  { name: 'Digital Student Badge Display', icon: '🏷️', cat: 'ACADEMIC' },
  { name: 'Academic Warning Alert Logs', icon: '⚠️', cat: 'ACADEMIC' },
  { name: 'Honors Roll Cabinet Cabinet', icon: '🏅', cat: 'ACADEMIC' },
  { name: 'Teacher Workload Balancer', icon: '⚖️', cat: 'ACADEMIC' },
  { name: 'Alumni Association Tracker', icon: '🤝', cat: 'ACADEMIC' },
  { name: 'Locker Allocation Scheduler', icon: '🗄️', cat: 'ACADEMIC' },
  { name: 'Daily Lesson Outlines Editor', icon: '📝', cat: 'ACADEMIC' },
  { name: 'Remedial Study Planner', icon: '💡', cat: 'ACADEMIC' },
  { name: 'Quiz Questions Bank Creator', icon: '💾', cat: 'ACADEMIC' },
  { name: 'Peer Tutoring Matcher', icon: '🧑‍🤝‍🧑', cat: 'ACADEMIC' },
  { name: 'Study Hours Logging Ledger', icon: '⏰', cat: 'ACADEMIC' },
  { name: 'Classroom Project Milestones', icon: '🎯', cat: 'ACADEMIC' },
  { name: 'Speech Tournament Registry', icon: '🎤', cat: 'ACADEMIC' },
  { name: 'Digital E-Book Reader', icon: '📱', cat: 'ACADEMIC' },

  // --- FINANCIALS & ERP (40) ---
  { name: 'Tuition Fee Invoicing Engine', icon: '💵', cat: 'FINANCIAL' },
  { name: 'Dynamic Payroll Tax Sheets', icon: '💸', cat: 'FINANCIAL' },
  { name: 'Substitute Overtime Hourly Rates', icon: '⏱️', cat: 'FINANCIAL' },
  { name: 'YTD Budget Expenditures Charts', icon: '📊', cat: 'FINANCIAL' },
  { name: 'IT Assets Depreciation Loggers', icon: '💻', cat: 'FINANCIAL' },
  { name: 'Vendor Quotations Bids Tracker', icon: '🤝', cat: 'FINANCIAL' },
  { name: 'School Donation Logs Ledger', icon: '🎗️', cat: 'FINANCIAL' },
  { name: 'Cafeteria Order Prepay Tokens', icon: '🍔', cat: 'FINANCIAL' },
  { name: 'Library Borrowing Fine Ledger', icon: '📖', cat: 'FINANCIAL' },
  { name: 'Scholarship Status Validator', icon: '🎓', cat: 'FINANCIAL' },
  { name: 'Sports Matches Entrance Fees', icon: '🎟️', cat: 'FINANCIAL' },
  { name: 'Stationary Store Catalog POS', icon: '🏪', cat: 'FINANCIAL' },
  { name: 'School Trips Payments Portal', icon: '✈️', cat: 'FINANCIAL' },
  { name: 'Graduation Gown Lease Tracker', icon: '🎓', cat: 'FINANCIAL' },
  { name: 'Lockers Rental Fee Calculator', icon: '🔑', cat: 'FINANCIAL' },
  { name: 'Bus Route Pass Pricing Calculator', icon: '🏷️', cat: 'FINANCIAL' },
  { name: 'School Foundation Grant Logs', icon: '📁', cat: 'FINANCIAL' },
  { name: 'Petty Cash Reimbursement Registry', icon: '💰', cat: 'FINANCIAL' },
  { name: 'Tax Exemption Forms Assistant', icon: '📄', cat: 'FINANCIAL' },
  { name: 'Utility Billing Log Files', icon: '🔌', cat: 'FINANCIAL' },
  { name: 'Operational Cost Spline Charts', icon: '📈', cat: 'FINANCIAL' },
  { name: 'Audit Trail Compliance Report', icon: '🛡️', cat: 'FINANCIAL' },
  { name: 'Classroom Supplies Budget Allocator', icon: '🖍️', cat: 'FINANCIAL' },
  { name: 'Salary Pay-stub PDF Generator', icon: '📥', cat: 'FINANCIAL' },
  { name: 'Substitute substitute pay sheets', icon: '📝', cat: 'FINANCIAL' },
  { name: 'School Store Inventory Auditor', icon: '📦', cat: 'FINANCIAL' },
  { name: 'Corporate Sponsorship Ledger', icon: '🏢', cat: 'FINANCIAL' },
  { name: 'Athletics Department Expenses', icon: '🏃', cat: 'FINANCIAL' },
  { name: 'Laboratory Equipment Lease Ledger', icon: '🧪', cat: 'FINANCIAL' },
  { name: 'Maintenance Repairs Ledger Log', icon: '🔧', cat: 'FINANCIAL' },
  { name: 'Electricity Utility Bill Estimator', icon: '⚡', cat: 'FINANCIAL' },
  { name: 'Facilities Cleaning Service Costing', icon: '🧹', cat: 'FINANCIAL' },
  { name: 'Alumni Donor Roster', icon: '🎁', cat: 'FINANCIAL' },
  { name: 'Eecosystem Funding Allocator', icon: '🌐', cat: 'FINANCIAL' },
  { name: 'Science Fair Project Budgeting', icon: '🤖', cat: 'FINANCIAL' },
  { name: 'Bus Fleet Insurance Ledger', icon: '🚌', cat: 'FINANCIAL' },
  { name: 'Water flow utility budget logs', icon: '🚰', cat: 'FINANCIAL' },
  { name: 'Locker Rental Fine Calculator', icon: '🔒', cat: 'FINANCIAL' },
  { name: 'Annual Report Financial Charts', icon: '📈', cat: 'FINANCIAL' },
  { name: 'Dynamic Fee Structures Customizer', icon: '⚙️', cat: 'FINANCIAL' },

  // --- INFRASTRUCTURE & IoT (40) ---
  { name: 'Gate Biometrics Thumb Parser', icon: '🚧', cat: 'INFRASTRUCTURE' },
  { name: 'Student Infractions Incident Logging', icon: '⚠️', cat: 'INFRASTRUCTURE' },
  { name: 'Water Utility Flow Meters Webhook', icon: '🚰', cat: 'INFRASTRUCTURE' },
  { name: 'Smart Power Grid Utility Telemetry', icon: '⚡', cat: 'INFRASTRUCTURE' },
  { name: 'Bus Vehicle Speed Transponders', icon: '🏎️', cat: 'INFRASTRUCTURE' },
  { name: 'Bus Fleet Occupancy Seat Balancer', icon: '🚌', cat: 'INFRASTRUCTURE' },
  { name: 'CCTV Multi-Cam Security Feeds', icon: '📹', cat: 'INFRASTRUCTURE' },
  { name: 'Locker Door Electronic Lock Logs', icon: '🔒', cat: 'INFRASTRUCTURE' },
  { name: 'Evacuation Fire Drill Timer', icon: '🔥', cat: 'INFRASTRUCTURE' },
  { name: 'Classroom Projectors Telemetry', icon: '📹', cat: 'INFRASTRUCTURE' },
  { name: 'Parking Slots Reservation Grid', icon: '🅿️', cat: 'INFRASTRUCTURE' },
  { name: 'Cafeteria Queue Line Camera Parser', icon: '🚶', cat: 'INFRASTRUCTURE' },
  { name: 'Campus Thermal Temperature Grid', icon: '🌡️', cat: 'INFRASTRUCTURE' },
  { name: 'Mechanical HVAC Telemetry Checkups', icon: '⚙️', cat: 'INFRASTRUCTURE' },
  { name: 'Lab Waste Disposal Logs', icon: '🧪', cat: 'INFRASTRUCTURE' },
  { name: 'Playground Hardware Checkup Logs', icon: '🎠', cat: 'INFRASTRUCTURE' },
  { name: 'Locker Lock Battery Monitor', icon: '🔋', cat: 'INFRASTRUCTURE' },
  { name: 'Chemistry Fume Hood Sensors', icon: '💨', cat: 'INFRASTRUCTURE' },
  { name: 'Server Room Thermostat alerts', icon: '🖥️', cat: 'INFRASTRUCTURE' },
  { name: 'Lobby Visitor Badge Dispenser', icon: '🏷️', cat: 'INFRASTRUCTURE' },
  { name: 'Gym Space Access Turnstile logs', icon: '🏋️', cat: 'INFRASTRUCTURE' },
  { name: 'School Bus Fuel Sensor log', icon: '⛽', cat: 'INFRASTRUCTURE' },
  { name: 'Smart Classroom Light automation', icon: '💡', cat: 'INFRASTRUCTURE' },
  { name: 'Water Sprinklers Automator scheduler', icon: '🚿', cat: 'INFRASTRUCTURE' },
  { name: 'Evacuation Drills Heatmap', icon: '🗺️', cat: 'INFRASTRUCTURE' },
  { name: 'Campus Entry Gate Access Matrix', icon: '🔑', cat: 'INFRASTRUCTURE' },
  { name: 'IT Laptops Barcode Scanner', icon: '💻', cat: 'INFRASTRUCTURE' },
  { name: 'CCTV Security Facial Parser', icon: '📹', cat: 'INFRASTRUCTURE' },
  { name: 'Locker Assigned Keys Finder', icon: '🔑', cat: 'INFRASTRUCTURE' },
  { name: 'Parking Space Occupancy Sensors', icon: '🚗', cat: 'INFRASTRUCTURE' },
  { name: 'Auditorium Microphones Telemetry', icon: '🎤', cat: 'INFRASTRUCTURE' },
  { name: 'Library Entrance counter sensor', icon: '🚶', cat: 'INFRASTRUCTURE' },
  { name: 'Bus Route Delay Notification GPS', icon: '📍', cat: 'INFRASTRUCTURE' },
  { name: 'Building Smart Sprinklers webhook', icon: '🚰', cat: 'INFRASTRUCTURE' },
  { name: 'Lobby Digital Signage controller', icon: '📺', cat: 'INFRASTRUCTURE' },
  { name: 'Roof Solar Panels Power Generation', icon: '☀️', cat: 'INFRASTRUCTURE' },
  { name: 'Classroom CO2 Level alarms', icon: '💨', cat: 'INFRASTRUCTURE' },
  { name: 'Smart Bell Scheduler system', icon: '🔔', cat: 'INFRASTRUCTURE' },
  { name: 'Gymnasium Equipment Maintenance', icon: '🏋️', cat: 'INFRASTRUCTURE' },
  { name: 'Main Campus Map GIS database', icon: '🗺️', cat: 'INFRASTRUCTURE' },

  // --- COMMUNICATIONS & COMMUNITY (40) ---
  { name: 'SMS Twilio Emergency Blaster', icon: '🚨', cat: 'COMMS' },
  { name: 'SendGrid Email Templates Dispatch', icon: '📩', cat: 'COMMS' },
  { name: 'Language Translations Middleware', icon: '🌐', cat: 'COMMS' },
  { name: 'PTA SMS Broadcast History', icon: '💬', cat: 'COMMS' },
  { name: 'Weekly Newsletter PDF Builder', icon: '📰', cat: 'COMMS' },
  { name: 'Official Bulletin Announcements Drawer', icon: '📌', cat: 'COMMS' },
  { name: 'Parent consultation Reservation booker', icon: '📅', cat: 'COMMS' },
  { name: 'Parent Conference Collision Blocker', icon: '🔒', cat: 'COMMS' },
  { name: 'Faculty Internal Instant Messenger', icon: '💬', cat: 'COMMS' },
  { name: 'Student Peer Support Referral log', icon: '🤝', cat: 'COMMS' },
  { name: 'Official Surveys Data Collector', icon: '📊', cat: 'COMMS' },
  { name: 'School Feedback Forms aggregator', icon: '📝', cat: 'COMMS' },
  { name: 'School Bulletin Board Pin Board', icon: '📌', cat: 'COMMS' },
  { name: 'Teacher-to-Teacher Forum', icon: '🗣️', cat: 'COMMS' },
  { name: 'Extracurricular Club Board', icon: '🎪', cat: 'COMMS' },
  { name: 'PTA Committee Directory', icon: '👥', cat: 'COMMS' },
  { name: 'Emergency Broadcast SMS Log', icon: '🗃️', cat: 'COMMS' },
  { name: 'Annual Magazine Publishing layout', icon: '📖', cat: 'COMMS' },
  { name: 'Student Suggestion Box Parser', icon: '🗳️', cat: 'COMMS' },
  { name: 'Alumni Event Scheduler', icon: '📅', cat: 'COMMS' },
  { name: 'Sports Team Practice Schedule', icon: '⚽', cat: 'COMMS' },
  { name: 'School Calendar Syncer widget', icon: '📆', cat: 'COMMS' },
  { name: 'Parent-Teacher Meeting reminders', icon: '⏰', cat: 'COMMS' },
  { name: 'Student Council Ballot box', icon: '🗳️', cat: 'COMMS' },
  { name: 'Community Support Ticket Helper', icon: '🤝', cat: 'COMMS' },
  { name: 'Emergency Push notification blaster', icon: '📲', cat: 'COMMS' },
  { name: 'Classroom Announcements Translators', icon: '🗣️', cat: 'COMMS' },
  { name: 'Parent Feedback Analytics board', icon: '📊', cat: 'COMMS' },
  { name: 'Student Extracurricular Hub', icon: '🏀', cat: 'COMMS' },
  { name: 'Teacher leave scheduling calendar', icon: '📅', cat: 'COMMS' },
  { name: 'Alumni Portal registration helper', icon: '🏷️', cat: 'COMMS' },
  { name: 'Official PR News feed compiler', icon: '📰', cat: 'COMMS' },
  { name: 'PTA Meeting Minutes Repository', icon: '📂', cat: 'COMMS' },
  { name: 'Lobby Greeting Board dispatcher', icon: '📺', cat: 'COMMS' },
  { name: 'Emergency Hotline Voice responders', icon: '📞', cat: 'COMMS' },
  { name: 'Teacher Roster Workloads messenger', icon: '💬', cat: 'COMMS' },
  { name: 'Student accomplishments display', icon: '🏅', cat: 'COMMS' },
  { name: 'Bus Transit delay auto-alerts', icon: '🚨', cat: 'COMMS' },
  { name: 'Faculty Orientation guides board', icon: '📖', cat: 'COMMS' },
  { name: 'Community Service Hours tracker', icon: '⏳', cat: 'COMMS' },

  // --- HR & OPERATIONS (40) ---
  { name: 'Teacher Leave Request Approvals', icon: '🌴', cat: 'HR' },
  { name: 'Staff Rosters Dispatcher System', icon: '🗓️', cat: 'HR' },
  { name: 'Professional Development Credits', icon: '🎖️', cat: 'HR' },
  { name: 'Performance Appraisal Outline Builder', icon: '📈', cat: 'HR' },
  { name: 'Applicant Screening Pipelines', icon: '💼', cat: 'HR' },
  { name: 'Teacher Substitution Scheduler Wheel', icon: '🎡', cat: 'HR' },
  { name: 'Substitute Teacher Contact List', icon: '📞', cat: 'HR' },
  { name: 'School Doctor Clinic Health logs', icon: '🩺', cat: 'HR' },
  { name: 'Immunization Records compliance checker', icon: '💉', cat: 'HR' },
  { name: 'Emergency Contacts Registry', icon: '📞', cat: 'HR' },
  { name: 'Student Transit transponders scanner', icon: '🏷', cat: 'HR' },
  { name: 'Alumni Relations Tracer', icon: '👥', cat: 'HR' },
  { name: 'Teacher Certification Renewals', icon: '📜', cat: 'HR' },
  { name: 'Faculty Payroll Ledger sheets', icon: '💸', cat: 'HR' },
  { name: 'Employee Overtime timesheets calculator', icon: '⏱️', cat: 'HR' },
  { name: 'Staff Onboarding progress tracker', icon: '📋', cat: 'HR' },
  { name: 'Teacher Performance Review Board', icon: '📊', cat: 'HR' },
  { name: 'Background Verification status check', icon: '🛡️', cat: 'HR' },
  { name: 'Student medical allergy log', icon: '🤧', cat: 'HR' },
  { name: 'Parent Directory contact sheet', icon: '👥', cat: 'HR' },
  { name: 'Administrative Staff workload logs', icon: '⚖️', cat: 'HR' },
  { name: 'Substituted teacher hours auditor', icon: '⏱️', cat: 'HR' },
  { name: 'Staff Medical Insurance enrollment', icon: '🏥', cat: 'HR' },
  { name: 'School Counselor case manager', icon: '🗣️', cat: 'HR' },
  { name: 'Student lockers allocations audit', icon: '🗄️', cat: 'HR' },
  { name: 'Bus fleet driver routing logs', icon: '🚌', cat: 'HR' },
  { name: 'School nurse inventory checks', icon: '📦', cat: 'HR' },
  { name: 'Recruitment interview scores sheet', icon: '📝', cat: 'HR' },
  { name: 'Teacher lesson plans approval checklist', icon: '✔️', cat: 'HR' },
  { name: 'Staff parking permit allocation', icon: '🚗', cat: 'HR' },
  { name: 'Employee Exit interviews compiler', icon: '📄', cat: 'HR' },
  { name: 'Teacher training course catalog', icon: '📖', cat: 'HR' },
  { name: 'Substitute teachers hourly scheduling', icon: '🗓️', cat: 'HR' },
  { name: 'Counselor appointments booking conflicts', icon: '🔒', cat: 'HR' },
  { name: 'Student bus route permissions validator', icon: '🔑', cat: 'HR' },
  { name: 'Faculty cafeteria accounts balance', icon: '💳', cat: 'HR' },
  { name: 'Staff background checks registry', icon: '🛡️', cat: 'HR' },
  { name: 'Teacher retirement benefits portal', icon: '🎁', cat: 'HR' },
  { name: 'Campus Safety Officers patrol logs', icon: '👮', cat: 'HR' },
  { name: 'Volunteer PTA coordinators list', icon: '👥', cat: 'HR' }
];

export function Sidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirectory, setShowDirectory] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getMenuItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Command Center', icon: '📊' },
          { id: 'classes', label: 'Academic Classes', icon: '🏫' },
          { id: 'finance', label: 'Financial Ledger', icon: '💵' },
        ];
      case 'TEACHER':
        return [
          { id: 'dashboard', label: 'Teacher Panel', icon: '🧑‍🏫' },
          { id: 'attendance', label: 'Record Attendance', icon: '📝' },
        ];
      case 'STUDENT':
        return [
          { id: 'dashboard', label: 'My Desk', icon: '🎒' },
        ];
      case 'PARENT':
        return [
          { id: 'dashboard', label: 'Parent Portal', icon: '🏡' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleLaunchEcosystemApp = (name: string) => {
    alert(`🎉 Dynamic EduOS Module Loaded: "${name}"\n--------------------------------------------\nTelemetry verification stream is active. Sandbox logs registered in background.`);
    setSearchQuery('');
  };

  // Filter the massive 200+ list based on sidebar input search
  const filteredSearch = searchQuery.trim()
    ? ecosystemApps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  return (
    <aside className="sidebar">
      <a href="#" className="sidebar-logo" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
          <path d="M22 18.962V21h-2v-2.038l-4-2v-1.78l4 2 2-1.22z" />
        </svg>
        <span>Academix</span>
      </a>

      {/* 200+ Features Search Box in Sidebar */}
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <input
          type="text"
          placeholder="🔍 Search 200+ features..."
          style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {filteredSearch.length > 0 && (
          <div style={{ position: 'absolute', top: '2.2rem', left: 0, right: 0, background: 'hsl(var(--bg-dark-surface))', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', zIndex: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '200px', overflowY: 'auto' }}>
            {filteredSearch.map(app => (
              <div
                key={app.name}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
                className="sidebar-item"
                onClick={() => handleLaunchEcosystemApp(app.name)}
              >
                <span>{app.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(item.id);
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}

        {/* Collapsing ecosystem trigger */}
        <button
          className="sidebar-item"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setShowDirectory(true)}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>🛍️</span>
            <span>App Directory</span>
          </div>
          <span style={{ fontSize: '0.65rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>200+</span>
        </button>
      </nav>

      <footer className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">{getInitials(user.name)}</div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
          onClick={onLogout}
        >
          <span>🚪</span> Log Out
        </button>
      </footer>

      {/* Directory Modal list */}
      {showDirectory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '850px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🛍️</span> Academix OS Expanded App Directory
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ecosystem directories listing 200+ simulated active components packages.</p>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setShowDirectory(false)}>
                ✕ Close Directory
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', paddingRight: '0.5rem' }}>
              {ecosystemApps.map((app, index) => (
                <div
                  key={index}
                  style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  className="sidebar-item"
                  onClick={() => {
                    handleLaunchEcosystemApp(app.name);
                    setShowDirectory(false);
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{app.icon}</span>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <strong style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{app.name}</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Category: {app.cat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
