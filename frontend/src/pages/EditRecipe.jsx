import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CUISINES = ['Italian', 'Indian', 'Mexican', 'Chinese', 'Japanese', 'French', 'American', 'Mediterranean', 'Thai', 'Other'];
const UNITS = ['', 'g', 'kg', 'ml', 'L', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'piece', 'slice', 'clove', 'pinch'];

export default function EditRecipe() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', cuisine: '', cook_time_minutes: '', servings: '', image_url: ''
  });
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);

        if (!user || data.user_id !== user.id) {
          navigate(`/recipes/${id}`);
          return;
        }

        setForm({
          title: data.title || '',
          description: data.description || '',
          cuisine: data.cuisine || '',
          cook_time_minutes: data.cook_time_minutes || '',
          servings: data.servings || '',
          image_url: data.image_url || ''
        });
        setIngredients(
          data.ingredients?.length
            ? data.ingredients.map(i => ({ name: i.name, quantity: i.quantity || '', unit: i.unit || '' }))
            : [{ name: '', quantity: '', unit: '' }]
        );
        setSteps(
          data.steps?.length
            ? data.steps.map(s => s.instruction)
            : ['']
        );
      } catch {
        setError('Could not load recipe.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, user]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const updateIngredient = (i, field, val) =>
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  const addIngredient = () => setIngredients(prev => [...prev, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = i => setIngredients(prev => prev.filter((_, idx) => idx !== i));

  const updateStep = (i, val) => setSteps(prev => prev.map((s, idx) => idx === i ? val : s));
  const addStep = () => setSteps(prev => [...prev, '']);
  const removeStep = i => setSteps(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const validIngredients = ingredients.filter(i => i.name.trim());
    const validSteps = steps.filter(s => s.trim());

    if (!form.title.trim()) return setError('Recipe title is required.');
    if (validIngredients.length === 0) return setError('Add at least one ingredient.');
    if (validSteps.length === 0) return setError('Add at least one step.');

    setSaving(true);
    try {
      await api.put(`/recipes/${id}`, {
        ...form,
        cook_time_minutes: form.cook_time_minutes ? parseInt(form.cook_time_minutes) : null,
        servings: form.servings ? parseInt(form.servings) : null,
        ingredients: validIngredients,
        steps: validSteps
      });
      navigate(`/recipes/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
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

  if (loading) return <div className="spinner" />;

  if (error && ingredients.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <p style={{ color: 'var(--ink-muted)' }}>{error}</p>
      <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Go home</button>
    </div>
  );

  return (
    <div className="page-wrap" style={{ padding: '40px 24px', maxWidth: 760 }}>
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <button className="btn-ghost btn-sm" onClick={() => navigate(`/recipes/${id}`)}>← Back</button>
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, fontWeight: 700, marginBottom: 6, marginTop: 16 }}>
          Edit Recipe
        </h1>
        <p style={{ color: 'var(--ink-muted)', marginBottom: 32, fontSize: 15 }}>
          Update your recipe details below
        </p>

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
                <textarea name="description" placeholder="A short description..." value={form.description} onChange={handleChange} />
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
            <button type="button" className="btn-ghost" onClick={() => navigate(`/recipes/${id}`)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '12px 36px', fontSize: 15, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
