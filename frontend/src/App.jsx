import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Scene from './components/Scene';
import Buddy from './components/Buddy';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import StoryPage from './pages/StoryPage';
import QuizPage from './pages/QuizPage';
import MathPage from './pages/MathPage';
import MemoryGame from './pages/MemoryGame';
import RoutinePage from './pages/RoutinePage';
import LeaderboardPage from './pages/LeaderboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

const NAV = [
  { id: 'dashboard',   emoji: '🏠', label: 'Home'   },
  { id: 'story',       emoji: '📖', label: 'Story'  },
  { id: 'quiz',        emoji: '🎲', label: 'Quiz'   },
  { id: 'math',        emoji: '🧮', label: 'Math'   },
  { id: 'memory',      emoji: '🧠', label: 'Memory' },
  { id: 'leaderboard', emoji: '🏆', label: 'Champs' },
];

function getValidSession() {
  try {
    const token = localStorage.getItem('ks_auth_token');
    const user  = localStorage.getItem('ks_user');
    if (token && user && (token === 'demo' || token.length > 10)) {
      return JSON.parse(user);
    }
  } catch {}
  return null;
}

function MainApp({ onLogout, authUser }) {
  const { profile, ready } = useApp();
  const [page, setPage]   = useState('dashboard');
  const [pageKey, setKey] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.detail?.page) go(e.detail.page); };
    window.addEventListener('buddy:navigate', handler);
    return () => window.removeEventListener('buddy:navigate', handler);
  }, []);

  if (!ready) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh' }}>
      <div className="spinner" />
    </div>
  );

  if (!profile) return <Setup onDone={() => { setPage('dashboard'); setKey(k => k + 1); }} />;

  const go = (p) => { setPage(p); setKey(k => k + 1); };

  const renderPage = () => {
    const props = { key: pageKey, onNav: go };
    switch (page) {
      case 'story':       return <StoryPage       {...props} />;
      case 'quiz':        return <QuizPage         {...props} />;
      case 'math':        return <MathPage         {...props} />;
      case 'memory':      return <MemoryGame       {...props} />;
      case 'routine':     return <RoutinePage      {...props} />;
      case 'leaderboard': return <LeaderboardPage  {...props} />;
      case 'profile':     return <ProfilePage      {...props} authUser={authUser} onLogout={onLogout} />;
      default:            return <Dashboard        {...props} onLogout={onLogout} />;
    }
  };

  const avatarDisplay = profile?.avatar || '👤';
  const avatarColor   = profile?.color  || '#8B5CF6';

  return (
    <>
      <div style={{ paddingBottom: 80, minHeight: '100dvh', position: 'relative', zIndex: 1 }}>
        {renderPage()}
      </div>

      <nav className="nav-bar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          {NAV.map(n => (
            <button key={n.id}
              className={`nav-btn${page === n.id ? ' active' : ''}`}
              onClick={() => go(n.id)}
              aria-label={n.label}
              aria-current={page === n.id ? 'page' : undefined}
            >
              <span className="nav-emoji" role="img" aria-hidden>{n.emoji}</span>
              <span>{n.label}</span>
            </button>
          ))}

          <button
            className={`nav-btn${page === 'profile' ? ' active' : ''}`}
            onClick={() => go('profile')}
            aria-label="Profile"
            aria-current={page === 'profile' ? 'page' : undefined}
          >
            <span
              className="nav-emoji"
              role="img"
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${avatarColor}, #8B5CF6)`,
                fontSize: '1rem',
                boxShadow: page === 'profile' ? `0 0 10px ${avatarColor}80` : 'none',
                border: page === 'profile' ? `2px solid ${avatarColor}` : '2px solid transparent',
                transition: 'all .2s',
              }}
            >
              {avatarDisplay}
            </span>
            <span>Profile</span>
          </button>
        </div>
      </nav>

      <Buddy profile={profile} page={page} />
    </>
  );
}

function Root() {
  const [screen,   setScreen]   = useState('landing');
  const [authUser, setAuthUser] = useState(null);
  const [checked,  setChecked]  = useState(false);

  useEffect(() => {
    const user = getValidSession();
    if (user) {
      setAuthUser(user);
      setScreen('app');
    }
    setChecked(true);
  }, []);

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    setScreen('app');
  };

  const handleSignupSuccess = (user) => {
    setAuthUser(user);
    setScreen('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('ks_auth_token');
    localStorage.removeItem('ks_user');
    setAuthUser(null);
    setScreen('landing');
  };

  if (!checked) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh' }}>
      <div className="spinner" />
    </div>
  );

  if (screen === 'landing') return <LandingPage onNavigate={setScreen} />;
  if (screen === 'login')   return <LoginPage   onNavigate={setScreen} onLoginSuccess={handleLoginSuccess} />;
  if (screen === 'signup')  return <SignupPage  onNavigate={setScreen} onSignupSuccess={handleSignupSuccess} />;

  return (
    <AppProvider>
      <Scene />
      <MainApp onLogout={handleLogout} authUser={authUser} />
    </AppProvider>
  );
}

export default function App() {
  return <Root />;
}