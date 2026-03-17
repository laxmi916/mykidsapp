import { useApp } from '../context/AppContext';

const BADGE_COLORS = ['#FF3D9A', '#8B5CF6', '#06B6D4', '#14F0C0', '#FFD60A', '#FF8C00'];

export default function ProfilePage({ authUser, onLogout, onNav }) {
  const { profile, xp, level, xpInLevel, badges, streak, resetAll } = useApp();

  const handleLogout = () => {
    localStorage.removeItem('ks_auth_token');
    localStorage.removeItem('ks_user');
    onLogout?.();
  };

  const handleReset = () => {
    if (window.confirm('Reset all progress? XP, badges and profile will be cleared.')) {
      resetAll();
    }
  };

  const c = profile?.color || '#8B5CF6';
  const g = profile?.glow  || 'rgba(139,92,246,0.4)';

  const stats = [
    { emoji: '⭐', label: 'Total XP',    value: xp,           color: '#FFD60A' },
    { emoji: '🚀', label: 'Level',       value: `Lv ${level}`, color: '#8B5CF6' },
    { emoji: '🔥', label: 'Day Streak',  value: streak,        color: '#FF3D9A' },
    { emoji: '🏅', label: 'Badges',      value: badges.length, color: '#14F0C0' },
  ];

  return (
    <div className="page">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={() => onNav('dashboard')}
          style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 12, padding: '8px 16px', fontSize: '.85rem', fontWeight: 700,
            color: 'var(--c-text)', cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--f-head)' }}>My Profile</h2>
        <div style={{ width: 64 }} />
      </div>

      {/* ── Avatar Card ── */}
      <div className="card" style={{
        padding: '28px 20px', marginBottom: 16, textAlign: 'center',
        background: `linear-gradient(145deg, ${c}18, var(--c-surface) 70%)`,
        borderColor: `${c}30`,
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%', margin: '0 auto 14px',
          background: `linear-gradient(135deg, ${c}, #8B5CF6)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', boxShadow: `0 0 36px ${g}`,
          border: '3px solid rgba(255,255,255,.15)',
          animation: 'pulse 3.5s ease-in-out infinite',
        }}>
          {profile?.avatar || '🦸'}
        </div>

        <h2 style={{
          fontFamily: 'var(--f-head)', fontSize: '1.6rem', lineHeight: 1.1,
          background: `linear-gradient(135deg, ${c}, #8B5CF6)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 4,
        }}>
          {profile?.heroName || profile?.name || 'Hero'}
        </h2>

        {profile?.superpower && (
          <p style={{ fontSize: '.85rem', color: 'var(--c-muted)', fontWeight: 700, marginBottom: 4 }}>
            ✨ {profile.superpower}
          </p>
        )}
        {profile?.catchphrase && (
          <p style={{
            fontSize: '.82rem', fontStyle: 'italic', color: c, fontWeight: 700,
            background: `${c}12`, borderRadius: 10, padding: '6px 14px', display: 'inline-block', marginTop: 6,
          }}>
            "{profile.catchphrase}"
          </p>
        )}
      </div>

      {/* ── Account Info ── */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.7px', textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: 12 }}>
          👤 Account Details
        </p>
        {[
          { icon: '📛', label: 'Parent Name', value: authUser?.name || '—' },
          { icon: '📧', label: 'Email',        value: authUser?.email || '—' },
          { icon: '🎂', label: 'Child Age',    value: profile?.age ? `${profile.age} years old` : '—' },
          { icon: '🌟', label: 'Child Name',   value: profile?.name || '—' },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)',
          }}>
            <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>{row.icon}</span>
            <div>
              <p style={{ fontSize: '.68rem', color: 'var(--c-muted)', fontWeight: 700, marginBottom: 1 }}>{row.label}</p>
              <p style={{ fontSize: '.9rem', fontWeight: 800 }}>{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stats Grid ── */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.7px', textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: 14 }}>
          📊 My Stats
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: `${s.color}10`, border: `1px solid ${s.color}25`,
              borderRadius: 14, padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color, fontFamily: 'var(--f-head)' }}>{s.value}</div>
              <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--c-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── XP Progress ── */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '.85rem', fontWeight: 800 }}>Level {level} Progress</span>
          <span style={{ fontSize: '.78rem', color: 'var(--c-muted)', fontWeight: 700 }}>{xpInLevel} / 100 XP</span>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${xpInLevel}%` }} />
        </div>
        <p style={{ fontSize: '.72rem', color: 'var(--c-muted)', fontWeight: 700, marginTop: 6 }}>
          {100 - xpInLevel} XP to Level {level + 1} 🎯
        </p>
      </div>

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.7px', textTransform: 'uppercase', color: '#FFD60A', marginBottom: 12 }}>
            🏅 Earned Badges ({badges.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {badges.map((b, i) => (
              <div key={b.id} title={`${b.name}: ${b.desc}`}
                style={{
                  width: 52, height: 52, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  background: `${BADGE_COLORS[i % BADGE_COLORS.length]}18`,
                  border: `2px solid ${BADGE_COLORS[i % BADGE_COLORS.length]}40`,
                  boxShadow: `0 0 12px ${BADGE_COLORS[i % BADGE_COLORS.length]}20`,
                  cursor: 'default',
                }}>
                {b.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <button
          onClick={handleReset}
          style={{
            padding: '14px', borderRadius: 14, border: '1px solid rgba(255,61,154,.25)',
            background: 'rgba(255,61,154,.06)', color: '#FF3D9A',
            fontWeight: 800, fontSize: '.9rem', cursor: 'pointer',
          }}
        >
          🔄 Reset Child Profile & Progress
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: '15px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #FF3D9A, #8B5CF6)',
            color: '#fff', fontWeight: 900, fontSize: '1rem',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(139,92,246,.35)',
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}