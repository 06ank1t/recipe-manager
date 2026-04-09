import { useState, useEffect } from 'react';
import api from '../api';
import RecipeCard from '../components/RecipeCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CUISINES = ['All', 'Italian', 'Indian', 'Mexican', 'Chinese', 'Japanese', 'French', 'American'];

export default function Home() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Split search state: one for typing, one for submitting
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [error, setError] = useState('');

  const fetchRecipes = async () => {
    // Prevent the API call if the user is not logged in
    if (!user) return; 

    setLoading(true);
    setError('');
    try {
      const params = {};
      // Fetch using the SUBMITTED search, not the typing input
      if (activeSearch.trim()) params.ingredients = activeSearch.trim();
      if (activeCuisine !== 'All') params.cuisine = activeCuisine;
      const { data } = await api.get('/recipes', { params });
      setRecipes(data);
    } catch {
      setError('Could not load recipes. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Run fetch whenever the activeSearch or cuisine changes
  useEffect(() => { 
    if (user) fetchRecipes(); 
  }, [activeCuisine, activeSearch, user]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Auto-clear the results if the user deletes everything in the search bar
    if (value.trim() === '' && activeSearch !== '') {
      setLoading(true); // Trigger loading instantly to prevent flash
      setActiveSearch('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Only fetch if the search is actually new
    if (searchInput !== activeSearch) {
      setLoading(true); // Trigger loading instantly to prevent flash
      setActiveSearch(searchInput);
    }
  };

  // ==========================================
  // VIEW FOR LOGGED-OUT USERS
  // ==========================================
  if (!user) {
    return (
      <div style={{
        background: 'linear-gradient(160deg, var(--paper) 0%, var(--gold-light) 100%)',
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', paddingBottom: '10vh' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>
            Welcome to Recipe Manager
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 24 }}>
            Your personal <br />
            <em style={{ color: 'var(--spice)', fontStyle: 'italic' }}>digital cookbook</em>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', marginBottom: 40, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 40px' }}>
            Login to save your own personal collection of recipes, track ingredients, and discover what you can cook with what you have on hand.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '12px 32px', borderRadius: 'var(--radius-lg)', fontSize: 15, cursor: 'pointer' }}>
                Log In
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '12px 32px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 15,
                background: 'transparent',
                border: '1.5px solid var(--ink)',
                color: 'var(--ink)',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}>
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW FOR LOGGED-IN USERS
  // ==========================================
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, var(--paper) 0%, var(--gold-light) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '56px 24px 48px',
        textAlign: 'center'
      }}>
        <div className="page-wrap">
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>
            Your personal cookbook
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
            Find recipes by<br />
            <em style={{ color: 'var(--spice)', fontStyle: 'italic' }}>what you have</em>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            Type ingredients you have on hand and discover what you can cook.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, maxWidth: 560, margin: '0 auto' }}>
            <input
              type="text"
              placeholder="chicken, garlic, tomato..."
              value={searchInput}
              onChange={handleInputChange}
              style={{ flex: 1, fontSize: 15, padding: '12px 18px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-strong)', background: 'var(--warm-white)' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 28px', borderRadius: 'var(--radius-lg)', fontSize: 15, whiteSpace: 'nowrap', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="page-wrap" style={{ padding: '36px 24px' }}>

        {/* Cuisine filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {CUISINES.map(c => (
            <button
              key={c}
              onClick={() => {
                // Trigger loading instantly when changing cuisine
                if (activeCuisine !== c) {
                  setLoading(true); 
                  setActiveCuisine(c);
                }
              }}
              style={{
                padding: '7px 18px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                border: activeCuisine === c ? '1.5px solid var(--ink)' : '1.5px solid var(--border)',
                background: activeCuisine === c ? 'var(--ink)' : 'transparent',
                color: activeCuisine === c ? 'var(--cream)' : 'var(--ink-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >{c}</button>
          ))}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 24 }}>{error}</div>}

        {loading ? (
          <div className="spinner" />
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🥘</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 8, color: 'var(--ink)' }}>No recipes found</h3>
            <p style={{ fontSize: 15, marginBottom: 24 }}>
              {activeSearch ? `No recipes with "${activeSearch}"` : 'No recipes yet.'}
            </p>
            {user && (
              <Link to="/add" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ cursor: 'pointer' }}>Add the first recipe</button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Dynamic Header Section */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: 0, fontFamily: 'Playfair Display, serif' }}>
                {(activeSearch.trim() !== '' || activeCuisine !== 'All') 
                  ? 'Search Results' 
                  : 'Your Recipes'}
              </h2>
              
              {/* Recipe count now sits nicely right next to the title */}
              {(activeSearch.trim() !== '' || activeCuisine !== 'All') && (
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
                  {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
                  {activeSearch && ` for "${activeSearch}"`}
                </p>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20
            }} className="fade-in">
              {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}