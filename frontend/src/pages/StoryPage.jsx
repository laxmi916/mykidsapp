import { useState } from "react";
import { useApp } from "../context/AppContext";
import Confetti from "../components/Confetti";
import { buddyShow } from "../components/Buddy";
import { post, speak, listen } from "../hooks/api";
import "./StoryPage.css";

const TOPICS = ["Lion","Space","Ocean","Dragon","Princess","Robot","Jungle","Magic School","Dinosaur","Superhero"];

const normalizeAnswer = (value) =>
  String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();

const getCorrectOption = (question) => {
  if (!question) return "";

  const rawAnswer = String(question.answer ?? "").trim();
  const options = Array.isArray(question.options) ? question.options : [];
  const idxFromLetter = rawAnswer.match(/^[A-D]$/i)
    ? rawAnswer.toUpperCase().charCodeAt(0) - 65
    : -1;

  if (idxFromLetter >= 0 && options[idxFromLetter] !== undefined) {
    return String(options[idxFromLetter]).trim();
  }

  const match = options.find(
    (opt) => normalizeAnswer(opt) === normalizeAnswer(rawAnswer)
  );

  return match ? String(match).trim() : rawAnswer;
};

export default function StoryPage() {
  const { profile, addXP } = useApp();

  const [age, setAge]       = useState(profile?.age || 7);
  const [topic, setTopic]   = useState("");
  const [story, setStory]   = useState("");
  const [translated, setTranslated] = useState("");

  const [storyLoading, setStoryLoading] = useState(false);
  const [quizLoading,  setQuizLoading]  = useState(false);
  const [transLoading, setTransLoading] = useState(false);

  const [quiz,    setQuiz]    = useState(null);
  const [answers, setAnswers] = useState({});
  const [score,   setScore]   = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [listening, setListening] = useState(false);
  const [confetti,  setConfetti]  = useState(false);
  const [speaking,  setSpeaking]  = useState(false);

  const getStory = async (overrideTopic) => {
    const finalTopic = overrideTopic || topic;
    if (!finalTopic.trim()) return;
    setStoryLoading(true);
    setStory(""); setTranslated(""); setQuiz(null); setScore(null); setAnswers({}); setSubmitted(false);
    try {
      const data = await post("story", { age, topic: finalTopic });
      setStory(data.story);
      addXP(10);
      setConfetti(true);
      buddyShow("win", "Great story! 📖");
      setTimeout(() => setConfetti(false), 1400);
    } catch {
      setStory("Oops! Could not load the story. Please try again.");
    }
    setStoryLoading(false);
  };

  const handleVoice = () => {
    listen(
      (transcript) => { setTopic(transcript); getStory(transcript); },
      () => setListening(false)
    );
    setListening(true);
  };

  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    setSpeaking(true);
    speak(story, "en-US", 0.88);
    setTimeout(() => setSpeaking(false), story.length * 65 + 2000);
  };

  const translateToTelugu = async () => {
    setTransLoading(true);
    try {
      const data = await post("translate", { text: story });
      setTranslated(data.translated);
      speak(data.translated, "te-IN");
    } catch { setTranslated("Translation failed. Please try again."); }
    setTransLoading(false);
  };

  const getQuiz = async () => {
    if (!story) return;
    setQuizLoading(true);
    setQuiz(null); setAnswers({}); setScore(null); setSubmitted(false);
    try {
      const data = await post("story-quiz", { story, age });
      const questions = (data?.questions || []).map((q) => ({
        ...q,
        question: String(q.question ?? "").trim(),
        answer: String(q.answer ?? "").trim(),
        options: (q.options || []).map((opt) => String(opt ?? "").trim()),
      }));
      setQuiz({ questions });
    } catch {
      setQuiz({ questions: [] });
    }
    setQuizLoading(false);
  };

  const selectAnswer = (qi, opt) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qi]: opt }));
  };

  const submitQuiz = () => {
    let s = 0;
    quiz.questions.forEach((q, i) => {
      if (normalizeAnswer(answers[i]) === normalizeAnswer(getCorrectOption(q))) s++;
    });
    setScore(s);
    setSubmitted(true);
    if (s === quiz.questions.length) {
      setConfetti(true);
      buddyShow("win", "Perfect score! 🌟");
      addXP(20);
      setTimeout(() => setConfetti(false), 1400);
    } else {
      buddyShow("fail", `${s}/${quiz.questions.length} — Good try! 💪`);
      addXP(10);
    }
  };

  return (
    <div className="story-page">
      <Confetti active={confetti} />

      <div className="story-header">
        <div className="story-header-icon">📖</div>
        <h1 className="story-title">Story Time!</h1>
        <p className="story-sub">Create magical stories & test your understanding ✨</p>
      </div>

      {profile && (
        <div
          className="story-profile-card"
          style={{
            background: "var(--c-surface)",
            border: `1px solid ${(profile.color || "#8B5CF6")}33`,
            borderRadius: "var(--r-lg)",
            padding: "16px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
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
            <div style={{ color: "var(--c-muted)", fontSize: ".92rem", fontWeight: 700 }}>
              Age: {profile.age || "-"}
            </div>
            {profile.superpower && (
              <div style={{ color: "#FFD60A", fontSize: ".82rem", marginTop: 4 }}>
                ✨ {profile.superpower}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="story-input-card">
        <div className="story-age-row">
          <label className="story-label">Child's Age</label>
          <div className="story-age-btns">
            {[4,5,6,7,8,9,10,11,12].map(a => (
              <button key={a} className={`age-chip${age===a?' active':''}`} onClick={() => setAge(a)}>{a}</button>
            ))}
          </div>
        </div>

        <div className="story-topic-row">
          <label className="story-label">Pick a Topic</label>
          <div className="story-topic-chips">
            {TOPICS.map(t => (
              <button key={t} className={`topic-chip-s${topic===t?' active':''}`} onClick={() => setTopic(t)}>{t}</button>
            ))}
          </div>
          <div className="story-input-row">
            <input
              className="story-input"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Or type your own topic…"
              onKeyDown={e => e.key === 'Enter' && getStory()}
            />
            <button className={`voice-btn${listening?' active':''}`} onClick={handleVoice} title="Speak your topic">
              {listening ? "🔴" : "🎤"}
            </button>
          </div>
        </div>

        <button
          className="story-generate-btn"
          onClick={() => getStory()}
          disabled={storyLoading || !topic.trim()}
        >
          {storyLoading ? <><span className="btn-spinner"/>Creating story…</> : <>✨ Generate Story</>}
        </button>
      </div>

      {story && (
        <div className="story-display-card">
          <div className="story-display-header">
            <h2 className="story-display-title">📚 Your Story</h2>
            <div className="story-actions">
              <button className={`story-action-btn${speaking?' active':''}`} onClick={handleSpeak}>
                {speaking ? "⏹️ Stop" : "🔊 Read Aloud"}
              </button>
              <button className="story-action-btn teal" onClick={translateToTelugu} disabled={transLoading}>
                {transLoading ? "⏳" : "🌐 Telugu"}
              </button>
              <button className="story-action-btn purple" onClick={getQuiz} disabled={quizLoading}>
                {quizLoading ? <><span className="btn-spinner-sm"/>Quiz…</> : "🎲 Take Quiz"}
              </button>
            </div>
          </div>

          <div className="story-text">
            {story.split(/(?<=[.!?])\s+/).map((sentence, i) => (
              <span key={i} className="story-sentence" onClick={() => speak(sentence)} title="Click to hear">
                {sentence}{' '}
              </span>
            ))}
          </div>
          <p className="story-hint">💡 Click any sentence to hear it read aloud</p>
        </div>
      )}

      {translated && (
        <div className="story-telugu-card">
          <div className="story-display-header">
            <h3 className="story-display-title">🌐 తెలుగు అనువాదం</h3>
            <button className="story-action-btn teal" onClick={() => speak(translated, "te-IN")}>🔊 వినండి</button>
          </div>
          <p className="story-telugu-text">{translated}</p>
        </div>
      )}

      {quiz && quiz.questions?.length > 0 && (
        <div className="story-quiz-card">
          <h2 className="quiz-title">🎲 Story Quiz</h2>
          <p className="quiz-sub">Answer based on the story you just read!</p>

          {quiz.questions.map((q, i) => (
            <div key={i} className="quiz-question">
              <p className="quiz-q-text">
                <span className="quiz-q-num">{i + 1}</span>
                {q.question}
              </p>
              <div className="quiz-options">
                {q.options.map((opt, j) => {
                  const correctOption = getCorrectOption(q);
                  let cls = "quiz-opt";
                  if (submitted) {
                    if (normalizeAnswer(opt) === normalizeAnswer(correctOption)) cls += " correct";
                    else if (normalizeAnswer(answers[i]) === normalizeAnswer(opt)) cls += " wrong";
                  } else if (answers[i] === opt) {
                    cls += " selected";
                  }
                  return (
                    <button
                      key={j}
                      className={cls}
                      onClick={() => selectAnswer(i, opt)}
                      disabled={submitted}
                    >
                      <span className="opt-letter">{String.fromCharCode(65+j)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted ? (
            <button
              className="quiz-submit-btn"
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < quiz.questions.length}
            >
              ✅ Submit Quiz
            </button>
          ) : (
            <div className="quiz-result">
              <div className="quiz-result-emoji">
                {score === quiz.questions.length ? "🌟" : score >= quiz.questions.length/2 ? "👍" : "💪"}
              </div>
              <h3 className="quiz-result-text">Score: {score}/{quiz.questions.length}</h3>
              <p className="quiz-result-sub">
                {score === quiz.questions.length
                  ? "Perfect! You read carefully! 🎉"
                  : score >= quiz.questions.length/2
                  ? "Good job! Read the story again to improve! 📖"
                  : "Keep practicing! Every story makes you smarter! ✨"}
              </p>
              <button className="quiz-retry-btn" onClick={() => { setQuiz(null); setAnswers({}); setScore(null); setSubmitted(false); }}>
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {!story && !storyLoading && (
        <div className="story-empty">
          <div className="story-empty-icon">📚</div>
          <p>Pick a topic and generate your first story!</p>
        </div>
      )}
    </div>
  );
}
