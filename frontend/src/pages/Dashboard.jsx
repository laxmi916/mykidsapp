import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const FEATURES = [
  { id:'story',       emoji:'📖', title:'Story Time',    desc:'AI-powered stories just for you', color:'#FF3D9A', xp:20 },
  { id:'quiz',        emoji:'🎲', title:'Quiz',          desc:'Test what you learned',           color:'#8B5CF6', xp:30 },
  { id:'math',        emoji:'🧮', title:'Math Fun',      desc:'Fun number challenges',           color:'#06B6D4', xp:25 },
  { id:'memory',      emoji:'🧠', title:'Memory Match',  desc:'Flip cards & find pairs',         color:'#14F0C0', xp:35 },
  { id:'routine',     emoji:'📅', title:'My Day',        desc:'Your daily story in words',       color:'#FFD60A', xp:15 },
  { id:'leaderboard', emoji:'🏆', title:'Champions',     desc:'See the top learners',            color:'#FF8C00', xp:0  },
];

const FACTS = [
  { e:'🦈', f:'Sharks have existed longer than trees on Earth!' },
  { e:'🐙', f:'Octopuses have three hearts and their blood is blue!' },
  { e:'🌙', f:'The Moon is slowly moving away from Earth every year!' },
  { e:'🦋', f:'Butterflies taste everything with their feet!' },
  { e:'🐘', f:'Elephants are the only mammals that cannot jump!' },
  { e:'🍯', f:'Honey found in ancient Egyptian tombs is still edible!' },
  { e:'⚡', f:'Lightning is five times hotter than the surface of the Sun!' },
  { e:'🐝', f:'A honeybee flaps its wings 200 times per second!' },
];

const GREETINGS = {
  morning:   ['☀️', 'Good Morning'],
  afternoon: ['🌤️', 'Good Afternoon'],
  evening:   ['🌙', 'Good Evening'],
};

