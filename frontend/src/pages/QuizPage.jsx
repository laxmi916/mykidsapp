import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { post } from '../hooks/api';
import Confetti from '../components/Confetti';
import { buddyShow } from '../components/Buddy';

const TYPE_OPTS = [
  { v:'gk', label:'General Knowledge', emoji:'🌍', color:'#8B5CF6' },
  { v:'spelling', label:'Spelling Bee', emoji:'🔤', color:'#FF3D9A' },
];

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
            background: `linear-gradient(135deg, ${profile.color || "#8B5CF6"}, #FF3D9A)`,
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

export default function QuizPage() {
  const { profile, addXP, earnBadge } = useApp();

  const [quiz,     setQuiz]     = useState(null);
  const [picks,    setPicks]    = useState({});
  const [done,     setDone]     = useState(false);
  const [score,    setScore]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [qIdx,     setQIdx]     = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [shake,    setShake]    = useState(false);
  const [type,     setType]     = useState('gk');
  const [reveal,   setReveal]   = useState(false); // show correct after pick

  const c = profile?.color || '#8B5CF6';

  const startQuiz = async () => {
    setLoading(true); setDone(false); setPicks({}); setQIdx(0); setReveal(false);
    try {
      const d = await post('quiz', { type, age: profile?.age || 7 });
      setQuiz({ questions: d.questions });
    } catch { alert('Could not load quiz 😢'); }
    setLoading(false);
  };

  const pick = (opt) => {
    if (picks[qIdx] !== undefined) return; // already answered
    setPicks(p => ({ ...p, [qIdx]: opt }));
    setReveal(true);
    setShake(false);
  };

  const next = () => {
    if (picks[qIdx] === undefined) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setReveal(false);
    if (qIdx < quiz.questions.length - 1) {
      setQIdx(q => q + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    let s = 0;
    quiz.questions.forEach((q, i) => { if (picks[i] === q.answer) s++; });
    setScore(s);
    setDone(true);
    const total = quiz.questions.length;
    if (s === total) {
      addXP(50); setConfetti(true);
      earnBadge({ id:'quiz_perfect', icon:'🎯', name:'Perfect Score!', desc:'All correct!' });
      buddyShow('win', `Got ${s}/${total} on the quiz!`);
    } else if (s >= total * 0.6) {
      addXP(30); buddyShow('win', `Got ${s}/${total}!`);
    } else {
      addXP(10); buddyShow('fail', `Got ${s}/${total}`);
    }
  };

  const q = quiz?.questions[qIdx];
  const picked = picks[qIdx];
  const isCorrect = picked !== undefined && q && picked === q.answer;

  // ── Start screen ──
  if (!quiz && !loading) return (
    <div className="page">
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:'3.5rem', animation:'bounce 2s ease-in-out infinite', display:'inline-block', marginBottom:10 }}>🎲</div>
        <h1 className="page-title" style={{
          background:'linear-gradient(135deg,#8B5CF6,#FF3D9A)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:6,
        }}>Quiz Arena</h1>
        <p className="text-muted text-sm">Test your superbrain powers 🧠</p>
      </div>

      <ProfileCard profile={profile} />

      <div className="card" style={{ padding:'22px 20px', marginBottom:16 }}>
        <p style={{ fontSize:'.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.6px', color:'var(--c-muted)', marginBottom:12 }}>
          Choose Quiz Type
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {TYPE_OPTS.map(t => (
            <button key={t.v} onClick={() => setType(t.v)}
              style={{
                padding:'16px 12px', borderRadius:'var(--r-md)', cursor:'pointer',
                border:`2px solid ${type===t.v ? t.color : 'var(--c-border2)'}`,
                background: type===t.v ? `${t.color}18` : 'var(--c-raised)',
                transition:'all .18s var(--ease-spring)',
                transform: type===t.v ? 'scale(1.03)' : 'none',
                boxShadow: type===t.v ? `0 4px 16px ${t.color}35` : 'none',
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              }}>
              <span style={{ fontSize:'1.8rem' }}>{t.emoji}</span>
              <span style={{ fontSize:'.8rem', fontWeight:800, color: type===t.v ? t.color : 'var(--c-text)', lineHeight:1.2, textAlign:'center' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding:'14px 18px', marginBottom:20, background:'linear-gradient(135deg,rgba(139,92,246,.08),var(--c-surface))', borderColor:'rgba(139,92,246,.2)' }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          {['5 Questions','Age-Adaptive','Instant XP','Track Score'].map((i,idx) => (
            <span key={idx} style={{ fontSize:'.75rem', fontWeight:800, color:'var(--c-muted)', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ color:'var(--c-teal)' }}>✓</span> {i}
            </span>
          ))}
        </div>
      </div>

      <button className="btn btn-purple btn-full btn-lg" onClick={startQuiz}>
        Start Quiz 🎯
      </button>
    </div>
  );

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'50vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:'2.5rem', animation:'spin .8s linear infinite' }}>🎲</div>
      <p style={{ fontFamily:'var(--f-head)', fontSize:'1.2rem' }}>Building your quiz…</p>
    </div>
  );

  // ── Results screen ──
  if (done) {
    const total = quiz.questions.length;
    const pct = Math.round((score/total)*100);
    return (
      <div className="page">
        {confetti && <Confetti onDone={() => setConfetti(false)}/>}
        <ProfileCard profile={profile} />
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:'4rem', animation:'resultPop .6s var(--ease-spring)', display:'inline-block', marginBottom:12 }}>
            {pct===100?'🏆':pct>=60?'🌟':'💪'}
          </div>
          <h1 className="page-title" style={{ marginBottom:8,
            background: pct===100 ? 'linear-gradient(135deg,#FFD60A,#FF8C00)'
              : pct>=60 ? 'linear-gradient(135deg,#8B5CF6,#FF3D9A)'
              : 'linear-gradient(135deg,#06B6D4,#8B5CF6)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            {pct===100?'PERFECT!':pct>=60?'Well Done!':'Keep Going!'}
          </h1>
          <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap', marginBottom:8 }}>
            <span style={{ background:'var(--c-raised)', border:'1px solid var(--c-border2)', padding:'6px 14px', borderRadius:99, fontSize:'.88rem', fontWeight:800 }}>
              Score: <span style={{ color: c }}>{score}/{total}</span>
            </span>
            <span style={{ background:'var(--c-raised)', border:'1px solid var(--c-border2)', padding:'6px 14px', borderRadius:99, fontSize:'.88rem', fontWeight:800 }}>
              ⭐ +{pct===100?50:pct>=60?30:10} XP
            </span>
          </div>
        </div>

        {/* Review answers */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {quiz.questions.map((q, i) => {
            const correct = picks[i] === q.answer;
            return (
              <div key={i} className="card" style={{
                padding:'14px 16px',
                borderColor: correct ? 'rgba(20,240,192,.3)' : 'rgba(255,77,77,.3)',
                background: correct ? 'rgba(20,240,192,.05)' : 'rgba(255,77,77,.05)',
              }}>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <span style={{ fontSize:'1rem', flexShrink:0 }}>{correct?'✅':'❌'}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'.85rem', marginBottom:4 }}>{q.question}</p>
                    {!correct && <p style={{ fontSize:'.75rem', color:'var(--c-muted)' }}>Your answer: <span style={{ color:'#FF4D4D' }}>{picks[i]}</span></p>}
                    <p style={{ fontSize:'.75rem' }}>Correct: <span style={{ color:'var(--c-teal)', fontWeight:800 }}>{q.answer}</span></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-outline" style={{ flex:1 }} onClick={() => { setQuiz(null); setDone(false); }}>
            Change Type
          </button>
          <button className="btn btn-purple" style={{ flex:2 }} onClick={startQuiz}>
            Play Again 🔄
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ──
  return (
    <div className="page">
      <ProfileCard profile={profile} />

      {/* Progress */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:'.72rem', fontWeight:800, color:'var(--c-muted)' }}>Question {qIdx+1} of {quiz.questions.length}</span>
            <span style={{ fontSize:'.72rem', fontWeight:800, color: c }}>{Math.round(((qIdx)/(quiz.questions.length))*100)}%</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{
              width:`${((qIdx)/(quiz.questions.length))*100}%`,
              background:`linear-gradient(90deg,${c},#8B5CF6)`,
              transition:'width .5s var(--ease-out)',
            }}/>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className={`card ${shake?'shake':''}`} style={{ padding:'24px 22px', marginBottom:16, textAlign:'center',
        background:`linear-gradient(135deg,${c}10,var(--c-surface) 55%)`, borderColor:`${c}25`,
        animation:'slideDown .35s var(--ease-spring)',
        animationFillMode:'both',
      }}>
        <span style={{ fontSize:'2rem', display:'block', marginBottom:10 }}>
          {type==='spelling'?'🔤':'🎯'}
        </span>
        <p style={{ fontFamily:'var(--f-head)', fontSize:'1.2rem', lineHeight:1.4 }}>{q?.question}</p>
      </div>

      {/* Options */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
        {q?.options.map((opt, i) => {
          const isPicked   = picked === opt;
          const isRight    = opt === q.answer;
          let border = 'var(--c-border2)';
          let bg     = 'var(--c-raised)';
          let textC  = 'var(--c-text)';
          if (reveal) {
            if (isRight)              { border='rgba(20,240,192,.7)'; bg='rgba(20,240,192,.12)'; textC='#14F0C0'; }
            else if (isPicked)        { border='rgba(255,77,77,.7)';  bg='rgba(255,77,77,.1)';   textC='#FF4D4D'; }
          } else if (isPicked) {
            border=`${c}80`; bg=`${c}18`; textC=c;
          }
          return (
            <button key={opt} onClick={() => pick(opt)}
              style={{
                padding:'14px 12px', borderRadius:'var(--r-md)', cursor: picked!==undefined?'default':'pointer',
                border:`2px solid ${border}`, background:bg, color:textC,
                fontFamily:'var(--f-body)', fontSize:'.9rem', fontWeight:800, lineHeight:1.3,
                transition:'all .2s var(--ease-spring)',
                transform: isPicked && !reveal ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isRight && reveal ? '0 4px 16px rgba(20,240,192,.3)' : 'none',
                display:'flex', alignItems:'center', gap:8,
              }}>
              <span style={{ width:22, height:22, borderRadius:'50%', background:'rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:800, flexShrink:0 }}>
                {['A','B','C','D'][i]}
              </span>
              {opt}
              {reveal && isRight && <span style={{ marginLeft:'auto' }}>✓</span>}
              {reveal && isPicked && !isRight && <span style={{ marginLeft:'auto' }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback line */}
      {reveal && (
        <div style={{
          textAlign:'center', marginBottom:14, padding:'10px', borderRadius:'var(--r-md)',
          background: isCorrect ? 'rgba(20,240,192,.1)' : 'rgba(255,77,77,.1)',
          border:`1px solid ${isCorrect?'rgba(20,240,192,.3)':'rgba(255,77,77,.3)'}`,
          animation:'slideUp .3s var(--ease-spring)',
          fontFamily:'var(--f-head)', fontSize:'.95rem',
          color: isCorrect ? '#14F0C0' : '#FF4D4D',
        }}>
          {isCorrect ? '✅ Correct! Great job!' : `❌ The answer was "${q.answer}"`}
        </div>
      )}

      <button className="btn btn-full btn-lg"
        onClick={next}
        style={{
          background: !reveal ? `linear-gradient(135deg,${c},#6366F1)` : 'linear-gradient(135deg,#14F0C0,#06B6D4)',
          color: !reveal ? 'white' : '#07050F',
          boxShadow: !reveal ? `0 4px 20px ${c}45` : '0 4px 20px rgba(20,240,192,.35)',
        }}>
        {qIdx < quiz.questions.length - 1
          ? (reveal ? 'Next Question →' : 'Lock Answer →')
          : (reveal ? 'See Results 🏆' : 'Finish Quiz 🏆')
        }
      </button>
    </div>
  );
}
