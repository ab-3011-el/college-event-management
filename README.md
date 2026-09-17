# College Event Management System
### Full Stack: React + Node.js/Express + MySQL

---

## Project Structure

```
college-events/
├── backend/
│   ├── server.js       ← Express API server
│   ├── .env            ← DB credentials (edit this)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js              ← Layout + navigation
    │   ├── index.css           ← Global styles
    │   ├── api/index.js        ← All API calls
    │   └── pages/
    │       ├── Dashboard.js    ← Stats overview
    │       ├── Events.js       ← Event management
    │       ├── Students.js     ← Student management
    │       ├── Registrations.js← Register students
    │       └── Feedback.js     ← Ratings & reviews
    └── package.json
```

---

## Setup Instructions

### Step 1 — MySQL Database
1. Open **MySQL Workbench**
2. Run the `college_event_management.sql` file you already have
3. Make sure the database `college_events` is created with sample data

### Step 2 — Backend Setup
```bash
cd backend
npm install
```

Edit `.env` and set your MySQL password:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=college_events
PORT=5000
```

Start the server:
```bash
npm run dev        # uses nodemon (auto-restarts on save)
# OR
npm start          # plain node
```

You should see:
```
✅ Connected to MySQL database
🚀 Server running on http://localhost:5000
```

Test it: open http://localhost:5000/api/events in your browser.

### Step 3 — Frontend Setup
```bash
cd frontend
npm install
npm start
```

The React app opens at **http://localhost:3000**
(It auto-proxies API calls to port 5000 via the "proxy" in package.json)

---

## API Endpoints

| Method | Endpoint                       | Description                  |
|--------|-------------------------------|------------------------------|
| GET    | /api/stats                    | Dashboard statistics         |
| GET    | /api/events                   | All events (filter: category, dept_id) |
| GET    | /api/events/:id               | Single event details         |
| POST   | /api/events                   | Create new event             |
| DELETE | /api/events/:id               | Delete event                 |
| GET    | /api/departments              | All departments              |
| GET    | /api/students                 | All students                 |
| POST   | /api/students                 | Add new student              |
| GET    | /api/registrations            | All registrations (filter: event_id, student_id) |
| POST   | /api/registrations            | Register student (auto waitlist if full) |
| PATCH  | /api/registrations/:id/cancel | Cancel registration          |
| GET    | /api/feedback/:event_id       | Feedback for an event        |
| POST   | /api/feedback                 | Submit feedback              |

---

## Features

- **Dashboard** — Live stats: total events, students, registrations, avg rating; top events chart; recent activity
- **Events** — Browse with category filter, add new events, see capacity bars, delete events
- **Students** — Search students by name/email/dept, add new students
- **Registrations** — Register students for events (auto-waitlists when full), cancel registrations, filter by status
- **Feedback** — Star ratings per event, rating distribution chart, view all reviews

---

## Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | React 18, CSS Variables |
| Backend   | Node.js, Express 4 |
| Database  | MySQL (via mysql2) |
| Dev tools | nodemon, dotenv    |
