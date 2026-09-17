import { useEffect, useState } from 'react';
import { api } from '../api';

function AddStudentModal({ depts, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', dept_id: '', year_of_study: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.dept_id || !form.year_of_study)
      return setError('Please fill all required fields');
    setLoading(true); setError('');
    try { await api.createStudent(form); onSaved(); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="serif">Add Student</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Full Name *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Arjun Krishnan" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@college.edu" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit number" />
          </div>
          <div className="card-grid card-grid-2">
            <div className="form-group">
              <label>Department *</label>
              <select className="form-control" value={form.dept_id} onChange={e => set('dept_id', e.target.value)}>
                <option value="">Select</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year of Study *</label>
              <select className="form-control" value={form.year_of_study} onChange={e => set('year_of_study', e.target.value)}>
                {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Saving…' : 'Add Student'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [depts, setDepts]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [stds, dps] = await Promise.all([api.getStudents(), api.getDepartments()]);
      setStudents(stds); setDepts(dps);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.dept_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {showModal && <AddStudentModal depts={depts} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          className="form-control"
          placeholder="Search by name, email or department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 380 }}
        />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Student</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        {loading ? <div className="spinner">Loading students…</div> : (
          filtered.length === 0
            ? <div className="empty-state"><p>No students found</p></div>
            : <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Year</th><th>Events</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.student_id}>
                        <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                        <td style={{ color: 'var(--muted)' }}>{s.email}</td>
                        <td style={{ color: 'var(--muted)' }}>{s.phone || '—'}</td>
                        <td><span className="badge badge-gray">{s.dept_name}</span></td>
                        <td style={{ color: 'var(--muted)' }}>{s.year_of_study}</td>
                        <td>
                          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--teal)' }}>
                            {s.total_registrations}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        )}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
        Showing {filtered.length} of {students.length} students
      </div>
    </div>
  );
}
