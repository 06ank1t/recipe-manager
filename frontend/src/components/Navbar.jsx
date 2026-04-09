import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

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
          <Link to="/" style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontWeight: 500,
            color: isActive('/') ? 'var(--ink)' : 'var(--ink-muted)',
            background: isActive('/') ? 'var(--paper)' : 'transparent',
            transition: 'all 0.15s'
          }}>Browse</Link>

          {user && (
            <Link to="/add" style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              fontWeight: 500,
              color: isActive('/add') ? 'var(--ink)' : 'var(--ink-muted)',
              background: isActive('/add') ? 'var(--paper)' : 'transparent',
              transition: 'all 0.15s'
            }}>+ Add Recipe</Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <div style={{
                width: 34, height: 34,
                borderRadius: '50%',
                background: 'var(--gold-light)',
                border: '1.5px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
                color: 'var(--ink-soft)'
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
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
