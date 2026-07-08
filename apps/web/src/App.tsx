import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ParentDashboard } from './pages/ParentDashboard';

// Simple localization dictionary for demonstration
const translations: Record<string, Record<string, string>> = {
  EN: {
    systemFeed: 'System Feed',
    unread: 'unread',
    noMessages: 'No new messages.',
    themeToggle: 'Theme',
    langToggle: 'Language',
    aiAssistant: 'Academix AI Advisor',
    chatPlaceholder: 'Ask Academix AI...',
    assistantGreeting: 'Hello! I am your Academix Advisor. Ask me about schedules, menu, fees, or how to navigate the portal.',
  },
  ES: {
    systemFeed: 'Canal del Sistema',
    unread: 'no leído',
    noMessages: 'No hay mensajes nuevos.',
    themeToggle: 'Tema',
    langToggle: 'Idioma',
    aiAssistant: 'Asesor Academix AI',
    chatPlaceholder: 'Preguntar a Academix...',
    assistantGreeting: '¡Hola! Soy tu Asesor Academix. Pregúntame sobre horarios, menús, tarifas o cómo navegar por el portal.',
  }
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('sms_token'));
  const [user, setUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // UX Options
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'ES'>('EN');

  // AI Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([]);

  const t = translations[language];

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [token, user]);

  // Apply light theme dynamically to document body
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  // Initialize Chat greeting when it opens
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      setChatMessages([{ sender: 'assistant', text: t.assistantGreeting }]);
    }
  }, [isChatOpen, language]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Session expired');
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (newToken: string, loggedUser: any) => {
    localStorage.setItem('sms_token', newToken);
    setToken(newToken);
    setUser(loggedUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('sms_token');
    setToken(null);
    setUser(null);
    setIsChatOpen(false);
    setChatMessages([]);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'EN' ? 'en-US' : 'es-ES';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newMessages = [...chatMessages, { sender: 'user' as const, text: userMsg }];
    setChatMessages(newMessages);
    setChatInput('');

    // AI simulation logic
    setTimeout(() => {
      let responseText = "I am Academix AI Advisor. I can resolve queries regarding schedules, classes, fee invoice structures, and help desk services.";
      const query = userMsg.toLowerCase();

      if (query.includes('schedule') || query.includes('time') || query.includes('horario') || query.includes('calendario')) {
        responseText = language === 'EN' 
          ? "📅 The Parent-Teacher Consultations are scheduled for tomorrow at 2:00 PM in the Auditorium Hall. Next Saturday is the Annual Athletics Meet starting at 9:00 AM."
          : "📅 Las Consultas de Padres y Maestros están programadas para mañana a las 2:00 PM en el Auditorio. El próximo sábado es el Encuentro Atlético Anual a las 9:00 AM.";
      } else if (query.includes('cafeteria') || query.includes('burger') || query.includes('food') || query.includes('lunch') || query.includes('menú') || query.includes('comida')) {
        responseText = language === 'EN'
          ? "🍔 The cafeteria lunch pre-order special today is Chicken Burger served with Fruit Salad and Apple Juice for $8.50."
          : "🍔 El almuerzo especial hoy en la cafetería es Hamburguesa de Pollo servida con Ensalada de Frutas y Jugo de Manzana por $8.50.";
      } else if (query.includes('fee') || query.includes('pay') || query.includes('invoice') || query.includes('pagar') || query.includes('tarifa')) {
        responseText = language === 'EN'
          ? "💳 Outstanding payments can be settled securely from the Parent Workspace by selecting 'Secure Payment' to trigger our mock payment simulator gateway."
          : "💳 Los pagos pendientes se pueden liquidar de forma segura desde el panel del padre, seleccionando 'Pago Seguro' para iniciar la simulación de cobro.";
      } else if (query.includes('scholarship') || query.includes('beca') || query.includes('gpa')) {
        responseText = language === 'EN'
          ? "🎓 Scholarship applications require a grade point average above 3.8 and a clear student conduct record without pending disciplinary entries."
          : "🎓 Las solicitudes de beca requieren un promedio general superior a 3.8 y un expediente de conducta impecable.";
      }

      setChatMessages([...newMessages, { sender: 'assistant', text: responseText }]);
    }, 800);
  };

  if (!token || !user) {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#020617', color: 'var(--text-secondary)' }}>
          Authenticating session...
        </div>
      );
    }
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        if (activeTab === 'classes') {
          return <AdminDashboard token={token} defaultSubTab="classes" />;
        }
        if (activeTab === 'finance') {
          return <AdminDashboard token={token} defaultSubTab="finance" />;
        }
        return <AdminDashboard token={token} defaultSubTab="overview" />;
      case 'TEACHER':
        if (activeTab === 'attendance') {
          return <TeacherDashboard token={token} defaultTab="attendance" />;
        }
        return <TeacherDashboard token={token} defaultTab="overview" />;
      case 'STUDENT':
        return <StudentDashboard token={token} />;
      case 'PARENT':
        return <ParentDashboard token={token} />;
      default:
        return <div>Invalid Role</div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="layout-wrapper">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="main-content">
        {/* Top Navbar HUD */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          
          {/* Accessibility UX controls */}
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setIsLightTheme(!isLightTheme)}
          >
            {isLightTheme ? '🌙 Dark' : '☀️ Light'} {t.themeToggle}
          </button>

          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => setLanguage(l => l === 'EN' ? 'ES' : 'EN')}
          >
            🌐 {language === 'EN' ? 'Español' : 'English'}
          </button>

          {/* Notifications feed trigger */}
          <div style={{ position: 'relative', cursor: 'pointer' }} className="notif-center-trigger">
            <span style={{ fontSize: '1.4rem' }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.35rem', borderRadius: '10px', boxShadow: '0 0 8px var(--danger-glow)' }}>
                {unreadCount}
              </span>
            )}
            
            <div className="notif-dropdown" style={{ display: 'none', position: 'absolute', top: '2.5rem', right: 0, width: '320px', background: 'hsl(var(--bg-dark-surface))', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t.systemFeed}</span>
                {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadCount} {t.unread}</span>}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>{t.noMessages}</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem', opacity: n.isRead ? 0.6 : 1 }} onClick={() => !n.isRead && handleMarkAsRead(n.id)}>
                      <div style={{ fontSize: '0.9rem' }}>{n.isRead ? '✉️' : '📩'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {renderDashboard()}
      </main>

      {/* Docked AI Chatbot Advisor */}
      <div className="ai-chatbot-container">
        {isChatOpen ? (
          <div className="ai-chatbot-drawer glass-card">
            <header className="ai-chat-header">
              <span>🤖 {t.aiAssistant}</span>
              <button 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setIsChatOpen(false)}
              >
                ✕
              </button>
            </header>
            <div className="ai-chat-body">
              {chatMessages.map((msg, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div className={`chat-bubble ${msg.sender}`} style={{ maxWidth: '100%' }}>
                    {msg.text}
                  </div>
                  {msg.sender === 'assistant' && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      onClick={() => speakText(msg.text)}
                    >
                      <span>🔊 Listen</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="ai-chat-footer">
              <input
                type="text"
                className="form-control"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                placeholder={t.chatPlaceholder}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Send
              </button>
            </form>
          </div>
        ) : (
          <button className="ai-chatbot-toggle" onClick={() => setIsChatOpen(true)}>
            💬
          </button>
        )}
      </div>
      
      <style>{`
        .notif-center-trigger:hover .notif-dropdown {
          display: block !important;
        }
      `}</style>
    </div>
  );
}

export default App;
