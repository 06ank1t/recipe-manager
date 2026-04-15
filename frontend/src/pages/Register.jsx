import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    let value = e.target.value;
    // Basic alphanumeric checking is handled by backend or could be done here,
    // but allowing normal names in the box or enforcing handle styling:
    setForm(f => ({ ...f, [e.target.name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (!form.username) return setError('Username is required.');
    if (form.username.length < 3) return setError('Username must be at least 3 characters.');

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="fade-in">

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🥗</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: 15 }}>Start building your recipe collection</p>
        </div>

        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px 36px', boxShadow: 'var(--shadow-md)'
        }}>
          {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label>Username *</label>
              <input
                name="username"
                placeholder="How should we call you?"
                value={form.username}
                onChange={handleChange}
                maxLength={30}
                required
                autoFocus
              />
              {form.username && (
                <span style={{ fontSize: 11, color: form.username.length >= 3 ? 'var(--herb)' : 'var(--spice)', marginTop: 2 }}>
                  {form.username.length >= 3 ? `✓ Looks good` : 'Min. 3 characters'}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Email address *</label>
              <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Confirm *</label>
                <input type="password" name="confirm" placeholder="••••••••" value={form.confirm} onChange={handleChange} required />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--spice)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
