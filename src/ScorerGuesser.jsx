import { useState, useEffect, useCallback, useRef } from "react";
import { MATCHES } from "./data/matches";
import {
  shuffleArray, getScoreColor, difficultyLabels, difficultyColors,
  S, ExitConfirm,
  topBar, exitBtn, timerBarContainer, matchInfoStyle, teamNameStyle, scoreBoxStyle,
  progressDot, resultBox, inputStyle, leaderboardRow, summaryMatchRow, getTimerColor,
} from "./shared";

const TIMER_SECONDS = 20;
const MATCHES_PER_GAME = 10;
const OPTIONS_COUNT = 4;

function getAllScorers() {
  const scorers = new Set();
  MATCHES.forEach((m) => m.goals.forEach((g) => {
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

  useEffect(() => {
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
        match: currentMatch, selected: option, correct: currentGoal.scorer,
        minute: currentGoal.minute, team: currentGoal.team,
        points, label, isCorrect: correct, timeOut,
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
  const timerColor = getTimerColor(timeLeft, TIMER_SECONDS);

  const optionBtn = (isHover) => ({
    background: isHover ? "rgba(255, 82, 82, 0.06)" : "rgba(255, 255, 255, 0.02)",
    border: isHover ? "2px solid rgba(255, 82, 82, 0.3)" : "2px solid rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: "18px 14px",
    color: "#e8eaed",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "center",
    fontFamily: "'DM Sans', sans-serif",
  });

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 32 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>
            <span style={{ fontSize: 24, marginRight: 8 }}>🏆</span>RANKING — STRZELCY
          </h2>
          {leaderboard.map((entry, i) => (
            <div key={i} style={leaderboardRow(i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontWeight: 900, fontSize: 15, color: i === 0 ? "#ffab00" : i < 3 ? "#00e676" : "#4a5568", width: 28, textAlign: "center", fontFamily: "'Outfit', sans-serif" }}>{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{entry.name}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? "#ffab00" : "#00e676", fontFamily: "'Outfit', sans-serif" }}>{entry.score}</span>
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
        <div style={{ ...S.card, ...S.center, marginTop: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h2 style={{ ...S.h2, fontSize: 26 }}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4, fontFamily: "'Outfit', sans-serif", letterSpacing: 2 }}>TRYB: ZGADNIJ STRZELCA</div>

          <div style={{ margin: "28px 0", padding: "24px", background: "rgba(0, 230, 118, 0.05)", borderRadius: 16, border: "1px solid rgba(0, 230, 118, 0.1)" }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#00e676", fontFamily: "'Outfit', sans-serif" }}>{totalScore}</div>
            <div style={{ color: "#5a6577", fontSize: 12, marginTop: 4, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>PUNKTÓW</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{matches.length}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>BRAMEK</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffab00", fontFamily: "'Outfit', sans-serif" }}>{correctCount}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>TRAFIONE</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#76ff03", fontFamily: "'Outfit', sans-serif" }}>{Math.round((correctCount / matches.length) * 100)}%</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>CELNOŚĆ</div>
            </div>
          </div>

          {matchResults.map((mr, i) => (
            <div key={i} style={summaryMatchRow}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{mr.match.home} vs {mr.match.away}</div>
                <div style={{ fontWeight: 800, color: mr.isCorrect ? "#00e676" : "#ff5252", fontFamily: "'Outfit', sans-serif" }}>{mr.isCorrect ? "✓" : "✗"}</div>
              </div>
              <div style={{ fontSize: 11, color: "#5a6577", marginTop: 4 }}>{mr.correct} {mr.minute}' · {mr.match.competition} {mr.match.season}</div>
            </div>
          ))}

          <div style={{ marginTop: 28 }}>
            <input type="text" placeholder="Twoje imię / nick" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={inputStyle} />
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

        <div style={topBar}>
          <button onClick={() => setShowExitConfirm(true)} style={exitBtn}>← Wyjdź</button>
          <div style={{ fontSize: 13, color: "#5a6577", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Bramka {matchNum}/{matches.length}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#00e676", fontFamily: "'Outfit', sans-serif" }}>{totalScore} pkt</div>
        </div>

        <div style={{ ...S.card, position: "relative" }}>
          <div style={timerBarContainer}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}aa)`, transition: "width 1s linear, background 0.5s", boxShadow: `0 0 12px ${timerColor}44` }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 4 }}>
            <span style={{ ...S.badge, background: difficultyColors[currentMatch.difficulty] + "12", color: difficultyColors[currentMatch.difficulty], border: `1px solid ${difficultyColors[currentMatch.difficulty]}22` }}>
              {difficultyLabels[currentMatch.difficulty]}
            </span>
            <span style={{ fontSize: 26, fontWeight: 900, color: timerColor, fontVariantNumeric: "tabular-nums", fontFamily: "'Outfit', sans-serif", animation: timeLeft <= 5 ? "timerUrgent 0.5s ease-in-out infinite" : "none" }}>{timeLeft}s</span>
          </div>

          {/* Match info */}
          <div style={{ ...S.center, marginBottom: 24 }}>
            <div style={matchInfoStyle}>{currentMatch.competition} · {currentMatch.season}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <span style={{ ...teamNameStyle, textAlign: "right", flex: 1 }}>{currentMatch.home}</span>
              <span style={scoreBoxStyle}>{currentMatch.score}</span>
              <span style={{ ...teamNameStyle, textAlign: "left", flex: 1 }}>{currentMatch.away}</span>
            </div>
          </div>

          {/* Goal prompt */}
          <div style={{
            ...S.center, padding: "18px 16px",
            background: "rgba(255, 82, 82, 0.04)",
            borderRadius: 14,
            border: "1px solid rgba(255, 82, 82, 0.1)",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>
              Kto strzelił bramkę w <span style={{ color: "#ff5252", fontWeight: 700 }}>{currentGoal.minute}'</span>
              <span style={{ color: "#5a6577", fontWeight: 400 }}> ({currentGoal.team === "home" ? currentMatch.home : currentMatch.away})</span>?
            </div>
          </div>

          {/* Options */}
          {!showResult && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {currentMatch.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(option)}
                  style={optionBtn(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 82, 82, 0.3)";
                    e.currentTarget.style.background = "rgba(255, 82, 82, 0.06)";
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
            <div style={resultBox(lastResult.isCorrect ? "#00e676" : "#ff5252")}>
              <div style={{ fontSize: 30, fontWeight: 900, color: lastResult.isCorrect ? "#00e676" : "#ff5252", fontFamily: "'Outfit', sans-serif" }}>{lastResult.label}</div>
              {lastResult.timeOut ? (
                <div style={{ fontSize: 14, color: "#5a6577", marginTop: 10 }}>Czas minął!</div>
              ) : !lastResult.isCorrect ? (
                <div style={{ fontSize: 14, color: "#5a6577", marginTop: 10 }}>
                  Twój typ: <b style={{ color: "#ff5252" }}>{lastResult.selected}</b>
                </div>
              ) : null}
              <div style={{ fontSize: 20, fontWeight: 700, color: "#e8eaed", marginTop: 14 }}>
                Strzelec: <span style={{ color: "#00e676" }}>{lastResult.correct}</span> · {lastResult.minute}'
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: lastResult.isCorrect ? "#00e676" : "#ff5252", marginTop: 10, fontFamily: "'Outfit', sans-serif" }}>+{lastResult.points}</div>
            </div>
          )}

          {showResult && (
            <button style={S.greenBtn} onClick={nextMatch}>
              {currentMatchIdx + 1 < matches.length ? "NASTĘPNA BRAMKA →" : "ZOBACZ WYNIKI"}
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
            {matches.map((_, i) => (
              <div key={i} style={progressDot(
                i < currentMatchIdx,
                i === currentMatchIdx,
                showResult ? (lastResult?.isCorrect ? "#00e676" : "#ff5252") : "#ffab00"
              )} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
