import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const CUISINES = ['All', 'Italian', 'Indian', 'Mexican', 'Chinese', 'Japanese', 'French', 'American', 'Mediterranean', 'Thai', 'Other'];

const getEmoji = (cuisine) => {
  const map = {
    Italian: '🍝', Indian: '🍛', Mexican: '🌮', Chinese: '🥡', Japanese: '🍣',
    French: '🥐', American: '🍔', Mediterranean: '🥙', Thai: '🍜'
  };
  return map[cuisine] || '🍽️';
};

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data } = await api.get('/recipes/mine');
        setRecipes(data);
      } catch (err) {
        console.error('Failed to load your recipes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const togglePublic = async (id, currentStatus) => {
    try {
      await api.patch(`/recipes/${id}/visibility`, { is_public: !currentStatus });
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, is_public: !currentStatus } : r));
    } catch {
      alert('Failed to update visibility');
    }
  };

  const filtered = recipes
    .filter(r => activeCategory === 'All' || r.cuisine === activeCategory)
    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === 'time') return (a.cook_time_minutes || 9999) - (b.cook_time_minutes || 9999);
      return a.title.localeCompare(b.title);
    });

  const validCookTimes = recipes.map(r => r.cook_time_minutes).filter(Boolean);
  const stats = {
    total: recipes.length,
    public: recipes.filter(r => r.is_public).length,
    avgRating: recipes.length
      ? (recipes.reduce((s, r) => s + parseFloat(r.avg_rating || 0), 0) / recipes.length).toFixed(1)
      : '0.0',
    quickest: validCookTimes.length ? Math.min(...validCookTimes) : '--',
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', color: 'var(--ink)' }}>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 40%, #3d1f0e 100%)',
        padding: '52px 24px 44px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blur blob */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 320, height: 320,
          borderRadius: '50%', background: 'rgba(212,168,67,0.12)', filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
            color: 'rgba(212,168,67,0.8)', marginBottom: 8
          }}>Your Culinary Archive</p>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px,4vw,42px)',
            fontWeight: 700, color: '#faf7f2', marginBottom: 32, lineHeight: 1.15
          }}>My Recipes</h1>

          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Recipes', value: stats.total, icon: '📖', accent: '#d4a843' },
              { label: 'Public', value: stats.public, icon: '🌐', accent: '#5dd68c' },
              { label: 'Avg Rating', value: `${stats.avgRating}★`, icon: '⭐', accent: '#f4c842' },
              { label: 'Quickest (min)', value: stats.quickest, icon: '⚡', accent: '#ff8c42' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14,
                padding: '14px 20px',
                minWidth: 110,
                transition: 'background 0.2s',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#faf7f2', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search your recipes…"
            style={{ flex: 1, minWidth: 200 }}
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto' }}>
            <option value="rating">Sort: Best Rated</option>
            <option value="time">Sort: Quickest</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <Link to="/add" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>+ New Recipe</button>
          </Link>
        </div>

        {/* Cuisine filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {CUISINES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: activeCategory === cat ? '1.5px solid var(--ink)' : '1.5px solid var(--border)',
              background: activeCategory === cat ? 'var(--ink)' : 'transparent',
              color: activeCategory === cat ? 'var(--cream)' : 'var(--ink-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {filtered.length > 0 && (
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>
            {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` · ${activeCategory}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </p>
        )}

        {/* ── Recipe Grid ─────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20, paddingBottom: '3rem'
        }} className="fade-in">
          {filtered.map(recipe => (
            <div key={recipe.id} style={{
              background: 'var(--warm-white)', border: '1px solid var(--border)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex', flexDirection: 'column'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              {/* Image banner */}
              <div style={{
                background: recipe.image_url
                  ? `url(${recipe.image_url}) center/cover no-repeat`
                  : 'linear-gradient(135deg, var(--paper) 0%, var(--gold-light) 100%)',
                height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
              }}>
                {!recipe.image_url && getEmoji(recipe.cuisine)}
              </div>

              <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Title + rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, flex: 1, lineHeight: 1.3, color: 'var(--ink)', fontFamily: 'Playfair Display, serif' }}>
                    {recipe.title}
                  </h3>
                  <span style={{ fontSize: 13, color: 'var(--gold)', marginLeft: 8, whiteSpace: 'nowrap', fontWeight: 600 }}>
                    ★ {recipe.avg_rating || 'New'}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 10 }}>
                  {[
                    recipe.cook_time_minutes ? `⏱ ${recipe.cook_time_minutes} min` : null,
                    recipe.servings ? `👤 ${recipe.servings}` : null,
                    recipe.cuisine || null,
                  ].filter(Boolean).join(' · ')}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, marginBottom: 12 }}>
                  {recipe.difficulty && <span className="tag">{recipe.difficulty}</span>}
                  {recipe.cuisine && <span className="tag">{recipe.cuisine}</span>}
                </div>

                {/* Public/Private toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: recipe.is_public ? 'var(--herb)' : 'var(--ink-muted)', fontWeight: 500 }}>
                    {recipe.is_public ? '🌐 Public' : '🔒 Private'}
                  </span>
                  <button onClick={() => togglePublic(recipe.id, recipe.is_public)} style={{
                    padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12,
                    background: recipe.is_public ? 'var(--spice-light)' : 'var(--herb-light)',
                    color: recipe.is_public ? 'var(--spice-dark)' : 'var(--herb)',
                    fontWeight: 500, transition: 'all 0.2s',
                  }}>
                    {recipe.is_public ? 'Make Private' : 'Make Public'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🥘</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 8, color: 'var(--ink)' }}>
                {recipes.length === 0 ? 'No recipes yet' : 'No matches found'}
              </h3>
              <p style={{ fontSize: 14, marginBottom: 24 }}>
                {recipes.length === 0
                  ? 'Start building your culinary collection.'
                  : `Try a different search or cuisine filter.`}
              </p>
              {recipes.length === 0 && (
                <Link to="/add" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary">+ Add your first recipe</button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}