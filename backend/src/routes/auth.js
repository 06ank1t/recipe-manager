const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

// ── Register ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username?.trim() || !email?.trim() || !password)
    return res.status(400).json({ message: 'Username, email and password are required.' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username.trim(), email.trim(), hash]
    );
    res.status(201).json({ message: 'User created', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists.' });
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// ── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, avatar_url, password FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(400).json({ message: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials.' });

    const { password: _pw, ...userFields } = rows[0];
    const token = jwt.sign({ id: userFields.id, username: userFields.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userFields });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

module.exports = router;