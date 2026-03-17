import { useState, useEffect, useRef } from 'react';
import './Buddy.css';
import { post, speak, stopSpeak, listen } from '../hooks/api';

/* ═══════════════════════════════════════════════════════
   LOCAL RESPONSE LIBRARY — Zero API calls for greetings
   Each context has 5+ varied responses to avoid repetition
═══════════════════════════════════════════════════════ */
const LOCAL_MSGS = {
  dashboard: [
    (n) => `Welcome back, ${n}! ✨ What shall we explore today?`,
    (n) => `Hey ${n}! 🌟 Your adventure is waiting — what's first?`,
    (n) => `Great to see you, ${n}! 🚀 Ready to learn something awesome?`,
    (n) => `${n}, the champion is back! 🏆 Let's make today amazing!`,
    (n) => `Hello ${n}! 🎉 Pick anything — stories, quizzes, math, memory!`,
  ],
  story: [
    (n) => `Story time, ${n}! 📖 Pick any topic and I'll spin a magical tale!`,
    (n) => `${n}, let's go on a story adventure! 🌈 What world shall we explore?`,
    (n) => `Ooh, stories! 📚 Type your favourite topic, ${n}, and watch the magic!`,
    (n) => `${n}, be the author today! ✨ Choose a topic and create your story!`,
    (n) => `Imagination mode ON! 🚀 What story do you want, ${n}?`,
  ],
  quiz: [
    (n) => `Quiz champion time, ${n}! 🎲 Show the world what you know!`,
    (n) => `${n}, your brain is ready for this quiz! 💡 Give it your best shot!`,
    (n) => `Let's test that big brain, ${n}! 🧠 Pick a quiz and go for it!`,
    (n) => `${n}, I bet you'll ace this! 🌟 Quizzes are your superpower!`,
    (n) => `Ready, set, quiz! 🎯 You've got this, ${n}!`,
  ],
  math: [
    (n) => `Numbers time, ${n}! 🧮 Maths is your hidden superpower!`,
    (n) => `${n}, let's crush some maths problems! ➕ I know you can do it!`,
    (n) => `Maths wizard ${n} has arrived! 🔢 Let's solve something brilliant!`,
    (n) => `${n}, every maths problem you solve makes you smarter! 🚀 Let's go!`,
    (n) => `Calculating in 3… 2… 1… 🧮 You're amazing at this, ${n}!`,
  ],
  memory: [
    (n) => `Memory master ${n}! 🧠 Can you find all the matching pairs?`,
    (n) => `${n}, flip those cards and show off that incredible memory! 🃏`,
    (n) => `Let's play memory! 🌟 Pick a theme and pair 'em up, ${n}!`,
    (n) => `${n}, focus those eyes! 👀 The cards are hiding secrets!`,
    (n) => `Brain workout time, ${n}! 🧠 How fast can you match them all?`,
  ],
  leaderboard: [
    (n) => `Look at those scores, ${n}! 🏆 Keep earning points to climb higher!`,
    (n) => `${n}, you're a star! 🌟 Every point counts — keep going!`,
    (n) => `Champions board! 🥇 ${n}, your name belongs at the top!`,
    (n) => `${n}, check out the rankings! 🏆 You're on your way to #1!`,
    (n) => `Leaderboard time! ⭐ How many points can you earn today, ${n}?`,
  ],
  win: [
    (n) => `${n}, YOU DID IT!! 🎉🎊 That was absolutely incredible!`,
    (n) => `YESSS!! 🌟 ${n}, I am SO proud of you right now!`,
    (n) => `${n}, champion energy! 🏆🎉 You smashed it completely!`,
    (n) => `Wow wow wow!! ✨ ${n}, you are unstoppable!`,
    (n) => `${n}, that was PERFECT! 🎯🌟 You're a total superstar!`,
  ],
  fail: [
    (n) => `That's okay, ${n}! 💪 Every champion tries again — you've got this!`,
    (n) => `${n}, mistakes help us learn! 🌱 Give it one more try!`,
    (n) => `Don't worry, ${n}! 🤗 Even superheroes need practice!`,
    (n) => `${n}, you're learning something new right now! 💡 Try again!`,
    (n) => `Almost there, ${n}! ⭐ One more try and you'll nail it!`,
  ],
  idle: [
    (n) => `Psst, ${n}… adventures are waiting for you! 👀`,
    (n) => `${n}, something exciting is just one tap away! 🚀`,
    (n) => `Hey ${n}! 🌟 Shall we read a story or play memory?`,
    (n) => `${n}, your brain is missing all the fun! 😄 Let's go!`,
    (n) => `Ready when you are, ${n}! ✨ Pick anything!`,
  ],
  welcome: [
    (n) => `Welcome to KidStar, ${n}! 🌟 Adventures and learning await you!`,
    (n) => `${n}, you're going to LOVE this! 🚀 Ready to start your journey?`,
    (n) => `Hi ${n}! 🎉 I'm Buddy and I'll guide you through everything!`,
  ],
};

