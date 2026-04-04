import { useState, useEffect, useCallback, useRef } from "react";
import { STADIUMS } from "./data/stadiums";
import {
  shuffleArray, difficultyLabels, difficultyColors,
  S, ExitConfirm,
  topBar, exitBtn, timerBarContainer, progressDot, resultBox,
  inputStyle, leaderboardRow, summaryMatchRow, getTimerColor,
} from "./shared";

const ROUNDS_PER_GAME = 8;
const TIMER_SECONDS = 45;
const OPTIONS_COUNT = 4;

function generateOptions(correctName, all) {
  const opts = [correctName];
  const pool = shuffleArray(all.filter((s) => s.name !== correctName));
  for (let i = 0; i < OPTIONS_COUNT - 1 && i < pool.length; i++) {
    opts.push(pool[i].name);
  }
  return shuffleArray(opts);
}

// Shuffle hints order but always keep "kraj" (country) as the last hint —
// it's the biggest giveaway, so it should always come last.
function shuffleHints(hints) {
  const krajHint = hints.find((h) => h.type === "kraj");
  const rest = hints.filter((h) => h.type !== "kraj");
  const shuffled = shuffleArray(rest);
  if (krajHint) shuffled.push(krajHint);
  return shuffled;
}

// ═══════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════
export default function StadiumGuesser({ onBack }) {
  const [screen, setScreen] = useState("game");
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [totalScore, setTotalScore] = useState(0);
  const [results, setResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState([
    { name: "Maciek K.", score: 620 },
    { name: "Kuba W.", score: 510 },
    { name: "Tomek R.", score: 440 },
  ]);
  const [revealedHints, setRevealedHints] = useState(1);
  const timerRef = useRef(null);

  const initGame = () => {
    const shuffled = shuffleArray(STADIUMS).slice(0, ROUNDS_PER_GAME).map((s) => ({
      ...s,
      options: generateOptions(s.name, STADIUMS),
      shuffledHints: shuffleHints(s.hints),
    }));
    setRounds(shuffled);
    setCurrentIdx(0);
    setTimeLeft(TIMER_SECONDS);
    setTotalScore(0);
    setResults([]);
    setShowResult(false);
    setLastResult(null);
    setRevealedHints(1);
    setScreen("game");
  };

  // Auto-start on mount
  useEffect(() => { initGame(); }, []);

  const current = rounds[currentIdx];

  // Timer + hint reveal
  useEffect(() => {
    if (screen !== "game" || showResult || !current || showExitConfirm) return;

    setRevealedHints(1);
    const hintInterval = Math.max(3000, (TIMER_SECONDS * 1000) / (current.shuffledHints.length + 1));
    const revealTimer = setInterval(() => {
      setRevealedHints((prev) => {
        if (prev >= current.shuffledHints.length) { clearInterval(revealTimer); return prev; }
        return prev + 1;
      });
    }, hintInterval);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(revealTimer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(revealTimer);
    };
  }, [screen, showResult, currentIdx, current, showExitConfirm]);

  const handleTimeout = useCallback(() => {
    clearInterval(timerRef.current);
    if (!current) return;
    const entry = {
      stadium: current, points: 0, label: "CZAS!", isCorrect: false, timeOut: true, selected: null,
    };
    setLastResult(entry);
    setResults((prev) => [...prev, entry]);
    setShowResult(true);
    setRevealedHints(current.shuffledHints.length);
  }, [current]);

  const handleAnswer = useCallback((option) => {
    clearInterval(timerRef.current);
    if (!current) return;
    const correct = option === current.name;
    const hintBonus = correct ? Math.max(0, (current.shuffledHints.length - revealedHints) * 12) : 0;
    const points = correct ? 100 + hintBonus : 0;
    const label = correct ? (hintBonus > 0 ? "SZYBKI!" : "DOBRZE!") : "PUDŁO";
    const entry = {
      stadium: current, selected: option, points, label, isCorrect: correct, timeOut: false,
    };
    setLastResult(entry);
    setTotalScore((prev) => prev + points);
    setResults((prev) => [...prev, entry]);
    setShowResult(true);
    setRevealedHints(current.shuffledHints.length);
  }, [current, revealedHints]);

  const nextRound = () => {
    setShowResult(false);
    setLastResult(null);
    if (currentIdx + 1 < rounds.length) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setScreen("summary");
    }
  };

  const submitToLeaderboard = () => {
    if (!playerName.trim()) return;
    const newBoard = [...leaderboard, { name: playerName.trim(), score: totalScore }]
      .sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(newBoard);
    setScreen("leaderboard");
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = getTimerColor(timeLeft, TIMER_SECONDS);

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 32 }}>
          <h2 style={{ ...S.h2, textAlign: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 24, marginRight: 8 }}>🏆</span>RANKING — STADIONY
          </h2>
          {leaderboard.map((entry, i) => (
            <div key={i} style={leaderboardRow(i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontWeight: 900, fontSize: 15, color: i === 0 ? "#fbbf24" : i < 3 ? "#4ade80" : "#4b5264", width: 28, textAlign: "center", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{entry.name}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? "#fbbf24" : "#4ade80", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{entry.score}</span>
            </div>
          ))}
          <button style={{ ...S.ghostBtn, marginTop: 20 }} onClick={onBack}>WRÓĆ DO MENU</button>
        </div>
      </div>
    );
  }

  // ─── SUMMARY ───
  if (screen === "summary") {
    const correctCount = results.filter((r) => r.isCorrect).length;
    return (
      <div style={S.app}>
        <div style={{ ...S.card, textAlign: "center", marginTop: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏟️</div>
          <h2 style={{ ...S.h2, fontSize: 26 }}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#8892a4", marginTop: 4, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: 2 }}>
            STADIONY · PODPOWIEDZI
          </div>

          <div style={{ margin: "28px 0", padding: "24px", background: "rgba(0, 230, 118, 0.05)", borderRadius: 16, border: "1px solid rgba(0, 230, 118, 0.1)" }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#4ade80", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{totalScore}</div>
            <div style={{ color: "#8892a4", fontSize: 12, marginTop: 4, letterSpacing: 2, fontFamily: "'Bricolage Grotesque', sans-serif" }}>PUNKTÓW</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{rounds.length}</div>
              <div style={{ color: "#4b5264", fontSize: 10, letterSpacing: 2, fontFamily: "'Bricolage Grotesque', sans-serif" }}>RUND</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{correctCount}</div>
              <div style={{ color: "#4b5264", fontSize: 10, letterSpacing: 2, fontFamily: "'Bricolage Grotesque', sans-serif" }}>TRAFIONE</div>
            </div>
          </div>

          {results.map((r, i) => (
            <div key={i} style={summaryMatchRow}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>🏟️ {r.stadium.name}</div>
                <div style={{ fontWeight: 800, color: r.isCorrect ? "#4ade80" : "#f87171", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{r.points} pkt</div>
              </div>
              <div style={{ fontSize: 11, color: "#8892a4", marginTop: 4 }}>
                {r.stadium.club} · {r.timeOut ? "Czas minął" : (r.isCorrect ? "Trafione" : "Pudło")}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 28 }}>
            <input type="text" placeholder="Twoje imię / nick" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={inputStyle} />
            <button style={S.goldBtn} onClick={submitToLeaderboard}>ZAPISZ WYNIK</button>
          </div>
          <button style={{ ...S.ghostBtn, marginTop: 12 }} onClick={initGame}>ZAGRAJ PONOWNIE</button>
          <button style={{ ...S.ghostBtn, marginTop: 8 }} onClick={onBack}>WRÓĆ DO MENU</button>
        </div>
      </div>
    );
  }

  // ─── GAME ───
  if (screen === "game" && current) {
    const roundNum = currentIdx + 1;

    return (
      <div style={S.app}>
        {showExitConfirm && (
          <ExitConfirm
            onConfirm={() => { clearInterval(timerRef.current); onBack(); }}
            onCancel={() => setShowExitConfirm(false)}
          />
        )}

        <div style={topBar}>
          <button onClick={() => setShowExitConfirm(true)} style={exitBtn}>← Wyjdź</button>
          <div style={{ fontSize: 13, color: "#8892a4", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600 }}>
            🏟️ {roundNum}/{rounds.length}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#4ade80", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{totalScore} pkt</div>
        </div>

        <div style={{ ...S.card, position: "relative" }}>
          <div style={timerBarContainer}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}aa)`, transition: "width 1s linear, background 0.5s", boxShadow: `0 0 12px ${timerColor}44` }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 4 }}>
            <span style={{ ...S.badge, background: difficultyColors[current.difficulty] + "12", color: difficultyColors[current.difficulty], border: `1px solid ${difficultyColors[current.difficulty]}22` }}>
              {difficultyLabels[current.difficulty]}
            </span>
            <span style={{ fontSize: 26, fontWeight: 900, color: timerColor, fontVariantNumeric: "tabular-nums", fontFamily: "'Bricolage Grotesque', sans-serif", animation: timeLeft <= 10 ? "timerUrgent 0.5s ease-in-out infinite" : "none" }}>{timeLeft}s</span>
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#4b5264", letterSpacing: 3, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, marginBottom: 16 }}>
            ODGADNIJ STADION
          </div>

          {/* Progressive hints — shuffled order */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {current.shuffledHints.map((hint, i) => {
              const revealed = i < revealedHints;
              return (
                <div key={i} style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: revealed ? "rgba(64, 196, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                  border: revealed ? "1px solid rgba(64, 196, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.04)",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: revealed ? "revealClub 0.4s ease-out both" : "none",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: revealed ? "#38bdf8" : "#2a3444",
                    fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: 1,
                    minWidth: 70, textTransform: "uppercase",
                  }}>{revealed ? hint.type : "???"}</span>
                  <span style={{
                    fontSize: 13, color: revealed ? "#c8d6e5" : "#1a2234",
                    fontWeight: 500, lineHeight: 1.4,
                  }}>
                    {revealed ? hint.text : "Ukryta podpowiedź..."}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Options */}
          {!showResult && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {current.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "2px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 14, padding: "16px 12px",
                    color: "#edf0f7", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                    textAlign: "center", fontFamily: "'Sora', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(64, 196, 255, 0.3)";
                    e.currentTarget.style.background = "rgba(64, 196, 255, 0.06)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Result */}
          {showResult && lastResult && (
            <div style={resultBox(lastResult.isCorrect ? "#4ade80" : "#f87171")}>
              <div style={{ fontSize: 28, fontWeight: 900, color: lastResult.isCorrect ? "#4ade80" : "#f87171", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {lastResult.label}
              </div>

              {lastResult.timeOut ? (
                <div style={{ fontSize: 14, color: "#8892a4", marginTop: 10 }}>Czas minął!</div>
              ) : !lastResult.isCorrect ? (
                <div style={{ fontSize: 14, color: "#8892a4", marginTop: 10 }}>
                  Twój typ: <b style={{ color: "#f87171" }}>{lastResult.selected}</b>
                </div>
              ) : null}

              <div style={{ fontSize: 20, fontWeight: 700, color: "#edf0f7", marginTop: 12 }}>
                🏟️ <span style={{ color: "#38bdf8" }}>{current.name}</span>
              </div>
              <div style={{ fontSize: 12, color: "#8892a4", marginTop: 4 }}>{current.club}</div>

              <div style={{ fontSize: 36, fontWeight: 900, color: lastResult.isCorrect ? "#4ade80" : "#f87171", marginTop: 10, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                +{lastResult.points}
              </div>

              {lastResult.points > 100 && (
                <div style={{ fontSize: 11, color: "#38bdf8", marginTop: 4, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  +{lastResult.points - 100} bonus za szybkość!
                </div>
              )}
            </div>
          )}

          {showResult && (
            <button style={S.greenBtn} onClick={nextRound}>
              {currentIdx + 1 < rounds.length ? "NASTĘPNA RUNDA →" : "ZOBACZ WYNIKI"}
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
            {rounds.map((_, i) => (
              <div key={i} style={progressDot(
                i < currentIdx,
                i === currentIdx,
                showResult ? (lastResult?.isCorrect ? "#4ade80" : "#f87171") : "#fbbf24"
              )} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
