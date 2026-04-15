import React, { useState, useEffect } from 'react';

const MASTER_INGREDIENTS = [
  // Produce
  { name: 'Apples', category: 'Produce' }, { name: 'Avocado', category: 'Produce' }, { name: 'Bananas', category: 'Produce' },
  { name: 'Bell Peppers', category: 'Produce' }, { name: 'Blueberries', category: 'Produce' }, { name: 'Broccoli', category: 'Produce' },
  { name: 'Carrots', category: 'Produce' }, { name: 'Celery', category: 'Produce' }, { name: 'Cherry Tomatoes', category: 'Produce' },
  { name: 'Cilantro', category: 'Produce' }, { name: 'Cucumber', category: 'Produce' }, { name: 'Fresh Basil', category: 'Produce' },
  { name: 'Garlic', category: 'Produce' }, { name: 'Ginger', category: 'Produce' }, { name: 'Green Beans', category: 'Produce' },
  { name: 'Green Onions', category: 'Produce' }, { name: 'Jalapenos', category: 'Produce' }, { name: 'Kale', category: 'Produce' },
  { name: 'Lemon', category: 'Produce' }, { name: 'Lime', category: 'Produce' }, { name: 'Mango', category: 'Produce' },
  { name: 'Mushrooms', category: 'Produce' }, { name: 'Onion (Red)', category: 'Produce' }, { name: 'Onion (White/Yellow)', category: 'Produce' },
  { name: 'Potatoes', category: 'Produce' }, { name: 'Spinach', category: 'Produce' }, { name: 'Strawberries', category: 'Produce' },
  { name: 'Sweet Potatoes', category: 'Produce' }, { name: 'Tomatoes', category: 'Produce' }, { name: 'Zucchini', category: 'Produce' },
  // Meat & Seafood
  { name: 'Bacon', category: 'Meat & Seafood' }, { name: 'Beef Mince', category: 'Meat & Seafood' }, { name: 'Chicken Breast', category: 'Meat & Seafood' },
  { name: 'Chicken Thighs', category: 'Meat & Seafood' }, { name: 'Pork Chops', category: 'Meat & Seafood' }, { name: 'Salmon Fillets', category: 'Meat & Seafood' },
  { name: 'Sausages', category: 'Meat & Seafood' }, { name: 'Shrimp/Prawns', category: 'Meat & Seafood' }, { name: 'Steak', category: 'Meat & Seafood' },
  { name: 'Turkey Mince', category: 'Meat & Seafood' }, { name: 'White Fish Fillets', category: 'Meat & Seafood' },
  // Dairy & Eggs
  { name: 'Butter', category: 'Dairy & Eggs' }, { name: 'Cheddar Cheese', category: 'Dairy & Eggs' }, { name: 'Cottage Cheese', category: 'Dairy & Eggs' },
  { name: 'Cream Cheese', category: 'Dairy & Eggs' }, { name: 'Double Cream', category: 'Dairy & Eggs' }, { name: 'Eggs', category: 'Dairy & Eggs' },
  { name: 'Feta Cheese', category: 'Dairy & Eggs' }, { name: 'Greek Yogurt', category: 'Dairy & Eggs' }, { name: 'Milk', category: 'Dairy & Eggs' },
  { name: 'Mozzarella', category: 'Dairy & Eggs' }, { name: 'Parmesan', category: 'Dairy & Eggs' }, { name: 'Sour Cream', category: 'Dairy & Eggs' },
  // Pantry
  { name: 'Almonds', category: 'Pantry' }, { name: 'Baking Powder', category: 'Pantry' }, { name: 'Baking Soda', category: 'Pantry' },
  { name: 'Balsamic Vinegar', category: 'Pantry' }, { name: 'Basmati Rice', category: 'Pantry' }, { name: 'Black Beans', category: 'Pantry' },
  { name: 'Bread', category: 'Pantry' }, { name: 'Brown Sugar', category: 'Pantry' }, { name: 'Canned Tomatoes', category: 'Pantry' },
  { name: 'Chickpeas', category: 'Pantry' }, { name: 'Chicken Broth/Stock', category: 'Pantry' }, { name: 'Chocolate Chips', category: 'Pantry' },
  { name: 'Coconut Milk', category: 'Pantry' }, { name: 'Coffee', category: 'Pantry' }, { name: 'Flour (All-Purpose)', category: 'Pantry' },
  { name: 'Honey', category: 'Pantry' }, { name: 'Jasmine Rice', category: 'Pantry' }, { name: 'Lentils', category: 'Pantry' },
  { name: 'Maple Syrup', category: 'Pantry' }, { name: 'Oats', category: 'Pantry' }, { name: 'Olive Oil', category: 'Pantry' },
  { name: 'Pasta (Penne)', category: 'Pantry' }, { name: 'Pasta (Spaghetti)', category: 'Pantry' }, { name: 'Peanut Butter', category: 'Pantry' },
  { name: 'Quinoa', category: 'Pantry' }, { name: 'Soy Sauce', category: 'Pantry' }, { name: 'Tomato Paste', category: 'Pantry' },
  { name: 'Vegetable Oil', category: 'Pantry' }, { name: 'White Sugar', category: 'Pantry' }, { name: 'White Vinegar', category: 'Pantry' },
  // Spices
  { name: 'Black Pepper', category: 'Spices' }, { name: 'Cayenne Pepper', category: 'Spices' }, { name: 'Chili Powder', category: 'Spices' },
  { name: 'Cinnamon', category: 'Spices' }, { name: 'Cumin', category: 'Spices' }, { name: 'Curry Powder', category: 'Spices' },
  { name: 'Dried Oregano', category: 'Spices' }, { name: 'Dried Thyme', category: 'Spices' }, { name: 'Garlic Powder', category: 'Spices' },
  { name: 'Nutmeg', category: 'Spices' }, { name: 'Onion Powder', category: 'Spices' }, { name: 'Paprika', category: 'Spices' },
  { name: 'Red Pepper Flakes', category: 'Spices' }, { name: 'Salt (Kosher/Sea)', category: 'Spices' }, { name: 'Turmeric', category: 'Spices' },
  // Frozen
  { name: 'Frozen Corn', category: 'Frozen' }, { name: 'Frozen Mixed Berries', category: 'Frozen' }, { name: 'Frozen Peas', category: 'Frozen' },
  { name: 'Frozen Spinach', category: 'Frozen' }, { name: 'Ice Cream', category: 'Frozen' }
];

