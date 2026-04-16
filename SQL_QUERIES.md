# Recipe Manager - SQL Queries

Here is a complete list of all the SQL queries currently used in the backend, broken down by their respective route files.

### `src/routes/auth.js`
*Authentication and user registration.*
```sql
-- Register a new user
INSERT INTO users (username, email, password) VALUES (?, ?, ?);

-- Fetch user by email for login authentication
SELECT id, username, email, avatar_url, password FROM users WHERE email = ?;
```

### `src/routes/users.js`
*User profile management.*
```sql
-- Get logged-in user's profile
SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?;

-- Check if a requested username is already taken by another user
SELECT id FROM users WHERE username = ? AND id != ?;

-- Update user profile settings
UPDATE users SET username = ?, avatar_url = ? WHERE id = ?;

-- Fetch the updated profile details to return to the client
SELECT id, username, email, avatar_url FROM users WHERE id = ?;
```

### `src/routes/ingredients.js`
*Ingredient operations.*
```sql
-- Autocomplete search for ingredients
SELECT * FROM ingredients WHERE name LIKE ? LIMIT 20;
```

### `src/routes/recipes.js`
*Core recipe operations, ingredient linking, steps, and reviews.*
```sql
-- Get public recipes (Dynamic query with optional WHERE clauses for ingredients, cuisine, and difficulty)
SELECT DISTINCT r.*, u.username as author_name, ROUND(AVG(rv.rating),1) as avg_rating, COUNT(rv.id) as rating_count
FROM recipes r 
LEFT JOIN reviews rv ON r.id = rv.recipe_id
JOIN users u ON r.user_id = u.id
WHERE r.is_public = TRUE
[AND r.cuisine = ?]
[AND r.difficulty = ?]
[AND (r.title LIKE ? OR EXISTS (
  SELECT 1 FROM recipe_ingredients ri 
  JOIN ingredients i ON i.id = ri.ingredient_id 
  WHERE ri.recipe_id = r.id AND i.name LIKE ?
))] 
GROUP BY r.id ORDER BY r.created_at DESC;

-- Get the logged-in user's created recipes
SELECT r.*, ROUND(AVG(rv.rating),1) as avg_rating, COUNT(rv.id) as rating_count
FROM recipes r LEFT JOIN reviews rv ON r.id = rv.recipe_id
WHERE r.user_id = ? GROUP BY r.id ORDER BY r.created_at DESC;

-- Get a specific recipe (allows access if public OR owned by the user)
SELECT * FROM recipes WHERE id = ? AND (user_id = ? OR is_public = TRUE);

-- Get the list of ingredients mapped to a specific recipe
SELECT i.name, ri.quantity, ri.unit
FROM recipe_ingredients ri
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE ri.recipe_id = ?;

-- Get the steps for a specific recipe
SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_number;

-- Insert a new recipe
INSERT INTO recipes (title, description, cuisine, difficulty, is_public, cook_time_minutes, servings, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Lookup if an ingredient exists by exact name (used during creation/update)
SELECT id FROM ingredients WHERE name = ?;

-- Create an ingredient if it does not exist
INSERT INTO ingredients (name) VALUES (?);

-- Map an ingredient to a recipe (many-to-many relationship)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?);

-- Add an instruction step to a recipe
INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?);

-- Check owner permission before an update or delete
SELECT user_id FROM recipes WHERE id = ?;

-- Update basic recipe details
UPDATE recipes SET title=?, description=?, cuisine=?, difficulty=?, is_public=?, cook_time_minutes=?, servings=?, image_url=? WHERE id=?;

-- Delete recipe ingredients before applying an update
DELETE FROM recipe_ingredients WHERE recipe_id = ?;

-- Delete recipe steps before applying an update
DELETE FROM steps WHERE recipe_id = ?;

-- Update recipe visibility separately (e.g. Publish / Unpublish)
UPDATE recipes SET is_public=? WHERE id=?;

-- Delete a recipe entirely
DELETE FROM recipes WHERE id = ?;

-- Get all reviews associated with a recipe
SELECT rv.*, u.username as user_name FROM reviews rv
JOIN users u ON u.id = rv.user_id
WHERE rv.recipe_id = ? ORDER BY rv.created_at DESC;

-- Post a review for a recipe
INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?,?,?,?);
```
