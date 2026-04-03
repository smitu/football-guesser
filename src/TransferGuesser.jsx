import { useState, useEffect, useCallback, useRef } from "react";
import { TRANSFERS } from "./data/transfers";
import { shuffleArray, difficultyLabels, difficultyColors, S, ExitConfirm } from "./shared";

const TIMER_SECONDS = 30;
const ROUNDS_PER_GAME = 10;
const OPTIONS_COUNT = 4;

function generateOptions(correctPlayer, allPlayers) {
  const options = [correctPlayer];
  const pool = allPlayers.filter((p) => p !== correctPlayer);
  const shuffled = shuffleArray(pool);
  for (let i = 0; i < OPTIONS_COUNT - 1 && i < shuffled.length; i++) {
    options.push(shuffled[i]);
  }
  return shuffleArray(options);
}

export default function TransferGuesser({ onBack }) {
  const [screen, setScreen] = useState("game");
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [totalScore, setTotalScore] = useState(0);
  const [results, setResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [revealedClubs, setRevealedClubs] = useState(1);
  const [leaderboard, setLeaderboard] = useState([
    { name: "Maciek K.", score: 750 },
    { name: "Kuba W.", score: 620 },
    { name: "Tomek R.", score: 500 },
    { name: "Ania M.", score: 380 },
    { name: "Piotr S.", score: 250 },
  ]);
  const timerRef = useRef(null);
  const allPlayerNames = useRef(TRANSFERS.map((t) => t.player));

  const initGame = () => {
    const shuffled = shuffleArray(TRANSFERS).slice(0, ROUNDS_PER_GAME).map((transfer) => ({
      ...transfer,
      options: generateOptions(transfer.player, allPlayerNames.current),
    }));
    return shuffled;
  };

  useEffect(() => {
    setRounds(initGame());
  }, []);

  const current = rounds[currentIdx];

  // Timer + progressive reveal
  useEffect(() => {
    if (screen !== "game" || showResult || gameOver || !current || showExitConfirm) return;
    setRevealedClubs(1);
    const revealInterval = setInterval(() => {
      setRevealedClubs((prev) => {
        if (prev >= current.clubs.length) {
          clearInterval(revealInterval);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(2000, (TIMER_SECONDS * 1000) / (current.clubs.length + 1)));

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(revealInterval);
          handleSubmit(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { clearInterval(timerRef.current); clearInterval(revealInterval); };
  }, [screen, showResult, currentIdx, gameOver, current, showExitConfirm]);

  const handleSubmit = useCallback(
    (option, timeOut = false) => {
      clearInterval(timerRef.current);
      if (!current) return;

      const correct = !timeOut && option === current.player;
      // More points if guessed with fewer clubs revealed
      const clubBonus = correct ? Math.max(0, (current.clubs.length - revealedClubs) * 10) : 0;
      const points = timeOut ? 0 : correct ? 100 + clubBonus : 0;
      const label = timeOut ? "CZAS!" : correct ? (clubBonus > 0 ? "SZYBKI!" : "DOBRZE!") : "PUDŁO";

      const entry = {
        transfer: current,
        selected: option,
        correct: current.player,
        points,
        label,
        isCorrect: correct,
        timeOut,
        clubsRevealed: revealedClubs,
      };

      setLastResult(entry);
      setTotalScore((prev) => prev + points);
      setResults((prev) => [...prev, entry]);
      setShowResult(true);
      setRevealedClubs(current.clubs.length); // Reveal all on answer
    },
    [current, revealedClubs]
  );

  const nextRound = () => {
    setShowResult(false);
    setLastResult(null);

    if (currentIdx + 1 < rounds.length) {
      setCurrentIdx((prev) => prev + 1);
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
    setRounds(initGame());
    setCurrentIdx(0);
    setTimeLeft(TIMER_SECONDS);
    setTotalScore(0);
    setResults([]);
    setShowResult(false);
    setLastResult(null);
    setGameOver(false);
    setRevealedClubs(1);
    setScreen("game");
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 15 ? "#eab308" : "#22c55e";

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 40 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>🏆 RANKING — TRANSFERY</h2>
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
    const correctCount = results.filter((r) => r.isCorrect).length;
    return (
      <div style={S.app}>
        <div style={{ ...S.card, ...S.center, marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={S.h2}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#8a9a8e", marginTop: 4 }}>TRYB: ZGADNIJ ZAWODNIKA</div>
          <div style={{ margin: "24px 0", padding: "20px", background: "rgba(29,185,84,0.08)", borderRadius: 12, border: "1px solid rgba(29,185,84,0.2)" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#1db954" }}>{totalScore}</div>
            <div style={{ color: "#8a9a8e", fontSize: 13, marginTop: 4 }}>PUNKTÓW</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>
            <div><div style={{ fontSize: 22, fontWeight: 700 }}>{rounds.length}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>RUND</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: "#f5c842" }}>{correctCount}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>TRAFIONE</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: "#84cc16" }}>{Math.round((correctCount / rounds.length) * 100)}%</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>CELNOŚĆ</div></div>
          </div>

          {results.map((r, i) => (
            <div key={i} style={{ textAlign: "left", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 6, border: "1px solid #1a3a24" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.correct}</div>
                <div style={{ fontWeight: 800, color: r.isCorrect ? "#22c55e" : "#ef4444" }}>{r.points} pkt</div>
              </div>
              <div style={{ fontSize: 11, color: "#8a9a8e" }}>{r.transfer.clubs.join(" → ")}</div>
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

        <div style={{ width: "100%", maxWidth: 520, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => setShowExitConfirm(true)} style={{ background: "none", border: "none", color: "#8a9a8e", cursor: "pointer", fontSize: 13, padding: "4px 0" }}>← Wyjdź</button>
          <div style={{ fontSize: 13, color: "#8a9a8e" }}>Runda {roundNum}/{rounds.length}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1db954" }}>{totalScore} pkt</div>
        </div>

        <div style={{ ...S.card, position: "relative" }}>
          {/* Timer bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "16px 16px 0 0", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 0.5s" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 4 }}>
            <span style={{ ...S.badge, background: difficultyColors[current.difficulty] + "22", color: difficultyColors[current.difficulty], border: `1px solid ${difficultyColors[current.difficulty]}44` }}>
              {difficultyLabels[current.difficulty]}
            </span>
            <span style={{ fontSize: 24, fontWeight: 800, color: timerColor, fontVariantNumeric: "tabular-nums" }}>{timeLeft}s</span>
          </div>

          {/* Transfer path prompt */}
          <div style={{ ...S.center, padding: "16px", background: "rgba(139,92,246,0.06)", borderRadius: 10, border: "1px solid rgba(139,92,246,0.15)", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#8a9a8e", marginBottom: 12 }}>ŚCIEŻKA TRANSFEROWA</div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {current.clubs.map((club, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {i > 0 && <span style={{ color: "#5a4a7a", fontSize: 14 }}>→</span>}
                  <span style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    background: i < revealedClubs ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
                    color: i < revealedClubs ? "#c4b5fd" : "#3a5a44",
                    border: i < revealedClubs ? "1px solid rgba(139,92,246,0.3)" : "1px solid #1a3a24",
                    transition: "all 0.5s",
                  }}>
                    {i < revealedClubs ? club : "???"}
                  </span>
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#5a4a7a", marginTop: 12 }}>
              {revealedClubs}/{current.clubs.length} klubów odkrytych
            </div>
          </div>

          {/* Question */}
          <div style={{ ...S.center, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Kto to za zawodnik?
          </div>

          {/* Options */}
          {!showResult && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {current.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(option)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "2px solid #1a3a24",
                    borderRadius: 10,
                    padding: "16px 12px",
                    color: "#e8e8e3",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => { e.target.style.borderColor = "#8b5cf6"; e.target.style.background = "rgba(139,92,246,0.08)"; }}
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

              <div style={{ fontSize: 20, fontWeight: 700, color: "#e8e8e3", marginTop: 12 }}>
                <span style={{ color: "#8b5cf6" }}>{lastResult.correct}</span>
              </div>

              <div style={{ fontSize: 32, fontWeight: 800, color: lastResult.isCorrect ? "#22c55e" : "#ef4444", marginTop: 8 }}>+{lastResult.points}</div>

              {lastResult.isCorrect && lastResult.points > 100 && (
                <div style={{ fontSize: 11, color: "#8b5cf6", marginTop: 4 }}>
                  +{lastResult.points - 100} bonus za szybkość!
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          {showResult && (
            <button style={S.greenBtn} onClick={nextRound}>
              {currentIdx + 1 < rounds.length ? "NASTĘPNA RUNDA →" : "ZOBACZ WYNIKI"}
            </button>
          )}

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {rounds.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < currentIdx ? "#1db954" : i === currentIdx ? (showResult ? (lastResult?.isCorrect ? "#22c55e" : "#ef4444") : "#f5c842") : "#1a3a24", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
