import { useState, useEffect } from 'react';
import './LandingPage.css';

const FLOATING_EMOJIS = ['⭐','🚀','🎨','📚','🧩','🎵','🌈','🦋','🔬','🏆','💡','🎭'];

export default function LandingPage({ onNavigate }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const parallaxX = (mousePos.x / window.innerWidth - 0.5) * 20;
  const parallaxY = (mousePos.y / window.innerHeight - 0.5) * 20;

  return (
    <div className={`landing ${visible ? 'visible' : ''}`}>
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Floating emoji particles */}
      <div className="floating-particles" style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}>
        {FLOATING_EMOJIS.map((emoji, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${(i * 8.3) % 100}%`,
              top: `${(i * 13 + 10) % 90}%`,
              animationDelay: `${i * 0.4}s`,
              fontSize: `${1.2 + (i % 3) * 0.4}rem`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Nav */}
      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-icon">🌟</span>
          <span className="logo-text">KidStar</span>
        </div>
        <div className="nav-actions">
          <button className="nav-login-btn" onClick={() => onNavigate('login')}>Log In</button>
          <button className="nav-signup-btn" onClick={() => onNavigate('signup')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <span className="pulse-dot" />
          Trusted by 10,000+ families worldwide
        </div>

        <h1 className="hero-title">
          Where Kids
          <span className="title-highlight"> Discover</span>
          <br />Their Inner
          <span className="title-star"> Superstar ✨</span>
        </h1>

        <p className="hero-sub">
          Personalized stories, brain-tickling quizzes, and magical adventures —
          all designed to make learning the best part of their day.
        </p>

        <div className="hero-cta">
          <button className="cta-primary" onClick={() => onNavigate('signup')}>
            <span>Start the Adventure</span>
            <span className="btn-arrow">→</span>
          </button>
          <button className="cta-secondary" onClick={() => onNavigate('login')}>
            Already a Star? Log In
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">4–14</span>
            <span className="stat-label">Ages</span>
          </div>
          <div className="stat-div" />
          <div className="stat">
            <span className="stat-num">100%</span>
            <span className="stat-label">Ad-Free</span>
          </div>
          <div className="stat-div" />
          <div className="stat">
            <span className="stat-num">∞</span>
            <span className="stat-label">Stories & Quizzes</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-label">What awaits inside</div>
        <h2 className="section-title">A World Built for Curious Minds</h2>

        <div className="features-grid">
          {[
            { emoji: '📖', title: 'AI Stories', desc: 'Personalized tales where YOUR child is the hero. New adventure every time!', color: '#FF6B9D' },
            { emoji: '🧠', title: 'Brain Games', desc: 'Memory challenges and puzzles that secretly make kids smarter.', color: '#C77DFF' },
            { emoji: '🧮', title: 'Math Magic', desc: 'Numbers turn into treasure hunts. Kids beg to do more math.', color: '#4CC9F0' },
            { emoji: '🎲', title: 'Smart Quizzes', desc: 'AI-powered questions that adapt to each child\'s level.', color: '#06D6A0' },
            { emoji: '🏆', title: 'Earn Badges', desc: 'Real rewards for real effort. Watch their confidence soar.', color: '#FFD166' },
            { emoji: '📅', title: 'Daily Routines', desc: 'Build healthy habits with fun morning and evening routines.', color: '#FF9F1C' },
          ].map((f, i) => (
            <div className="feature-card" key={i} style={{ '--card-color': f.color, animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.emoji}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parent Trust Section */}
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-text">
            <div className="section-label">For Parents</div>
            <h2 className="trust-title">Built With Your Child's Safety First</h2>
            <div className="trust-points">
              {[
                { icon: '🔒', title: 'No Ads. Ever.', desc: 'Zero ads, zero data selling. Your child\'s attention is priceless.' },
                { icon: '👁️', title: 'Full Transparency', desc: 'See exactly what your child learns, earns, and achieves every day.' },
                { icon: '🤖', title: 'Safe AI', desc: 'Every AI response is child-filtered. Nothing inappropriate ever gets through.' },
                { icon: '🎯', title: 'Age-Adaptive', desc: 'Content automatically adjusts from age 4 to 14. Always just right.' },
              ].map((p, i) => (
                <div className="trust-point" key={i}>
                  <span className="trust-icon">{p.icon}</span>
                  <div>
                    <strong>{p.title}</strong>
                    <p>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="trust-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="mock-header">
                  <span>🌟 KidStar</span>
                  <span className="mock-streak">🔥 7 day streak!</span>
                </div>
                <div className="mock-card">
                  <div className="mock-avatar">🦁</div>
                  <div className="mock-name">Alex the Lion</div>
                  <div className="mock-xp">
                    <span>⭐ 350 XP</span>
                    <div className="mock-bar"><div className="mock-fill" /></div>
                  </div>
                </div>
                <div className="mock-badges">
                  {['🌟','🚀','🧠','🏆','💡'].map((b, i) => (
                    <span key={i} className="mock-badge">{b}</span>
                  ))}
                </div>
                <div className="mock-message">📖 New story ready!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-label">Real families, real results</div>
        <h2 className="section-title">Parents Love It. Kids Can't Stop.</h2>
        <div className="testimonials-grid">
          {[
            { quote: "My 7-year-old asks to do 'one more quiz' every night. I never thought I'd say this, but I hide the tablet to make her stop learning!", name: "Priya M.", role: "Mother of 2, Pune", avatar: "👩" },
            { quote: "The personalized stories are genius. Seeing his name as the hero made my son fall in love with reading practically overnight.", name: "Rahul S.", role: "Father of 1, Mumbai", avatar: "👨" },
            { quote: "As a teacher, I'm impressed by how the AI adapts. It's not dumbed down — it genuinely meets kids where they are.", name: "Ms. Anita K.", role: "Primary School Teacher", avatar: "👩‍🏫" },
          ].map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{t.avatar}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-glow" />
        <h2>Ready to Unlock Your Child's Superstar?</h2>
        <p>Join thousands of families where learning is the favourite activity — not a chore.</p>
        <button className="cta-primary cta-large" onClick={() => onNavigate('signup')}>
          <span>Create Free Account</span>
          <span className="btn-arrow">🚀</span>
        </button>
        <p className="cta-note">No credit card needed · Takes 2 minutes · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <span>🌟</span> KidStar
        </div>
        <p>Safe learning for curious kids · Made with ❤️ for families everywhere</p>
      </footer>
    </div>
  );
}