export default function Dashboard({ onNav }) {
  const { profile, xp, level, xpInLevel, xpToNext, badges, streak, resetAll } = useApp();
  const [factI, setFactI]   = useState(() => Math.floor(Math.random() * FACTS.length));
  const [greet, setGreet]   = useState(GREETINGS.morning);

  useEffect(() => {
    const h = new Date().getHours();
    setGreet(h < 12 ? GREETINGS.morning : h < 18 ? GREETINGS.afternoon : GREETINGS.evening);
  }, []);

  if (!profile) return null;

  const c = profile.color || '#8B5CF6';
  const g = profile.glow  || 'rgba(139,92,246,0.5)';
  const fact = FACTS[factI];

  const handleReset = () => {
    if (window.confirm('Reset everything? All XP and badges will be lost.')) resetAll();
  };

  return (
    <div className="page">

      {/* ── Hero Banner ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        gap:16, flexWrap:'wrap', marginBottom:16,
      }}>
        {/* Avatar + name */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={handleReset} title="Tap to reset profile" style={{
            width:64, height:64, borderRadius:'50%', flexShrink:0,
            background:`linear-gradient(135deg,${c},#8B5CF6)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2rem', border:`2.5px solid rgba(255,255,255,.15)`,
            boxShadow:`0 0 28px ${g}`,
            animation:'pulse 3.5s ease-in-out infinite',
            cursor:'pointer',
          }}>
            {profile.avatar}
          </button>
          <div>
            <p style={{ fontSize:'.8rem', fontWeight:800, color:'var(--c-muted)', marginBottom:2 }}>
              {greet[0]} {greet[1]},
            </p>
            <h2 style={{
              fontFamily:'var(--f-head)', fontSize:'1.55rem', lineHeight:1.05,
              background:`linear-gradient(135deg,${c},#8B5CF6)`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{profile.heroName || profile.name}!</h2>
          </div>
        </div>

        {/* Stat chips */}
        <div style={{ display:'flex', gap:8 }}>
          {[
            { val: streak,       label:'Streak', color:'#FF3D9A', emoji:'🔥' },
            { val: xp,           label:'Total XP',color:'#FFD60A', emoji:'⭐' },
            { val: `Lv ${level}`,label:'Level',  color:'#8B5CF6', emoji:'🚀' },
          ].map(s => (
            <div key={s.label} className="stat-chip" style={{ boxShadow:`0 0 14px ${s.color}22` }}>
              <span style={{ fontSize:'1.1rem' }}>{s.emoji}</span>
              <span className="stat-val" style={{ color: s.color }}>{s.val}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── XP Bar ── */}
      <div className="card" style={{ padding:'16px 18px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:'.85rem', fontWeight:800 }}>Level {level} Progress</span>
          <span style={{ fontSize:'.78rem', fontWeight:800, color:'var(--c-muted)' }}>{xpInLevel} / 100 XP</span>
        </div>
        <div className="xp-track" style={{ marginBottom:6 }}>
          <div className="xp-fill" style={{ width:`${xpInLevel}%` }} />
        </div>
        <p style={{ fontSize:'.75rem', fontWeight:700, color:'var(--c-muted)' }}>
          {xpToNext} XP until Level {level + 1} 🎯
        </p>
      </div>

      {/* ── Fun Fact ── */}
      <button onClick={() => setFactI(i => (i + 1) % FACTS.length)}
        className="card w-full" style={{
          padding:'14px 18px', marginBottom:20, cursor:'pointer', border:'none', textAlign:'left',
          background:'linear-gradient(135deg, rgba(255,214,10,.08), rgba(255,140,0,.06))',
          borderColor:'rgba(255,214,10,.2)',
          transition:'transform .18s var(--ease-spring)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.015)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'2rem', animation:'wiggle 3s ease-in-out infinite', flexShrink:0 }}>{fact.e}</span>
          <div>
            <p style={{ fontSize:'.68rem', fontWeight:800, letterSpacing:'.7px', textTransform:'uppercase', color:'#FFD60A', marginBottom:3 }}>
              💡 Fun Fact — tap for more
            </p>
            <p style={{ fontSize:'.92rem', fontWeight:700, lineHeight:1.5, color:'var(--c-text)' }}>{fact.f}</p>
          </div>
        </div>
      </button>

      {/* ── Feature Grid ── */}
      <div className="grid-auto" style={{ marginBottom:20 }}>
        {FEATURES.map((f, i) => (
          <button key={f.id} className="feat-card" onClick={() => onNav(f.id)}
            style={{
              borderColor: `${f.color}28`,
              background: `linear-gradient(145deg, ${f.color}0F, var(--c-surface) 60%)`,
              animation: `cardIn .5s var(--ease-out) ${i * 0.07}s both`,
              boxShadow: `0 2px 0 0 ${f.color}18`,
            }}>
            <span className="feat-emoji">{f.emoji}</span>
            <span className="feat-title" style={{ color: f.color }}>{f.title}</span>
            <span className="feat-desc">{f.desc}</span>
            {f.xp > 0 && (
              <span className="feat-xp" style={{ background:`${f.color}1A`, color:f.color, border:`1px solid ${f.color}35` }}>
                ⭐ +{f.xp} XP
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <div className="card" style={{ padding:'18px 20px' }}>
          <p style={{ fontSize:'.78rem', fontWeight:800, letterSpacing:'.6px', textTransform:'uppercase', color:'#FFD60A', marginBottom:14 }}>
            🏅 My Badges — {badges.length} earned
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {badges.map(b => (
              <div key={b.id} className="badge-circle" title={`${b.name}: ${b.desc}`}>{b.icon}</div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize:'.68rem', color:'var(--c-muted2)', textAlign:'center', marginTop:12, fontWeight:700 }}>
        Tap your avatar to reset profile
      </p>
    </div>
  );
}