import { useState } from 'react';
import './AuthPages.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

async function safeFetch(url, options) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    console.error('Non-JSON response:', text.slice(0, 200));
    data = { message: `Server error (${res.status}). Please try again.` };
  }

  return { ok: res.ok, status: res.status, data };
}

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    setServerError('');
    setLoading(true);

    try {
      const { ok, data } = await safeFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (!ok) {
        setServerError(data.message || 'Login failed. Please try again.');
        return;
      }

      localStorage.setItem('ks_auth_token', data.token);
      localStorage.setItem('ks_user', JSON.stringify(data.user));
      onLoginSuccess?.(data.user);
    } catch (err) {
      setServerError('Cannot reach server. Check that the backend URL is correct and the server is running.');
      console.error('Login network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="auth-bg">
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card">
        <button className="auth-back" onClick={() => onNavigate('landing')}>
          Back
        </button>

        <div className="auth-logo">
          <span className="auth-logo-icon">🌟</span>
          <span className="auth-logo-text">KidStar</span>
        </div>

        <h1 className="auth-title">Welcome Back!</h1>
        <p className="auth-sub">Your child's adventure awaits.</p>

        {serverError && (
          <div className="auth-error-banner">
            {serverError}
          </div>
        )}

        <div className="auth-form">
          <div className="field-group">
            <label className="field-label">Parent Email</label>
            <div className={`field-wrap ${errors.email ? 'has-error' : ''}`}>
              <span className="field-icon">📧</span>
              <input
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className={`field-wrap ${errors.password ? 'has-error' : ''}`}>
              <span className="field-icon">🔒</span>
              <input
                type="password"
                className="field-input"
                placeholder="Your password"
                value={form.password}
                onChange={set('password')}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Log In'}
          </button>
        </div>

        <p className="auth-switch">
          New here?{' '}
          <button className="auth-link" onClick={() => onNavigate('signup')}>
            Create a free account
          </button>
        </p>

        <div className="auth-divider"><span>or</span></div>

        <button
          className="auth-demo-btn"
          onClick={() => {
            localStorage.setItem('ks_auth_token', 'demo');
            localStorage.setItem('ks_user', JSON.stringify({ name: 'Demo Parent', email: 'demo@kidstar.app' }));
            onLoginSuccess?.({ name: 'Demo Parent', email: 'demo@kidstar.app' });
          }}
        >
          Try Demo
        </button>
      </div>
    </div>
  );
}