/* Local answers for very common kids' questions — no API needed */
const LOCAL_QA = [
  { q: /how many planets/i,           a: "There are 8 planets in our solar system! 🪐 Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune!" },
  { q: /what is the largest planet/i, a: "Jupiter is the largest planet! 🪐 It's so big that 1,300 Earths could fit inside it!" },
  { q: /what is the smallest planet/i,a: "Mercury is the smallest planet! 🔭 It's even smaller than Earth's moon!" },
  { q: /what planet.*live|which planet.*home/i, a: "We live on Earth! 🌍 It's the third planet from the Sun and the only one with life!" },
  { q: /how many.*legs.*spider|spider.*legs/i, a: "Spiders have 8 legs! 🕷️ That's why they're called arachnids, not insects!" },
  { q: /how many.*legs.*insect|insect.*legs/i, a: "Insects have 6 legs! 🐛 That's one of the ways we know if something is an insect!" },
  { q: /fastest animal/i,             a: "The cheetah is the fastest land animal! 🐆 It can run up to 120 km per hour!" },
  { q: /largest animal/i,             a: "The blue whale is the largest animal ever! 🐋 It can be as long as 3 school buses!" },
  { q: /what.*sun.*made|sun.*made of/i, a: "The Sun is made of hot gas, mostly hydrogen and helium! ☀️ It's like a giant ball of fire!" },
  { q: /why.*sky.*blue/i,             a: "The sky looks blue because sunlight bounces off tiny air particles! 🌤️ Blue light scatters the most!" },
  { q: /why.*grass.*green/i,          a: "Grass is green because of chlorophyll! 🌿 It's a special pigment plants use to make food from sunlight!" },
  { q: /how many.*teeth/i,            a: "Adults have 32 teeth! 🦷 Kids have 20 baby teeth first, then they're replaced by permanent ones!" },
  { q: /how many.*bones/i,            a: "Adults have 206 bones! 🦴 Babies actually have more — about 270 — that fuse together as they grow!" },
  { q: /what.*2\s*[+\*x]\s*2|two.*times.*two|two.*plus.*two/i, a: "2 + 2 = 4! 🔢 Easy peasy! You're great at maths!" },
  { q: /capital.*india/i,             a: "The capital of India is New Delhi! 🇮🇳 It's a huge and amazing city!" },
  { q: /capital.*france/i,            a: "The capital of France is Paris! 🗼 It has the famous Eiffel Tower!" },
  { q: /capital.*usa|capital.*america/i, a: "The capital of the USA is Washington D.C.! 🦅 Not New York — many people get that wrong!" },
  { q: /what.*colour.*sun|what.*color.*sun/i, a: "The Sun is actually white! ☀️ It only looks yellow or orange from Earth because of our atmosphere!" },
  { q: /what.*colour.*sky at night|what.*color.*sky at night/i, a: "The sky looks dark/black at night because the Sun is on the other side of Earth! 🌙 And we see the stars!" },
  { q: /what.*rain.*made|why.*rain/i, a: "Rain is water! 🌧️ Water from oceans goes up as clouds, then falls back down as rain — it's called the water cycle!" },
  { q: /how.*rainbow/i,               a: "Rainbows form when sunlight passes through raindrops and splits into 7 colours! 🌈 Red, orange, yellow, green, blue, indigo, violet!" },
  { q: /what.*photosynthesis/i,       a: "Photosynthesis is how plants make food! 🌱 They use sunlight, water, and air to create energy and release oxygen!" },
];

