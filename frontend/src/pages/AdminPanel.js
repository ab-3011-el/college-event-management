import { useEffect, useState } from 'react';
import { api } from '../api';

const statusBadge = (s) => {
  const map = { Registered: 'badge-green', Waitlisted: 'badge-amber', Cancelled: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

// ── Quick Stats ──────────────────────────────────────────────
function QuickStats({ stats }) {
  const items = [
    { icon: '🎪', label: 'Total Events',   value: stats.totalEvents,   accent: 'blue',  sub: `${stats.upcomingEvents} upcoming` },
    { icon: '🎓', label: 'Students',       value: stats.totalStudents, accent: 'teal',  sub: 'enrolled' },
    { icon: '✅', label: 'Registrations',  value: stats.totalRegs,     accent: 'green', sub: 'confirmed' },
    { icon: '⭐', label: 'Avg Rating',     value: stats.avgRating ?? '—', accent: 'amber', sub: 'out of 5' },
  ];
  return (
    <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
      {items.map(s => (
        <div key={s.label} className="stat-card">
          <div className={`stat-icon ${s.accent}`}>{s.icon}</div>
          <div className="stat-body">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.accent}`}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Manage Events ────────────────────────────────────────────
function ManageEvents({ onNavigate }) {
  const [events, setEvents]   = useState([]);
  const [depts, setDepts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ event_name: '', event_date: '', event_time: '', venue: '', category: 'Technical', dept_id: '', max_participants: 100 });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getEvents(), api.getDepartments()])
      .then(([e, d]) => { setEvents(e); setDepts(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createEvent = async () => {
    if (!form.event_name || !form.event_date || !form.event_time || !form.venue || !form.dept_id)
      return setError('Fill all required fields');
    setError('');
    try {
      await api.createEvent(form);
      setSuccess('Event created!'); setShowForm(false);
      setForm({ event_name: '', event_date: '', event_time: '', venue: '', category: 'Technical', dept_id: '', max_participants: 100 });
      load(); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.deleteEvent(id); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="section-header">
        <h3 className="serif section-title" style={{ marginBottom: 0 }}>Manage Events</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Event'}
        </button>
      </div>
      {success && <div className="success-msg">✓ {success}</div>}
      {error   && <div className="error-msg">⚠ {error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>New Event</div>
          <div className="card-grid card-grid-2">
            <div className="form-group">
              <label>Event Name *</label>
              <input className="form-control" value={form.event_name} onChange={e => set('event_name', e.target.value)} placeholder="e.g. TechFest 2025" />
            </div>
            <div className="form-group">
              <label>Venue *</label>
              <input className="form-control" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Main Auditorium" />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" className="form-control" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input type="time" className="form-control" value={form.event_time} onChange={e => set('event_time', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                {['Technical','Cultural','Sports'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select className="form-control" value={form.dept_id} onChange={e => set('dept_id', e.target.value)}>
                <option value="">Select</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Max Participants</label>
              <input type="number" className="form-control" value={form.max_participants} onChange={e => set('max_participants', +e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={createEvent}>Create Event</button>
        </div>
      )}

      <div className="card">
        {loading ? <div className="spinner">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Category</th><th>Registered</th><th>Action</th></tr></thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.event_id}>
                    <td style={{ fontWeight: 600 }}>{e.event_name}</td>
                    <td>{new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ color: 'var(--muted)' }}>{e.venue}</td>
                    <td><span className={`cat-badge cat-${e.category || 'default'}`}>{e.category}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>{e.registered_count}</span> / {e.max_participants}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteEvent(e.event_id)}>Delete</button></td>
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

// ── Manage Students ──────────────────────────────────────────
function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [depts, setDepts]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', dept_id: '', year_of_study: new Date().getFullYear() });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getStudents(), api.getDepartments()])
      .then(([s, d]) => { setStudents(s); setDepts(d); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addStudent = async () => {
    if (!form.name || !form.email || !form.dept_id) return setError('Fill required fields');
    setError('');
    try {
      await api.createStudent(form);
      setSuccess('Student added!'); setShowForm(false);
      setForm({ name: '', email: '', phone: '', dept_id: '', year_of_study: new Date().getFullYear() });
      load(); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="section-header">
        <h3 className="serif section-title" style={{ marginBottom: 0 }}>Manage Students</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="form-control" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>{showForm ? '✕' : '+ Add'}</button>
        </div>
      </div>
      {success && <div className="success-msg">✓ {success}</div>}
      {error   && <div className="error-msg">⚠ {error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-grid card-grid-2">
            <div className="form-group"><label>Name *</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" /></div>
            <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@college.edu" /></div>
            <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div className="form-group">
              <label>Department *</label>
              <select className="form-control" value={form.dept_id} onChange={e => set('dept_id', e.target.value)}>
                <option value="">Select</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <select className="form-control" value={form.year_of_study} onChange={e => set('year_of_study', e.target.value)}>
                {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={addStudent}>Add Student</button>
        </div>
      )}

      <div className="card">
        {loading ? <div className="spinner">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Dept</th><th>Year</th><th>Events</th></tr></thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.student_id}>
                    <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.email}</td>
                    <td><span className="badge badge-blue">{s.dept_name}</span></td>
                    <td>{s.year_of_study}</td>
                    <td style={{ fontWeight: 700, color: 'var(--teal)' }}>{s.total_registrations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>{filtered.length} of {students.length} students</div>
      </div>
    </div>
  );
}

// ── Manage Registrations ─────────────────────────────────────
function ManageRegistrations() {
  const [regs, setRegs]         = useState([]);
  const [students, setStudents] = useState([]);
  const [events, setEvents]     = useState([]);
  const [filter, setFilter]     = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [eventId, setEventId]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getRegistrations(), api.getStudents(), api.getEvents()])
      .then(([r, s, e]) => { setRegs(r); setStudents(s); setEvents(e); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const doRegister = async () => {
    if (!studentId || !eventId) return setError('Select student and event');
    setError('');
    try {
      const res = await api.register({ student_id: +studentId, event_id: +eventId });
      setSuccess(`${res.message} (${res.status})`);
      setShowForm(false); setStudentId(''); setEventId('');
      load(); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
  };

  const cancelReg = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    try { await api.cancelReg(id); load(); } catch (e) { setError(e.message); }
  };

  const STATUS = ['All','Registered','Waitlisted','Cancelled'];
  const filtered = filter === 'All' ? regs : regs.filter(r => r.status === filter);

  return (
    <div>
      <div className="section-header">
        <h3 className="serif section-title" style={{ marginBottom: 0 }}>Registrations</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="filter-bar" style={{ margin: 0 }}>
            {STATUS.map(s => <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>{s}</button>)}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Register</button>
        </div>
      </div>
      {success && <div className="success-msg">✓ {success}</div>}
      {error   && <div className="error-msg">⚠ {error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-grid card-grid-2">
            <div className="form-group">
              <label>Student</label>
              <select className="form-control" value={studentId} onChange={e => setStudentId(e.target.value)}>
                <option value="">Select student</option>
                {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Event</label>
              <select className="form-control" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Select event</option>
                {events.map(e => <option key={e.event_id} value={e.event_id}>{e.event_name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={doRegister}>Register</button>
        </div>
      )}

      <div className="card">
        {loading ? <div className="spinner">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Event</th><th>Date</th><th>Status</th><th>Registered On</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.reg_id}>
                    <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                    <td>{r.event_name}</td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(r.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(r.registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>{r.status !== 'Cancelled' && <button className="btn btn-danger btn-sm" onClick={() => cancelReg(r.reg_id)}>Cancel</button>}</td>
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

// ── Main Admin Page ──────────────────────────────────────────
const ADMIN_TABS = [
  { id: 'overview',       label: 'Overview',       icon: '⊞' },
  { id: 'events',         label: 'Events',          icon: '🎪' },
  { id: 'students',       label: 'Students',        icon: '🎓' },
  { id: 'registrations',  label: 'Registrations',   icon: '📋' },
];

export default function AdminPanel({ user }) {
  const [tab, setTab]     = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      {/* Admin tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
        {ADMIN_TABS.map(t => (
          <button
            key={t.id}
            className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          {stats ? <QuickStats stats={stats} /> : <div className="spinner">Loading stats…</div>}

          {stats && (
            <div className="card-grid card-grid-2">
              <div className="card">
                <h3 className="serif section-title" style={{ fontSize: 16 }}>Top Events</h3>
                {(stats.topEvents || []).map(e => {
                  const max = Math.max(...stats.topEvents.map(x => x.registrations || 1), 1);
                  return (
                    <div key={e.event_name} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>{e.event_name}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{e.registrations}</span>
                      </div>
                      <div className="capacity-bar">
                        <div className="capacity-fill" style={{ width: `${(e.registrations / max) * 100}%`, background: 'var(--primary)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card">
                <h3 className="serif section-title" style={{ fontSize: 16 }}>Recent Activity</h3>
                {(stats.recentRegs || []).slice(0, 6).map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.student_name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{r.event_name}</div>
                    </div>
                    <span className={`badge ${r.status === 'Registered' ? 'badge-green' : r.status === 'Waitlisted' ? 'badge-amber' : 'badge-red'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'events'        && <ManageEvents />}
      {tab === 'students'      && <ManageStudents />}
      {tab === 'registrations' && <ManageRegistrations />}
    </div>
  );
}
