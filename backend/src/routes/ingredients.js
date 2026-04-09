const router = require('express').Router();
const pool = require('../db/connection');

router.get('/', async (req, res) => {
  const { q } = req.query;
  const [rows] = await pool.execute(
    'SELECT * FROM ingredients WHERE name LIKE ? LIMIT 20',
    [`%${q || ''}%`]
  );
  res.json(rows);
});

module.exports = router;