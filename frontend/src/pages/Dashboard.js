import { useEffect, useState } from 'react';
import { api } from '../api';

const statusBadge = (s) => {
  const map = { Registered: 'badge-green', Waitlisted: 'badge-amber', Cancelled: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading dashboard…</div>;
  if (error)   return <div className="error-msg">⚠ {error} — make sure the backend is running on port 5000.</div>;

  const topMax = Math.max(...(stats.topEvents || []).map(e => e.registrations || 1), 1);

  return (
    <div>
      {/* Stat cards */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Events',    value: stats.totalEvents,   accent: 'gold',  sub: `${stats.upcomingEvents} upcoming` },
          { label: 'Students',        value: stats.totalStudents, accent: 'blue',  sub: 'registered students' },
          { label: 'Registrations',   value: stats.totalRegs,     accent: 'teal',  sub: 'confirmed seats' },
          { label: 'Avg. Rating',     value: stats.avgRating ?? '—', accent: 'coral', sub: 'out of 5 stars' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.accent}`}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.accent}`}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: 28 }}>
        {/* Top Events */}
        <div className="card">
          <h3 className="serif section-title">Top Events by Registrations</h3>
          {(stats.topEvents || []).map(e => (
            <div key={e.event_name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{e.event_name}</span>
                <span style={{ color: 'var(--muted)' }}>{e.registrations}</span>
              </div>
              <div className="capacity-bar">
                <div className="capacity-fill" style={{ width: `${(e.registrations / topMax) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h3 className="serif section-title">Events by Category</h3>
          {(stats.categoryBreakdown || []).map(c => {
            const clsMap = { Technical: 'blue', Cultural: 'gold', Sports: 'teal' };
            const accent = clsMap[c.category] || 'muted';
            return (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span className={`badge cat-${c.category || 'default'}`}>{c.category || 'Other'}</span>
                <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: `var(--${accent})` }}>{c.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="serif section-title" style={{ marginBottom: 0 }}>Recent Registrations</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('registrations')}>View all</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Event</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(stats.recentRegs || []).map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.student_name}</td>
                  <td style={{ color: 'var(--muted)' }}>{r.event_name}</td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(r.registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
