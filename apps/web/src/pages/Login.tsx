import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    // Submit login quickly
    setError('');
    setLoading(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: roleEmail, password: rolePass }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error); });
        return res.json();
      })
      .then((data) => {
        onLoginSuccess(data.token, data.user);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
        padding: '2rem',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '2.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              width: '60px',
              height: '60px',
              background: 'var(--primary-glow)',
              borderRadius: 'var(--radius-md)',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontSize: '2rem',
              marginBottom: '1rem',
              boxShadow: '0 0 20px var(--border-glow)',
            }}
          >
            🏫
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            Welcome to Academix
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter your credentials to access the nervous system
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-glow)',
              color: 'var(--danger)',
              border: '1px solid hsla(350, 89%, 60%, 0.2)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '1.5rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-login-grid">
          <div
            style={{
              gridColumn: 'span 2',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Stakeholder Demo Access
          </div>
          <button
            className="quick-login-btn"
            onClick={() => triggerQuickLogin('admin@school.com', 'admin123')}
          >
            🔑 Admin Role
          </button>
          <button
            className="quick-login-btn"
            onClick={() => triggerQuickLogin('teacher.john@school.com', 'teacher123')}
          >
            🔑 Teacher Role
          </button>
          <button
            className="quick-login-btn"
            onClick={() => triggerQuickLogin('student.alice@school.com', 'student123')}
          >
            🔑 Student Role
          </button>
          <button
            className="quick-login-btn"
            onClick={() => triggerQuickLogin('parent@school.com', 'parent123')}
          >
            🔑 Parent Role
          </button>
        </div>
      </div>
    </div>
  );
}
