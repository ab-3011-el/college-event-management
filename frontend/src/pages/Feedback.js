import { useEffect, useState } from 'react';
import { api } from '../api';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={`star ${n <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(n)}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
        >★</span>
      ))}
    </div>
  );
}

function FeedbackModal({ events, students, onClose, onSaved }) {
  const [form, setForm] = useState({ student_id: '', event_id: '', rating: 0, comments: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.student_id || !form.event_id || !form.rating)
      return setError('Select student, event, and give a rating');
    setLoading(true); setError('');
    try { await api.submitFeedback(form); onSaved(); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="serif">Submit Feedback</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Student *</label>
            <select className="form-control" value={form.student_id} onChange={e => set('student_id', e.target.value)}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Event *</label>
            <select className="form-control" value={form.event_id} onChange={e => set('event_id', e.target.value)}>
              <option value="">Select event</option>
              {events.map(e => <option key={e.event_id} value={e.event_id}>{e.event_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Rating *</label>
            <StarRating value={form.rating} onChange={v => set('rating', v)} />
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea
              className="form-control"
              rows={4}
              value={form.comments}
              onChange={e => set('comments', e.target.value)}
              placeholder="Share your experience…"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading || !form.rating}>{loading ? 'Submitting…' : 'Submit Feedback'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Feedback() {
  const [events, setEvents]   = useState([]);
  const [students, setStudents] = useState([]);
  const [selEvent, setSelEvent] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([api.getEvents(), api.getStudents()])
      .then(([e, s]) => { setEvents(e); setStudents(s); if (e.length) setSelEvent(String(e[0].event_id)); })
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selEvent) return;
    setLoading(true);
    api.getFeedback(selEvent)
      .then(setFeedback)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selEvent]);

  const reload = () => {
    if (selEvent) {
      setLoading(true);
      api.getFeedback(selEvent).then(setFeedback).finally(() => setLoading(false));
    }
  };

  const avg = feedback.length ? (feedback.reduce((a, f) => a + f.rating, 0) / feedback.length).toFixed(1) : null;
  const dist = [5,4,3,2,1].map(n => ({ n, count: feedback.filter(f => f.rating === n).length }));
  const selEventName = events.find(e => String(e.event_id) === selEvent)?.event_name || '';

  return (
    <div>
      {showModal && (
        <FeedbackModal
          events={events} students={students}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); reload(); }}
        />
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 28, justifyContent: 'space-between' }}>
        <select className="form-control" value={selEvent} onChange={e => setSelEvent(e.target.value)} style={{ maxWidth: 360 }}>
          {events.map(e => <option key={e.event_id} value={e.event_id}>{e.event_name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Feedback</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {feedback.length > 0 && (
        <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
          {/* Rating summary */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 56, color: 'var(--gold)', lineHeight: 1 }}>{avg}</span>
              <div>
                <StarRating value={Math.round(avg)} />
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{feedback.length} reviews</div>
              </div>
            </div>
            <hr className="divider" />
            {dist.map(d => (
              <div key={d.n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{ color: 'var(--muted)', width: 16, textAlign: 'right' }}>{d.n}</span>
                <span style={{ color: 'var(--gold)' }}>★</span>
                <div className="capacity-bar" style={{ flex: 1 }}>
                  <div className="capacity-fill" style={{ width: `${feedback.length ? (d.count / feedback.length) * 100 : 0}%`, background: 'var(--gold)' }} />
                </div>
                <span style={{ color: 'var(--muted)', width: 20 }}>{d.count}</span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="card">
            <h3 className="serif" style={{ marginBottom: 20, fontSize: 18 }}>{selEventName}</h3>
            {[
              { label: 'Total Reviews',  value: feedback.length, color: 'var(--teal)' },
              { label: 'Average Rating', value: `${avg} / 5`,    color: 'var(--gold)' },
              { label: '5-Star Reviews', value: dist[0].count,   color: 'var(--blue)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>{s.label}</span>
                <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="serif" style={{ marginBottom: 20, fontSize: 18 }}>All Reviews</h3>
        {loading ? <div className="spinner">Loading feedback…</div> : (
          feedback.length === 0
            ? <div className="empty-state"><p>No feedback yet for this event.</p></div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {feedback.map(f => (
                  <div key={f.feedback_id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 500 }}>{f.student_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StarRating value={f.rating} />
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {new Date(f.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {f.comments && <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{f.comments}</p>}
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}
