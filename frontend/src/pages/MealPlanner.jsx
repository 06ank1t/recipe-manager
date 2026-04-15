import React, { useState, useEffect } from 'react';
import api from '../api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const initPlan = () => {
  const plan = {};
  DAYS.forEach(d => {
    plan[d] = {};
    MEALS.forEach(m => { plan[d][m] = null; });
  });
  return plan;
};

// Gets a YYYY-MM-DD string for the most recent Monday at 12:00 AM
const getWeekStart = () => {
  const d = new Date();
  const day = d.getDay() || 7; // Convert Sun(0) to 7
  d.setHours(0, 0, 0, 0); 
  d.setDate(d.getDate() - day + 1); 
  return d.toISOString().split('T')[0];
};

export default function MealPlanner() {
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [plan, setPlan] = useState(() => {
    try {
      const currentWeek = getWeekStart();
      const savedWeek = localStorage.getItem('mealPlanWeek');
      
      if (savedWeek !== currentWeek) {
        localStorage.setItem('mealPlanWeek', currentWeek);
        return initPlan();
      }

      const saved = localStorage.getItem('mealPlan');
      return saved ? JSON.parse(saved) : initPlan();
    } catch {
      return initPlan();
    }
  });

  const [dragging, setDragging] = useState(null);
  const [hovering, setHovering] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data } = await api.get('/recipes/mine');
        setUserRecipes(data);
      } catch (err) {
        console.error('Failed to fetch recipes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(plan));
  }, [plan]);

  const totalTime = Object.values(plan).reduce((sum, dayPlan) =>
    sum + Object.values(dayPlan).reduce((s, r) => s + (r && r.cook_time_minutes ? r.cook_time_minutes : 0), 0), 0);

  const filledSlots = Object.values(plan).reduce((sum, dayPlan) =>
    sum + Object.values(dayPlan).filter(Boolean).length, 0);

  const openPicker = (day, meal) => { setPickerOpen({ day, meal }); setSearchQuery(''); };
  const assignRecipe = (recipe) => {
    if (!pickerOpen) return;
    setPlan(prev => ({ ...prev, [pickerOpen.day]: { ...prev[pickerOpen.day], [pickerOpen.meal]: recipe } }));
    setPickerOpen(null);
  };
  const removeRecipe = (day, meal) => setPlan(prev => ({ ...prev, [day]: { ...prev[day], [meal]: null } }));
  const handleDragStart = (day, meal) => setDragging({ day, meal });
  const handleDrop = (targetDay, targetMeal) => {
    if (!dragging) return;
    const fromRecipe = plan[dragging.day][dragging.meal];
    const toRecipe = plan[targetDay][targetMeal];
    setPlan(prev => ({
      ...prev,
      [dragging.day]: { ...prev[dragging.day], [dragging.meal]: toRecipe },
      [targetDay]: { ...prev[targetDay], [targetMeal]: fromRecipe },
    }));
    setDragging(null);
    setHovering(null);
  };

  const filteredOptions = userRecipes.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: 'var(--cream)', color: 'var(--ink)' }}>
      {/* Header */}
      <div style={{ background: 'var(--herb)', color: '#f0f7f0', padding: '2rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.65, marginBottom: '0.3rem' }}>Weekly Planning</p>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '1.2rem', lineHeight: 1, fontFamily: 'Playfair Display, serif' }}>Meal Planner</h1>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Meals planned', value: `${filledSlots} / ${DAYS.length * MEALS.length}` },
              { label: 'Total cook time', value: `${Math.floor(totalTime / 60)}h ${totalTime % 60}m` },
              { label: 'Days covered', value: DAYS.filter(d => Object.values(plan[d]).some(Boolean)).length },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.6rem 1.1rem' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1rem 3rem', overflowX: 'auto' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
          💡 Click any empty slot to add a meal · Drag cards to swap · Click × to remove
        </p>

        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px' }}>
          <thead>
            <tr>
              <th style={{ width: 80, textAlign: 'left', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: 400 }}></th>
              {DAYS.map(day => (
                <th key={day} style={{ textAlign: 'center', padding: '0.5rem 0.3rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--herb)' }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map(meal => (
              <tr key={meal}>
                <td style={{ verticalAlign: 'middle', padding: '0.3rem 0.5rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                  {meal}
                </td>
                {DAYS.map(day => {
                  const recipe = plan[day][meal];
                  const isHovered = hovering?.day === day && hovering?.meal === meal;
                  return (
                    <td key={day} style={{ verticalAlign: 'top', padding: '0.2rem' }}>
                      <div
                        draggable={!!recipe}
                        onDragStart={() => handleDragStart(day, meal)}
                        onDragOver={e => { e.preventDefault(); setHovering({ day, meal }); }}
                        onDragLeave={() => setHovering(null)}
                        onDrop={() => handleDrop(day, meal)}
                        onClick={() => !recipe && openPicker(day, meal)}
                        style={{
                          minHeight: 72, borderRadius: 10,
                          border: isHovered ? '2px dashed var(--herb)' : recipe ? '2px solid var(--border)' : '2px dashed var(--border)',
                          background: recipe ? 'var(--warm-white)' : isHovered ? 'rgba(45,106,79,0.06)' : 'var(--paper)',
                          padding: '0.5rem 0.55rem',
                          cursor: recipe ? 'grab' : 'pointer',
                          transition: 'all 0.15s',
                          position: 'relative',
                          boxShadow: recipe ? 'var(--shadow-sm)' : 'none',
                        }}
                      >
                        {recipe ? (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); removeRecipe(day, meal); }}
                              style={{ position: 'absolute', top: 4, right: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: '0.9rem', lineHeight: 1, padding: 0 }}>×</button>
                            <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>🍽️</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2, color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{recipe.title}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>{recipe.cook_time_minutes || '--'} min</div>
                          </>
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border-strong)', fontSize: '1.4rem' }}>+</div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recipe Picker Modal */}
      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setPickerOpen(null)}>
          <div style={{ background: 'var(--warm-white)', borderRadius: 16, width: '90%', maxWidth: 400, padding: '1.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.1rem', color: 'var(--ink)', fontFamily: 'Playfair Display, serif' }}>
              Add {pickerOpen.meal} — {pickerOpen.day}
            </h3>

            <input
              type="text"
              placeholder="Search your recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 280, overflowY: 'auto', paddingRight: '4px' }}>
              {filteredOptions.length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', textAlign: 'center', fontSize: '0.9rem', padding: '1rem 0' }}>
                  {userRecipes.length === 0 ? "You haven't added any recipes yet!" : 'No recipes match your search.'}
                </p>
              ) : (
                filteredOptions.map(r => (
                  <button key={r.id} onClick={() => assignRecipe(r)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.9rem', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', color: 'var(--ink)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--herb-light)'; e.currentTarget.style.borderColor = 'var(--herb)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <span style={{ fontSize: '1.6rem' }}>🍽️</span>
                    <span>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{r.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{r.cook_time_minutes || '--'} min {r.cuisine ? `· ${r.cuisine}` : ''}</div>
                    </span>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setPickerOpen(null)}
              style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', borderRadius: 10, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--ink-muted)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}