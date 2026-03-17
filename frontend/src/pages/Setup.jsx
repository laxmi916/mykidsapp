import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { post } from '../hooks/api';

const ANIMALS = ['🦁','🐯','🐼','🦊','🐨','🦄','🐸','🦋','🐺','🦅','🐬','🦖'];
const PALETTES = [
  { name:'Neon Pink',    hex:'#FF3D9A', glow:'rgba(255,61,154,0.55)'  },
  { name:'Cosmic Purple',hex:'#8B5CF6', glow:'rgba(139,92,246,0.55)'  },
  { name:'Ocean Blue',   hex:'#06B6D4', glow:'rgba(6,182,212,0.55)'   },
  { name:'Mint Teal',    hex:'#14F0C0', glow:'rgba(20,240,192,0.55)'  },
  { name:'Sunshine',     hex:'#FFD60A', glow:'rgba(255,214,10,0.55)'  },
  { name:'Fire Orange',  hex:'#FF8C00', glow:'rgba(255,140,0,0.55)'   },
];

const STEP_INFO = [
  { emoji:'👤', title:'Your Name'   },
  { emoji:'🐾', title:'Your Buddy'  },
  { emoji:'🎨', title:'Your Color'  },
  { emoji:'🦸', title:'Your Hero!'  },
];

