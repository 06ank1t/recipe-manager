import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// ── Star Picker ─────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 28, padding: '0 2px', lineHeight: 1,
            color: n <= (hovered || value) ? '#d4a843' : 'var(--border-strong)',
            transition: 'color 0.1s, transform 0.1s',
            transform: n <= (hovered || value) ? 'scale(1.15)' : 'scale(1)',
          }}
        >★</button>
      ))}
    </div>
  );
}

// ── Review Card ─────────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: 'var(--warm-white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--gold-light)', border: '1.5px solid var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#92610a', flexShrink: 0,
          }}>
            {review.user_name?.[0]?.toUpperCase() || '?'}
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{review.user_name || 'Anonymous'}</span>
        </div>
        <div style={{ color: '#d4a843', fontSize: 15, letterSpacing: 1 }}>
          {'★'.repeat(review.rating)}
          <span style={{ color: 'var(--border-strong)' }}>{'★'.repeat(5 - review.rating)}</span>
        </div>
      </div>
      {review.comment && (
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
      )}
      <p style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 6, marginBottom: 0 }}>
        {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await api.get(`/recipes/${id}/reviews`);
      setReviews(data);
    } catch { /* silent */ }
  }, [id]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);
        setRecipe(data);
      } catch {
        setError('Recipe not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
    fetchReviews();
  }, [id, fetchReviews]);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) { setReviewError('Please select a star rating.'); return; }
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await api.post(`/recipes/${id}/reviews`, { rating: reviewRating, comment: reviewComment.trim() || undefined });
      setReviewSuccess('Review submitted! Thanks for your feedback.');
      setReviewRating(0);
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message === 'Already reviewed'
        ? "You've already reviewed this recipe."
        : 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const addToShoppingList = () => {
    try {
      const saved = localStorage.getItem('activeShoppingList');
      const currentList = saved ? JSON.parse(saved) : [];
      let addedCount = 0;

      recipe.ingredients.forEach(ing => {
        // Only add if not already in list (and unchecked)
        if (!currentList.some(item => item.name.toLowerCase() === ing.name.toLowerCase() && !item.checked)) {
          currentList.push({
            id: Date.now() + Math.random(),
            name: ing.name,
            category: 'Other', // default fallback
            checked: false
          });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        localStorage.setItem('activeShoppingList', JSON.stringify(currentList));
        alert(`Added ${addedCount} ingredient(s) to your Shopping List!`);
      } else {
        alert('All ingredients are already active on your Shopping List.');
      }
    } catch (err) {
      alert('Failed to add to shopping list.');
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>{error}</h2>
      <Link to="/"><button className="btn-ghost">Back to home</button></Link>
    </div>
  );

  const isOwner = user && recipe.user_id === user.id;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="fade-in">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div style={{
        height: 300,
        background: recipe.image_url
          ? `linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.6)), url(${recipe.image_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, var(--paper) 0%, var(--gold-light) 100%)',
        display: 'flex', alignItems: 'flex-end', padding: '0 0 32px',
      }}>
        <div className="page-wrap" style={{ width: '100%' }}>
          {recipe.cuisine && (
            <span style={{
              display: 'inline-block', fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.92)', color: '#3d3530', marginBottom: 10,
            }}>{recipe.cuisine}</span>
          )}
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700,
            color: recipe.image_url ? '#fff' : 'var(--ink)',
            textShadow: recipe.image_url ? '0 2px 10px rgba(0,0,0,0.4)' : 'none',
            maxWidth: 700, lineHeight: 1.2,
          }}>{recipe.title}</h1>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ color: '#d4a843', fontSize: 16 }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              <span style={{ color: recipe.image_url ? 'rgba(255,255,255,0.85)' : 'var(--ink-muted)', fontSize: 14 }}>
                {avgRating} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '36px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0,340px)', gap: 40, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ───────────────────────────────────── */}
          <div>
            {/* Meta strip */}
            <div style={{
              display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 28,
              padding: '18px 24px',
              background: 'var(--warm-white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}>
              {recipe.cook_time_minutes && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>⏱</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{recipe.cook_time_minutes} min</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Cook time</div>
                </div>
              )}
              {recipe.servings && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>👤</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{recipe.servings}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Servings</div>
                </div>
              )}
              {recipe.ingredients?.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>🧄</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{recipe.ingredients.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Ingredients</div>
                </div>
              )}
              {avgRating && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>⭐</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{avgRating}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Rating</div>
                </div>
              )}
            </div>

            {recipe.description && (
              <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.75, marginBottom: 36 }}>{recipe.description}</p>
            )}

            {/* Steps */}
            {recipe.steps?.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 20, color: 'var(--ink)' }}>Instructions</h2>
                <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recipe.steps.map((step, i) => (
                    <li key={step.id || i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      {/* Fixed-color step circle — doesn't invert in dark mode */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: '#2c1810', color: '#faf7f2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2,
                      }}>{i + 1}</div>
                      <div style={{
                        background: 'var(--warm-white)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '14px 18px', flex: 1,
                        fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)',
                      }}>{step.instruction}</div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div style={{
                marginBottom: 40, padding: '16px 20px',
                background: 'var(--paper)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)', flex: 1 }}>You created this recipe</span>
                <button className="btn-ghost btn-sm" onClick={() => navigate(`/recipes/${id}/edit`)}>✏️ Edit</button>
                <button className="btn-danger btn-sm" onClick={handleDelete} disabled={deleting} style={{ opacity: deleting ? 0.7 : 1 }}>
                  {deleting ? 'Deleting…' : '🗑 Delete'}
                </button>
              </div>
            )}

            {/* ── Reviews Section ─────────────────────────────── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--ink)', margin: 0 }}>
                  Reviews
                </h2>
                {reviews.length > 0 && (
                  <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''} · ★ {avgRating}
                  </span>
                )}
              </div>

              {/* Existing reviews */}
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 28, fontStyle: 'italic' }}>
                  No reviews yet — be the first!
                </p>
              ) : (
                <div style={{ marginBottom: 28 }}>
                  {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              )}

              {/* Submit a review — only for logged-in, non-owners */}
              {user && !isOwner && (
                <div style={{
                  background: 'var(--warm-white)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '24px 24px 20px',
                }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 16, color: 'var(--ink)' }}>
                    Leave a Review
                  </h3>

                  {reviewSuccess ? (
                    <div className="success-msg">{reviewSuccess}</div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
                          Your Rating *
                        </label>
                        <StarPicker value={reviewRating} onChange={setReviewRating} />
                      </div>
                      <div className="form-group">
                        <label>Comment <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>(optional)</span></label>
                        <textarea
                          placeholder="Share what you thought about this recipe…"
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          style={{ minHeight: 80 }}
                        />
                      </div>
                      {reviewError && <div className="error-msg">{reviewError}</div>}
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={reviewSubmitting || !reviewRating}
                        style={{ alignSelf: 'flex-start', opacity: (reviewSubmitting || !reviewRating) ? 0.6 : 1, padding: '10px 28px' }}
                      >
                        {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {!user && (
                <div style={{
                  background: 'var(--paper)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '16px 20px',
                  color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center',
                }}>
                  <Link to="/login" style={{ color: 'var(--spice)', fontWeight: 600 }}>Sign in</Link> to leave a review
                </div>
              )}

              {user && isOwner && (
                <div style={{
                  background: 'var(--paper)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '12px 16px',
                  color: 'var(--ink-faint)', fontSize: 13, fontStyle: 'italic',
                }}>
                  You can't review your own recipe.
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Ingredients ──────────────────────── */}
          <div style={{ position: 'sticky', top: 84 }}>
            <div style={{
              background: 'var(--warm-white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16,
            }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--ink)' }}>Ingredients</h2>
                {recipe.servings && (
                  <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>
                    For {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <ul style={{ listStyle: 'none', padding: '8px 0' }}>
                {recipe.ingredients?.map((ing, i) => (
                  <li key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 22px',
                    borderBottom: i < recipe.ingredients.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: 14,
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
              {recipe.ingredients?.length > 0 && (
                <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', background: 'var(--paper)' }}>
                  <button onClick={addToShoppingList} className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 14 }}>
                    🛒 Add to Shopping List
                  </button>
                </div>
              )}
            </div>

            <Link to="/" style={{ display: 'block' }}>
              <button className="btn-ghost" style={{ width: '100%' }}>← Back to recipes</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
