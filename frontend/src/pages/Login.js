import { useState } from 'react';

// Demo credentials — replace with real auth when connecting Supabase
const CREDENTIALS = {
  admin: [
    { email: 'admin@college.edu',   password: 'admin123',  name: 'Admin',         role: 'admin' },
    { email: 'principal@college.edu', password: 'principal', name: 'Dr. Principal', role: 'admin' },
  ],
  student: [
    { email: 'arjun@college.edu',   password: 'student123', name: 'Arjun Krishnan', role: 'student', id: 1 },
    { email: 'meera@college.edu',   password: 'student123', name: 'Meera Thomas',   role: 'student', id: 2 },
    { email: 'rahul@college.edu',   password: 'student123', name: 'Rahul Varma',    role: 'student', id: 3 },
  ],
};

export default function Login({ onLogin }) {
  const [role, setRole]       = useState('admin');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const fillDemo = () => {
    const demo = role === 'admin' ? CREDENTIALS.admin[0] : CREDENTIALS.student[0];
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const list = CREDENTIALS[role];
    const match = list.find(u => u.email === email.trim() && u.password === password);
    if (match) {
      onLogin({ ...match });
    } else {
      setError('Invalid email or password. Try the demo credentials below.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-brand">EMS</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          College Event Management
        </div>
        <div className="login-brand-sub">
          A unified platform for managing college events, student registrations, and feedback — built for your entire team.
        </div>
        <div className="login-feat-list">
          {['Manage all college events in one place', 'Real-time registration & waitlisting', 'Team collaboration via Supabase cloud', 'Star ratings & event feedback system'].map(f => (
            <div key={f} className="login-feat">
              <div className="login-feat-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to your account to continue</div>

        {/* Role selector */}
        <div className="role-tabs">
          {[
            { id: 'admin',   icon: '🛡️', label: 'Admin' },
            { id: 'student', icon: '🎓', label: 'Student' },
          ].map(r => (
            <button key={r.id} className={`role-tab ${role === r.id ? 'active' : ''}`} onClick={() => { setRole(r.id); setEmail(''); setPassword(''); setError(''); }}>
              <div className="role-tab-icon">{r.icon}</div>
              <div className="role-tab-label">{r.label}</div>
            </button>
          ))}
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder={role === 'admin' ? 'admin@college.edu' : 'student@college.edu'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: 0 }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4 }} disabled={loading}>
            {loading ? 'Signing in…' : `Sign in as ${role === 'admin' ? 'Admin' : 'Student'}`}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 10 }}>
            Demo credentials
          </div>
          {CREDENTIALS[role].slice(0, 2).map(c => (
            <div key={c.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text2)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'monospace' }}>{c.email}</span>
              <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{c.password}</span>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={fillDemo}>
            Fill demo credentials
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          College Event Management System v1.0
        </div>
      </div>
    </div>
  );
}
