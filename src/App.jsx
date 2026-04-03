import { useState, useEffect, useCallback, useRef } from "react";
import { MATCHES } from "./data/matches";
import ScoreGuesser from "./ScoreGuesser";

const TIMER_SECONDS = 45;
const MAX_MATCH_MINUTES = 120;
const MATCHES_PER_GAME = 10;

function calculateScore(guessedMinute, actualMinute) {
  const diff = Math.abs(guessedMinute - actualMinute);
  if (diff === 0) return 100;
  if (diff <= 2) return 85;
  if (diff <= 5) return 65;
  if (diff <= 10) return 40;
  if (diff <= 20) return 20;
  if (diff <= 30) return 10;
  return 0;
}

function getScoreColor(score) {
  if (score >= 85) return "#22c55e";
  if (score >= 65) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score) {
  if (score === 100) return "IDEALNIE!";
  if (score >= 85) return "ŚWIETNIE!";
  if (score >= 65) return "BLISKO!";
  if (score >= 40) return "NIEŹLE";
  if (score >= 20) return "DALEKO";
  return "PUDŁO";
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const difficultyLabels = { easy: "ŁATWY", medium: "ŚREDNI", hard: "TRUDNY" };
const difficultyColors = { easy: "#22c55e", medium: "#eab308", hard: "#ef4444" };

// ─── STYLES ───
const S = {
  app: { minHeight: "100vh", background: "#080f0b", color: "#e8e8e3", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", boxSizing: "border-box" },
  card: { background: "linear-gradient(145deg, #0f1f15, #0a1610)", border: "1px solid #1a3a24", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 520, boxSizing: "border-box" },
  greenBtn: { background: "linear-gradient(135deg, #1db954, #15803d)", color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, width: "100%", textTransform: "uppercase", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 4px 20px rgba(29,185,84,0.3)" },
  goldBtn: { background: "linear-gradient(135deg, #f5c842, #d4a520)", color: "#0a1610", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, width: "100%" },
  ghostBtn: { background: "transparent", color: "#8a9a8e", border: "1px solid #1a3a24", borderRadius: 10, padding: "12px 24px", fontSize: 14, cursor: "pointer", width: "100%" },
  badge: { display: "inline-block", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1.5 },
  h1: { fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: 700, margin: 0 },
  sub: { color: "#8a9a8e", fontSize: 14, margin: "8px 0 0" },
  center: { textAlign: "center" },
};

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [gameMode, setGameMode] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [guessedMinute, setGuessedMinute] = useState(45);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [totalScore, setTotalScore] = useState(0);
  const [matchResults, setMatchResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([
    { name: "Maciek K.", score: 2340 },
    { name: "Tomek R.", score: 1980 },
    { name: "Kuba W.", score: 1750 },
    { name: "Ania M.", score: 1520 },
    { name: "Piotr S.", score: 1310 },
  ]);
  const [playerName, setPlayerName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const timerRef = useRef(null);

  const currentMatch = matches[currentMatchIdx];
  const currentGoal = currentMatch?.selectedGoal;
  const hasExtraTime = currentGoal?.minute > 90;
  const maxMin = hasExtraTime ? MAX_MATCH_MINUTES : 90;

  const startGame = () => {
    const shuffled = shuffleArray(MATCHES).slice(0, MATCHES_PER_GAME).map((match) => {
      const randomGoal = match.goals[Math.floor(Math.random() * match.goals.length)];
      return { ...match, selectedGoal: randomGoal };
    });
    setMatches(shuffled);
    setCurrentMatchIdx(0);
    setGuessedMinute(45);
    setTimeLeft(TIMER_SECONDS);
    setTotalScore(0);
    setMatchResults([]);
    setShowResult(false);
    setGameOver(false);
    setScreen("game");
  };

  useEffect(() => {
    if (screen !== "game" || showResult || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitGuess(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, showResult, currentMatchIdx, gameOver]);

  const handleSubmitGuess = useCallback(
    (timeOut = false) => {
      clearInterval(timerRef.current);
      const actual = currentGoal.minute;
      const guess = timeOut ? -1 : guessedMinute;
      const score = timeOut ? 0 : calculateScore(guess, actual);

      setLastScore({ guess, actual, score, scorer: currentGoal.scorer, team: currentGoal.team, timeOut });
      setTotalScore((prev) => prev + score);
      setMatchResults((prev) => [...prev, { match: currentMatch, score, guess, actual, scorer: currentGoal.scorer, timeOut }]);
      setShowResult(true);
    },
    [currentGoal, currentMatch, guessedMinute]
  );

  const nextMatch = () => {
    setShowResult(false);
    setLastScore(null);

    if (currentMatchIdx + 1 < matches.length) {
      setCurrentMatchIdx((prev) => prev + 1);
      setGuessedMinute(45);
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

  const handleSliderInteraction = (e) => {
    if (showResult) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const minute = Math.round(pct * maxMin);
    setGuessedMinute(Math.max(1, Math.min(maxMin, minute)));
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#eab308" : "#22c55e";

  // ─── SCORE GUESSER MODE ───
  if (gameMode === "score") {
    return <ScoreGuesser onBack={() => { setGameMode(null); setScreen("menu"); }} />;
  }

  // ─── MENU ───
  if (screen === "menu") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, ...S.center, marginTop: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>⚽</div>
          <h1 style={{ ...S.h1, fontSize: 28 }}>FOOTBALL</h1>
          <h1 style={{ ...S.h1, fontSize: 34, background: "linear-gradient(90deg, #1db954, #f5c842)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GUESSER</h1>
          <p style={{ ...S.sub, marginTop: 16, marginBottom: 32 }}>
            Sprawdź swoją wiedzę o legendarnych meczach.
            <br />
            Wybierz tryb i zdobywaj punkty!
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Mode: Minute Guesser */}
            <button style={S.greenBtn} onClick={startGame}>
              <div style={{ fontSize: 18 }}>⏱️ ZGADNIJ MINUTĘ</div>
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 4 }}>Typuj minuty bramek na osi czasu</div>
            </button>
            {/* Mode: Score Guesser */}
            <button style={{ ...S.greenBtn, background: "linear-gradient(135deg, #f5c842, #d4a520)", color: "#0a1610", boxShadow: "0 4px 20px rgba(245,200,66,0.3)" }} onClick={() => setGameMode("score")}>
              <div style={{ fontSize: 18 }}>🏟️ ZGADNIJ WYNIK</div>
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, marginTop: 4 }}>Podaj dokładny wynik meczu</div>
            </button>
            <button style={S.ghostBtn} onClick={() => setScreen("leaderboard")}>RANKING</button>
            <button style={S.ghostBtn} onClick={() => setScreen("howto")}>JAK GRAĆ?</button>
          </div>
        </div>
        <p style={{ color: "#3a5a44", fontSize: 11, marginTop: 24, letterSpacing: 1 }}>v0.3 · 2 tryby · {MATCHES.length} klasyków · 2026</p>
      </div>
    );
  }

  // ─── HOW TO PLAY ───
  if (screen === "howto") {
    const steps = [
      { icon: "🏟️", title: "Dostajesz mecz", desc: "Losowy legendarny mecz z historii piłki." },
      { icon: "🎯", title: "Typujesz minuty", desc: "Przesuń suwak na minutę, w której Twoim zdaniem padła bramka." },
      { icon: "⏱️", title: `Masz ${TIMER_SECONDS} sekund`, desc: "Na każdą bramkę masz ograniczony czas." },
      { icon: "🏆", title: "Zbieraj punkty", desc: "Im bliżej, tym więcej. Dokładne trafienie = 100 pkt." },
    ];
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 40 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>JAK GRAĆ?</h2>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
                <div style={{ color: "#8a9a8e", fontSize: 13, marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
          <button style={{ ...S.greenBtn, marginTop: 8 }} onClick={() => setScreen("menu")}>WRÓĆ</button>
        </div>
      </div>
    );
  }

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 40 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>🏆 RANKING</h2>
          {leaderboard.map((entry, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: i === 0 ? "rgba(245,200,66,0.1)" : i < 3 ? "rgba(29,185,84,0.06)" : "transparent", borderRadius: 8, marginBottom: 4, border: i === 0 ? "1px solid rgba(245,200,66,0.2)" : "1px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? "#f5c842" : i < 3 ? "#1db954" : "#8a9a8e", width: 24, textAlign: "center" }}>{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{entry.name}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? "#f5c842" : "#1db954" }}>{entry.score}</span>
            </div>
          ))}
          <button style={{ ...S.ghostBtn, marginTop: 20 }} onClick={() => setScreen("menu")}>WRÓĆ DO MENU</button>
        </div>
      </div>
    );
  }

  // ─── SUMMARY ───
  if (screen === "summary") {
    const perfectHits = matchResults.filter((mr) => mr.score === 100).length;
    return (
      <div style={S.app}>
        <div style={{ ...S.card, ...S.center, marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={S.h2}>KONIEC GRY!</h2>
          <div style={{ margin: "24px 0", padding: "20px", background: "rgba(29,185,84,0.08)", borderRadius: 12, border: "1px solid rgba(29,185,84,0.2)" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#1db954" }}>{totalScore}</div>
            <div style={{ color: "#8a9a8e", fontSize: 13, marginTop: 4 }}>PUNKTÓW</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>
            <div><div style={{ fontSize: 22, fontWeight: 700 }}>{matches.length}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>MECZY</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: "#f5c842" }}>{perfectHits}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>IDEALNE</div></div>
          </div>

          {matchResults.map((mr, i) => (
            <div key={i} style={{ textAlign: "left", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 6, border: "1px solid #1a3a24" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{mr.match.home} vs {mr.match.away}</div>
                <div style={{ fontWeight: 800, color: getScoreColor(mr.score) }}>{mr.score} pkt</div>
              </div>
              <div style={{ fontSize: 11, color: "#8a9a8e" }}>{mr.match.competition} {mr.match.season} · {mr.scorer} {mr.actual}'</div>
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <input type="text" placeholder="Twoje imię / nick" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={{ width: "100%", padding: "12px 16px", background: "#0a1610", border: "1px solid #1a3a24", borderRadius: 8, color: "#e8e8e3", fontSize: 15, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
            <button style={S.goldBtn} onClick={submitToLeaderboard}>ZAPISZ WYNIK</button>
          </div>
          <button style={{ ...S.ghostBtn, marginTop: 12 }} onClick={startGame}>ZAGRAJ PONOWNIE</button>
        </div>
      </div>
    );
  }

  // ─── GAME ───
  if (screen === "game" && currentMatch && currentGoal) {
    const matchNum = currentMatchIdx + 1;
    const sliderPct = ((guessedMinute - 1) / (maxMin - 1)) * 100;

    return (
      <div style={S.app}>
        <div style={{ width: "100%", maxWidth: 520, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#8a9a8e" }}>Mecz {matchNum}/{matches.length}</div>
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
              W której minucie strzelił <span style={{ color: "#1db954" }}>{currentGoal.scorer}</span>
              <span style={{ color: "#8a9a8e", fontWeight: 400 }}> ({currentGoal.team === "home" ? currentMatch.home : currentMatch.away})</span>?
            </div>
          </div>

          {/* Slider */}
          {!showResult && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a9a8e", marginBottom: 8 }}>
                <span>1'</span>
                <span>45'</span>
                {hasExtraTime ? (<><span>90'</span><span>120'</span></>) : (<span>90'</span>)}
              </div>
              <div
                ref={sliderRef}
                onMouseDown={(e) => { setIsDragging(true); handleSliderInteraction(e); }}
                onMouseMove={(e) => isDragging && handleSliderInteraction(e)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => { setIsDragging(true); handleSliderInteraction(e); }}
                onTouchMove={(e) => isDragging && handleSliderInteraction(e)}
                onTouchEnd={() => setIsDragging(false)}
                style={{ position: "relative", height: 48, cursor: "pointer", userSelect: "none", touchAction: "none" }}
              >
                <div style={{ position: "absolute", top: 20, left: 0, right: 0, height: 8, background: "#1a3a24", borderRadius: 4 }}>
                  <div style={{ height: "100%", width: `${sliderPct}%`, background: "linear-gradient(90deg, #1db954, #22c55e)", borderRadius: 4, transition: isDragging ? "none" : "width 0.1s" }} />
                </div>
                <div style={{ position: "absolute", top: 14, left: `${(45 / maxMin) * 100}%`, width: 1, height: 20, background: "#3a5a44" }} />
                {hasExtraTime && <div style={{ position: "absolute", top: 14, left: `${(90 / maxMin) * 100}%`, width: 1, height: 20, background: "#3a5a44" }} />}
                <div style={{ position: "absolute", top: 10, left: `calc(${sliderPct}% - 16px)`, width: 32, height: 32, borderRadius: "50%", background: "#1db954", boxShadow: "0 0 16px rgba(29,185,84,0.5)", display: "flex", alignItems: "center", justifyContent: "center", transition: isDragging ? "none" : "left 0.1s" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{guessedMinute}'</span>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {showResult && lastScore && (
            <div style={{ ...S.center, padding: "20px", background: `${getScoreColor(lastScore.score)}11`, borderRadius: 12, border: `1px solid ${getScoreColor(lastScore.score)}33`, marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(lastScore.score) }}>{getScoreLabel(lastScore.score)}</div>
              {lastScore.timeOut ? (
                <div style={{ fontSize: 14, color: "#8a9a8e", marginTop: 8 }}>
                  Czas minął! Bramka padła w <b style={{ color: "#e8e8e3" }}>{lastScore.actual}'</b>
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "#8a9a8e", marginTop: 8 }}>
                  Twój typ: <b style={{ color: "#e8e8e3" }}>{lastScore.guess}'</b> · Faktycznie: <b style={{ color: "#e8e8e3" }}>{lastScore.actual}'</b> · Różnica: <b style={{ color: getScoreColor(lastScore.score) }}>{Math.abs(lastScore.guess - lastScore.actual)} min</b>
                </div>
              )}
              <div style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(lastScore.score), marginTop: 8 }}>+{lastScore.score}</div>
              <div style={{ position: "relative", height: 24, background: "#1a3a24", borderRadius: 4, marginTop: 16, overflow: "visible" }}>
                {!lastScore.timeOut && (
                  <div style={{ position: "absolute", top: -4, left: `calc(${((lastScore.guess - 1) / (maxMin - 1)) * 100}% - 8px)`, width: 16, height: 32, borderRadius: 4, background: "#8a9a8e", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>TY</span>
                  </div>
                )}
                <div style={{ position: "absolute", top: -4, left: `calc(${((lastScore.actual - 1) / (maxMin - 1)) * 100}% - 8px)`, width: 16, height: 32, borderRadius: 4, background: getScoreColor(lastScore.score), display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>{lastScore.actual}'</span>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          {!showResult ? (
            <button style={S.greenBtn} onClick={() => handleSubmitGuess(false)}>ZATWIERDŹ · {guessedMinute}'</button>
          ) : (
            <button style={S.greenBtn} onClick={nextMatch}>
              {currentMatchIdx + 1 < matches.length ? "NASTĘPNY MECZ →" : "ZOBACZ WYNIKI"}
            </button>
          )}

          {/* Match progress */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {matches.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < currentMatchIdx ? "#1db954" : i === currentMatchIdx ? (showResult ? getScoreColor(lastScore?.score || 0) : "#f5c842") : "#1a3a24", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  return null;
}
