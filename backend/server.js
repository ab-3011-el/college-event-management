const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Database Connection ───────────────────────────────────────────────────────
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
});

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed");
    console.error(err);
    process.exit(1);
  }

  console.log("✅ Connected to MySQL database");
  conn.release();
});

// ─── DEPARTMENTS ───────────────────────────────────────────────────────────────
app.get('/api/departments', (req, res) => {
  db.query('SELECT * FROM Department ORDER BY dept_name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ─── EVENTS ───────────────────────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  const { category, dept_id } = req.query;
  let sql = `
    SELECT e.*, d.dept_name,
      (SELECT COUNT(*) FROM Registration r WHERE r.event_id = e.event_id AND r.status = 'Registered') AS registered_count,
      ROUND((SELECT AVG(f.rating) FROM Feedback f WHERE f.event_id = e.event_id), 1) AS avg_rating
    FROM Event e
    JOIN Department d ON e.dept_id = d.dept_id
    WHERE 1=1
  `;
  const params = [];
  if (category)  { sql += ' AND e.category = ?';  params.push(category); }
  if (dept_id)   { sql += ' AND e.dept_id = ?';   params.push(dept_id); }
  sql += ' ORDER BY e.event_date ASC';

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/events/:id', (req, res) => {
  const sql = `
    SELECT e.*, d.dept_name,
      (SELECT COUNT(*) FROM Registration r WHERE r.event_id = e.event_id AND r.status = 'Registered') AS registered_count,
      ROUND((SELECT AVG(f.rating) FROM Feedback f WHERE f.event_id = e.event_id), 1) AS avg_rating
    FROM Event e
    JOIN Department d ON e.dept_id = d.dept_id
    WHERE e.event_id = ?
  `;
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  });
});

app.post('/api/events', (req, res) => {
  const { event_name, event_date, event_time, venue, category, dept_id, max_participants } = req.body;
  if (!event_name || !event_date || !event_time || !venue || !dept_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.query(
    'INSERT INTO Event (event_name, event_date, event_time, venue, category, dept_id, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [event_name, event_date, event_time, venue, category, dept_id, max_participants || 100],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Event created', event_id: result.insertId });
    }
  );
});

app.delete('/api/events/:id', (req, res) => {
  db.query('DELETE FROM Event WHERE event_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Event deleted' });
  });
});

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
app.get('/api/students', (req, res) => {
  const sql = `
    SELECT s.*, d.dept_name,
      (SELECT COUNT(*) FROM Registration r WHERE r.student_id = s.student_id) AS total_registrations
    FROM Student s
    JOIN Department d ON s.dept_id = d.dept_id
    ORDER BY s.name
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/students', (req, res) => {
  const { name, email, phone, dept_id, year_of_study } = req.body;
  if (!name || !email || !dept_id || !year_of_study) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.query(
    'INSERT INTO Student (name, email, phone, dept_id, year_of_study) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, dept_id, year_of_study],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Student registered', student_id: result.insertId });
    }
  );
});

// ─── REGISTRATIONS ────────────────────────────────────────────────────────────
app.get('/api/registrations', (req, res) => {
  const { event_id, student_id } = req.query;
  let sql = `
    SELECT r.*, s.name AS student_name, s.email,
           e.event_name, e.event_date, e.venue
    FROM Registration r
    JOIN Student s ON r.student_id = s.student_id
    JOIN Event   e ON r.event_id   = e.event_id
    WHERE 1=1
  `;
  const params = [];
  if (event_id)   { sql += ' AND r.event_id = ?';   params.push(event_id); }
  if (student_id) { sql += ' AND r.student_id = ?'; params.push(student_id); }
  sql += ' ORDER BY r.registered_at DESC';

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/registrations', (req, res) => {
  const { student_id, event_id } = req.body;
  if (!student_id || !event_id) return res.status(400).json({ error: 'student_id and event_id required' });

  // Check capacity
  const checkSql = `
    SELECT e.max_participants,
      (SELECT COUNT(*) FROM Registration r WHERE r.event_id = e.event_id AND r.status = 'Registered') AS registered_count
    FROM Event e WHERE e.event_id = ?
  `;
  db.query(checkSql, [event_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });

    const { max_participants, registered_count } = rows[0];
    const status = registered_count >= max_participants ? 'Waitlisted' : 'Registered';

    db.query(
      'INSERT INTO Registration (student_id, event_id, status) VALUES (?, ?, ?)',
      [student_id, event_id, status],
      (err2, result) => {
        if (err2) {
          if (err2.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Already registered for this event' });
          return res.status(500).json({ error: err2.message });
        }
        res.status(201).json({ message: `Registration successful (${status})`, status, reg_id: result.insertId });
      }
    );
  });
});

app.patch('/api/registrations/:id/cancel', (req, res) => {
  db.query(
    "UPDATE Registration SET status = 'Cancelled' WHERE reg_id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Registration cancelled' });
    }
  );
});

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────
app.get('/api/feedback/:event_id', (req, res) => {
  db.query(
    `SELECT f.*, s.name AS student_name FROM Feedback f
     JOIN Student s ON f.student_id = s.student_id
     WHERE f.event_id = ? ORDER BY f.submitted_at DESC`,
    [req.params.event_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/feedback', (req, res) => {
  const { student_id, event_id, rating, comments } = req.body;
  if (!student_id || !event_id || !rating) return res.status(400).json({ error: 'Missing required fields' });
  db.query(
    'INSERT INTO Feedback (student_id, event_id, rating, comments) VALUES (?, ?, ?, ?)',
    [student_id, event_id, rating, comments],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Feedback already submitted' });
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Feedback submitted', feedback_id: result.insertId });
    }
  );
});

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const queries = {
    totalEvents:   'SELECT COUNT(*) AS count FROM Event',
    totalStudents: 'SELECT COUNT(*) AS count FROM Student',
    totalRegs:     "SELECT COUNT(*) AS count FROM Registration WHERE status = 'Registered'",
    avgRating:     'SELECT ROUND(AVG(rating), 1) AS count FROM Feedback',
    upcomingEvents:`SELECT COUNT(*) AS count FROM Event WHERE event_date >= CURDATE()`,
    categoryBreakdown: `SELECT category, COUNT(*) AS count FROM Event GROUP BY category`,
    topEvents: `
      SELECT e.event_name, COUNT(r.reg_id) AS registrations
      FROM Event e LEFT JOIN Registration r ON e.event_id = r.event_id AND r.status = 'Registered'
      GROUP BY e.event_id ORDER BY registrations DESC LIMIT 5`,
    recentRegs: `
      SELECT s.name AS student_name, e.event_name, r.registered_at, r.status
      FROM Registration r
      JOIN Student s ON r.student_id = s.student_id
      JOIN Event e   ON r.event_id   = e.event_id
      ORDER BY r.registered_at DESC LIMIT 8`
  };

  const results = {};
  let pending = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, rows) => {
      if (!err) {
        results[key] = ['totalEvents','totalStudents','totalRegs','avgRating','upcomingEvents'].includes(key)
          ? rows[0].count
          : rows;
      }
      if (--pending === 0) res.json(results);
    });
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
