const router = require('express').Router();
const pool = require('../db/connection');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// ── GET /api/shopping-list ────────────────────────────────────────────────────
// Fetch all items for the logged-in user, ordered by creation date
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM shopping_list_items WHERE user_id = ? ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

// ── POST /api/shopping-list ───────────────────────────────────────────────────
// Add a single item
router.post('/', async (req, res) => {
  const { name, category } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Item name is required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO shopping_list_items (user_id, name, category) VALUES (?, ?, ?)',
      [req.user.id, name.trim(), category?.trim() || 'Other']
    );
    const [rows] = await pool.execute(
      'SELECT * FROM shopping_list_items WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

// ── POST /api/shopping-list/bulk ─────────────────────────────────────────────
// Add multiple items at once (used by RecipeDetail "Add to Shopping List")
// Skips items whose name already exists unchecked for this user
router.post('/bulk', async (req, res) => {
  const { items } = req.body; // [{ name, category }]
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: 'items array is required.' });

  try {
    // Fetch existing unchecked items for this user to avoid duplicates
    const [existing] = await pool.execute(
      'SELECT name FROM shopping_list_items WHERE user_id = ? AND checked = 0',
      [req.user.id]
    );
    const existingNames = new Set(existing.map(r => r.name.toLowerCase()));

    const toInsert = items.filter(i => i.name?.trim() && !existingNames.has(i.name.trim().toLowerCase()));

    if (toInsert.length === 0)
      return res.json({ added: 0, message: 'All ingredients already on your list.' });

    const placeholders = toInsert.map(() => '(?, ?, ?)').join(', ');
    const params = toInsert.flatMap(i => [req.user.id, i.name.trim(), i.category?.trim() || 'Other']);

    await pool.execute(
      `INSERT INTO shopping_list_items (user_id, name, category) VALUES ${placeholders}`,
      params
    );

    res.status(201).json({ added: toInsert.length });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

// ── PATCH /api/shopping-list/:id ─────────────────────────────────────────────
// Toggle the checked state of a single item (must belong to the logged-in user)
router.patch('/:id', async (req, res) => {
  const { checked } = req.body;
  if (typeof checked !== 'boolean')
    return res.status(400).json({ message: '`checked` (boolean) is required.' });
  try {
    const [rows] = await pool.execute(
      'SELECT user_id FROM shopping_list_items WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Item not found.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden.' });

    await pool.execute(
      'UPDATE shopping_list_items SET checked = ? WHERE id = ?',
      [checked ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Updated.' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

// ── DELETE /api/shopping-list/:id ────────────────────────────────────────────
// Remove a single item
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT user_id FROM shopping_list_items WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Item not found.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden.' });

    await pool.execute('DELETE FROM shopping_list_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

// ── DELETE /api/shopping-list ─────────────────────────────────────────────────
// Clear items: ?checked_only=true removes only checked, otherwise removes all
router.delete('/', async (req, res) => {
  const checkedOnly = req.query.checked_only === 'true';
  try {
    const query = checkedOnly
      ? 'DELETE FROM shopping_list_items WHERE user_id = ? AND checked = 1'
      : 'DELETE FROM shopping_list_items WHERE user_id = ?';
    await pool.execute(query, [req.user.id]);
    res.json({ message: 'Cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

module.exports = router;
