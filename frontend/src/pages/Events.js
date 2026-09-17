import { useEffect, useState } from 'react';
import { api } from '../api';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports'];

const catClass = (c) => `cat-${['Technical','Cultural','Sports'].includes(c) ? c : 'default'}`;

function EventModal({ depts, onClose, onSaved }) {
  const [form, setForm] = useState({ event_name: '', event_date: '', event_time: '', venue: '', category: 'Technical', dept_id: '', max_participants: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.event_name || !form.event_date || !form.event_time || !form.venue || !form.dept_id)
      return setError('Please fill all required fields');
    setLoading(true); setError('');
    try {
      await api.createEvent(form);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="serif">Add New Event</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Event Name *</label>
            <input className="form-control" value={form.event_name} onChange={e => set('event_name', e.target.value)} placeholder="e.g. TechFest 2025" />
          </div>
          <div className="card-grid card-grid-2">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" className="form-control" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input type="time" className="form-control" value={form.event_time} onChange={e => set('event_time', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Venue *</label>
            <input className="form-control" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Main Auditorium" />
          </div>
          <div className="card-grid card-grid-2">
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                {['Technical','Cultural','Sports'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Max Participants</label>
              <input type="number" className="form-control" value={form.max_participants} onChange={e => set('max_participants', +e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Department *</label>
            <select className="form-control" value={form.dept_id} onChange={e => set('dept_id', e.target.value)}>
              <option value="">Select department</option>
              {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Saving…' : 'Create Event'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [events, setEvents]   = useState([]);
  const [depts, setDepts]     = useState([]);
  const [cat, setCat]         = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = cat !== 'All' ? { category: cat } : {};
      const [evts, dps] = await Promise.all([api.getEvents(params), api.getDepartments()]);
      setEvents(evts); setDepts(dps);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [cat]);

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event? This will also remove all registrations.')) return;
    try { await api.deleteEvent(id); load(); }
    catch (e) { setError(e.message); }
  };

  const pct = (reg, max) => Math.min(Math.round((reg / max) * 100), 100);

  return (
    <div>
      {showModal && <EventModal depts={depts} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          {CATEGORIES.map(c => (
            <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Event</button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading ? <div className="spinner">Loading events…</div> : (
        events.length === 0
          ? <div className="empty-state"><div style={{ fontSize: 40 }}>◈</div><p>No events found</p></div>
          : <div className="card-grid card-grid-3">
              {events.map(e => {
                const p = pct(e.registered_count, e.max_participants);
                const date = new Date(e.event_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <div key={e.event_id} className="event-card">
                    <div className="event-card-header">
                      <span className={`category-badge ${catClass(e.category)}`}>{e.category || 'General'}</span>
                      <h3>{e.event_name}</h3>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{e.dept_name}</div>
                    </div>
                    <div className="event-card-body">
                      <div className="event-meta">
                        <div className="event-meta-row">📅 <span>{date}</span></div>
                        <div className="event-meta-row">🕐 <span>{e.event_time?.slice(0,5)}</span></div>
                        <div className="event-meta-row">📍 <span>{e.venue}</span></div>
                        {e.avg_rating && <div className="event-meta-row">⭐ <span>{e.avg_rating} / 5</span></div>}
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                          <span>{e.registered_count} registered</span>
                          <span>{p}% full</span>
                        </div>
                        <div className="capacity-bar">
                          <div className="capacity-fill" style={{ width: `${p}%`, background: p >= 90 ? 'var(--coral)' : p >= 70 ? 'var(--gold)' : 'var(--teal)' }} />
                        </div>
                      </div>
                    </div>
                    <div className="event-card-footer">
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Max: {e.max_participants}</span>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(e.event_id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
      )}
    </div>
  );
}
