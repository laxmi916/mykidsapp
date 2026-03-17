import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { get } from '../hooks/api';

const MEDALS = ['🥇','🥈','🥉'];
const MEDAL_COLORS = ['#FFD60A','#C0C0C0','#CD7F32'];
const MEDAL_GLOWS  = ['rgba(255,214,10,.35)','rgba(192,192,192,.25)','rgba(205,127,50,.25)'];

export default function LeaderboardPage() {
  const { profile, xp, level, badges } = useApp();
  const [board,   setBoard]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('board');

  useEffect(() => { loadBoard(); }, []);

  const loadBoard = async () => {
    setLoading(true);
    try { const d = await get('leaderboard'); setBoard(d.leaderboard || []); }
    catch { setBoard([]); }
    setLoading(false);
  };

  const myName = profile?.heroName || profile?.name || 'You';
  const c = profile?.color || '#8B5CF6';
  const g = profile?.glow  || 'rgba(139,92,246,.5)';

  const fullBoard = (() => {
    const b = [...board];
    const myIdx = b.findIndex(r => r.name === myName);
    if (myIdx >= 0) b[myIdx] = { ...b[myIdx], isMe:true };
    else b.push({ name:myName, score:xp, activity:'Total XP', isMe:true });
    return b.sort((a,b) => b.score - a.score);
  })();

  const myRank = fullBoard.findIndex(r => r.isMe) + 1;

  return (
    <div className="page">

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:'3.5rem', display:'inline-block', animation:'bounce 2.2s ease-in-out infinite', marginBottom:8 }}>🏆</div>
        <h1 className="page-title" style={{
          background:'linear-gradient(135deg,#FFD60A,#FF8C00)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:4,
        }}>Champions!</h1>
        <p className="text-muted text-sm">KidStar's top learners 🌟</p>
      </div>

      {/* My rank + stats card */}
      {profile && (
        <div className="card" style={{
          padding:'18px 20px', marginBottom:16,
          background:`linear-gradient(135deg,${c}14,var(--c-surface) 60%)`,
          borderColor:`${c}35`,
          boxShadow:`inset 0 0 40px ${c}08`,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <div style={{
              width:52, height:52, borderRadius:'50%', flexShrink:0,
              background:`linear-gradient(135deg,${c},#6366F1)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.9rem', boxShadow:`0 0 20px ${g}`,
            }}>{profile.avatar}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:'var(--f-head)', fontSize:'1.1rem', color: c, lineHeight:1 }}>{myName}</p>
              <p style={{ fontSize:'.75rem', color:'var(--c-muted)', fontWeight:800 }}>Level {level} · {xp} XP total</p>
            </div>
            <div style={{
              background:`linear-gradient(135deg,${c},#6366F1)`,
              padding:'8px 14px', borderRadius:'var(--r-md)',
              fontFamily:'var(--f-head)', fontSize:'1.1rem',
              boxShadow:`0 4px 16px ${g}`,
            }}>
              #{myRank}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              { v:xp,          l:'Total XP',  c:'#FFD60A' },
              { v:`Lv ${level}`,l:'Level',    c:c         },
              { v:badges.length,l:'Badges',   c:'#14F0C0' },
            ].map(s => (
              <div key={s.l} style={{
                background:'var(--c-raised)', border:'1px solid var(--c-border)', borderRadius:'var(--r-md)',
                padding:'10px 8px', textAlign:'center',
              }}>
                <p style={{ fontFamily:'var(--f-head)', fontSize:'1.2rem', color:s.c, lineHeight:1 }}>{s.v}</p>
                <p style={{ fontSize:'.6rem', fontWeight:800, color:'var(--c-muted)', textTransform:'uppercase', letterSpacing:'.4px', marginTop:3 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16, background:'var(--c-raised)', padding:5, borderRadius:'var(--r-md)', border:'1px solid var(--c-border)' }}>
        {[{ v:'board', l:'🏆 Leaderboard' },{ v:'badges', l:'🏅 My Badges' }].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)} style={{
            flex:1, padding:'9px', borderRadius:'var(--r-sm)', border:'none', cursor:'pointer',
            fontFamily:'var(--f-body)', fontSize:'.82rem', fontWeight:800,
            background: tab===t.v ? `linear-gradient(135deg,${c},#6366F1)` : 'transparent',
            color: tab===t.v ? 'white' : 'var(--c-muted)',
            boxShadow: tab===t.v ? `0 3px 12px ${g}` : 'none',
            transition:'all .2s var(--ease-spring)',
          }}>{t.l}</button>
        ))}
      </div>

      {/* Board tab */}
      {tab === 'board' && (
        loading ? (
          <div style={{ textAlign:'center', padding:40 }}>
            <div className="spinner" style={{ margin:'0 auto' }}/>
            <p style={{ marginTop:12, color:'var(--c-muted)' }}>Loading champions…</p>
          </div>
        ) : fullBoard.length === 0 ? (
          <div className="card" style={{ padding:'32px 24px', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>🌟</div>
            <p style={{ fontFamily:'var(--f-head)', fontSize:'1.2rem', marginBottom:8 }}>You're the First!</p>
            <p className="text-muted text-sm">Be the legend others chase. Keep earning XP!</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {fullBoard.slice(0, 10).map((row, i) => {
              const rank = i + 1;
              const medal = rank <= 3 ? MEDALS[rank-1] : null;
              const mColor = rank <= 3 ? MEDAL_COLORS[rank-1] : 'var(--c-muted)';
              const mGlow  = rank <= 3 ? MEDAL_GLOWS[rank-1]  : 'transparent';
              return (
                <div key={i} className="card" style={{
                  padding:'14px 16px',
                  background: row.isMe
                    ? `linear-gradient(135deg,${c}18,var(--c-surface) 60%)`
                    : rank <= 3
                      ? `linear-gradient(135deg,${mColor}10,var(--c-surface) 60%)`
                      : 'var(--c-surface)',
                  borderColor: row.isMe ? `${c}45` : rank<=3 ? `${mColor}35` : 'var(--c-border)',
                  boxShadow: row.isMe ? `0 4px 20px ${c}20` : rank<=3 ? `0 4px 16px ${mGlow}` : 'none',
                  animation:`cardIn .5s var(--ease-out) ${i*.06}s both`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {/* Rank */}
                    <div style={{
                      width:36, height:36, borderRadius:'50%', flexShrink:0,
                      background: rank<=3 ? `linear-gradient(135deg,${mColor},${mColor}88)` : 'var(--c-raised)',
                      border:`2px solid ${rank<=3?mColor:'var(--c-border2)'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'var(--f-head)', fontSize: rank<=3 ? '1rem' : '.85rem',
                      color: rank<=3 ? (rank===1?'#07050F':'white') : 'var(--c-muted)',
                      boxShadow: rank<=3 ? `0 4px 12px ${mGlow}` : 'none',
                    }}>
                      {medal || rank}
                    </div>

                    {/* Name */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{
                        fontFamily:'var(--f-head)', fontSize:'.95rem', lineHeight:1,
                        color: row.isMe ? c : rank<=3 ? mColor : 'var(--c-text)',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>
                        {row.name} {row.isMe && '← you'}
                      </p>
                      <p style={{ fontSize:'.65rem', color:'var(--c-muted)', fontWeight:800, marginTop:2 }}>
                        {row.activity || 'Learning'}
                      </p>
                    </div>

                    {/* Score */}
                    <div style={{
                      fontFamily:'var(--f-head)', fontSize:'1.05rem',
                      color: row.isMe ? c : rank<=3 ? mColor : 'var(--c-text)',
                      flexShrink:0,
                    }}>
                      {row.score.toLocaleString()} <span style={{ fontSize:'.65rem', color:'var(--c-muted)' }}>XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Badges tab */}
      {tab === 'badges' && (
        <div>
          {badges.length === 0 ? (
            <div className="card" style={{ padding:'32px 24px', textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>🏅</div>
              <p style={{ fontFamily:'var(--f-head)', fontSize:'1.2rem', marginBottom:8 }}>No Badges Yet</p>
              <p className="text-muted text-sm">Complete activities to earn your first badge!</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:12 }}>
              {badges.map((b,i) => (
                <div key={b.id} className="card" style={{
                  padding:'18px 14px', textAlign:'center',
                  animation:`cardIn .4s var(--ease-out) ${i*.08}s both`,
                  transition:'transform .2s var(--ease-spring)',
                  cursor:'default',
                }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                  <div style={{ fontSize:'2.2rem', marginBottom:8 }}>{b.icon}</div>
                  <p style={{ fontFamily:'var(--f-head)', fontSize:'.88rem', color:c, marginBottom:4 }}>{b.name}</p>
                  <p style={{ fontSize:'.7rem', color:'var(--c-muted)' }}>{b.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}