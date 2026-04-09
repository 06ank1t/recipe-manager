import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CUISINES = ['Italian', 'Indian', 'Mexican', 'Chinese', 'Japanese', 'French', 'American', 'Mediterranean', 'Thai', 'Other'];
const UNITS = ['', 'g', 'kg', 'ml', 'L', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'piece', 'slice', 'clove', 'pinch'];

const emptyIngredient = () => ({ name: '', quantity: '', unit: '' });

export default function AddRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', cuisine: '', cook_time_minutes: '', servings: '', image_url: ''
  });
  const [ingredients, setIngredients] = useState([emptyIngredient(), emptyIngredient()]);
  const [steps, setSteps] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Sign in to add recipes</h2>
        <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Ingredients
  const updateIngredient = (i, field, val) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  };
  const addIngredient = () => setIngredients(prev => [...prev, emptyIngredient()]);
  const removeIngredient = (i) => setIngredients(prev => prev.filter((_, idx) => idx !== i));

  // Steps
  const updateStep = (i, val) => setSteps(prev => prev.map((s, idx) => idx === i ? val : s));
  const addStep = () => setSteps(prev => [...prev, '']);
  const removeStep = (i) => setSteps(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const validIngredients = ingredients.filter(i => i.name.trim());
    const validSteps = steps.filter(s => s.trim());

    if (!form.title.trim()) return setError('Recipe title is required.');
    if (validIngredients.length === 0) return setError('Add at least one ingredient.');
    if (validSteps.length === 0) return setError('Add at least one step.');

    setLoading(true);
    try {
      const payload = {
        ...form,
        cook_time_minutes: form.cook_time_minutes ? parseInt(form.cook_time_minutes) : null,
        servings: form.servings ? parseInt(form.servings) : null,
        ingredients: validIngredients,
        steps: validSteps
      };
      const { data } = await api.post('/recipes', payload);
      navigate(`/recipes/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save recipe.');
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle = {
    background: 'var(--warm-white)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px 32px',
    marginBottom: 24
  };

  const sectionTitle = {
    fontFamily: 'Playfair Display, serif',
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    color: 'var(--ink)',
    paddingBottom: 12,
    borderBottom: '1px solid var(--border)'
  };

  return (
    <div className="page-wrap" style={{ padding: '40px 24px', maxWidth: 760 }}>
      <div className="fade-in">
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, fontWeight: 700, marginBottom: 6 }}>
          New Recipe
        </h1>
        <p style={{ color: 'var(--ink-muted)', marginBottom: 32, fontSize: 15 }}>Share a recipe with the community</p>

        {error && <div className="error-msg" style={{ marginBottom: 24 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Basic Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label>Recipe title *</label>
                <input name="title" placeholder="e.g. Garlic Butter Pasta" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" placeholder="A short description of the dish..." value={form.description} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cuisine</label>
                  <select name="cuisine" value={form.cuisine} onChange={handleChange}>
                    <option value="">Select cuisine</option>
                    {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cook time (minutes)</label>
                  <input type="number" name="cook_time_minutes" placeholder="30" min="1" value={form.cook_time_minutes} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Servings</label>
                  <input type="number" name="servings" placeholder="4" min="1" value={form.servings} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input name="image_url" placeholder="https://..." value={form.image_url} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Ingredients</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ingredients.map((ing, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                  <input placeholder={`Ingredient ${i + 1}`} value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                  <input placeholder="Amount" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)} />
                  <select value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u || '— unit —'}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    disabled={ingredients.length <= 1}
                    style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                  >×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredient} className="btn-ghost btn-sm" style={{ marginTop: 12 }}>
              + Add ingredient
            </button>
          </div>

          {/* Steps */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Instructions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--paper)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600, flexShrink: 0, marginTop: 8,
                    color: 'var(--ink-muted)'
                  }}>{i + 1}</div>
                  <textarea
                    placeholder={`Step ${i + 1}...`}
                    value={step}
                    onChange={e => updateStep(i, e.target.value)}
                    style={{ flex: 1, minHeight: 70 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    disabled={steps.length <= 1}
                    style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', fontSize: 18, cursor: 'pointer', padding: '8px 4px', lineHeight: 1 }}
                  >×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addStep} className="btn-ghost btn-sm" style={{ marginTop: 12 }}>
              + Add step
            </button>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 36px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Publish Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
