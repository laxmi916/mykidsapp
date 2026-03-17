import { useState } from "react";
import { useApp } from "../context/AppContext";
import { speak } from "../hooks/api";
import Confetti from "../components/Confetti";
import { buddyShow } from "../components/Buddy";

const OPS = [
  { v: "addition", l: "Addition", sym: "➕", c: "#FF3D9A" },
  { v: "subtraction", l: "Subtraction", sym: "➖", c: "#8B5CF6" },
  { v: "multiplication", l: "Multiply", sym: "✖️", c: "#06B6D4" },
  { v: "division", l: "Division", sym: "➗", c: "#14F0C0" },
];

export default function MathPage() {
  const { profile, addXP, earnBadge } = useApp();

  const [op, setOp] = useState("addition");
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [hints, setHints] = useState({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [wobble, setWobble] = useState(null);

  const curOp = OPS.find((o) => o.v === op);

  // ✅ Generate problems locally
  const generateProblems = () => {
    const age = profile?.age || 7;
    const max = age <= 6 ? 10 : age <= 8 ? 20 : 50;

    const list = [];

    for (let i = 0; i < 5; i++) {
      let a = Math.floor(Math.random() * max) + 1;
      let b = Math.floor(Math.random() * max) + 1;
      let question = "";
      let answer = 0;
      let hint = "";

      if (op === "addition") {
        question = `${a} + ${b} =`;
        answer = a + b;
        hint = `Add ${a} and ${b}`;
      }

      if (op === "subtraction") {
        if (b > a) [a, b] = [b, a];
        question = `${a} - ${b} =`;
        answer = a - b;
        hint = `Take ${b} away from ${a}`;
      }

      if (op === "multiplication") {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        question = `${a} × ${b} =`;
        answer = a * b;
        hint = `${a} groups of ${b}`;
      }

      if (op === "division") {
        b = Math.floor(Math.random() * 9) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        a = answer * b;
        question = `${a} ÷ ${b} =`;
        hint = `${a} split into ${b} equal parts`;
      }

      list.push({ question, answer, hint });
    }

    return list;
  };

  const getProblems = async () => {
    setLoading(true);
    setDone(false);
    setAnswers({});
    setHints({});

    setTimeout(() => {
      setProblems(generateProblems());
      setLoading(false);
    }, 500);
  };

  const setAns = (i, v) => {
    setAnswers((p) => ({ ...p, [i]: v }));
    setWobble(i);
    setTimeout(() => setWobble(null), 250);
  };

  const submit = () => {
    let n = 0;
    problems.forEach((p, i) => {
      if (Number(answers[i]) === p.answer) n++;
    });

    setScore(n);
    setDone(true);

    const pct = n / problems.length;

    if (pct === 1) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);

      addXP(40);

      buddyShow("win", "Perfect math score!");

      earnBadge({
        id: "math-ace",
        icon: "🔢",
        name: "Math Ace",
        desc: "Perfect math score!",
      });
    } else {
      addXP(Math.round(pct * 25));
    }

    speak(
      `You got ${n} out of ${problems.length} correct! ${
        n === problems.length ? "Amazing!" : "Good try!"
      }`
    );
  };

  const allDone =
    problems.length > 0 &&
    problems.every((_, i) => answers[i] !== undefined && answers[i] !== "");

  return (
    <div className="page">
      <Confetti active={confetti} />

      {/* Header */}
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
          Math Fun!
        </h1>

        <p className="text-muted text-sm">Choose an operation and solve 🧠</p>
      </div>

      {/* Operation selector */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {OPS.map((o) => (
          <button
            key={o.v}
            onClick={() => setOp(o.v)}
            className="card"
            style={{
              padding: "14px 12px",
              border: `2px solid ${op === o.v ? o.c : "var(--c-border2)"}`,
              background: op === o.v ? `${o.c}16` : "var(--c-raised)",
              fontWeight: 800,
              color: "var(--c-text)",
            }}
          >
            <span style={{ fontSize: "1.6rem", display: "block" }}>
              {o.sym}
            </span>
            {o.l}
          </button>
        ))}
      </div>

      <div className="text-center" style={{ marginBottom: 20 }}>
        <button className="btn btn-blue" onClick={getProblems}>
          {problems.length ? "🔄 New Problems" : "🧮 Get Problems!"}
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <p className="text-muted">Generating math problems… ✨</p>
        </div>
      )}

      {/* Problems */}
      {problems.length > 0 && !done && (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {problems.map((p, i) => (
              <div key={i} className="card card-raised" style={{ padding: 16 }}>
                <span
                  style={{
                    fontSize: "1.6rem",
                    color: curOp.c,
                    marginRight: 12,
                  }}
                >
                  {p.question}
                </span>

                <input
                  type="number"
                  className="math-answer"
                  value={answers[i] || ""}
                  onChange={(e) => setAns(i, e.target.value)}
                  placeholder="?"
                  style={{
                    transform: wobble === i ? "scale(1.1)" : "scale(1)",
                  }}
                />

                {p.hint && (
                  <button
                    onClick={() =>
                      setHints((h) => ({ ...h, [i]: !h[i] }))
                    }
                    style={{
                      marginLeft: 10,
                      background: "none",
                      border: "none",
                      color: "#FFD60A",
                      fontWeight: 800,
                    }}
                  >
                    💡 Hint
                  </button>
                )}

                {hints[i] && (
                  <p style={{ fontSize: ".8rem" }}>💡 {p.hint}</p>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-teal btn-full btn-lg"
            onClick={submit}
            disabled={!allDone}
          >
            ✅ Check My Answers!
          </button>
        </>
      )}

      {/* Results */}
      {done && (
        <div className="card text-center">
          <h2>
            {score}/{problems.length} Correct!
          </h2>

          <button className="btn btn-blue" onClick={getProblems}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}