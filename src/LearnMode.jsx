import { useState, useEffect, useRef } from "react";
import { LEARN_CATEGORIES } from "./data/learn";
import {
  shuffleArray, S, ExitConfirm,
  topBar, exitBtn, progressDot, resultBox, leaderboardRow, summaryMatchRow,
} from "./shared";

const QUESTIONS_PER_SESSION = 10;

export default function LearnMode({ onBack }) {
  const [phase, setPhase] = useState("categories"); // categories | quiz | result | summary
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const startCategory = (cat) => {
    const shuffled = shuffleArray(cat.questions).slice(0, QUESTIONS_PER_SESSION);
    // Shuffle options for each question but track the correct answer
    const prepared = shuffled.map((q) => {
      const indices = [0, 1, 2, 3];
      const shuffledIndices = shuffleArray(indices);
      return {
        ...q,
        shuffledOptions: shuffledIndices.map((i) => q.options[i]),
        correctShuffled: shuffledIndices.indexOf(q.correct),
      };
    });
    setCategory(cat);
    setQuestions(prepared);
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setPhase("quiz");
  };

  const handleAnswer = (optIdx) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    setShowExplanation(true);

    const isCorrect = optIdx === questions[currentIdx].correctShuffled;
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);

    setResults((prev) => [...prev, {
      question: questions[currentIdx],
      selected: optIdx,
      isCorrect,
    }]);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setPhase("summary");
    }
  };

  const current = questions[currentIdx];
  const correctCount = results.filter((r) => r.isCorrect).length;

  const getOptionStyle = (i) => {
    const base = {
      background: "rgba(255, 255, 255, 0.02)",
      border: "2px solid rgba(255, 255, 255, 0.06)",
      borderRadius: 14,
      padding: "16px 18px",
      color: "#e8eaed",
      fontSize: 14,
      fontWeight: 500,
      cursor: selectedOption === null ? "pointer" : "default",
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      textAlign: "left",
      fontFamily: "'DM Sans', sans-serif",
      lineHeight: 1.5,
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      width: "100%",
    };

    if (selectedOption === null) return base;

    const isCorrect = i === current.correctShuffled;
    const isSelected = i === selectedOption;

    if (isCorrect) {
      return {
        ...base,
        background: "rgba(0, 230, 118, 0.08)",
        borderColor: "rgba(0, 230, 118, 0.4)",
        color: "#e8eaed",
      };
    }
    if (isSelected && !isCorrect) {
      return {
        ...base,
        background: "rgba(255, 82, 82, 0.08)",
        borderColor: "rgba(255, 82, 82, 0.4)",
        color: "#e8eaed",
        opacity: 0.9,
      };
    }
    return { ...base, opacity: 0.35 };
  };

  const optionLabel = (i) => {
    const letters = ["A", "B", "C", "D"];
    const isCorrect = selectedOption !== null && i === current?.correctShuffled;
    const isWrong = selectedOption !== null && i === selectedOption && !isCorrect;

    return {
      width: 28,
      height: 28,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "'Outfit', sans-serif",
      flexShrink: 0,
      background: isCorrect
        ? "rgba(0, 230, 118, 0.2)"
        : isWrong
        ? "rgba(255, 82, 82, 0.2)"
        : `${category?.color || "#7a8599"}15`,
      color: isCorrect ? "#00e676" : isWrong ? "#ff5252" : (category?.color || "#7a8599"),
      border: isCorrect
        ? "1px solid rgba(0, 230, 118, 0.3)"
        : isWrong
        ? "1px solid rgba(255, 82, 82, 0.3)"
        : "1px solid rgba(255, 255, 255, 0.08)",
    };
  };

  // ─── CATEGORY SELECTION ───
  if (phase === "categories") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(0, 230, 118, 0.06)",
              border: "1px solid rgba(0, 230, 118, 0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 28,
            }}>📚</div>
            <h2 style={{ ...S.h2, fontSize: 24 }}>TRYB NAUKI</h2>
            <p style={{ ...S.sub, marginTop: 8, color: "#5a6577" }}>
              Wybierz kategorię i ucz się piłki nożnej!
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LEARN_CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => startCategory(cat)}
                style={{
                  background: `${cat.color}08`,
                  border: `1px solid ${cat.color}18`,
                  borderRadius: 16,
                  padding: "18px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: "fadeInUp 0.4s ease-out both",
                  animationDelay: `${i * 0.06}s`,
                  color: "#e8eaed",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${cat.color}14`;
                  e.currentTarget.style.borderColor = `${cat.color}30`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${cat.color}08`;
                  e.currentTarget.style.borderColor = `${cat.color}18`;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${cat.color}12`,
                  border: `1px solid ${cat.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                    color: cat.color,
                    letterSpacing: 0.3,
                  }}>{cat.title}</div>
                  <div style={{ fontSize: 12, color: "#5a6577", marginTop: 3 }}>{cat.desc}</div>
                  <div style={{ fontSize: 11, color: "#3a4455", marginTop: 4 }}>{cat.questions.length} pytań</div>
                </div>
                <div style={{ color: "#3a4455", fontSize: 18 }}>→</div>
              </button>
            ))}
          </div>

          <button style={{ ...S.ghostBtn, marginTop: 20 }} onClick={onBack}>← WRÓĆ DO MENU</button>
        </div>
      </div>
    );
  }

  // ─── SUMMARY ───
  if (phase === "summary") {
    const pct = Math.round((correctCount / questions.length) * 100);
    const emoji = pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "📖";
    const message = pct >= 90
      ? "Mistrz! Doskonała wiedza!"
      : pct >= 70
      ? "Bardzo dobrze! Świetna robota!"
      : pct >= 50
      ? "Nieźle! Ale jest jeszcze pole do nauki."
      : "Czas na powtórkę — nie poddawaj się!";

    return (
      <div style={S.app}>
        <div style={{ ...S.card, textAlign: "center", marginTop: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji}</div>
          <h2 style={{ ...S.h2, fontSize: 24 }}>PODSUMOWANIE</h2>
          <div style={{
            fontSize: 11, color: category.color, marginTop: 6,
            fontFamily: "'Outfit', sans-serif", letterSpacing: 2, fontWeight: 700,
          }}>{category.title.toUpperCase()}</div>

          {/* Score circle */}
          <div style={{
            margin: "28px auto", width: 120, height: 120, borderRadius: "50%",
            background: `${pct >= 70 ? "#00e676" : pct >= 50 ? "#ffab00" : "#ff5252"}0a`,
            border: `3px solid ${pct >= 70 ? "#00e676" : pct >= 50 ? "#ffab00" : "#ff5252"}30`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              fontSize: 36, fontWeight: 900,
              color: pct >= 70 ? "#00e676" : pct >= 50 ? "#ffab00" : "#ff5252",
              fontFamily: "'Outfit', sans-serif",
            }}>{pct}%</div>
            <div style={{ fontSize: 10, color: "#5a6577", letterSpacing: 1 }}>TRAFIEŃ</div>
          </div>

          <p style={{ color: "#7a8599", fontSize: 14, marginBottom: 24 }}>{message}</p>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#00e676", fontFamily: "'Outfit', sans-serif" }}>{correctCount}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>POPRAWNE</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ff5252", fontFamily: "'Outfit', sans-serif" }}>{questions.length - correctCount}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>BŁĘDNE</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffab00", fontFamily: "'Outfit', sans-serif" }}>{bestStreak}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>SERIA</div>
            </div>
          </div>

          {/* Question results */}
          {results.map((r, i) => (
            <div key={i} style={{
              ...summaryMatchRow,
              borderColor: r.isCorrect ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 82, 82, 0.1)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
                  {r.question.question.length > 60 ? r.question.question.slice(0, 60) + "…" : r.question.question}
                </div>
                <div style={{
                  fontWeight: 800, fontSize: 14,
                  color: r.isCorrect ? "#00e676" : "#ff5252",
                  fontFamily: "'Outfit', sans-serif",
                  flexShrink: 0,
                }}>{r.isCorrect ? "✓" : "✗"}</div>
              </div>
              {!r.isCorrect && (
                <div style={{ fontSize: 11, color: "#5a6577", marginTop: 6 }}>
                  Poprawna: {r.question.options[r.question.correct]}
                </div>
              )}
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            <button style={{
              ...S.greenBtn,
              background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
              color: category.id === "basics" ? "#060b14" : "#fff",
              boxShadow: `0 4px 24px ${category.color}25`,
            }} onClick={() => startCategory(category)}>
              ZAGRAJ PONOWNIE
            </button>
            <button style={S.ghostBtn} onClick={() => setPhase("categories")}>ZMIEŃ KATEGORIĘ</button>
            <button style={S.ghostBtn} onClick={onBack}>WRÓĆ DO MENU</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ ───
  if (phase === "quiz" && current) {
    const questionNum = currentIdx + 1;

    return (
      <div style={S.app}>
        {showExitConfirm && (
          <ExitConfirm
            onConfirm={onBack}
            onCancel={() => setShowExitConfirm(false)}
          />
        )}

        <div style={topBar}>
          <button onClick={() => setShowExitConfirm(true)} style={exitBtn}>← Wyjdź</button>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: category.color,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: 1,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{category.icon}</span>
            <span>{category.title.split(" ").slice(0, 2).join(" ")}</span>
          </div>
          <div style={{
            fontSize: 14, fontWeight: 700, color: "#00e676",
            fontFamily: "'Outfit', sans-serif",
          }}>{correctCount}/{questionNum - (selectedOption !== null ? 0 : 1)}</div>
        </div>

        <div style={{ ...S.card, position: "relative" }}>
          {/* Progress bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            borderRadius: "20px 20px 0 0", overflow: "hidden",
            background: "rgba(255, 255, 255, 0.04)",
          }}>
            <div style={{
              height: "100%",
              width: `${(questionNum / questions.length) * 100}%`,
              background: `linear-gradient(90deg, ${category.color}, ${category.color}aa)`,
              transition: "width 0.4s ease-out",
              boxShadow: `0 0 12px ${category.color}44`,
            }} />
          </div>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 20, marginTop: 4,
          }}>
            <span style={{
              ...S.badge,
              background: `${category.color}12`,
              color: category.color,
              border: `1px solid ${category.color}22`,
            }}>
              PYTANIE {questionNum}/{questions.length}
            </span>
            {streak > 1 && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: "#ffab00",
                fontFamily: "'Outfit', sans-serif",
                animation: "fadeIn 0.3s ease-out",
              }}>🔥 Seria: {streak}</span>
            )}
          </div>

          {/* Question */}
          <div style={{
            fontSize: 17, fontWeight: 600, lineHeight: 1.6,
            marginBottom: 24,
            color: "#e8eaed",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {current.question}
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {current.shuffledOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                style={getOptionStyle(i)}
                onMouseEnter={(e) => {
                  if (selectedOption === null) {
                    e.currentTarget.style.borderColor = `${category.color}40`;
                    e.currentTarget.style.background = `${category.color}0a`;
                    e.currentTarget.style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedOption === null) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <div style={optionLabel(i)}>
                  {selectedOption !== null && i === current.correctShuffled ? "✓"
                    : selectedOption !== null && i === selectedOption && i !== current.correctShuffled ? "✗"
                    : ["A", "B", "C", "D"][i]}
                </div>
                <span>{option}</span>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div style={{
              padding: "18px 20px",
              background: selectedOption === current.correctShuffled
                ? "rgba(0, 230, 118, 0.05)"
                : "rgba(255, 82, 82, 0.05)",
              borderRadius: 14,
              border: selectedOption === current.correctShuffled
                ? "1px solid rgba(0, 230, 118, 0.15)"
                : "1px solid rgba(255, 82, 82, 0.15)",
              marginBottom: 20,
              animation: "fadeInUp 0.3s ease-out both",
            }}>
              <div style={{
                fontSize: 14, fontWeight: 700, marginBottom: 8,
                color: selectedOption === current.correctShuffled ? "#00e676" : "#ff5252",
                fontFamily: "'Outfit', sans-serif",
              }}>
                {selectedOption === current.correctShuffled ? "✓ Poprawna odpowiedź!" : "✗ Niestety, błąd"}
              </div>
              <div style={{
                fontSize: 13, color: "#7a8599", lineHeight: 1.6,
              }}>
                {current.explanation}
              </div>
            </div>
          )}

          {/* Next button */}
          {showExplanation && (
            <button style={{
              ...S.greenBtn,
              background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
              color: category.id === "basics" ? "#060b14" : "#fff",
              boxShadow: `0 4px 24px ${category.color}25`,
              animation: "fadeIn 0.2s ease-out",
            }} onClick={nextQuestion}>
              {currentIdx + 1 < questions.length ? "NASTĘPNE PYTANIE →" : "ZOBACZ PODSUMOWANIE"}
            </button>
          )}

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 18, flexWrap: "wrap" }}>
            {questions.map((_, i) => {
              const done = i < results.length;
              const isCurrent = i === currentIdx;
              const wasCorrect = done ? results[i].isCorrect : false;
              return (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: done
                    ? (wasCorrect ? "#00e676" : "#ff5252")
                    : isCurrent ? category.color : "rgba(255, 255, 255, 0.08)",
                  transition: "all 0.3s",
                  boxShadow: isCurrent ? `0 0 8px ${category.color}44` : "none",
                }} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
