import { useState } from 'react';
import './AuthPages.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const STEPS = [
  { id: 1, label: 'Your Info', icon: '👤' },
  { id: 2, label: 'Set Password', icon: '🔒' },
  { id: 3, label: 'All Done!', icon: '🎉' },
];

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

export default function SignupPage({ onNavigate, onSignupSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const nextStep = () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) {
        setErrors(e);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length) {
        setErrors(e);
        return;
      }
      setErrors({});
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setServerError('');
    setLoading(true);

    try {
      const { ok, data } = await safeFetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (!ok) {
        setServerError(data.message || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('ks_auth_token', data.token);
      localStorage.setItem('ks_user', JSON.stringify(data.user));
      setStep(3);
    } catch (err) {
      setServerError('Cannot reach server. Check that the backend URL is correct and the server is running.');
      console.error('Signup network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    const map = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: '#FF4757' },
      { score: 2, label: 'Fair', color: '#FF8C00' },
      { score: 3, label: 'Good', color: '#FFD166' },
      { score: 4, label: 'Strong', color: '#06D6A0' },
      { score: 5, label: 'Very Strong', color: '#4CC9F0' },
    ];

    return map[Math.min(score, 5)];
  };

  const strength = passwordStrength(form.password);

  return (
    <div className="auth-bg">
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card auth-card-signup">
        <button className="auth-back" onClick={() => (step > 1 ? setStep(s => s - 1) : onNavigate('landing'))}>
          {step > 1 ? 'Back' : 'Home'}
        </button>

        <div className="auth-logo">
          <span className="auth-logo-icon">🌟</span>
          <span className="auth-logo-text">KidStar</span>
        </div>

        <div className="auth-steps">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`auth-step ${step >= s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}>
              <div className="step-circle">{step > s.id ? '✓' : s.icon}</div>
              <span>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`step-line ${step > s.id ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="auth-step-content">
            <h1 className="auth-title">Join KidStar!</h1>
            <p className="auth-sub">Create a safe world of learning for your child.</p>
            {serverError && <div className="auth-error-banner">{serverError}</div>}

            <div className="auth-form">
              <div className="field-group">
                <label className="field-label">Your Name (Parent / Guardian)</label>
                <div className={`field-wrap ${errors.name ? 'has-error' : ''}`}>
                  <span className="field-icon">👤</span>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={set('name')}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className={`field-wrap ${errors.email ? 'has-error' : ''}`}>
                  <span className="field-icon">📧</span>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <button className="auth-submit" onClick={nextStep}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="auth-step-content">
            <h1 className="auth-title">Set Your Password</h1>
            <p className="auth-sub">Keep your family's account safe.</p>
            {serverError && <div className="auth-error-banner">{serverError}</div>}

            <div className="auth-form">
              <div className="field-group">
                <label className="field-label">Choose a Password</label>
                <div className={`field-wrap ${errors.password ? 'has-error' : ''}`}>
                  <span className="field-icon">🔒</span>
                  <input
                    type="password"
                    className="field-input"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    autoComplete="new-password"
                  />
                </div>
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div
                          key={n}
                          className="strength-bar"
                          style={{ background: n <= strength.score ? strength.color : 'rgba(255,255,255,0.1)' }}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span style={{ color: strength.color, fontSize: '0.78rem', fontWeight: 700 }}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                )}
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <div className={`field-wrap ${errors.confirm ? 'has-error' : ''}`}>
                  <span className="field-icon">✓</span>
                  <input
                    type="password"
                    className="field-input"
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>

              <button className="auth-submit" onClick={nextStep} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="auth-step-content auth-success">
            <div className="success-burst">🎉</div>
            <h1 className="auth-title">You're In!</h1>
            <p className="auth-sub">
              Welcome to KidStar, <strong>{form.name}</strong>!
            </p>
            <div className="success-perks">
              {['Zero ads', 'Unlimited stories & quizzes', "Track your child's progress"].map((p, i) => (
                <div key={i} className="perk-item">{p}</div>
              ))}
            </div>
            <button className="auth-submit" onClick={() => onSignupSuccess?.({ name: form.name, email: form.email })}>
              Let's Go
            </button>
          </div>
        )}

        {step < 3 && (
          <p className="auth-switch">
            Already have an account?{' '}
            <button className="auth-link" onClick={() => onNavigate('login')}>
              Log in here
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
