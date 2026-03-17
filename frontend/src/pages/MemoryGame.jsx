import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { post } from '../hooks/api';
import Confetti from '../components/Confetti';
import { buddyShow } from '../components/Buddy';

const THEMES = [
  { v:'animals',   l:'🐾 Animals',   color:'var(--c-teal)'   },
  { v:'flowers',   l:'🌸 Flowers',   color:'var(--c-pink)'   },
  { v:'food',      l:'🍕 Food',      color:'var(--c-orange)' },
  { v:'transport', l:'🚗 Transport', color:'var(--c-blue)'   },
  { v:'sports',    l:'⚽ Sports',    color:'var(--c-green)'  },
  { v:'music',     l:'🎵 Music',     color:'var(--c-purple)' },
];

const PAIR_OPTIONS = [
  { v:4, l:'4 Pairs',  sub:'Easy',   color:'var(--c-teal)'   },
  { v:6, l:'6 Pairs',  sub:'Medium', color:'var(--c-yellow)' },
  { v:8, l:'8 Pairs',  sub:'Hard',   color:'var(--c-orange)' },
  { v:10,l:'10 Pairs', sub:'Expert', color:'var(--c-pink)'   },
];

// Full fallback data per theme — used if backend unavailable
const FALLBACK = {
  animals: [
    {id:0,emoji:'🐶',word:'Dog'},{id:1,emoji:'🐱',word:'Cat'},{id:2,emoji:'🐘',word:'Elephant'},
    {id:3,emoji:'🦁',word:'Lion'},{id:4,emoji:'🐸',word:'Frog'},{id:5,emoji:'🦋',word:'Butterfly'},
    {id:6,emoji:'🐢',word:'Turtle'},{id:7,emoji:'🦒',word:'Giraffe'},{id:8,emoji:'🐧',word:'Penguin'},
    {id:9,emoji:'🦊',word:'Fox'},
  ],
  flowers: [
    {id:0,emoji:'🌸',word:'Blossom'},{id:1,emoji:'🌺',word:'Hibiscus'},{id:2,emoji:'🌻',word:'Sunflower'},
    {id:3,emoji:'🌹',word:'Rose'},{id:4,emoji:'🌷',word:'Tulip'},{id:5,emoji:'💐',word:'Bouquet'},
    {id:6,emoji:'🌼',word:'Daisy'},{id:7,emoji:'🪷',word:'Lotus'},{id:8,emoji:'🍀',word:'Clover'},
    {id:9,emoji:'🌱',word:'Seedling'},
  ],
  food: [
    {id:0,emoji:'🍕',word:'Pizza'},{id:1,emoji:'🍎',word:'Apple'},{id:2,emoji:'🍌',word:'Banana'},
    {id:3,emoji:'🍓',word:'Strawberry'},{id:4,emoji:'🥕',word:'Carrot'},{id:5,emoji:'🍦',word:'Ice Cream'},
    {id:6,emoji:'🍩',word:'Donut'},{id:7,emoji:'🥑',word:'Avocado'},{id:8,emoji:'🍇',word:'Grapes'},
    {id:9,emoji:'🌽',word:'Corn'},
  ],
  transport: [
    {id:0,emoji:'🚗',word:'Car'},{id:1,emoji:'✈️',word:'Airplane'},{id:2,emoji:'🚂',word:'Train'},
    {id:3,emoji:'🚢',word:'Ship'},{id:4,emoji:'🚁',word:'Helicopter'},{id:5,emoji:'🛵',word:'Scooter'},
    {id:6,emoji:'🚌',word:'Bus'},{id:7,emoji:'🚲',word:'Bicycle'},{id:8,emoji:'🚀',word:'Rocket'},
    {id:9,emoji:'⛵',word:'Sailboat'},
  ],
  sports: [
    {id:0,emoji:'⚽',word:'Football'},{id:1,emoji:'🏀',word:'Basketball'},{id:2,emoji:'🎾',word:'Tennis'},
    {id:3,emoji:'🏏',word:'Cricket'},{id:4,emoji:'🏊',word:'Swimming'},{id:5,emoji:'🎯',word:'Archery'},
    {id:6,emoji:'🏐',word:'Volleyball'},{id:7,emoji:'🥊',word:'Boxing'},{id:8,emoji:'⛳',word:'Golf'},
    {id:9,emoji:'🏋️',word:'Lifting'},
  ],
  music: [
    {id:0,emoji:'🎵',word:'Note'},{id:1,emoji:'🎸',word:'Guitar'},{id:2,emoji:'🥁',word:'Drums'},
    {id:3,emoji:'🎹',word:'Piano'},{id:4,emoji:'🎺',word:'Trumpet'},{id:5,emoji:'🎻',word:'Violin'},
    {id:6,emoji:'🎷',word:'Saxophone'},{id:7,emoji:'🪘',word:'Bongo'},{id:8,emoji:'🎤',word:'Mic'},
    {id:9,emoji:'🔔',word:'Bell'},
  ],
};

const shuffle = a => [...a].sort(() => Math.random() - 0.5);

function ProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <div
      className="card card-raised"
      style={{
        padding: 16,
        marginBottom: 16,
        border: `2px solid ${(profile.color || "#8B5CF6")}33`,
        background: `linear-gradient(135deg, ${(profile.color || "#8B5CF6")}18, rgba(255,255,255,0.04))`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: "1.8rem",
            background: `linear-gradient(135deg, ${profile.color || "#8B5CF6"}, #06B6D4)`,
          }}
        >
          {profile.avatar || "👤"}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>
            {profile.heroName || profile.name || "Student"}
          </div>
          <div className="text-muted" style={{ fontSize: ".9rem" }}>
            Age: {profile.age || "-"}
          </div>
          {profile.superpower && (
            <div style={{ fontSize: ".82rem", marginTop: 4, color: "#FFD60A" }}>
              ✨ {profile.superpower}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemoryGame() {
  const { profile, addXP, earnBadge } = useApp();
  const [theme,     setTheme]     = useState('animals');
  const [pairCount, setPairCount] = useState(6);
  const [cards,     setCards]     = useState([]);
  const [flipped,   setFlipped]   = useState([]);
  const [matched,   setMatched]   = useState(new Set());
  const [moves,     setMoves]     = useState(0);
  const [time,      setTime]      = useState(0);
  const [running,   setRunning]   = useState(false);
  const [won,       setWon]       = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [locked,    setLocked]    = useState(false);
  const [confetti,  setConfetti]  = useState(false);
  const [wrongPair, setWrongPair] = useState([]);

  useEffect(() => {
    let t;
    if (running && !won) t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running, won]);

  const startGame = async () => {
    setLoading(true);
    setFlipped([]); setMatched(new Set()); setMoves(0); setTime(0);
    setWon(false); setRunning(false); setWrongPair([]);
    try {
      const d = await post('memory-game', { age: profile?.age || 7, theme, count: pairCount });
      buildCards(d.pairs.slice(0, pairCount));
    } catch {
      // Use local fallback if API fails
      const pool = FALLBACK[theme] || FALLBACK.animals;
      buildCards(shuffle(pool).slice(0, pairCount));
    }
    setLoading(false);
    setTimeout(() => setRunning(true), 300);
  };

  const buildCards = (pairs) => {
    const all = [];
    pairs.forEach((p, i) => {
      all.push({ uid:`${i}-a`, pairId:i, emoji:p.emoji, word:p.word });
      all.push({ uid:`${i}-b`, pairId:i, emoji:p.emoji, word:p.word });
    });
    setCards(shuffle(all));
  };

  const handleFlip = useCallback((uid) => {
    if (locked || flipped.includes(uid) || matched.has(uid)) return;
    if (flipped.length === 2) return;
    const next = [...flipped, uid];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = next.map(id => cards.find(c => c.uid === id));
      if (a.pairId === b.pairId) {
        const nm = new Set([...matched, a.uid, b.uid]);
        setMatched(nm);
        setFlipped([]);
        setLocked(false);
        if (nm.size === cards.length) {
          setWon(true); setRunning(false);
          setConfetti(true);
          setTimeout(() => setConfetti(false), 2000);
          addXP(40);
          earnBadge({ id:'memory-master', icon:'🧠', name:'Memory Master', desc:'Won the memory game!' });
          buddyShow('win', 'Amazing memory! 🧠');
        }
      } else {
        setWrongPair(next);
        setTimeout(() => { setFlipped([]); setLocked(false); setWrongPair([]); }, 950);
      }
    }
  }, [locked, flipped, matched, cards, addXP, earnBadge]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const isFaceUp = uid => flipped.includes(uid) || matched.has(uid);
  const isMatch  = uid => matched.has(uid);
  const isWrong  = uid => wrongPair.includes(uid);

  // Grid columns: 4 pairs = 4 cols, 6+ = 4 cols, 10 = 5 cols on wide
  const cols = pairCount <= 4 ? 4 : pairCount <= 6 ? 4 : pairCount <= 8 ? 4 : 5;
  const activeTheme = THEMES.find(t => t.v === theme) || THEMES[0];

  return (
    <div className="page mem-page">
      <Confetti active={confetti} />

      {/* Header */}
      <div className="text-center" style={{ marginBottom: 24 }}>
        <div style={{ fontSize:'3.2rem', display:'inline-block', animation:'wiggle 3s ease-in-out infinite', marginBottom:6 }}>🧠</div>
        <h1 className="page-title" style={{
          background:'linear-gradient(135deg,#14F0C0,#06B6D4)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:4,
        }}>Memory Match!</h1>
        <p className="text-muted text-sm" style={{ fontWeight:700 }}>Flip cards to find matching pairs 🃏</p>
      </div>

      <ProfileCard profile={profile} />

      {/* Controls Card */}
      <div className="card mem-controls-card">
        {/* Theme row */}
        <div className="mem-section-label">Choose Theme</div>
        <div className="mem-theme-row">
          {THEMES.map(t => (
            <button key={t.v}
              className="mem-theme-btn"
              style={{
                borderColor: theme===t.v ? t.color : 'var(--c-border2)',
                background:  theme===t.v ? `${t.color}20` : 'var(--c-raised)',
                color:       theme===t.v ? t.color : 'var(--c-muted)',
                boxShadow:   theme===t.v ? `0 0 10px ${t.color}40` : 'none',
              }}
              onClick={() => setTheme(t.v)}
            >{t.l}</button>
          ))}
        </div>

        {/* Pair count row */}
        <div className="mem-section-label" style={{ marginTop:14 }}>Number of Pairs</div>
        <div className="mem-pairs-row">
          {PAIR_OPTIONS.map(p => (
            <button key={p.v}
              className="mem-pair-btn"
              style={{
                borderColor: pairCount===p.v ? p.color : 'var(--c-border2)',
                background:  pairCount===p.v ? `${p.color}18` : 'var(--c-raised)',
                color:       pairCount===p.v ? p.color : 'var(--c-muted)',
              }}
              onClick={() => setPairCount(p.v)}
            >
              <span className="mem-pair-num">{p.l}</span>
              <span className="mem-pair-sub">{p.sub}</span>
            </button>
          ))}
        </div>

        <button className="btn btn-teal btn-full" style={{ marginTop:14 }} onClick={startGame} disabled={loading}>
          {loading ? '⏳ Shuffling cards…' : cards.length ? '🔄 New Game' : '🎮 Start Game!'}
        </button>
      </div>

      {/* Stats */}
      {cards.length > 0 && (
        <div className="grid-3" style={{ marginBottom:16 }}>
          {[
            { e:'🎯', v:moves, l:'Moves', c:'var(--c-pink)' },
            { e:'✅', v:`${matched.size/2}/${cards.length/2}`, l:'Pairs', c:'var(--c-teal)' },
            { e:'⏱️', v:fmt(time), l:'Time', c:'var(--c-purple)' },
          ].map(s => (
            <div key={s.l} className="stat-chip" style={{ boxShadow:`0 0 12px ${s.c}20` }}>
              <span style={{ fontSize:'1.1rem' }}>{s.e}</span>
              <span className="stat-val" style={{ color:s.c }}>{s.v}</span>
              <span className="stat-label">{s.l}</span>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center" style={{ padding:'40px 20px' }}>
          <div className="spinner" style={{ marginBottom:14 }} />
          <p className="text-muted" style={{ fontWeight:800 }}>Shuffling the deck… 🃏</p>
        </div>
      )}

      {/* Win screen */}
      {won && (
        <div className="card text-center" style={{
          padding:'32px 24px', marginBottom:16,
          background:'linear-gradient(145deg,rgba(20,240,192,.12),rgba(6,182,212,.08))',
          animation:'resultPop .5s var(--ease-spring)',
        }}>
          <div style={{ fontSize:'4.5rem', marginBottom:12 }}>🎉</div>
          <h2 style={{ fontFamily:'var(--f-head)', fontSize:'2.3rem', color:'var(--c-teal)', marginBottom:8 }}>You Won!</h2>
          <p className="text-muted" style={{ fontWeight:800, marginBottom:20 }}>
            {moves} moves · {fmt(time)} · {cards.length/2} pairs found!
          </p>
          <button className="btn btn-teal" onClick={startGame}>🔄 Play Again!</button>
        </div>
      )}

      {/* Card Grid */}
      {cards.length > 0 && !loading && (
        <div className="mem-grid-wrap">
          <div className="mem-grid" style={{ "--mem-cols": cols }}>
            {cards.map(card => {
              const up  = isFaceUp(card.uid);
              const ok  = isMatch(card.uid);
              const bad = isWrong(card.uid);
              return (
                <div key={card.uid}
                  className={`mem-card-wrap${up ? ' flipped' : ''} ${ok ? 'matched' : ''}`}
                  onClick={() => !won && handleFlip(card.uid)}
                  style={{ animation: bad ? 'shake .35s ease' : undefined }}
                >
                  <div className="mem-card-inner">
                    {/* Back */}
                    <div className="mem-back">
                      <span className="mem-back-icon">❓</span>
                      <span className="mem-back-sub">Tap!</span>
                    </div>
                    {/* Face */}
                    <div className="mem-face"
                      style={bad ? { borderColor:'var(--c-red)', background:'rgba(255,77,77,.2)' } :
                             ok  ? { borderColor:'var(--c-teal)', background:'rgba(20,240,192,.15)' } : {}}
                    >
                      <span className="mem-face-emoji">{card.emoji}</span>
                      <span className="mem-face-word">{card.word}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty */}
      {!cards.length && !loading && (
        <div className="text-center" style={{ padding:'50px 20px', color:'var(--c-muted)' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:12, animation:'float 3s ease-in-out infinite' }}>🃏</div>
          <p className="font-head" style={{ fontSize:'1.3rem', marginBottom:6 }}>Ready to match?</p>
          <p className="text-sm" style={{ fontWeight:700 }}>Pick a theme, set pairs, and start!</p>
        </div>
      )}
    </div>
  );
}
