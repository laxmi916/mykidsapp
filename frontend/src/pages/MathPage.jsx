import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { post, speak } from "../hooks/api";
import Confetti from "../components/Confetti";
import { buddyShow } from "../components/Buddy";

const TOPICS = [
  { v: "addition", l: "Addition", sym: "+", c: "#FF3D9A" },
  { v: "subtraction", l: "Subtraction", sym: "-", c: "#8B5CF6" },
  { v: "multiplication", l: "Multiplication", sym: "x", c: "#06B6D4" },
  { v: "division", l: "Division", sym: "/", c: "#14F0C0" },
  { v: "lcm_hcf", l: "LCM & HCF", sym: "LCM", c: "#FF8A00" },
  { v: "number_system", l: "Number System", sym: "123", c: "#22C55E" },
  { v: "approximation", l: "Approximation", sym: "~", c: "#F43F5E" },
  { v: "fractions_decimals", l: "Fractions to Decimals", sym: "3/4", c: "#0EA5E9" },
  { v: "percentage", l: "Percentage", sym: "%", c: "#EAB308" },
  { v: "decimals_operations", l: "Decimals Operations", sym: "0.5", c: "#10B981" },
  { v: "whole_numbers_operations", l: "Whole Numbers", sym: "1234", c: "#6366F1" },
  { v: "fractions_operations", l: "Fraction Operations", sym: "1/2", c: "#EC4899" },
  { v: "simplification", l: "Simplification", sym: "()", c: "#F97316" },
  { v: "distance_time_speed", l: "Distance Time Speed", sym: "km/h", c: "#84CC16" },
  { v: "measures", l: "Mass Length Money", sym: "kg", c: "#06B6D4" },
  { v: "factors_multiples", l: "Factors & Multiples", sym: "24", c: "#A855F7" },
  { v: "profit_loss", l: "Profit & Loss", sym: "Rs", c: "#EF4444" },
  { v: "mensuration", l: "Perimeter Area Volume", sym: "m2", c: "#14B8A6" },
  { v: "simple_interest", l: "Simple Interest", sym: "SI", c: "#F59E0B" },
];

const FALLBACK_MCQS = {
  addition: [
    { question: "36 + 14 = ?", options: ["40", "50", "52", "48"], answer: "50", hint: "Add tens and ones." },
    { question: "19 + 8 = ?", options: ["25", "26", "27", "28"], answer: "27", hint: "19 is one less than 20." },
    { question: "45 + 11 = ?", options: ["54", "55", "56", "57"], answer: "56", hint: "Add 10, then 1." },
    { question: "60 + 25 = ?", options: ["75", "85", "95", "80"], answer: "85", hint: "Add 2 tens and 5 ones." },
    { question: "7 + 16 = ?", options: ["21", "22", "23", "24"], answer: "23", hint: "16 plus 7." },
  ],
  subtraction: [
    { question: "63 - 28 = ?", options: ["35", "45", "25", "34"], answer: "35", hint: "Subtract 20, then 8." },
    { question: "90 - 35 = ?", options: ["45", "55", "65", "75"], answer: "55", hint: "Take away 3 tens and 5 ones." },
    { question: "41 - 19 = ?", options: ["22", "23", "24", "21"], answer: "22", hint: "Subtract 20 then add 1." },
    { question: "70 - 16 = ?", options: ["56", "54", "53", "52"], answer: "54", hint: "Subtract 10, then 6." },
    { question: "28 - 9 = ?", options: ["17", "18", "19", "20"], answer: "19", hint: "28 minus 10 plus 1." },
  ],
};

