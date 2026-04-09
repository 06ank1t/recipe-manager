const router = require('express').Router();
const pool = require('../db/connection');
const auth = require('../middleware/auth');

// Get all recipes (Locked down to the logged-in user)
router.get('/', auth, async (req, res) => {
  const { ingredients, cuisine } = req.query;
  
  // Base query: Only select recipes belonging to the logged-in user
  let query = `SELECT DISTINCT r.* FROM recipes r WHERE r.user_id = ?`;
  const params = [req.user.id];

  if (ingredients) {
    const list = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length > 0) {
      // Changed from 'IN' to a dynamic list of 'LIKE' statements
      query += ` AND r.id IN (
                   SELECT ri.recipe_id FROM recipe_ingredients ri
                   JOIN ingredients i ON i.id = ri.ingredient_id
                   WHERE ${list.map(() => `i.name LIKE ?`).join(' OR ')}
                 )`;
      // Add wildcard '%' around each search term so 'ginger' matches 'ginger paste'
      params.push(...list.map(item => `%${item}%`));
    }
  }

  if (cuisine) {
    // We already have a WHERE clause (user_id = ?), so we just use AND
    query += ` AND r.cuisine = ?`;
    params.push(cuisine);
  }

  query += ` ORDER BY r.created_at DESC`;

  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

// Get single recipe (Locked down so you can't view other people's recipes)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check both the recipe ID and that the user owns it
    const [recipe] = await pool.execute('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
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

// Create recipe (auth required)
router.post('/', auth, async (req, res) => {
  const { title, description, cuisine, cook_time_minutes, servings, image_url, ingredients, steps } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO recipes (title, description, cuisine, cook_time_minutes, servings, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, cuisine || null, cook_time_minutes || null, servings || null, image_url || null, req.user.id]
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

// Delete recipe (auth + owner only)
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

// Update recipe (auth + owner only)
router.put('/:id', auth, async (req, res) => {
  const { title, description, cuisine, cook_time_minutes, servings, image_url, ingredients, steps } = req.body;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute('SELECT user_id FROM recipes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Recipe not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Not your recipe' });

    await conn.beginTransaction();
    await conn.execute(
      'UPDATE recipes SET title=?, description=?, cuisine=?, cook_time_minutes=?, servings=?, image_url=? WHERE id=?',
      [title, description||null, cuisine||null, cook_time_minutes||null, servings||null, image_url||null, req.params.id]
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
        [req.params.id, ingId, ing.quantity||null, ing.unit||null]
      );
    }
    await conn.execute('DELETE FROM steps WHERE recipe_id = ?', [req.params.id]);
    for (const [i, step] of steps.entries()) {
      if (!step?.trim()) continue;
      await conn.execute('INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)', [req.params.id, i+1, step.trim()]);
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

// Fixed: Export moved to the very bottom!
module.exports = router;
