const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'fitness-super-secret-key-123';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ---

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, age, weight, height, goal, createdAt } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, email, password, age, weight, height, goal, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [name, email, hashedPassword, age, weight, height, goal, createdAt], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      
      const user = { id: this.lastID, name, email, age, weight, height, goal, createdAt };
      const token = jwt.sign({ email, id: user.id }, JWT_SECRET);
      res.status(201).json({ user, token });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign({ email, id: user.id }, JWT_SECRET);
    res.json({ user: userWithoutPassword, token });
  });
});

// --- WORKOUTS ---
app.get('/api/workouts', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM workouts WHERE userEmail = ? ORDER BY id DESC`, [req.user.email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/workouts', authenticateToken, (req, res) => {
  const { type, exercise, duration, calories, sets, reps, date, notes, createdAt } = req.body;
  const query = `INSERT INTO workouts (userEmail, type, exercise, duration, calories, sets, reps, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [req.user.email, type, exercise, duration, calories, sets, reps, date, notes, createdAt], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, userEmail: req.user.email, ...req.body });
  });
});

// --- MEALS ---
app.get('/api/meals', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM meals WHERE userEmail = ? ORDER BY id DESC`, [req.user.email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/meals', authenticateToken, (req, res) => {
  const { name, type, calories, protein, carbs, fats, date, createdAt } = req.body;
  const query = `INSERT INTO meals (userEmail, name, type, calories, protein, carbs, fats, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [req.user.email, name, type, calories, protein, carbs, fats, date, createdAt], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, userEmail: req.user.email, ...req.body });
  });
});

// --- SLEEP ---
app.get('/api/sleep', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM sleep WHERE userEmail = ? ORDER BY id DESC`, [req.user.email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/sleep', authenticateToken, (req, res) => {
  const { hours, quality, bedTime, wakeTime, date, createdAt } = req.body;
  const query = `INSERT INTO sleep (userEmail, hours, quality, bedTime, wakeTime, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [req.user.email, hours, quality, bedTime, wakeTime, date, createdAt], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, userEmail: req.user.email, ...req.body });
  });
});

// --- HEART RATES ---
app.get('/api/heart-rates', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM heart_rates WHERE userEmail = ? ORDER BY id DESC`, [req.user.email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/heart-rates', authenticateToken, (req, res) => {
  const { rate, type, date, createdAt } = req.body;
  const query = `INSERT INTO heart_rates (userEmail, rate, type, date, createdAt) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [req.user.email, rate, type, date, createdAt], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, userEmail: req.user.email, ...req.body });
  });
});

// --- ACTIVITIES ---
app.get('/api/activities', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM activities WHERE userEmail = ? ORDER BY id DESC LIMIT 50`, [req.user.email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/activities', authenticateToken, (req, res) => {
  const { type, description, time } = req.body;
  const query = `INSERT INTO activities (userEmail, type, description, time) VALUES (?, ?, ?, ?)`;
  
  db.run(query, [req.user.email, type, description, time], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, userEmail: req.user.email, ...req.body });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
