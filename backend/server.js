const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'team_register_secret_2024';

app.use(cors());
app.use(express.json());

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many login attempts, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
});

// Apply rate limiting
app.use('/api/login', loginLimiter);
app.use('/api/', apiLimiter);

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'attendance.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('office', 'wfh', 'absent')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed 13 team members
const teamMembers = [
  { username: 'alice',    password: 'pass123', name: 'Alice Johnson' },
  { username: 'bob',      password: 'pass123', name: 'Bob Smith' },
  { username: 'carol',    password: 'pass123', name: 'Carol Williams' },
  { username: 'david',    password: 'pass123', name: 'David Brown' },
  { username: 'emma',     password: 'pass123', name: 'Emma Davis' },
  { username: 'frank',    password: 'pass123', name: 'Frank Miller' },
  { username: 'grace',    password: 'pass123', name: 'Grace Wilson' },
  { username: 'henry',    password: 'pass123', name: 'Henry Moore' },
  { username: 'iris',     password: 'pass123', name: 'Iris Taylor' },
  { username: 'james',    password: 'pass123', name: 'James Anderson' },
  { username: 'karen',    password: 'pass123', name: 'Karen Thomas' },
  { username: 'liam',     password: 'pass123', name: 'Liam Jackson' },
  { username: 'mia',      password: 'pass123', name: 'Mia White' },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, password, name) VALUES (?, ?, ?)'
);
for (const member of teamMembers) {
  const hashed = bcrypt.hashSync(member.password, 10);
  insertUser.run(member.username, hashed, member.name);
}

// Middleware: verify JWT
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ── Routes ──────────────────────────────────────────────────────────────────

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
});

// GET /api/attendance/today — all members' attendance for today
app.get('/api/attendance/today', authenticate, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = db.prepare(`
    SELECT u.id, u.name, u.username,
           COALESCE(a.status, 'absent') AS status
    FROM users u
    LEFT JOIN attendance a ON a.user_id = u.id AND a.date = ?
    ORDER BY u.name
  `).all(today);
  const officeCount = rows.filter(r => r.status === 'office').length;
  res.json({ date: today, members: rows, officeCount, alert: officeCount > 5 });
});

// POST /api/attendance — mark own attendance
app.post('/api/attendance', authenticate, (req, res) => {
  const { status } = req.body;
  if (!['office', 'wfh', 'absent'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const today = new Date().toISOString().slice(0, 10);
  db.prepare(`
    INSERT INTO attendance (user_id, date, status)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP
  `).run(req.user.id, today, status);

  // Re-fetch today's count for alert
  const officeCount = db.prepare(
    "SELECT COUNT(*) as cnt FROM attendance WHERE date = ? AND status = 'office'"
  ).get(today).cnt;

  res.json({ success: true, status, officeCount, alert: officeCount > 5 });
});

// GET /api/attendance/history — last 30 days for current user
app.get('/api/attendance/history', authenticate, (req, res) => {
  const rows = db.prepare(
    "SELECT date, status FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30"
  ).all(req.user.id);
  res.json(rows);
});

// GET /api/users — list all team members
app.get('/api/users', authenticate, (req, res) => {
  const users = db.prepare('SELECT id, name, username FROM users ORDER BY name').all();
  res.json(users);
});

// Serve Angular static files
const distPath = path.join(__dirname, '../frontend/dist/frontend/browser');
app.use(express.static(distPath));

// Angular catch-all (must be after API routes)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});