const CATEGORY_ICONS = {
  'Produce': '🥦', 'Meat & Seafood': '🥩', 'Dairy & Eggs': '🧀',
  'Pantry': '🫙', 'Spices': '🌿', 'Frozen': '❄️', 'Other': '🛒'
};

export default function ShoppingList() {
  const [activeItems, setActiveItems] = useState(() => {
    try {
      const saved = localStorage.getItem('activeShoppingList');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCat, setCustomCat] = useState('Other');
  const [hideChecked, setHideChecked] = useState(false);

  useEffect(() => {
    localStorage.setItem('activeShoppingList', JSON.stringify(activeItems));
  }, [activeItems]);

  const toggleItem = (id) => setActiveItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const removeItem = (id) => setActiveItems(prev => prev.filter(i => i.id !== id));
  const clearChecked = () => setActiveItems(prev => prev.filter(i => !i.checked));
  const clearEntireList = () => {
    if (window.confirm('Are you sure you want to clear your entire active shopping list and start fresh?')) {
      setActiveItems([]);
    }
  };

  const addFromDatabase = (item) => {
    if (activeItems.some(i => i.name.toLowerCase() === item.name.toLowerCase() && !i.checked)) return;
    setActiveItems(prev => [...prev, { id: Date.now() + Math.random(), name: item.name, category: item.category, checked: false }]);
    setDbSearchQuery('');
  };

  const addCustomItem = () => {
    if (!customName.trim()) return;
    setActiveItems(prev => [...prev, { id: Date.now() + Math.random(), name: customName.trim(), category: customCat, checked: false }]);
    setCustomName('');
  };

  const visibleActiveItems = activeItems.filter(i => !hideChecked || !i.checked);
  const activeCategories = [...new Set(activeItems.map(i => i.category))];
  const groupedActiveItems = activeCategories.reduce((acc, cat) => {
    const catItems = visibleActiveItems.filter(i => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  const checkedCount = activeItems.filter(i => i.checked).length;
  const totalCount = activeItems.length;

  const filteredDatabase = dbSearchQuery.trim() === ''
    ? []
    : MASTER_INGREDIENTS.filter(i => i.name.toLowerCase().includes(dbSearchQuery.toLowerCase())).slice(0, 15);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: 'var(--cream)', color: 'var(--ink)', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ background: '#1a3a5c', color: '#eaf2ff', padding: '2rem 2rem 1.8rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.3rem' }}>Daily Planner</p>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0', lineHeight: 1, fontFamily: 'Playfair Display, serif' }}>Shopping List</h1>
            </div>
            {totalCount > 0 && (
              <button onClick={clearEntireList} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                🗑 Clear List
              </button>
            )}
          </div>

          {totalCount > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.4rem' }}>
                <span>{checkedCount} of {totalCount} items got</span>
                <span>{Math.round(checkedCount / totalCount * 100)}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${checkedCount / totalCount * 100}%`, background: '#5dd68c', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '2rem auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', padding: '0 1.5rem' }}>

        {/* LEFT: Active Shopping List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'Playfair Display, serif' }}>Active List</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none', color: 'var(--ink-muted)' }}>
                <input type="checkbox" checked={hideChecked} onChange={e => setHideChecked(e.target.checked)} style={{ accentColor: '#1a3a5c' }} />
                Hide checked
              </label>
              {checkedCount > 0 && (
                <button onClick={clearChecked} style={{ background: 'none', border: 'none', color: 'var(--spice)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  Clear Checked
                </button>
              )}
              {totalCount > 0 && (
                <button onClick={clearEntireList} style={{ background: 'none', border: 'none', color: 'var(--spice)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  Clear All
                </button>
              )}
            </div>
          </div>

          {totalCount === 0 ? (
            <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', padding: '3rem 2rem', borderRadius: 12, textAlign: 'center', color: 'var(--ink-muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
              Your list is empty.<br />Search the database to build your list for today.
            </div>
          ) : (
            <div>
              {Object.entries(groupedActiveItems).map(([cat, catItems]) => (
                <div key={cat} style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{CATEGORY_ICONS[cat] || '🛒'}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>{cat}</span>
                  </div>
                  <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    {catItems.map((item, idx) => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.75rem 1rem',
                        borderBottom: idx < catItems.length - 1 ? '1px solid var(--border)' : 'none',
                        background: item.checked ? 'var(--paper)' : 'var(--warm-white)', transition: 'background 0.2s'
                      }}>
                        <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)} style={{ accentColor: '#1a3a5c', width: 17, height: 17, cursor: 'pointer', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '0.95rem', textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--ink-faint)' : 'var(--ink)', transition: 'all 0.2s' }}>
                          {item.name}
                        </span>
                        <button onClick={() => removeItem(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--border-strong)', fontSize: '1rem', padding: '0 0.2rem', lineHeight: 1 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--spice)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--border-strong)'}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Master Database Builder */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--ink)', fontFamily: 'Playfair Display, serif' }}>Add Ingredients</h2>

          <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.2rem', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Search Master Pantry</p>
            <input
              value={dbSearchQuery}
              onChange={e => setDbSearchQuery(e.target.value)}
              placeholder="Search hundreds of ingredients..."
            />

            {dbSearchQuery && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '250px', overflowY: 'auto' }}>
                {filteredDatabase.length > 0 ? (
                  filteredDatabase.map(item => (
                    <button
                      key={item.name}
                      onClick={() => addFromDatabase(item)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', textAlign: 'left', color: 'var(--ink)' }}
                    >
                      <span>{item.name} <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginLeft: '0.5rem' }}>({item.category})</span></span>
                      <span style={{ fontSize: '1.1rem', color: '#1a3a5c' }}>+</span>
                    </button>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', textAlign: 'center', padding: '1rem 0' }}>No matches in database.</p>
                )}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.2rem' }}>
            <p style={{ margin: '0 0 0.7rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Custom Item</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input value={customName} onChange={e => setCustomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomItem()} placeholder="Item name" style={{ flex: 2, minWidth: 120 }} />
              <select value={customCat} onChange={e => setCustomCat(e.target.value)} style={{ flex: 1, minWidth: 100 }}>
                {Object.keys(CATEGORY_ICONS).map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={addCustomItem} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                + Add Custom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}