function getLocalAnswer(text) {
  for (const item of LOCAL_QA) {
    if (item.q.test(text)) return item.a;
  }
  return null;
}

function pickRandom(arr, heroName) {
  const fn = arr[Math.floor(Math.random() * arr.length)];
  return typeof fn === 'function' ? fn(heroName) : fn;
}

/* ─── Face SVG ────────────────────────────────────────── */
const FACES = {
  happy:   { eyes:'happy',   mouth:'M 12 20 Q 20 28 28 20', brows:'neutral' },
  excited: { eyes:'excited', mouth:'M 10 18 Q 20 30 30 18', brows:'raised'  },
  sad:     { eyes:'sad',     mouth:'M 12 24 Q 20 16 28 24', brows:'worried' },
  think:   { eyes:'think',   mouth:'M 14 22 Q 18 20 22 22', brows:'oneup'   },
  love:    { eyes:'love',    mouth:'M 12 20 Q 20 30 28 20', brows:'neutral' },
};

function BuddyFace({ mood = 'happy', color = '#8B5CF6', listening = false }) {
  const face = FACES[mood] || FACES.happy;
  const renderEyes = () => {
    switch (face.eyes) {
      case 'excited':
        return (<><ellipse cx="14" cy="17" rx="3.5" ry="4" fill="white"/><ellipse cx="26" cy="17" rx="3.5" ry="4" fill="white"/><circle cx="14.5" cy="17.5" r="2.5" fill="#1a1a2e"/><circle cx="26.5" cy="17.5" r="2.5" fill="#1a1a2e"/><circle cx="15.2" cy="16.6" r="0.9" fill="white"/><circle cx="27.2" cy="16.6" r="0.9" fill="white"/></>);
      case 'sad':
        return (<><ellipse cx="14" cy="17" rx="3" ry="2.8" fill="white"/><ellipse cx="26" cy="17" rx="3" ry="2.8" fill="white"/><circle cx="14" cy="17.8" r="1.8" fill="#1a1a2e"/><circle cx="26" cy="17.8" r="1.8" fill="#1a1a2e"/></>);
      case 'love':
        return (<><text x="11" y="21" fontSize="7" fill="#FF6B9D">♥</text><text x="23" y="21" fontSize="7" fill="#FF6B9D">♥</text></>);
      case 'think':
        return (<><ellipse cx="14" cy="17" rx="3" ry="3.5" fill="white"/><ellipse cx="26" cy="17" rx="3" ry="3.5" fill="white"/><circle cx="15.5" cy="17" r="2" fill="#1a1a2e"/><circle cx="27.5" cy="17" r="2" fill="#1a1a2e"/></>);
      default:
        return (<><ellipse cx="14" cy="17" rx="3" ry="3.5" fill="white"/><ellipse cx="26" cy="17" rx="3" ry="3.5" fill="white"/><circle cx="14.8" cy="17.5" r="2" fill="#1a1a2e"/><circle cx="26.8" cy="17.5" r="2" fill="#1a1a2e"/><circle cx="15.5" cy="16.8" r="0.7" fill="white"/><circle cx="27.5" cy="16.8" r="0.7" fill="white"/></>);
    }
  };
  const renderBrows = () => {
    switch (face.brows) {
      case 'raised':  return (<><path d="M 10 11 Q 14 8 18 11"  stroke="white" strokeWidth="2"   fill="none" strokeLinecap="round"/><path d="M 22 11 Q 26 8 30 11"  stroke="white" strokeWidth="2"   fill="none" strokeLinecap="round"/></>);
      case 'worried': return (<><path d="M 10 12 Q 14 10 18 13" stroke="white" strokeWidth="2"   fill="none" strokeLinecap="round"/><path d="M 22 13 Q 26 10 30 12" stroke="white" strokeWidth="2"   fill="none" strokeLinecap="round"/></>);
      case 'oneup':   return (<><path d="M 10 12 Q 14 9 18 12"  stroke="white" strokeWidth="2"   fill="none" strokeLinecap="round"/><path d="M 22 11 Q 26 11 30 12" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></>);
      default:        return (<><path d="M 10 12 Q 14 10 18 12" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M 22 12 Q 26 10 30 12" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></>);
    }
  };
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" style={{ overflow:'visible' }}>
      <ellipse cx="20" cy="20" rx="18" ry="18" fill={color} opacity="0.15"/>
      <ellipse cx="20" cy="20" rx="16" ry="16" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6"/>
      <ellipse cx="9"  cy="24" rx="4"  ry="2.5" fill="#FF9AC9" opacity="0.4"/>
      <ellipse cx="31" cy="24" rx="4"  ry="2.5" fill="#FF9AC9" opacity="0.4"/>
      {renderBrows()}
      {renderEyes()}
      <path d={face.mouth} stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {listening && (
        <circle cx="20" cy="20" r="19" fill="none" stroke="#FF6B9D" strokeWidth="2" opacity="0.7">
          <animate attributeName="r"       values="19;22;19"     dur="0.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0.1;0.7"  dur="0.8s" repeatCount="indefinite"/>
        </circle>
      )}
    </svg>
  );
}

