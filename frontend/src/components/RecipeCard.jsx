import { Link } from 'react-router-dom';

const CUISINE_COLORS = {
  Italian: { bg: '#fef3e2', color: '#92610a' },
  Indian: { bg: '#fde8e8', color: '#922b21' },
  Mexican: { bg: '#e8f5e9', color: '#1b5e20' },
  Chinese: { bg: '#fce4ec', color: '#880e4f' },
  Japanese: { bg: '#e8eaf6', color: '#283593' },
  French: { bg: '#e3f2fd', color: '#0d47a1' },
  American: { bg: '#fff8e1', color: '#f57f17' },
};

export default function RecipeCard({ recipe }) {
  const cuisineStyle = CUISINE_COLORS[recipe.cuisine] || { bg: 'var(--paper)', color: 'var(--ink-muted)' };

  return (
    <Link to={`/recipes/${recipe.id}`} style={{ display: 'block' }}>
      <div style={{
        background: 'var(--warm-white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        height: '100%',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Image / Placeholder */}
        <div style={{
          height: 180,
          background: recipe.image_url
            ? `url(${recipe.image_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, var(--paper) 0%, var(--gold-light) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          position: 'relative'
        }}>
          {!recipe.image_url && <span>🍽️</span>}
          {recipe.cuisine && (
            <span style={{
              position: 'absolute',
              top: 10, right: 10,
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              background: cuisineStyle.bg,
              color: cuisineStyle.color,
              letterSpacing: '0.3px'
            }}>{recipe.cuisine}</span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px 18px' }}>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: 6,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{recipe.title}</h3>

          {recipe.description && (
            <p style={{
              fontSize: 13,
              color: 'var(--ink-muted)',
              marginBottom: 12,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5
            }}>{recipe.description}</p>
          )}

          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--ink-muted)' }}>
            {recipe.cook_time_minutes && (
              <span>⏱ {recipe.cook_time_minutes} min</span>
            )}
            {recipe.servings && (
              <span>👤 {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
