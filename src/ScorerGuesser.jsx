import { useState, useEffect, useCallback, useRef } from "react";
import { MATCHES } from "./data/matches";
import { shuffleArray, getScoreColor, difficultyLabels, difficultyColors, S, ExitConfirm } from "./shared";

const TIMER_SECONDS = 20;
const MATCHES_PER_GAME = 10;
const OPTIONS_COUNT = 4;

// Build a pool of all unique scorers from the database
function getAllScorers() {
  const scorers = new Set();
  MATCHES.forEach((m) => m.goals.forEach((g) => {
    // Skip own goals
    if (!g.scorer.includes("(s.)")) scorers.add(g.scorer);
  }));
  return [...scorers];
}

function generateOptions(correctScorer, allScorers) {
  const options = [correctScorer];
  const pool = allScorers.filter((s) => s !== correctScorer);
  const shuffled = shuffleArray(pool);
  for (let i = 0; i < OPTIONS_COUNT - 1 && i < shuffled.length; i++) {
    options.push(shuffled[i]);
  }
  return shuffleArray(options);
}

export default function ScorerGuesser({ onBack }) {
  const [screen, setScreen] = useState("game");
  const [matches, setMatches] = useState([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [totalScore, setTotalScore] = useState(0);
  const [matchResults, setMatchResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [leaderboard, setLeaderboard] = useState([
    { name: "Maciek K.", score: 820 },
    { name: "Kuba W.", score: 700 },
    { name: "Tomek R.", score: 600 },
    { name: "Ania M.", score: 500 },
    { name: "Piotr S.", score: 400 },
  ]);
  const timerRef = useRef(null);
  const allScorers = useRef(getAllScorers());

  // Initialize game on mount
  useEffect(() => {
    // Pick matches and one iconic goal per match, skip own goals
    const shuffled = shuffleArray(MATCHES).slice(0, MATCHES_PER_GAME * 2);
    const selected = [];
    for (const match of shuffled) {
      if (selected.length >= MATCHES_PER_GAME) break;
      const validGoals = match.goals.filter((g) => !g.scorer.includes("(s.)"));
      if (validGoals.length === 0) continue;
      const goal = validGoals[Math.floor(Math.random() * validGoals.length)];
      const options = generateOptions(goal.scorer, allScorers.current);
      selected.push({ ...match, selectedGoal: goal, options });
    }
    setMatches(selected);
  }, []);

  const currentMatch = matches[currentMatchIdx];
  const currentGoal = currentMatch?.selectedGoal;

  // Timer
  useEffect(() => {
    if (screen !== "game" || showResult || gameOver || !currentMatch || showExitConfirm) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, showResult, currentMatchIdx, gameOver, currentMatch, showExitConfirm]);

  const handleSubmit = useCallback(
    (option, timeOut = false) => {
      clearInterval(timerRef.current);
      if (!currentGoal) return;

      const correct = !timeOut && option === currentGoal.scorer;
      const points = timeOut ? 0 : correct ? 100 : 0;
      const label = timeOut ? "CZAS!" : correct ? "IDEALNIE!" : "PUDŁO";

      const entry = {
        match: currentMatch,
        selected: option,
        correct: currentGoal.scorer,
        minute: currentGoal.minute,
        team: currentGoal.team,
        points,
        label,
        isCorrect: correct,
        timeOut,
      };

      setLastResult(entry);
      setTotalScore((prev) => prev + points);
      setMatchResults((prev) => [...prev, entry]);
      setShowResult(true);
    },
    [currentMatch, currentGoal]
  );

  const nextMatch = () => {
    setShowResult(false);
    setLastResult(null);
    setSelectedOption(null);

    if (currentMatchIdx + 1 < matches.length) {
      setCurrentMatchIdx((prev) => prev + 1);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setGameOver(true);
      setScreen("summary");
    }
  };

  const submitToLeaderboard = () => {
    if (!playerName.trim()) return;
    const newBoard = [...leaderboard, { name: playerName.trim(), score: totalScore }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(newBoard);
    setScreen("leaderboard");
  };

  const restartGame = () => {
    const shuffled = shuffleArray(MATCHES).slice(0, MATCHES_PER_GAME * 2);
    const selected = [];
    for (const match of shuffled) {
      if (selected.length >= MATCHES_PER_GAME) break;
      const validGoals = match.goals.filter((g) => !g.scorer.includes("(s.)"));
      if (validGoals.length === 0) continue;
      const goal = validGoals[Math.floor(Math.random() * validGoals.length)];
      const options = generateOptions(goal.scorer, allScorers.current);
      selected.push({ ...match, selectedGoal: goal, options });
    }
    setMatches(selected);
    setCurrentMatchIdx(0);
    setSelectedOption(null);
    setTimeLeft(TIMER_SECONDS);
    setTotalScore(0);
    setMatchResults([]);
    setShowResult(false);
    setLastResult(null);
    setGameOver(false);
    setScreen("game");
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#eab308" : "#22c55e";

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 40 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>🏆 RANKING — STRZELCY</h2>
          {leaderboard.map((entry, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: i === 0 ? "rgba(245,200,66,0.1)" : i < 3 ? "rgba(29,185,84,0.06)" : "transparent", borderRadius: 8, marginBottom: 4, border: i === 0 ? "1px solid rgba(245,200,66,0.2)" : "1px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? "#f5c842" : i < 3 ? "#1db954" : "#8a9a8e", width: 24, textAlign: "center" }}>{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{entry.name}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? "#f5c842" : "#1db954" }}>{entry.score}</span>
            </div>
          ))}
          <button style={{ ...S.ghostBtn, marginTop: 20 }} onClick={onBack}>WRÓĆ DO MENU</button>
        </div>
      </div>
    );
  }

  // ─── SUMMARY ───
  if (screen === "summary") {
    const correctCount = matchResults.filter((mr) => mr.isCorrect).length;
    return (
      <div style={S.app}>
        <div style={{ ...S.card, ...S.center, marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={S.h2}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#8a9a8e", marginTop: 4 }}>TRYB: ZGADNIJ STRZELCA</div>
          <div style={{ margin: "24px 0", padding: "20px", background: "rgba(29,185,84,0.08)", borderRadius: 12, border: "1px solid rgba(29,185,84,0.2)" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#1db954" }}>{totalScore}</div>
            <div style={{ color: "#8a9a8e", fontSize: 13, marginTop: 4 }}>PUNKTÓW</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>
            <div><div style={{ fontSize: 22, fontWeight: 700 }}>{matches.length}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>BRAMEK</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: "#f5c842" }}>{correctCount}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>TRAFIONE</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: "#84cc16" }}>{Math.round((correctCount / matches.length) * 100)}%</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>CELNOŚĆ</div></div>
          </div>

          {matchResults.map((mr, i) => (
            <div key={i} style={{ textAlign: "left", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 6, border: "1px solid #1a3a24" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{mr.match.home} vs {mr.match.away}</div>
                <div style={{ fontWeight: 800, color: mr.isCorrect ? "#22c55e" : "#ef4444" }}>{mr.isCorrect ? "✓" : "✗"}</div>
              </div>
              <div style={{ fontSize: 11, color: "#8a9a8e" }}>
                {mr.correct} {mr.minute}' · {mr.match.competition} {mr.match.season}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <input type="text" placeholder="Twoje imię / nick" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={{ width: "100%", padding: "12px 16px", background: "#0a1610", border: "1px solid #1a3a24", borderRadius: 8, color: "#e8e8e3", fontSize: 15, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
            <button style={S.goldBtn} onClick={submitToLeaderboard}>ZAPISZ WYNIK</button>
          </div>
          <button style={{ ...S.ghostBtn, marginTop: 12 }} onClick={restartGame}>ZAGRAJ PONOWNIE</button>
          <button style={{ ...S.ghostBtn, marginTop: 8 }} onClick={onBack}>WRÓĆ DO MENU</button>
        </div>
      </div>
    );
  }

  // ─── GAME ───
  if (screen === "game" && currentMatch && currentGoal) {
    const matchNum = currentMatchIdx + 1;

    return (
      <div style={S.app}>
        {showExitConfirm && (
          <ExitConfirm
            onConfirm={() => { clearInterval(timerRef.current); onBack(); }}
            onCancel={() => setShowExitConfirm(false)}
          />
        )}

        <div style={{ width: "100%", maxWidth: 520, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => setShowExitConfirm(true)} style={{ background: "none", border: "none", color: "#8a9a8e", cursor: "pointer", fontSize: 13, padding: "4px 0" }}>← Wyjdź</button>
          <div style={{ fontSize: 13, color: "#8a9a8e" }}>Bramka {matchNum}/{matches.length}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1db954" }}>{totalScore} pkt</div>
        </div>

        <div style={{ ...S.card, position: "relative" }}>
          {/* Timer bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "16px 16px 0 0", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 0.5s" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 4 }}>
            <span style={{ ...S.badge, background: difficultyColors[currentMatch.difficulty] + "22", color: difficultyColors[currentMatch.difficulty], border: `1px solid ${difficultyColors[currentMatch.difficulty]}44` }}>
              {difficultyLabels[currentMatch.difficulty]}
            </span>
            <span style={{ fontSize: 24, fontWeight: 800, color: timerColor, fontVariantNumeric: "tabular-nums" }}>{timeLeft}s</span>
          </div>

          {/* Match info */}
          <div style={{ ...S.center, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#8a9a8e", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{currentMatch.competition} · {currentMatch.season}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, textAlign: "right", flex: 1 }}>{currentMatch.home}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#f5c842", padding: "4px 14px", background: "rgba(245,200,66,0.1)", borderRadius: 8 }}>{currentMatch.score}</span>
              <span style={{ fontSize: 18, fontWeight: 700, textAlign: "left", flex: 1 }}>{currentMatch.away}</span>
            </div>
          </div>

          {/* Goal prompt */}
          <div style={{ ...S.center, padding: "16px", background: "rgba(29,185,84,0.06)", borderRadius: 10, border: "1px solid rgba(29,185,84,0.15)", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              Kto strzelił bramkę w <span style={{ color: "#1db954" }}>{currentGoal.minute}'</span>
              <span style={{ color: "#8a9a8e", fontWeight: 400 }}> ({currentGoal.team === "home" ? currentMatch.home : currentMatch.away})</span>?
            </div>
          </div>

          {/* Options */}
          {!showResult && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {currentMatch.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(option)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "2px solid #1a3a24",
                    borderRadius: 10,
                    padding: "16px 12px",
                    color: "#e8e8e3",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => { e.target.style.borderColor = "#1db954"; e.target.style.background = "rgba(29,185,84,0.08)"; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = "#1a3a24"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Result */}
          {showResult && lastResult && (
            <div style={{ ...S.center, padding: "20px", background: `${lastResult.isCorrect ? "#22c55e" : "#ef4444"}11`, borderRadius: 12, border: `1px solid ${lastResult.isCorrect ? "#22c55e" : "#ef4444"}33`, marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: lastResult.isCorrect ? "#22c55e" : "#ef4444" }}>{lastResult.label}</div>

              {lastResult.timeOut ? (
                <div style={{ fontSize: 14, color: "#8a9a8e", marginTop: 8 }}>Czas minął!</div>
              ) : !lastResult.isCorrect ? (
                <div style={{ fontSize: 14, color: "#8a9a8e", marginTop: 8 }}>
                  Twój typ: <b style={{ color: "#ef4444" }}>{lastResult.selected}</b>
                </div>
              ) : null}

              <div style={{ fontSize: 18, fontWeight: 700, color: "#e8e8e3", marginTop: 12 }}>
                Strzelec: <span style={{ color: "#22c55e" }}>{lastResult.correct}</span> · {lastResult.minute}'
              </div>

              <div style={{ fontSize: 32, fontWeight: 800, color: lastResult.isCorrect ? "#22c55e" : "#ef4444", marginTop: 8 }}>+{lastResult.points}</div>
            </div>
          )}

          {/* Action button — only after result */}
          {showResult && (
            <button style={S.greenBtn} onClick={nextMatch}>
              {currentMatchIdx + 1 < matches.length ? "NASTĘPNA BRAMKA →" : "ZOBACZ WYNIKI"}
            </button>
          )}

          {/* Match progress */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {matches.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < currentMatchIdx ? "#1db954" : i === currentMatchIdx ? (showResult ? (lastResult?.isCorrect ? "#22c55e" : "#ef4444") : "#f5c842") : "#1a3a24", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
