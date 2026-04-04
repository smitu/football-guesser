import { useState, useEffect, useCallback, useRef } from "react";
import { TRANSFERS } from "./data/transfers";
import { getClubData } from "./data/clubs";
import {
  shuffleArray, difficultyLabels, difficultyColors,
  S, ExitConfirm,
  topBar, exitBtn, timerBarContainer,
  progressDot, resultBox, inputStyle, leaderboardRow, summaryMatchRow, getTimerColor,
} from "./shared";

const TIMER_SECONDS = 30;
const ROUNDS_PER_GAME = 10;

// More options for harder difficulties
function getOptionsCount(difficulty) {
  if (difficulty === "hell") return 6;
  if (difficulty === "hard") return 6;
  return 4;
}

function generateOptions(correctPlayer, allPlayers, count = 4) {
  const options = [correctPlayer];
  const pool = allPlayers.filter((p) => p !== correctPlayer);
  const shuffled = shuffleArray(pool);
  for (let i = 0; i < count - 1 && i < shuffled.length; i++) {
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
      options: generateOptions(transfer.player, allPlayerNames.current, getOptionsCount(transfer.difficulty)),
    }));
    return shuffled;
  };

  useEffect(() => {
    setRounds(initGame());
  }, []);

  const current = rounds[currentIdx];

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
      const clubBonus = correct ? Math.max(0, (current.clubs.length - revealedClubs) * 10) : 0;
      const points = timeOut ? 0 : correct ? 100 + clubBonus : 0;
      const label = timeOut ? "CZAS!" : correct ? (clubBonus > 0 ? "SZYBKI!" : "DOBRZE!") : "PUDŁO";
      const entry = {
        transfer: current, selected: option, correct: current.player,
        points, label, isCorrect: correct, timeOut, clubsRevealed: revealedClubs,
      };
      setLastResult(entry);
      setTotalScore((prev) => prev + points);
      setResults((prev) => [...prev, entry]);
      setShowResult(true);
      setRevealedClubs(current.clubs.length);
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
  const timerColor = getTimerColor(timeLeft, TIMER_SECONDS);

  const optionBtn = {
    background: "rgba(255, 255, 255, 0.02)",
    border: "2px solid rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: "18px 14px",
    color: "#edf0f7",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "center",
    fontFamily: "'Sora', sans-serif",
  };

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 32 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>
            <span style={{ fontSize: 24, marginRight: 8 }}>🏆</span>RANKING — TRANSFERY
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
        <div style={{ ...S.card, ...S.center, marginTop: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h2 style={{ ...S.h2, fontSize: 26 }}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#8892a4", marginTop: 4, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: 2 }}>TRYB: ZGADNIJ ZAWODNIKA</div>

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
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#76ff03", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{Math.round((correctCount / rounds.length) * 100)}%</div>
              <div style={{ color: "#4b5264", fontSize: 10, letterSpacing: 2, fontFamily: "'Bricolage Grotesque', sans-serif" }}>CELNOŚĆ</div>
            </div>
          </div>

          {results.map((r, i) => (
            <div key={i} style={summaryMatchRow}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.correct}</div>
                <div style={{ fontWeight: 800, color: r.isCorrect ? "#4ade80" : "#f87171", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{r.points} pkt</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, marginTop: 6 }}>
                {r.transfer.clubs.map((club, ci) => {
                  const cd = getClubData(club);
                  return (
                    <span key={ci} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      {ci > 0 && <span style={{ color: "#3a4455", fontSize: 9 }}>→</span>}
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: cd.s,
                        background: cd.p, borderRadius: 4,
                        padding: "2px 5px",
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        letterSpacing: 0.3,
                      }}>{cd.abbr}</span>
                    </span>
                  );
                })}
              </div>
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
          <div style={{ fontSize: 13, color: "#8892a4", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600 }}>Runda {roundNum}/{rounds.length}</div>
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

          {/* Transfer path with club badges */}
          <div style={{
            ...S.center, padding: "20px 16px",
            background: "rgba(179, 136, 255, 0.04)",
            borderRadius: 14,
            border: "1px solid rgba(179, 136, 255, 0.1)",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, color: "#6a5a8a", marginBottom: 14, letterSpacing: 3, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>ŚCIEŻKA TRANSFEROWA</div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {current.clubs.map((club, i) => {
                const revealed = i < revealedClubs;
                const cd = getClubData(club);
                return (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {i > 0 && <span style={{ color: "#3a2a5a", fontSize: 11, margin: "0 2px" }}>→</span>}
                    {revealed ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "6px 12px 6px 6px",
                        borderRadius: 10,
                        background: `${cd.p}15`,
                        border: `1px solid ${cd.p}30`,
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        animation: "revealClub 0.4s ease-out both",
                      }}>
                        {/* Club badge */}
                        <span style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: `linear-gradient(135deg, ${cd.p}, ${cd.p}cc)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 900, color: cd.s,
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          letterSpacing: 0.5,
                          boxShadow: `0 2px 8px ${cd.p}40`,
                          flexShrink: 0,
                        }}>
                          {cd.abbr}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: "#d4bfff",
                          whiteSpace: "nowrap",
                        }}>
                          {club}
                        </span>
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "6px 12px 6px 6px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "all 0.5s",
                      }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: "rgba(255, 255, 255, 0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, color: "#2a3444",
                        }}>?</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#2a3444" }}>???</span>
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#4a3a6a", marginTop: 14, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {revealedClubs}/{current.clubs.length} klubów odkrytych
            </div>
          </div>

          {/* Question */}
          <div style={{ ...S.center, fontSize: 16, fontWeight: 700, marginBottom: 18, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Kto to za zawodnik?
          </div>

          {/* Options */}
          {!showResult && (
            <div style={{ display: "grid", gridTemplateColumns: current.options.length > 4 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {current.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(option)}
                  style={optionBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(179, 136, 255, 0.3)";
                    e.currentTarget.style.background = "rgba(179, 136, 255, 0.06)";
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
              <div style={{ fontSize: 30, fontWeight: 900, color: lastResult.isCorrect ? "#4ade80" : "#f87171", fontFamily: "'Bricolage Grotesque', sans-serif" }}>{lastResult.label}</div>
              {lastResult.timeOut ? (
                <div style={{ fontSize: 14, color: "#8892a4", marginTop: 10 }}>Czas minął!</div>
              ) : !lastResult.isCorrect ? (
                <div style={{ fontSize: 14, color: "#8892a4", marginTop: 10 }}>
                  Twój typ: <b style={{ color: "#f87171" }}>{lastResult.selected}</b>
                </div>
              ) : null}
              <div style={{ fontSize: 22, fontWeight: 700, color: "#edf0f7", marginTop: 14 }}>
                <span style={{ color: "#a78bfa" }}>{lastResult.correct}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: lastResult.isCorrect ? "#4ade80" : "#f87171", marginTop: 10, fontFamily: "'Bricolage Grotesque', sans-serif" }}>+{lastResult.points}</div>
              {lastResult.isCorrect && lastResult.points > 100 && (
                <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 6, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
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
