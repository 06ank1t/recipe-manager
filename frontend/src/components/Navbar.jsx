import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    fontWeight: 500,
    color: isActive(path) ? 'var(--ink)' : 'var(--ink-muted)',
    background: isActive(path) ? 'var(--paper)' : 'transparent',
    transition: 'all 0.15s'
  });

  return (
    <nav style={{
      background: 'var(--warm-white)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>🍳</span>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '-0.3px'
          }}>Recipo</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Dark Mode Toggle */}
          <button onClick={toggleTheme} className="btn-ghost btn-sm" style={{ marginRight: 8, fontSize: 16 }}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <Link to="/" style={navLinkStyle('/')}>Browse</Link>

          {user && (
            <>
              <Link to="/my-recipes" style={navLinkStyle('/my-recipes')}>My Recipes</Link>
              <Link to="/meal-planner" style={navLinkStyle('/meal-planner')}>Planner</Link>
              <Link to="/shopping-list" style={navLinkStyle('/shopping-list')}>Shopping</Link>
              <Link to="/add" style={navLinkStyle('/add')}>+ Add Recipe</Link>
            </>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <Link to="/profile" title="Edit profile" style={{ display: 'flex', flexShrink: 0 }}>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    style={{
                      width: 34, height: 34, borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid var(--gold)',
                    }}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{
                  width: 34, height: 34,
                  borderRadius: '50%',
                  background: 'var(--gold-light)',
                  border: '1.5px solid var(--gold)',
                  display: user.avatar_url ? 'none' : 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--ink-soft)',
                }}>
                  {(user.username || user.name)?.[0]?.toUpperCase()}
                </div>
              </Link>
              <button onClick={handleLogout} className="btn-ghost btn-sm">Log out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
              <Link to="/login">
                <button className="btn-ghost btn-sm">Log in</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary btn-sm">Sign up</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}