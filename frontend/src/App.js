import { useState } from 'react';
import './index.css';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Events     from './pages/Events';
import Students   from './pages/Students';
import Registrations from './pages/Registrations';
import Feedback   from './pages/Feedback';
import AdminPanel from './pages/AdminPanel';

// Nav items per role
const ADMIN_NAV = [
  { id: 'admin',         label: 'Admin Panel',    icon: '🛡️' },
  { id: 'dashboard',    label: 'Dashboard',       icon: '⊞' },
  { id: 'events',       label: 'Events',          icon: '🎪' },
  { id: 'students',     label: 'Students',        icon: '🎓' },
  { id: 'registrations',label: 'Registrations',   icon: '📋' },
  { id: 'feedback',     label: 'Feedback',        icon: '⭐' },
];

const STUDENT_NAV = [
  { id: 'dashboard',    label: 'Dashboard',       icon: '⊞' },
  { id: 'events',       label: 'Browse Events',   icon: '🎪' },
  { id: 'registrations',label: 'My Registrations',icon: '📋' },
  { id: 'feedback',     label: 'Feedback',        icon: '⭐' },
];

const PAGE_TITLES = {
  admin:         'Admin Panel',
  dashboard:     'Dashboard',
  events:        'Events',
  students:      'Students',
  registrations: 'Registrations',
  feedback:      'Feedback & Ratings',
};

const PAGES = {
  dashboard:     Dashboard,
  events:        Events,
  students:      Students,
  registrations: Registrations,
  feedback:      Feedback,
};

function Sidebar({ user, page, setPage, onLogout }) {
  const nav = user.role === 'admin' ? ADMIN_NAV : STUDENT_NAV;
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <div className="sidebar-logo-text">
          <h1>EMS</h1>
          <span>Event Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(n => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className={`user-avatar ${user.role}`}>{initials}</div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role" style={{ textTransform: 'capitalize' }}>{user.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  );
}

export default function App() {
  const [user, setUser]   = useState(null);
  const [page, setPage]   = useState('dashboard');

  const handleLogin = (u) => {
    setUser(u);
    setPage(u.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('dashboard');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const Page = page === 'admin' ? AdminPanel : (PAGES[page] || Dashboard);

  return (
    <div className="layout">
      <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} />

      <main className="main">
        <div className="topbar">
          <h2 className="serif">{PAGE_TITLES[page] || 'Dashboard'}</h2>
          <div className="topbar-right">
            <span className={`topbar-badge ${user.role}`}>
              {user.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{user.name}</span>
          </div>
        </div>

        <div className="content">
          {page === 'admin'
            ? <AdminPanel user={user} onNavigate={setPage} />
            : <Page onNavigate={setPage} user={user} />
          }
        </div>
      </main>
    </div>
  );
}