/* ─── Main Buddy ─────────────────────────────────────── */
export default function Buddy({ profile, page }) {
  const [visible,   setVisible]   = useState(false);
  const [open,      setOpen]      = useState(false);
  const [msg,       setMsg]       = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mood,      setMood]      = useState('happy');
  const [anim,      setAnim]      = useState('idle');
  const [listening, setListening] = useState(false);
  const [hasNew,    setHasNew]    = useState(false);
  const [speaking,  setSpeaking]  = useState(false);
  const [wiggle,    setWiggle]    = useState(false);
  const [armLeft,   setArmLeft]   = useState('rest');
  const [armRight,  setArmRight]  = useState('rest');
  const [jumpUp,    setJumpUp]    = useState(false);
  // Track last page to not repeat same message twice in a row
  const lastPageRef = useRef('');
  const speakTimer  = useRef(null);

  const color    = profile?.color    || '#8B5CF6';
  const glow     = profile?.glow     || 'rgba(139,92,246,0.5)';
  const emoji    = profile?.avatar   || '🦁';
  const heroName = profile?.heroName || profile?.name || 'Champion';
  const age      = profile?.age      || 7;

  /* entrance */
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true); setAnim('enter'); setArmLeft('wave');
      setTimeout(() => { setAnim('idle'); setArmLeft('rest'); }, 1200);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  /* page change → LOCAL greeting, NO API call */
  useEffect(() => {
    if (!visible || !profile) return;
    if (lastPageRef.current === page) return;
    lastPageRef.current = page;

    const greeting = pickRandom(LOCAL_MSGS[page] || LOCAL_MSGS.dashboard, heroName);
    showLocalMsg(greeting, page === 'win' ? 'excited' : page === 'fail' ? 'sad' : 'happy');
    setHasNew(true);
  }, [page, visible, profile]);

  /* periodic wiggle */
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => {
      setWiggle(true);
      setTimeout(() => setWiggle(false), 600);
    }, 9000);
    return () => clearInterval(t);
  }, [visible]);

  /* ── Show a local message (no API) ── */
  const showLocalMsg = (text, newMood = 'happy', doSpeak = false) => {
    setMsg(text);
    setMood(newMood);
    if (doSpeak) speakMsg(text);
    // Animate
    if (newMood === 'excited') {
      setAnim('celebrate'); setJumpUp(true); setArmLeft('wave'); setArmRight('wave');
      setTimeout(() => { setAnim('idle'); setJumpUp(false); setArmLeft('rest'); setArmRight('rest'); }, 1000);
    } else {
      setAnim('bounce'); setArmLeft('wave');
      setTimeout(() => { setAnim('idle'); setArmLeft('rest'); }, 800);
    }
  };

  /* ── Ask Gemini only for actual voice questions ── */
  const askGemini = async (question) => {
    setAiLoading(true);
    setMood('think');
    try {
      const d = await post('buddy-ask', { question, heroName, age });
      const reply = d.message || `That's a great question, ${heroName}! 🌟 I'm still learning that one!`;
      showLocalMsg(reply, 'excited', true);
    } catch {
      showLocalMsg(`Hmm, I'm not sure about that one, ${heroName}! 🤔 Ask a teacher or parent!`, 'think', false);
    }
    setAiLoading(false);
  };

  const speakMsg = (text) => {
    clearTimeout(speakTimer.current);
    setSpeaking(true);
    const rate = age <= 6 ? 0.78 : age <= 9 ? 0.84 : 0.9;
    speak(text, 'en-US', rate, 1.15);
    const ms = ((text?.split(' ').length || 8) / 2.5) * 1000 + 600;
    speakTimer.current = setTimeout(() => setSpeaking(false), ms);
  };

  /* ── VOICE: answer locally if possible, otherwise use Gemini ── */
  const startVoice = () => {
    stopSpeak(); setSpeaking(false);
    setListening(true); setMood('think'); setArmRight('point');
    showLocalMsg('🎤 I\'m listening… ask me anything!', 'think', false);

    listen(
      (transcript) => {
        setListening(false); setArmRight('rest');
        setOpen(true);

        const low = transcript.toLowerCase();

        // 1. Try local Q&A first (no API needed)
        const localAnswer = getLocalAnswer(transcript);
        if (localAnswer) {
          showLocalMsg(localAnswer, 'excited', true);
          setHasNew(true);
          return;
        }

        // 2. Navigation intent — handle locally
        const navPage = low.includes('story')  ? 'story'
          : low.includes('quiz')   ? 'quiz'
          : low.includes('math')   ? 'math'
          : low.includes('memory') ? 'memory'
          : null;
        if (navPage) {
          const navMsgs = {
            story:  `Taking you to Story Time right now, ${heroName}! 📖`,
            quiz:   `Quiz time! Let's go, ${heroName}! 🎲`,
            math:   `Maths mode activated, ${heroName}! 🧮`,
            memory: `Memory game time, ${heroName}! 🧠`,
          };
          showLocalMsg(navMsgs[navPage], 'excited', true);
          setTimeout(() => window.dispatchEvent(new CustomEvent('buddy:navigate', { detail: { page: navPage } })), 1500);
          setHasNew(true);
          return;
        }

        // 3. Social/simple phrases — handle locally
        if (/^(hi|hello|hey|hiya)/i.test(low)) {
          showLocalMsg(`Hi there, ${heroName}! 👋 So great to hear your voice!`, 'love', true);
          return;
        }
        if (/thank|thanks/i.test(low)) {
          showLocalMsg(`You're very welcome, ${heroName}! 🤗 That's what I'm here for!`, 'love', true);
          return;
        }
        if (/bored|nothing|don't know|boring/i.test(low)) {
          showLocalMsg(`${heroName}, let's fix that! 🚀 Try a story or memory game!`, 'excited', true);
          return;
        }
        if (/help/i.test(low)) {
          showLocalMsg(`I'm here, ${heroName}! 🌟 Try Story for tales, Quiz for challenges, or Memory for fun!`, 'happy', true);
          return;
        }

        // 4. Real question → send to Gemini (one call only)
        showLocalMsg(`Ooh, good question, ${heroName}! 🤔 Let me think…`, 'think', false);
        askGemini(transcript);
        setHasNew(true);
      },
      () => {
        setListening(false); setArmRight('rest'); setMood('happy');
        if (!msg) showLocalMsg(pickRandom(LOCAL_MSGS.idle, heroName), 'happy', false);
      }
    );
  };

  /* ── External events from other pages (win/fail etc.) ── */
  useEffect(() => {
    const h = (e) => {
      const { context, extra } = e.detail || {};
      const msgs = LOCAL_MSGS[context];
      if (msgs) {
        const text = extra || pickRandom(msgs, heroName);
        showLocalMsg(text, context === 'win' ? 'excited' : context === 'fail' ? 'sad' : 'happy',
          context === 'win' || context === 'fail');
      }
    };
    window.addEventListener('buddy:show', h);
    return () => window.removeEventListener('buddy:show', h);
  }, [profile]);

  const toggleOpen = () => {
    if (!open) {
      setOpen(true); setHasNew(false);
      if (!msg) showLocalMsg(pickRandom(LOCAL_MSGS[page] || LOCAL_MSGS.dashboard, heroName), 'happy', false);
      setArmLeft('wave');
      setTimeout(() => setArmLeft('rest'), 700);
    } else {
      setOpen(false); stopSpeak(); setSpeaking(false);
    }
  };

  if (!visible || !profile) return null;

  const leftArmPath  = armLeft  === 'wave' ? 'M20,30 Q5,18 8,8'   : armLeft  === 'point' ? 'M20,30 Q4,24 2,16'   : 'M20,30 Q8,28 10,36';
  const rightArmPath = armRight === 'wave' ? 'M44,30 Q59,18 56,8'  : armRight === 'point' ? 'M44,30 Q60,24 62,16'  : 'M44,30 Q56,28 54,36';

  return (
    <div className="buddy-wrap" role="complementary" aria-label="Buddy guide">

      {/* Speech bubble */}
      {open && (
        <div className="buddy-bubble">
          {aiLoading ? (
            <div style={{ padding: '8px 0' }}>
              <div className="buddy-typing"><span/><span/><span/></div>
              <p style={{ fontSize:'0.72rem', color:'var(--c-muted)', textAlign:'center', marginTop:6, fontWeight:700 }}>
                Thinking of a great answer…
              </p>
            </div>
          ) : (
            <>
              <p className="buddy-msg">{msg}</p>
              <div className="buddy-replies">
                <button
                  className={`buddy-reply-btn mic-btn${listening ? ' listening' : ''}`}
                  onClick={startVoice}
                  disabled={listening}
                  style={{
                    background: listening ? 'rgba(255,61,154,0.2)' : undefined,
                    borderColor: listening ? 'var(--c-pink)' : undefined,
                  }}
                >
                  {listening ? '🔴 Listening…' : '🎤 Ask me anything!'}
                </button>
                <button
                  className="buddy-reply-btn"
                  onClick={() => {
                    const newMsg = pickRandom(LOCAL_MSGS[page] || LOCAL_MSGS.idle, heroName);
                    showLocalMsg(newMsg, 'happy', false);
                  }}
                  style={{ fontSize:'0.78rem' }}
                >
                  💬 Tip for this page
                </button>
              </div>
            </>
          )}
          <button className="bubble-close" onClick={() => setOpen(false)}>✕</button>
        </div>
      )}

      {/* Buddy body */}
      <div
        className={`buddy-body ${anim} ${wiggle ? 'wiggle' : ''} ${jumpUp ? 'jump' : ''}`}
        onClick={toggleOpen}
        role="button" tabIndex={0}
        aria-label="Open buddy"
        onKeyDown={e => e.key === 'Enter' && toggleOpen()}
        style={{ '--buddy-color': color, '--buddy-glow': glow }}
      >
        <svg className={`buddy-arm left ${armLeft}`} viewBox="0 0 64 64" width="40" height="40">
          <path d={leftArmPath} stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9"/>
          <circle cx={armLeft==='wave'?8:armLeft==='point'?2:10} cy={armLeft==='wave'?8:armLeft==='point'?16:36} r="5" fill={color}/>
        </svg>

        <div className="buddy-avatar"
          style={{ background:`linear-gradient(135deg,${color},#6366F1)`, boxShadow:`0 0 28px ${glow}, 0 0 60px ${glow.replace('0.5','0.2')}` }}>
          {speaking && <div className="speak-ring" style={{ borderColor: color }}/>}
          <div className="buddy-face">
            <BuddyFace mood={mood} color={color} listening={listening}/>
          </div>
          <div className="buddy-emoji">{emoji}</div>
          {hasNew && !open && <span className="buddy-dot"/>}
        </div>

        <svg className={`buddy-arm right ${armRight}`} viewBox="0 0 64 64" width="40" height="40">
          <path d={rightArmPath} stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9"/>
          <circle cx={armRight==='wave'?56:armRight==='point'?62:54} cy={armRight==='wave'?8:armRight==='point'?16:36} r="5" fill={color}/>
        </svg>

        <div className="buddy-shadow"/>
        <div className="buddy-feet">
          <div className="foot" style={{ background: color }}/>
          <div className="foot" style={{ background: color }}/>
        </div>

        <div className="buddy-label" style={{ background: color }}>
          {listening ? '🎤 Listening…' : speaking ? '🔊 Speaking…' : heroName}
        </div>
      </div>
    </div>
  );
}

export function buddyShow(context, extra = '') {
  window.dispatchEvent(new CustomEvent('buddy:show', { detail: { context, extra } }));
}