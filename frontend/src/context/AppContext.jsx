import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const defaultMathSkills = {
  addition: { correct: 0, total: 0 },
  subtraction: { correct: 0, total: 0 },
  multiplication: { correct: 0, total: 0 },
  division: { correct: 0, total: 0 },
  lcm_hcf: { correct: 0, total: 0 },
  number_system: { correct: 0, total: 0 },
  approximation: { correct: 0, total: 0 },
  fractions_decimals: { correct: 0, total: 0 },
  percentage: { correct: 0, total: 0 },
  decimals_operations: { correct: 0, total: 0 },
  whole_numbers_operations: { correct: 0, total: 0 },
  fractions_operations: { correct: 0, total: 0 },
  simplification: { correct: 0, total: 0 },
  distance_time_speed: { correct: 0, total: 0 },
  measures: { correct: 0, total: 0 },
  factors_multiples: { correct: 0, total: 0 },
  profit_loss: { correct: 0, total: 0 },
  mensuration: { correct: 0, total: 0 },
  simple_interest: { correct: 0, total: 0 },
};

export function AppProvider({ children }) {
  const [ready,   setReady]   = useState(false);
  const [profile, setProfileState] = useState(null);
  const [xp,      setXpState]      = useState(0);
  const [badges,  setBadgesState]  = useState([]);
  const [streak,  setStreakState]  = useState(0);
  const [currentStory, setCurrentStory] = useState('');
  const [mathSkills, setMathSkillsState] = useState(defaultMathSkills);

  useEffect(() => {
    setProfileState(load('ks_profile', null));
    setXpState(load('ks_xp', 0));
    setBadgesState(load('ks_badges', []));
    setStreakState(load('ks_streak', 0));
    setMathSkillsState(load('ks_math_skills', defaultMathSkills));
    setReady(true);
  }, []);

  const setProfile = (p) => { setProfileState(p); save('ks_profile', p); };
  const resetAll   = () => {
    setProfileState(null); setXpState(0); setBadgesState([]); setStreakState(0); setMathSkillsState(defaultMathSkills);
    ['ks_profile','ks_xp','ks_badges','ks_streak','ks_math_skills'].forEach(k => localStorage.removeItem(k));
  };

  const addXP = (n) => setXpState(prev => {
    const next = prev + n; save('ks_xp', next); return next;
  });

  const earnBadge = (badge) => setBadgesState(prev => {
    if (prev.find(b => b.id === badge.id)) return prev;
    const next = [...prev, { ...badge, at: Date.now() }];
    save('ks_badges', next); return next;
  });

  const updateMathSkill = (skill, correctCount, totalCount) => {
    setMathSkillsState((prev) => {
      const current = prev?.[skill] || { correct: 0, total: 0 };
      const next = {
        ...prev,
        [skill]: {
          correct: current.correct + correctCount,
          total: current.total + totalCount,
        },
      };
      save('ks_math_skills', next);
      return next;
    });
  };

  const level      = Math.floor(xp / 100) + 1;
  const xpInLevel  = xp % 100;
  const xpToNext   = 100 - xpInLevel;

  return (
    <Ctx.Provider value={{
      ready, profile, setProfile, resetAll,
      xp, addXP, level, xpInLevel, xpToNext,
      badges, earnBadge,
      streak, setStreakState,
      mathSkills, updateMathSkill,
      currentStory, setCurrentStory,
    }}>
      {children}
    </Ctx.Provider>
  );
}