export default function Setup({ onDone }) {
  const { setProfile, earnBadge } = useApp();
  const [step,  setStep]  = useState(1);
  const [name,  setName]  = useState('');
  const [age,   setAge]   = useState(7);
  const [pet,   setPet]   = useState('🦁');
  const [palI,  setPalI]  = useState(0);
  const [hero,  setHero]  = useState(null);
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState('');

  const pal = PALETTES[palI];

  const bumpAge = d => {
    const n = age + d;
    if (n < 4 || n > 14) {
      setErr(n < 4 ? 'Minimum age is 4! 😊' : 'Maximum age is 14! 🎓');
      setTimeout(() => setErr(''), 1500);
      return;
    }
    setAge(n);
  };

  const makeHero = async () => {
    setBusy(true);
    try {
      const d = await post('avatar-name', { childName: name, favoriteAnimal: pet, favoriteColor: pal.name });
      setHero(d);
    } catch {
      // Generate a fun local name if API fails
      const prefixes = ['Super', 'Star', 'Ultra', 'Mega', 'Cosmic', 'Brave'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      setHero({
        heroName: `${prefix} ${name}`,
        superpower: 'Infinite curiosity and unstoppable learning!',
        catchphrase: 'Knowledge is my greatest power!'
      });
    }
    setBusy(false);
    setStep(4);
  };

  const finish = () => {
    setProfile({
      name,
      age,
      avatar: pet,
      color: pal.hex,
      glow: pal.glow,
      colorName: pal.name,
      heroName: hero?.heroName || `Super ${name}`,
      superpower: hero?.superpower || 'Infinite curiosity',
      catchphrase: hero?.catchphrase || 'Learning rocks!',
    });
    earnBadge({ id:'welcome', icon:'🌟', name:'Star Born', desc:'Joined KidStar!' });
    onDone();
  };

  const wrapStyle = {
    minHeight: '100dvh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    position: 'relative', zIndex: 1,
  };

  const cardStyle = {
    maxWidth: 460, width: '100%',
    padding: '32px 28px',
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border2)',
    borderRadius: 'var(--r-xl)',
    boxShadow: `0 0 80px ${pal.glow.replace('0.55','0.15')}, 0 32px 64px rgba(0,0,0,0.6)`,
    animation: 'pageIn .4s var(--ease-out)',
  };

  return (
    <div style={wrapStyle}>
      {/* Floating bg decorations */}
      {['⭐','🌙','✨','💫','🎈','🌈'].map((e,i) => (
        <div key={i} aria-hidden style={{
          position:'fixed', fontSize:'1.8rem', opacity:.1, pointerEvents:'none',
          left:`${(i*17+5)%92}%`, top:`${(i*19+8)%82}%`,
          animation:`float ${3.5+i*.5}s ease-in-out ${i*.4}s infinite`,
        }}>{e}</div>
      ))}

      <div style={cardStyle}>

        {/* Progress steps */}
        <div style={{ display:'flex', gap:6, marginBottom:28, justifyContent:'center' }}>
          {STEP_INFO.map((s, i) => {
            const n = i + 1;
            const isDone   = n < step;
            const isActive = n === step;
            return (
              <div key={n} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%',
                  background: isDone ? pal.hex : isActive ? `linear-gradient(135deg,${pal.hex},#8B5CF6)` : 'var(--c-raised)',
                  border: isActive ? 'none' : `2px solid ${isDone ? pal.hex : 'var(--c-border2)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: isDone ? '1rem' : '0.85rem',
                  boxShadow: isActive ? `0 0 14px ${pal.glow}` : 'none',
                  transition: 'all .3s',
                }}>
                  {isDone ? '✓' : s.emoji}
                </div>
                <span style={{
                  fontSize:'0.62rem', fontWeight:800,
                  color: isActive ? pal.hex : 'var(--c-muted2)',
                  letterSpacing:'.03em',
                }}>{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1 — Name & Age */}
        {step === 1 && (
          <div style={{ animation:'slideUp .35s var(--ease-out)' }}>
            <div style={{ textAlign:'center', marginBottom:26 }}>
              <div style={{ fontSize:'3.2rem', animation:'wiggle 3s ease-in-out infinite', display:'inline-block', marginBottom:8 }}>👋</div>
              <h1 style={{
                fontFamily:'var(--f-head)', fontSize:'2rem',
                background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`,
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                margin:'0 0 6px',
              }}>Welcome to KidStar!</h1>
              <p style={{ color:'var(--c-muted)', fontWeight:700, fontSize:'.9rem', margin:0 }}>
                Let's build your learning profile 🚀
              </p>
            </div>

            <label style={{ display:'block', fontSize:'.76rem', fontWeight:800, letterSpacing:'.7px',
              textTransform:'uppercase', color:'var(--c-muted)', marginBottom:7 }}>
              What's your first name? ✏️
            </label>
            <input
              className="input"
              placeholder="Type your name here…"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
              style={{ marginBottom:20, fontSize:'1.05rem', width:'100%', boxSizing:'border-box' }}
              autoFocus
            />

            <label style={{ display:'block', fontSize:'.76rem', fontWeight:800, letterSpacing:'.7px',
              textTransform:'uppercase', color:'var(--c-muted)', marginBottom:12 }}>
              How old are you? 🎂
            </label>
            <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginBottom:8 }}>
              <button
                onClick={() => bumpAge(-1)}
                style={{ width:44,height:44,borderRadius:'50%',border:`2px solid ${pal.hex}`,
                  background:'transparent',color:pal.hex,fontSize:'1.4rem',cursor:'pointer',fontWeight:900 }}>
                −
              </button>
              <div style={{
                width:80, height:80, borderRadius:'50%',
                background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--f-head)', fontSize:'2.2rem', color:'#fff',
                boxShadow:`0 0 32px ${pal.glow}`,
              }}>{age}</div>
              <button
                onClick={() => bumpAge(1)}
                style={{ width:44,height:44,borderRadius:'50%',border:`2px solid ${pal.hex}`,
                  background:'transparent',color:pal.hex,fontSize:'1.4rem',cursor:'pointer',fontWeight:900 }}>
                +
              </button>
            </div>
            {err && <p style={{ textAlign:'center', color:'var(--c-red)', fontSize:'.83rem', marginBottom:8, fontWeight:700 }}>{err}</p>}

            <div style={{ height:16 }}/>
            <button
              className="btn btn-pink btn-full btn-lg"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              style={{ background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`, border:'none',
                boxShadow:`0 6px 24px ${pal.glow}` }}
            >
              Next — Pick Your Buddy →
            </button>
          </div>
        )}

        {/* STEP 2 — Animal Buddy */}
        {step === 2 && (
          <div style={{ animation:'slideUp .35s var(--ease-out)' }}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:'2.8rem', animation:'float 2s ease-in-out infinite', display:'inline-block', marginBottom:6 }}>🐾</div>
              <h2 style={{ fontFamily:'var(--f-head)', fontSize:'1.7rem', margin:'0 0 4px', color:'var(--c-text)' }}>
                Pick Your Buddy!
              </h2>
              <p style={{ color:'var(--c-muted)', fontWeight:700, fontSize:'.88rem', margin:0 }}>
                This animal will be your avatar, {name}!
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:24 }}>
              {ANIMALS.map(a => (
                <button key={a} onClick={() => setPet(a)} style={{
                  fontSize:'2rem', padding:'10px 6px',
                  border:`2px solid ${pet===a ? pal.hex : 'var(--c-border2)'}`,
                  borderRadius:'var(--r-md)', cursor:'pointer',
                  background: pet===a ? `${pal.hex}22` : 'var(--c-raised)',
                  transform: pet===a ? 'scale(1.2) rotate(-5deg)' : 'scale(1)',
                  boxShadow: pet===a ? `0 0 16px ${pal.glow}` : 'none',
                  transition:'all .18s var(--ease-spring)',
                  lineHeight:1,
                }}>{a}</button>
              ))}
            </div>

            {/* Preview */}
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{
                width:72, height:72, borderRadius:'50%', margin:'0 auto',
                background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'2.4rem', boxShadow:`0 0 28px ${pal.glow}`,
              }}>{pet}</div>
              <p style={{ fontSize:'.8rem', color:'var(--c-muted)', fontWeight:700, marginTop:6 }}>
                {name}'s buddy
              </p>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-purple" style={{ flex:2 }}
                onClick={() => setStep(3)}>
                Choose Color →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Color */}
        {step === 3 && (
          <div style={{ animation:'slideUp .35s var(--ease-out)' }}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:'2.8rem', display:'inline-block', marginBottom:6 }}>🎨</div>
              <h2 style={{ fontFamily:'var(--f-head)', fontSize:'1.7rem', margin:'0 0 4px', color:'var(--c-text)' }}>
                Hero Color!
              </h2>
              <p style={{ color:'var(--c-muted)', fontWeight:700, fontSize:'.88rem', margin:0 }}>
                Your signature power color, {name}
              </p>
            </div>

            <div style={{ display:'flex', justifyContent:'center', gap:12, marginBottom:22, flexWrap:'wrap' }}>
              {PALETTES.map((p, i) => (
                <div key={p.hex} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                  <button
                    title={p.name}
                    onClick={() => setPalI(i)}
                    style={{
                      width:52, height:52, borderRadius:'50%',
                      background:`linear-gradient(135deg,${p.hex},${PALETTES[(i+1)%6].hex})`,
                      border: palI===i ? '3px solid white' : '3px solid transparent',
                      cursor:'pointer', flexShrink:0,
                      transform: palI===i ? 'scale(1.3)' : 'scale(1)',
                      boxShadow: palI===i ? `0 0 22px ${p.glow}` : 'none',
                      transition:'all .2s var(--ease-spring)',
                    }}
                  />
                  {palI===i && (
                    <span style={{ fontSize:'.65rem', fontWeight:800, color:p.hex, letterSpacing:'.03em' }}>
                      {p.name}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Avatar preview */}
            <div style={{ textAlign:'center', marginBottom:22 }}>
              <div style={{
                width:96, height:96, borderRadius:'50%', margin:'0 auto 8px',
                background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem',
                boxShadow:`0 0 40px ${pal.glow}`,
                animation:'pulse 2.5s ease-in-out infinite',
              }}>{pet}</div>
              <p style={{ fontFamily:'var(--f-head)', fontSize:'1.1rem', color:pal.hex, margin:0 }}>
                {name} · {pal.name}
              </p>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setStep(2)}>← Back</button>
              <button
                className="btn btn-blue" style={{
                  flex:2,
                  background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`,
                  border:'none', boxShadow:`0 6px 24px ${pal.glow}`,
                }}
                onClick={makeHero} disabled={busy}
              >
                {busy
                  ? <><span className="loader-dot" style={{ width:8,height:8,'--dl2':'0s' }}/><span className="loader-dot" style={{ width:8,height:8,'--dl2':'0.15s' }}/><span className="loader-dot" style={{ width:8,height:8,'--dl2':'0.3s' }}/></>
                  : '✨ Create My Hero!'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Hero reveal */}
        {step === 4 && hero && (
          <div style={{ textAlign:'center', animation:'slideUp .4s var(--ease-out)' }}>
            {/* Avatar with sparkles */}
            <div style={{ position:'relative', width:110, height:110, margin:'0 auto 18px' }}>
              <div style={{
                width:110, height:110, borderRadius:'50%',
                background:`linear-gradient(135deg,${pal.hex},#8B5CF6,#06B6D4)`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.8rem',
                boxShadow:`0 0 50px ${pal.glow}, 0 0 100px ${pal.glow.replace('.55','.2')}`,
                animation:'popIn .5s var(--ease-spring)',
              }}>{pet}</div>
              {['⭐','✨','💫'].map((e,i) => (
                <span key={i} aria-hidden style={{
                  position:'absolute', top:'50%', left:'50%', marginLeft:-10, marginTop:-10,
                  fontSize:'1.1rem', animation:`orbit ${2.2+i*.6}s linear ${i*.5}s infinite`,
                }}>{e}</span>
              ))}
            </div>

            <p style={{ fontSize:'.72rem', fontWeight:800, letterSpacing:'.06em',
              color:'var(--c-muted)', marginBottom:4, textTransform:'uppercase' }}>
              Meet Your Hero
            </p>
            <h2 style={{
              fontFamily:'var(--f-head)', fontSize:'2rem', marginBottom:6,
              background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{hero.heroName}</h2>
            <p style={{ color:'var(--c-muted)', fontWeight:700, fontSize:'.85rem', marginBottom:20 }}>
              Level 1 KidStar Champion 🌟
            </p>

            <div style={{ display:'grid', gap:10, marginBottom:26, textAlign:'left' }}>
              {[
                { tag:'⚡ SUPERPOWER',  val: hero.superpower,         clr:'var(--c-blue)' },
                { tag:'💬 CATCHPHRASE', val: `"${hero.catchphrase}"`, clr: pal.hex        },
              ].map(item => (
                <div key={item.tag} style={{
                  padding:'12px 16px', borderRadius:'var(--r-md)',
                  background:'var(--c-raised)', border:'1px solid var(--c-border2)',
                }}>
                  <p style={{ fontSize:'.67rem', fontWeight:800, letterSpacing:'.06em',
                    color:'var(--c-muted)', marginBottom:4, textTransform:'uppercase' }}>{item.tag}</p>
                  <p style={{ fontWeight:800, color:item.clr, fontSize:'.95rem', lineHeight:1.45, margin:0 }}>{item.val}</p>
                </div>
              ))}
            </div>

            <button
              className="btn btn-pink btn-full btn-lg"
              onClick={finish}
              style={{
                background:`linear-gradient(135deg,${pal.hex},#8B5CF6)`,
                border:'none', boxShadow:`0 8px 32px ${pal.glow}`,
                fontSize:'1.05rem',
              }}
            >
              🚀 Start My Adventure, {name}!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}