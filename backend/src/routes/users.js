const router = require('express').Router();
const pool = require('../db/connection');
const auth = require('../middleware/auth');

// ── GET /api/users/me ────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

// ── PUT /api/users/me ────────────────────────────────────────────────────────
router.put('/me', auth, async (req, res) => {
  const { username, avatar_url } = req.body;

  // Validate username
  if (username !== undefined && username !== null && username !== '') {
    // Check uniqueness (exclude current user)
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, req.user.id]
    );
    if (existing.length) return res.status(400).json({ message: 'Username already taken.' });
  }

  // Validate avatar URL
  if (avatar_url && avatar_url.trim()) {
    try { new URL(avatar_url.trim()); }
    catch { return res.status(400).json({ message: 'Avatar URL is not a valid URL.' }); }
  }

  try {
    await pool.execute(
      `UPDATE users SET
        username     = ?,
        avatar_url   = ?
       WHERE id = ?`,
      [
        username?.trim() || null,
        avatar_url?.trim() || null,
        req.user.id,
      ]
    );

    // Return updated profile
    const [rows] = await pool.execute(
      'SELECT id, username, email, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Username already taken.' });
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

module.exports = router;
