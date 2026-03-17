import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { post, speak } from '../hooks/api';

const TIME_ICONS = ['☀️','🌤️','🌞','⛅','🌆','🌙','🌟'];

export default function RoutinePage() {
  const { profile, addXP } = useApp();
  const [routine,    setRoutine]    = useState('');
  const [translated, setTranslated] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [translating,setTranslating]= useState(false);
  const [playing,    setPlaying]    = useState(false);

  const getRoutine = async () => {
    setLoading(true); setTranslated('');
    try {
      const d = await post('words', { age: profile?.age || 7 });
      setRoutine(d.words);
      addXP(15);
      autoPlay(d.words);
    } catch { setRoutine('Could not load routine. Try again! 🙈'); }
    setLoading(false);
  };

  const autoPlay = (text) => {
    setPlaying(true); speak(text);
    setTimeout(() => setPlaying(false), (text.split(' ').length / 2.5) * 1000 + 500);
  };

  const doTranslate = async () => {
    if (!routine || translating) return;
    setTranslating(true);
    try {
      const d = await post('translate', { text: routine, language: 'Telugu' });
      setTranslated(d.translated);
    } catch {}
    setTranslating(false);
  };

  const paras = routine.split(/\n+/).filter(Boolean);

  return (
    <div className="page">
      {/* Header */}
      <div className="text-center" style={{ marginBottom:22 }}>
        <div style={{ fontSize:'3rem', display:'inline-block', animation:'float 3s ease-in-out infinite', marginBottom:6 }}>📅</div>
        <h1 className="page-title" style={{
          background:'linear-gradient(135deg,#FFD60A,#FF8C00)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:4,
        }}>My Day!</h1>
        <p className="text-muted text-sm">A story about a {profile?.age||7}-year-old Indian kid 🌟</p>
      </div>

      <div className="text-center" style={{ marginBottom:20 }}>
        <button className="btn btn-yellow btn-lg" onClick={getRoutine} disabled={loading}
          style={{ animation:!routine&&!loading?'pulse 2s ease-in-out infinite':undefined }}>
          {loading ? '⏳ Writing…' : routine ? '🔄 New Day' : '📅 Get My Day!'}
        </button>
      </div>

      {loading && (
        <div className="text-center" style={{ padding:'40px 20px' }}>
          <div style={{ fontSize:'3rem', animation:'wiggle 1s ease-in-out infinite', marginBottom:14 }}>📖</div>
          <div className="spinner" style={{ marginBottom:14 }} />
          <p className="text-muted" style={{ fontWeight:800 }}>Writing your day's adventure… ✍️</p>
        </div>
      )}

      {routine && !loading && (
        <div className="card" style={{
          padding:'22px', marginBottom:14,
          background:'linear-gradient(145deg,rgba(255,214,10,.08),var(--c-surface) 55%)',
          borderColor:'rgba(255,214,10,.2)',
          animation:'slideUp .4s var(--ease-out)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
            <h2 className="section-title" style={{ color:'#FFD60A', fontSize:'1.4rem' }}>
              {profile?.name || 'My'}'s Day ✨
            </h2>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => playing ? speak('') : autoPlay(routine)}>
                {playing ? '⏹ Stop' : '🔊 Read'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={doTranslate} disabled={translating}>
                {translating ? '⏳' : '🌐 Telugu'}
              </button>
            </div>
          </div>

          <div style={{ display:'grid', gap:10 }}>
            {paras.map((para, i) => (
              <div key={i} style={{
                display:'flex', gap:12, alignItems:'flex-start',
                padding:'12px 14px', borderRadius:'var(--r-md)',
                background:'var(--c-raised)', border:'1px solid var(--c-border)',
                animation:`cardIn .4s var(--ease-out) ${i*.06}s both`,
              }}>
                <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{TIME_ICONS[i % TIME_ICONS.length]}</span>
                <p style={{ lineHeight:1.7, fontWeight:700, fontSize:'.97rem' }}>{para}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Telugu */}
      {translated && (
        <div className="card" style={{
          padding:'20px', marginBottom:14,
          background:'rgba(20,240,192,.05)', borderColor:'rgba(20,240,192,.22)',
          animation:'slideUp .35s var(--ease-out)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <h3 className="section-title" style={{ color:'var(--c-teal)', fontSize:'1.3rem' }}>🌐 తెలుగులో</h3>
            <button className="btn btn-teal btn-sm" onClick={() => speak(translated,'te-IN',0.85)}>🔊 వినండి</button>
          </div>
          {translated.split(/\n+/).filter(Boolean).map((p, i) => (
            <p key={i} style={{ marginBottom:10, lineHeight:1.8, fontSize:'.95rem', fontWeight:700 }}>{p}</p>
          ))}
        </div>
      )}

      {!routine && !loading && (
        <div className="text-center" style={{ padding:'50px 20px', color:'var(--c-muted)' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:12, animation:'float 3s ease-in-out infinite' }}>🌅</div>
          <p className="font-head" style={{ fontSize:'1.3rem', marginBottom:6 }}>What will today bring?</p>
          <p className="text-sm" style={{ fontWeight:700 }}>Tap the button to generate your daily story!</p>
        </div>
      )}
    </div>
  );
}