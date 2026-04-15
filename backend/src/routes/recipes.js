const router = require('express').Router();
const pool = require('../db/connection');
const auth = require('../middleware/auth');


// Get all public recipes
router.get('/', async (req, res) => {
  const { ingredients, cuisine, difficulty } = req.query;
  
  // Notice we added u.username as author_name and JOIN users u
  let query = `SELECT DISTINCT r.*, u.username as author_name, ROUND(AVG(rv.rating),1) as avg_rating, COUNT(rv.id) as rating_count
               FROM recipes r 
               LEFT JOIN reviews rv ON r.id = rv.recipe_id
               JOIN users u ON r.user_id = u.id`;
               
  const params = [];
  // STRICTLY ENFORCE privacy: only fetch recipes where is_public is true
  const wheres = ['r.is_public = TRUE'];

  if (cuisine) { 
    wheres.push('r.cuisine = ?'); 
    params.push(cuisine); 
  }
  
  if (difficulty) { 
    wheres.push('r.difficulty = ?'); 
    params.push(difficulty); 
  }
  
  if (ingredients) {
    // Split by comma or space to allow freeform entry
    const list = ingredients.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    if (list.length) {
      list.forEach(kw => {
        wheres.push(`(
          r.title LIKE ? OR 
          EXISTS (
            SELECT 1 FROM recipe_ingredients ri 
            JOIN ingredients i ON i.id = ri.ingredient_id 
            WHERE ri.recipe_id = r.id AND i.name LIKE ?
          )
        )`);
        params.push(`%${kw}%`, `%${kw}%`);
      });
    }
  }

  query += ' WHERE ' + wheres.join(' AND ');
  query += ' GROUP BY r.id ORDER BY r.created_at DESC';

  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});


router.get('/mine', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, ROUND(AVG(rv.rating),1) as avg_rating, COUNT(rv.id) as rating_count
       FROM recipes r LEFT JOIN reviews rv ON r.id = rv.recipe_id
       WHERE r.user_id = ? GROUP BY r.id ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    
    const [recipe] = await pool.execute(
      'SELECT * FROM recipes WHERE id = ? AND (user_id = ? OR is_public = TRUE)', 
      [req.params.id, req.user.id]
    );
    
    if (!recipe.length) return res.status(404).json({ message: 'Recipe not found or unauthorized' });

    const [ingredients] = await pool.execute(
      `SELECT i.name, ri.quantity, ri.unit
       FROM recipe_ingredients ri
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = ?`,
      [req.params.id]
    );

    const [steps] = await pool.execute(
      'SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_number',
      [req.params.id]
    );

    res.json({ ...recipe[0], ingredients, steps });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});


router.post('/', auth, async (req, res) => {
  const { title, description, cuisine, difficulty, is_public, cook_time_minutes, servings, image_url, ingredients, steps } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO recipes (title, description, cuisine, difficulty, is_public, cook_time_minutes, servings, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title, 
        description || null, 
        cuisine || null, 
        difficulty || null, 
        is_public || false, 
        cook_time_minutes || null, 
        servings || null, 
        image_url || null, 
        req.user.id
      ]
    );
    const recipeId = result.insertId;

    for (const ing of ingredients) {
      if (!ing.name?.trim()) continue;
      let [rows] = await conn.execute('SELECT id FROM ingredients WHERE name = ?', [ing.name.trim()]);
      let ingId = rows[0]?.id;
      if (!ingId) {
        const [r] = await conn.execute('INSERT INTO ingredients (name) VALUES (?)', [ing.name.trim()]);
        ingId = r.insertId;
      }
      await conn.execute(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
        [recipeId, ingId, ing.quantity || null, ing.unit || null]
      );
    }

    for (const [i, step] of steps.entries()) {
      if (!step?.trim()) continue;
      await conn.execute(
        'INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)',
        [recipeId, i + 1, step.trim()]
      );
    }

    await conn.commit();
    res.status(201).json({ id: recipeId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Failed to create recipe', error: err.message });
  } finally {
    conn.release();
  }
});


router.put('/:id', auth, async (req, res) => {
  const { title, description, cuisine, difficulty, is_public, cook_time_minutes, servings, image_url, ingredients, steps } = req.body;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute('SELECT user_id FROM recipes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Recipe not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Not your recipe' });

    await conn.beginTransaction();
    await conn.execute(
      'UPDATE recipes SET title=?, description=?, cuisine=?, difficulty=?, is_public=?, cook_time_minutes=?, servings=?, image_url=? WHERE id=?',
      [
        title, 
        description || null, 
        cuisine || null, 
        difficulty || null,
        is_public || false,
        cook_time_minutes || null, 
        servings || null, 
        image_url || null, 
        req.params.id
      ]
    );
    
    await conn.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [req.params.id]);
    for (const ing of ingredients) {
      if (!ing.name?.trim()) continue;
      let [ingRows] = await conn.execute('SELECT id FROM ingredients WHERE name = ?', [ing.name.trim()]);
      let ingId = ingRows[0]?.id;
      if (!ingId) {
        const [r] = await conn.execute('INSERT INTO ingredients (name) VALUES (?)', [ing.name.trim()]);
        ingId = r.insertId;
      }
      await conn.execute(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
        [req.params.id, ingId, ing.quantity || null, ing.unit || null]
      );
    }
    
    await conn.execute('DELETE FROM steps WHERE recipe_id = ?', [req.params.id]);
    for (const [i, step] of steps.entries()) {
      if (!step?.trim()) continue;
      await conn.execute('INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)', [req.params.id, i + 1, step.trim()]);
    }
    
    await conn.commit();
    res.json({ message: 'Updated' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Failed to update recipe', error: err.message });
  } finally {
    conn.release();
  }
});


router.patch('/:id/visibility', auth, async (req, res) => {
  const { is_public } = req.body;
  try {
    const [rows] = await pool.execute('SELECT user_id FROM recipes WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    
    await pool.execute('UPDATE recipes SET is_public=? WHERE id=?', [is_public, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT user_id FROM recipes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Recipe not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Not your recipe' });

    await pool.execute('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});


router.get('/:id/reviews', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT rv.*, u.username as user_name FROM reviews rv
       JOIN users u ON u.id = rv.user_id
       WHERE rv.recipe_id = ? ORDER BY rv.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});


router.post('/:id/reviews', auth, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    await pool.execute(
      'INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?,?,?,?)',
      [req.params.id, req.user.id, rating, comment || null]
    );
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Already reviewed' });
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;