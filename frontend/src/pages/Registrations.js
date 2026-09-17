import { useEffect, useState } from 'react';
import { api } from '../api';

const statusBadge = (s) => {
  const map = { Registered: 'badge-green', Waitlisted: 'badge-amber', Cancelled: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

function RegisterModal({ students, events, onClose, onSaved }) {
  const [studentId, setStudentId] = useState('');
  const [eventId, setEventId]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const submit = async () => {
    if (!studentId || !eventId) return setError('Select both a student and an event');
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.register({ student_id: +studentId, event_id: +eventId });
      setSuccess(`${res.message} — Status: ${res.status}`);
      setStudentId(''); setEventId('');
      setTimeout(() => onSaved(), 1200);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="serif">Register Student for Event</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error   && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">✓ {success}</div>}
          <div className="form-group">
            <label>Student *</label>
            <select className="form-control" value={studentId} onChange={e => setStudentId(e.target.value)}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} — {s.dept_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Event *</label>
            <select className="form-control" value={eventId} onChange={e => setEventId(e.target.value)}>
              <option value="">Select event</option>
              {events.map(e => (
                <option key={e.event_id} value={e.event_id}>
                  {e.event_name} — {new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Registering…' : 'Register'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Registrations() {
  const [regs, setRegs]           = useState([]);
  const [students, setStudents]   = useState([]);
  const [events, setEvents]       = useState([]);
  const [filter, setFilter]       = useState('All');
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState('');

  const STATUS_OPTS = ['All', 'Registered', 'Waitlisted', 'Cancelled'];

  const load = async () => {
    setLoading(true);
    try {
      const [r, s, e] = await Promise.all([api.getRegistrations(), api.getStudents(), api.getEvents()]);
      setRegs(r); setStudents(s); setEvents(e);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cancelReg = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    try { await api.cancelReg(id); load(); }
    catch (e) { setError(e.message); }
  };

  const filtered = filter === 'All' ? regs : regs.filter(r => r.status === filter);

  return (
    <div>
      {showModal && (
        <RegisterModal
          students={students} events={events}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          {STATUS_OPTS.map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Register Student</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        {loading ? <div className="spinner">Loading…</div> : (
          filtered.length === 0
            ? <div className="empty-state"><p>No registrations found</p></div>
            : <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Student</th><th>Event</th><th>Date</th><th>Venue</th><th>Status</th><th>Registered On</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.reg_id}>
                        <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{r.student_name}</td>
                        <td>{r.event_name}</td>
                        <td style={{ color: 'var(--muted)' }}>{new Date(r.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ color: 'var(--muted)' }}>{r.venue}</td>
                        <td>{statusBadge(r.status)}</td>
                        <td style={{ color: 'var(--muted)' }}>{new Date(r.registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td>
                          {r.status !== 'Cancelled' && (
                            <button className="btn btn-danger btn-sm" onClick={() => cancelReg(r.reg_id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        )}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
        Showing {filtered.length} of {regs.length} registrations
      </div>
    </div>
  );
}