export default function MathPage() {
  const { profile, xp, level, badges, addXP, earnBadge, mathSkills, updateMathSkill } = useApp();

  const [topic, setTopic] = useState("addition");
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [error, setError] = useState("");

  const currentTopic = TOPICS.find((item) => item.v === topic) || TOPICS[0];
  const skillStats = mathSkills || {};

  const skillSummary = useMemo(
    () =>
      TOPICS.map((item) => {
        const stat = skillStats[item.v] || { correct: 0, total: 0 };
        const percent = stat.total ? Math.round((stat.correct / stat.total) * 100) : 0;
        return { ...item, ...stat, percent };
      }),
    [skillStats]
  );

  const weakSkills = skillSummary.filter((item) => item.total > 0 && item.percent < 60);

  const normalizeProblems = (list) =>
    (Array.isArray(list) ? list : []).slice(0, 5).map((item, index) => {
      const options = Array.isArray(item.options) ? item.options.map((opt) => String(opt)) : [];
      const answer = String(item.answer ?? "");
      const fixedOptions = options.includes(answer) ? options : [...options.slice(0, 3), answer];
      return {
        question: item.question || `Question ${index + 1}`,
        options: fixedOptions.slice(0, 4),
        answer,
        hint: item.hint || "",
      };
    });

  const getProblems = async () => {
    setLoading(true);
    setDone(false);
    setScore(0);
    setAnswers({});
    setError("");

    try {
      const data = await post("math", {
        age: profile?.age || 10,
        operation: topic,
        topic: currentTopic.l,
      });

      const normalized = normalizeProblems(data.problems);
      if (!normalized.length) throw new Error("No problems returned");
      setProblems(normalized);
    } catch (err) {
      console.error("Math fetch error:", err);
      setError("Using offline questions for this topic.");
      setProblems(normalizeProblems(FALLBACK_MCQS[topic] || FALLBACK_MCQS.addition));
    } finally {
      setLoading(false);
    }
  };

  const chooseAnswer = (index, value) => {
    if (done) return;
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const isCorrect = (index) => answers[index] === problems[index]?.answer;

  const submit = () => {
    let correct = 0;
    problems.forEach((problem, index) => {
      if (answers[index] === problem.answer) correct += 1;
    });

    setScore(correct);
    setDone(true);
    updateMathSkill(topic, correct, problems.length);

    const pct = problems.length ? correct / problems.length : 0;

    if (pct === 1) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
      addXP(40);
      buddyShow("win", "Perfect math score!");
      earnBadge({
        id: `math-ace-${topic}`,
        icon: "🔢",
        name: `${currentTopic.l} Star`,
        desc: `Perfect score in ${currentTopic.l}!`,
      });
    } else {
      addXP(Math.round(pct * 25));
    }

    speak(`You got ${correct} out of ${problems.length} correct in ${currentTopic.l}.`);
  };

  const allDone = problems.length > 0 && problems.every((_, index) => answers[index] !== undefined);

  return (
    <div className="page">
      <Confetti active={confetti} />

      <div className="text-center" style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: "3rem",
            display: "inline-block",
            animation: "bounce 2.5s ease-in-out infinite",
            marginBottom: 6,
          }}
        >
          🧮
        </div>

        <h1
          className="page-title"
          style={{
            background: "linear-gradient(135deg,#06B6D4,#8B5CF6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Math MCQ Practice
        </h1>

        <p className="text-muted text-sm">Pick a topic and solve 5 multiple-choice questions.</p>
      </div>

      {profile && (
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
                Age: {profile.age || "-"} | Level: {level || 1} | XP: {xp || 0}
              </div>
              <div style={{ fontSize: ".82rem", marginTop: 4, color: "#FFD60A" }}>
                Badges: {badges?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card card-raised" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10, color: currentTopic.c }}>
          Math Skill Analysis
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {skillSummary.map((item) => (
            <div
              key={item.v}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: ".82rem", fontWeight: 800 }}>{item.l}</span>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.percent}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${item.c}, #FFD60A)`,
                  }}
                />
              </div>
              <span style={{ fontSize: ".8rem", fontWeight: 800, color: item.c }}>
                {item.total ? `${item.percent}%` : "--"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-muted" style={{ fontSize: ".82rem", marginTop: 12, marginBottom: 0 }}>
          {weakSkills.length
            ? `Needs practice: ${weakSkills.map((item) => item.l).join(", ")}`
            : "No weak skill found yet. Start solving to build your topic analysis."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {TOPICS.map((item) => (
          <button
            key={item.v}
            onClick={() => setTopic(item.v)}
            className="card"
            style={{
              padding: "14px 12px",
              border: `2px solid ${topic === item.v ? item.c : "var(--c-border2)"}`,
              background: topic === item.v ? `${item.c}18` : "var(--c-raised)",
              fontWeight: 800,
              color: "var(--c-text)",
            }}
          >
            <span style={{ fontSize: "1.1rem", display: "block", marginBottom: 4 }}>{item.sym}</span>
            <span style={{ fontSize: ".86rem" }}>{item.l}</span>
          </button>
        ))}
      </div>

      <div className="text-center" style={{ marginBottom: 20 }}>
        <button className="btn btn-blue" onClick={getProblems} disabled={loading}>
          {problems.length ? "🔄 New MCQs" : "🧮 Get MCQs"}
        </button>
        {error && (
          <p className="text-muted" style={{ marginTop: 10 }}>
            {error}
          </p>
        )}
      </div>

      {loading && (
        <div className="text-center">
          <p className="text-muted">Generating maths questions... ✨</p>
        </div>
      )}

      {problems.length > 0 && (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {problems.map((problem, index) => (
              <div key={index} className="card card-raised" style={{ padding: 16 }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 12, color: currentTopic.c }}>
                  {index + 1}. {problem.question}
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {problem.options.map((option) => {
                    const selected = answers[index] === option;
                    const correct = done && option === problem.answer;
                    const wrong = done && selected && option !== problem.answer;
                    const showIcon = correct || wrong;

                    return (
                      <button
                        key={option}
                        onClick={() => chooseAnswer(index, option)}
                        className="card"
                        disabled={done}
                        style={{
                          padding: "12px 14px",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: `2px solid ${
                            correct ? "#22C55E" : wrong ? "#EF4444" : selected ? currentTopic.c : "var(--c-border2)"
                          }`,
                          background: correct
                            ? "rgba(34,197,94,0.12)"
                            : wrong
                              ? "rgba(239,68,68,0.12)"
                              : selected
                                ? `${currentTopic.c}18`
                                : "var(--c-raised)",
                          color: "var(--c-text)",
                          fontWeight: 700,
                        }}
                      >
                        <span>{option}</span>
                        {showIcon && (
                          <span style={{ fontSize: "1rem", marginLeft: 12 }}>
                            {correct ? "✅" : "❌"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {problem.hint && !done && (
                  <p style={{ fontSize: ".82rem", marginTop: 10, color: "#FFD60A" }}>
                    Hint: {problem.hint}
                  </p>
                )}

                {done && !isCorrect(index) && (
                  <p style={{ color: "#FFD60A", marginTop: 10 }}>
                    Correct answer: <b>{problem.answer}</b>
                  </p>
                )}

                {done && isCorrect(index) && (
                  <p style={{ color: "#22C55E", marginTop: 10, fontWeight: 800 }}>
                    ✅ Correct
                  </p>
                )}

                {done && !isCorrect(index) && (
                  <p style={{ color: "#EF4444", marginTop: 10, fontWeight: 800 }}>
                    ❌ Wrong
                  </p>
                )}
              </div>
            ))}
          </div>

          {!done && (
            <button className="btn btn-teal btn-full btn-lg" onClick={submit} disabled={!allDone}>
              ✅ Check My Answers
            </button>
          )}
        </>
      )}

      {done && (
        <div className="card text-center">
          <h2 style={{ color: currentTopic.c }}>
            🎯 Total Score: {score}/{problems.length}
          </h2>
          <p className="text-muted">Topic: {currentTopic.l}</p>

          <button className="btn btn-blue" onClick={getProblems}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}
