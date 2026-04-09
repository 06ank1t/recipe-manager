import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);
        setRecipe(data);
      } catch {
        setError('Recipe not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/recipes/${id}`);
      navigate('/');
    } catch {
      alert('Failed to delete recipe.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>{error}</h2>
      <Link to="/"><button className="btn-ghost">Back to home</button></Link>
    </div>
  );

  const isOwner = user && recipe.user_id === user.id;

  return (
    <div className="fade-in">
      {/* Hero image or gradient */}
      <div style={{
        height: 280,
        background: recipe.image_url
          ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url(${recipe.image_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, var(--paper) 0%, var(--gold-light) 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 0 32px'
      }}>
        <div className="page-wrap" style={{ width: '100%' }}>
          {recipe.cuisine && (
            <span style={{
              display: 'inline-block',
              fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.9)',
              color: 'var(--ink-soft)',
              marginBottom: 10
            }}>{recipe.cuisine}</span>
          )}
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 700,
            color: recipe.image_url ? '#fff' : 'var(--ink)',
            textShadow: recipe.image_url ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            maxWidth: 700
          }}>{recipe.title}</h1>
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '36px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0,340px)', gap: 40, alignItems: 'start' }}>

          {/* Left: description + steps */}
          <div>
            {/* Meta row */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28, padding: '16px 20px', background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              {recipe.cook_time_minutes && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 2 }}>⏱</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{recipe.cook_time_minutes} min</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Cook time</div>
                </div>
              )}
              {recipe.servings && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 2 }}>👤</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{recipe.servings}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Servings</div>
                </div>
              )}
              {recipe.ingredients?.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 2 }}>🧄</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{recipe.ingredients.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Ingredients</div>
                </div>
              )}
            </div>

            {recipe.description && (
              <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 32 }}>{recipe.description}</p>
            )}

            {/* Steps */}
            {recipe.steps?.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 20 }}>Instructions</h2>
                <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recipe.steps.map((step, i) => (
                    <li key={step.id || i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--ink)', color: 'var(--cream)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, flexShrink: 0
                      }}>{i + 1}</div>
                      <div style={{
                        background: 'var(--warm-white)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '14px 18px', flex: 1,
                        fontSize: 15, lineHeight: 1.65, color: 'var(--ink-soft)'
                      }}>{step.instruction}</div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => navigate(`/recipes/${id}/edit`)}
                >
                  ✏️ Edit Recipe
                </button>
                <button
                  className="btn-danger btn-sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ opacity: deleting ? 0.7 : 1 }}
                >
                  {deleting ? 'Deleting...' : 'Delete Recipe'}
                </button>
              </div>
            )}
          </div>

          {/* Right: ingredients */}
          <div style={{ position: 'sticky', top: 84 }}>
            <div style={{
              background: 'var(--warm-white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20 }}>Ingredients</h2>
                {recipe.servings && (
                  <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>For {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</p>
                )}
              </div>
              <ul style={{ listStyle: 'none', padding: '8px 0' }}>
                {recipe.ingredients?.map((ing, i) => (
                  <li key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 22px',
                    borderBottom: i < recipe.ingredients.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: 14
                  }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{ing.name}</span>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                      {[ing.quantity, ing.unit].filter(Boolean).join(' ')}
                    </span>
                  </li>
                ))}
                {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                  <li style={{ padding: '16px 22px', color: 'var(--ink-faint)', fontSize: 14 }}>No ingredients listed.</li>
                )}
              </ul>
            </div>

            <Link to="/" style={{ display: 'block', marginTop: 16 }}>
              <button className="btn-ghost" style={{ width: '100%' }}>← Back to recipes</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
