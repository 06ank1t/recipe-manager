import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  // Load fresh data from the server on mount
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/users/me').then(({ data }) => {
      setForm({
        username: data.username || '',
        avatar_url: data.avatar_url || '',
      });
    }).catch(() => {
      // fall back to localStorage values
      setForm({
        username: user.username || '',
        avatar_url: user.avatar_url || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    let value = e.target.value;
    if (e.target.name === 'username') value = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setForm(f => ({ ...f, [e.target.name]: value }));
    setError('');
    setSuccess('');
    if (e.target.name === 'avatar_url') setAvatarError(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.username && form.username.length < 3)
      return setError('Username must be at least 3 characters.');

    setSaving(true);
    try {
      const { data } = await api.put('/users/me', {
        username: form.username || null,
        avatar_url: form.avatar_url || null,
      });
      updateUser(data); // sync to context + localStorage
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 100 }} />;

  const displayLabel = form.username || user?.username || '';
  const avatarSrc = form.avatar_url && !avatarError ? form.avatar_url : null;
  const initial = (displayLabel || '?')[0]?.toUpperCase();

  return (
    <div style={{ minHeight: '80vh', background: 'var(--cream)', color: 'var(--ink)' }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 40%, #3d1f0e 100%)',
        padding: '48px 24px 40px',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                onError={() => setAvatarError(true)}
                style={{
                  width: 88, height: 88, borderRadius: '50%',
                  objectFit: 'cover', border: '3px solid rgba(212,168,67,0.6)',
                }}
              />
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4a843, #92610a)',
                border: '3px solid rgba(212,168,67,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 34, fontWeight: 700, color: '#fff',
              }}>
                {initial}
              </div>
            )}
          </div>

          <div>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 28, fontWeight: 700, color: '#faf7f2',
              marginBottom: 4, lineHeight: 1.2,
            }}>
              {displayLabel || 'Your Profile'}
            </h1>
            {form.username && (
              <p style={{ fontSize: 13, color: 'rgba(212,168,67,0.85)', margin: 0 }}>@{form.username}</p>
            )}
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>
              Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '36px 24px 60px' }}>
        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px 36px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, marginBottom: 24, color: 'var(--ink)' }}>
            Edit Profile
          </h2>

          {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}
          {success && <div className="success-msg" style={{ marginBottom: 20 }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Username */}
            <div className="form-group">
              <label>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--ink-muted)', fontSize: 15, pointerEvents: 'none', userSelect: 'none',
                }}>@</span>
                <input
                  name="username"
                  placeholder="alice_cooks"
                  value={form.username}
                  onChange={handleChange}
                  maxLength={30}
                  style={{ paddingLeft: 28, fontFamily: 'monospace' }}
                />
              </div>
              {form.username && (
                <span style={{ fontSize: 11, color: form.username.length >= 3 ? 'var(--herb)' : 'var(--spice)' }}>
                  {form.username.length >= 3 ? `✓ @${form.username} looks good` : 'Min. 3 characters required'}
                </span>
              )}
            </div>

            {/* Avatar URL */}
            <div className="form-group">
              <label>Profile Picture URL</label>
              <input
                name="avatar_url"
                placeholder="https://example.com/photo.jpg"
                value={form.avatar_url}
                onChange={handleChange}
                type="url"
              />
              {form.avatar_url && !avatarError && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={form.avatar_url}
                    alt="Preview"
                    onError={() => setAvatarError(true)}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--herb)' }}>✓ Preview looks good</span>
                </div>
              )}
              {form.avatar_url && avatarError && (
                <span style={{ fontSize: 12, color: 'var(--spice)' }}>⚠ Could not load this image URL</span>
              )}
            </div>

            {/* Account info (read-only) */}
            <div style={{
              background: 'var(--paper)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '14px 16px',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Account Info</p>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Account username</div>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{user?.username}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Email</div>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{user?.email}</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ padding: '12px', fontSize: 15, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
