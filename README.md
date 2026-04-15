# 🍳 Recipo — Personal Recipe Manager

A full-stack web application for saving, browsing, and discovering recipes. Search by ingredients you already have, plan your weekly meals, build a shopping list, and rate community recipes.

---

## ✨ Features

- **Browse** — explore all public recipes from the community, filterable by cuisine and ingredient
- **My Recipes** — manage your personal collection with visibility toggles (public / private)
- **Recipe Detail** — full instructions, ingredient list, metadata, and a star-based review system
- **Meal Planner** — drag-and-drop weekly meal planning grid, saved to local storage
- **Shopping List** — searchable ingredient database with custom item support and progress tracking
- **Auth** — JWT-based registration & login with protected routes
- **Dark Mode** — full site-wide dark/light toggle

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | Vanilla CSS with CSS custom properties (design tokens) |
| **Backend** | Node.js, Express 5 |
| **Database** | MySQL (via `mysql2` connection pool) |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |
| **Fonts** | Google Fonts — Playfair Display, DM Sans |

---

## 📁 Project Structure

```
recipe-manager/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── connection.js       # MySQL pool
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── auth.js             # POST /register, POST /login
│   │   │   ├── recipes.js          # Full CRUD + reviews
│   │   │   └── ingredients.js      # Ingredient search
│   │   └── index.js                # Express app entry point
│   ├── .env                        # Environment variables (not committed)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx            # Browse + ingredient search
    │   │   ├── MyRecipes.jsx       # Personal recipe collection
    │   │   ├── RecipeDetail.jsx    # Recipe view + reviews
    │   │   ├── AddRecipe.jsx       # Create recipe form
    │   │   ├── EditRecipe.jsx      # Edit recipe form
    │   │   ├── MealPlanner.jsx     # Weekly drag-and-drop planner
    │   │   ├── ShoppingList.jsx    # Grocery list builder
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── RecipeCard.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx      # User session state
    │   │   └── ThemeContext.jsx     # Dark/light mode
    │   ├── api/                    # Axios instance with base URL + auth header
    │   ├── index.css               # Global design system + dark mode tokens
    │   └── main.jsx
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+
- **npm** v9+

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/recipe-manager.git
cd recipe-manager
```

### 2. Set up the database

Log in to MySQL and run:

```sql
CREATE DATABASE recipe_manager;
CREATE USER 'recipe_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON recipe_manager.* TO 'recipe_user'@'localhost';
FLUSH PRIVILEGES;
```

Then import the schema (from the project root):

```bash
mysql -u recipe_user -p recipe_manager < lab_backup.sql
```

### 3. Configure the backend environment

```bash
cd backend
cp .env.example .env   # or create .env manually
```

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=recipe_user
DB_PASSWORD=your_password
DB_NAME=recipe_manager
JWT_SECRET=replace_with_a_long_random_secret
```

> [!CAUTION]
> Never commit your `.env` file. Make sure it's listed in `.gitignore`.

### 4. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create a new account |
| `POST` | `/login` | ❌ | Login, returns JWT token |

### Recipes — `/api/recipes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | Browse all public recipes (filter: `?cuisine=`, `?difficulty=`, `?ingredients=`) |
| `GET` | `/mine` | ✅ | Get the logged-in user's own recipes |
| `GET` | `/:id` | ✅ | Get single recipe with ingredients & steps |
| `POST` | `/` | ✅ | Create a new recipe |
| `PUT` | `/:id` | ✅ | Update a recipe (owner only) |
| `DELETE` | `/:id` | ✅ | Delete a recipe (owner only) |
| `PATCH` | `/:id/visibility` | ✅ | Toggle public/private |
| `GET` | `/:id/reviews` | ❌ | Get all reviews for a recipe |
| `POST` | `/:id/reviews` | ✅ | Submit a rating + comment (once per user) |

### Ingredients — `/api/ingredients`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Search all available ingredients |

---

## 🌙 Dark Mode

Click the **🌙 / ☀️** toggle in the navbar. The theme is persisted and applied via a `dark` class on `<body>`, driving a full CSS variable swap defined in `index.css`.

---

## 📝 License

MIT — free to use, modify, and distribute.
