import { useState, useEffect, useCallback, useRef } from "react";
import { MATCHES } from "./data/matches";
import ScoreGuesser from "./ScoreGuesser";
import ScorerGuesser from "./ScorerGuesser";
import TransferGuesser from "./TransferGuesser";
import {
  shuffleArray, getScoreColor, difficultyLabels, difficultyColors,
  S, modeButtons, ExitConfirm,
  topBar, exitBtn, timerBarContainer, matchInfoStyle, teamNameStyle, scoreBoxStyle,
  progressDot, resultBox, inputStyle, leaderboardRow, summaryMatchRow, getTimerColor,
} from "./shared";

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

function getScoreLabel(score) {
  if (score === 100) return "IDEALNIE!";
  if (score >= 85) return "ŚWIETNIE!";
  if (score >= 65) return "BLISKO!";
  if (score >= 40) return "NIEŹLE";
  if (score >= 20) return "DALEKO";
  return "PUDŁO";
}

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [gameMode, setGameMode] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
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
    if (screen !== "game" || showResult || gameOver || showExitConfirm) return;
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
  }, [screen, showResult, currentMatchIdx, gameOver, showExitConfirm]);

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
  const timerColor = getTimerColor(timeLeft, TIMER_SECONDS);

  const goToMenu = () => { setGameMode(null); setScreen("menu"); setShowExitConfirm(false); };

  // ─── SUB-MODES ───
  if (gameMode === "score") return <ScoreGuesser onBack={goToMenu} />;
  if (gameMode === "scorer") return <ScorerGuesser onBack={goToMenu} />;
  if (gameMode === "transfer") return <TransferGuesser onBack={goToMenu} />;

  // ─── MENU ───
  if (screen === "menu") {
    const modes = [
      { key: "minute", icon: "⏱️", title: "ZGADNIJ MINUTĘ", desc: "Typuj minuty bramek na osi czasu", onClick: startGame, style: modeButtons.minute },
      { key: "score", icon: "🏟️", title: "ZGADNIJ WYNIK", desc: "Podaj dokładny wynik meczu", onClick: () => setGameMode("score"), style: modeButtons.score },
      { key: "scorer", icon: "🎯", title: "ZGADNIJ STRZELCA", desc: "Kto strzelił legendarną bramkę?", onClick: () => setGameMode("scorer"), style: modeButtons.scorer },
      { key: "transfer", icon: "🔄", title: "ZGADNIJ ZAWODNIKA", desc: "Rozpoznaj piłkarza po transferach", onClick: () => setGameMode("transfer"), style: modeButtons.transfer },
    ];

    return (
      <div style={S.app}>
        <div style={{ ...S.card, ...S.center, marginTop: 32 }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(0, 230, 118, 0.1), rgba(0, 200, 83, 0.05))",
            border: "2px solid rgba(0, 230, 118, 0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 38,
            animation: "glowPulse 3s ease-in-out infinite",
          }}>⚽</div>

          <h1 style={{ ...S.h1, fontSize: 30, color: "#7a8599", letterSpacing: 4 }}>FOOTBALL</h1>
          <h1 style={{
            ...S.h1, fontSize: 42, letterSpacing: -1,
            background: "linear-gradient(135deg, #00e676, #ffab00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 4,
          }}>GUESSER</h1>

          <p style={{ ...S.sub, marginTop: 12, marginBottom: 36, maxWidth: 320, margin: "12px auto 36px" }}>
            Sprawdź swoją wiedzę o legendarnych meczach piłkarskich.
          </p>

          {/* Mode buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {modes.map((mode, i) => (
              <button key={mode.key} style={{ ...mode.style, textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", animationDelay: `${i * 0.06}s` }} onClick={mode.onClick}>
                <span style={{ fontSize: 22, width: 36, textAlign: "center", flexShrink: 0 }}>{mode.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.8 }}>{mode.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, marginTop: 2, letterSpacing: 0 }}>{mode.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Secondary buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={{ ...S.ghostBtn, flex: 1 }} onClick={() => setScreen("leaderboard")}>🏆 RANKING</button>
            <button style={{ ...S.ghostBtn, flex: 1 }} onClick={() => setScreen("howto")}>❓ JAK GRAĆ</button>
          </div>
        </div>

        <p style={{ color: "#3a4455", fontSize: 11, marginTop: 24, letterSpacing: 2, fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
          v0.5 · 4 tryby · {MATCHES.length} klasyków · 2026
        </p>
      </div>
    );
  }

  // ─── HOW TO PLAY ───
  if (screen === "howto") {
    const steps = [
      { icon: "🏟️", title: "Dostajesz mecz", desc: "Losowy legendarny mecz z historii piłki nożnej." },
      { icon: "🎯", title: "Typujesz minuty", desc: "Przesuń suwak na minutę, w której Twoim zdaniem padła bramka." },
      { icon: "⏱️", title: `Masz ${TIMER_SECONDS} sekund`, desc: "Na każdą bramkę masz ograniczony czas — nie zwlekaj!" },
      { icon: "🏆", title: "Zbieraj punkty", desc: "Im bliżej prawdziwej minuty, tym więcej punktów. Trafienie = 100 pkt." },
    ];
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 32 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 28 }}>JAK GRAĆ?</h2>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 22,
              animation: "fadeInUp 0.4s ease-out both",
              animationDelay: `${i * 0.08}s`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(0, 230, 118, 0.06)",
                border: "1px solid rgba(0, 230, 118, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{s.title}</div>
                <div style={{ color: "#5a6577", fontSize: 13, lineHeight: 1.5 }}>{s.desc}</div>
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
        <div style={{ ...S.card, marginTop: 32 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>
            <span style={{ fontSize: 24, marginRight: 8 }}>🏆</span>RANKING
          </h2>
          {leaderboard.map((entry, i) => (
            <div key={i} style={leaderboardRow(i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{
                  fontWeight: 900, fontSize: 15,
                  color: i === 0 ? "#ffab00" : i < 3 ? "#00e676" : "#4a5568",
                  width: 28, textAlign: "center",
                  fontFamily: "'Outfit', sans-serif",
                }}>{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{entry.name}</span>
              </div>
              <span style={{
                fontWeight: 800, fontSize: 16,
                color: i === 0 ? "#ffab00" : "#00e676",
                fontFamily: "'Outfit', sans-serif",
              }}>{entry.score}</span>
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
        <div style={{ ...S.card, ...S.center, marginTop: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h2 style={{ ...S.h2, fontSize: 26 }}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4, fontFamily: "'Outfit', sans-serif", letterSpacing: 2 }}>TRYB: ZGADNIJ MINUTĘ</div>

          <div style={{
            margin: "28px 0", padding: "24px",
            background: "rgba(0, 230, 118, 0.05)", borderRadius: 16,
            border: "1px solid rgba(0, 230, 118, 0.1)",
          }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#00e676", fontFamily: "'Outfit', sans-serif", animation: "countUp 0.5s ease-out" }}>{totalScore}</div>
            <div style={{ color: "#5a6577", fontSize: 12, marginTop: 4, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>PUNKTÓW</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{matches.length}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>MECZY</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffab00", fontFamily: "'Outfit', sans-serif" }}>{perfectHits}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>IDEALNE</div>
            </div>
          </div>

          {matchResults.map((mr, i) => (
            <div key={i} style={summaryMatchRow}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{mr.match.home} vs {mr.match.away}</div>
                <div style={{ fontWeight: 800, color: getScoreColor(mr.score), fontFamily: "'Outfit', sans-serif" }}>{mr.score} pkt</div>
              </div>
              <div style={{ fontSize: 11, color: "#5a6577", marginTop: 4 }}>
                {mr.match.competition} {mr.match.season} · {mr.scorer} {mr.actual}'
              </div>
            </div>
          ))}

          <div style={{ marginTop: 28 }}>
            <input type="text" placeholder="Twoje imię / nick" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={inputStyle} />
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
        {showExitConfirm && (
          <ExitConfirm
            onConfirm={() => { clearInterval(timerRef.current); goToMenu(); }}
            onCancel={() => setShowExitConfirm(false)}
          />
        )}

        <div style={topBar}>
          <button onClick={() => setShowExitConfirm(true)} style={exitBtn}>← Wyjdź</button>
          <div style={{ fontSize: 13, color: "#5a6577", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Mecz {matchNum}/{matches.length}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#00e676", fontFamily: "'Outfit', sans-serif" }}>{totalScore} pkt</div>
        </div>

        <div style={{ ...S.card, position: "relative" }}>
          {/* Timer bar */}
          <div style={timerBarContainer}>
            <div style={{
              height: "100%", width: `${timerPct}%`,
              background: `linear-gradient(90deg, ${timerColor}, ${timerColor}aa)`,
              transition: "width 1s linear, background 0.5s",
              boxShadow: `0 0 12px ${timerColor}44`,
            }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 4 }}>
            <span style={{
              ...S.badge,
              background: difficultyColors[currentMatch.difficulty] + "12",
              color: difficultyColors[currentMatch.difficulty],
              border: `1px solid ${difficultyColors[currentMatch.difficulty]}22`,
            }}>
              {difficultyLabels[currentMatch.difficulty]}
            </span>
            <span style={{
              fontSize: 26, fontWeight: 900, color: timerColor,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "'Outfit', sans-serif",
              animation: timeLeft <= 10 ? "timerUrgent 0.5s ease-in-out infinite" : "none",
            }}>{timeLeft}s</span>
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
            background: "rgba(0, 230, 118, 0.04)",
            borderRadius: 14,
            border: "1px solid rgba(0, 230, 118, 0.1)",
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>
              W której minucie strzelił{" "}
              <span style={{ color: "#00e676", fontWeight: 700 }}>{currentGoal.scorer}</span>
              <span style={{ color: "#5a6577", fontWeight: 400 }}> ({currentGoal.team === "home" ? currentMatch.home : currentMatch.away})</span>?
            </div>
          </div>

          {/* Slider */}
          {!showResult && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4a5568", marginBottom: 10, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
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
                style={{ position: "relative", height: 52, cursor: "pointer", userSelect: "none", touchAction: "none" }}
              >
                {/* Track */}
                <div style={{
                  position: "absolute", top: 22, left: 0, right: 0, height: 8,
                  background: "rgba(255, 255, 255, 0.06)", borderRadius: 4,
                }}>
                  <div style={{
                    height: "100%", width: `${sliderPct}%`,
                    background: "linear-gradient(90deg, #00e676, #00c853)",
                    borderRadius: 4,
                    transition: isDragging ? "none" : "width 0.1s",
                    boxShadow: "0 0 12px rgba(0, 230, 118, 0.3)",
                  }} />
                </div>
                {/* Half-time marker */}
                <div style={{ position: "absolute", top: 16, left: `${(45 / maxMin) * 100}%`, width: 1, height: 20, background: "rgba(255, 255, 255, 0.1)" }} />
                {hasExtraTime && <div style={{ position: "absolute", top: 16, left: `${(90 / maxMin) * 100}%`, width: 1, height: 20, background: "rgba(255, 255, 255, 0.1)" }} />}
                {/* Thumb */}
                <div style={{
                  position: "absolute", top: 12, left: `calc(${sliderPct}% - 16px)`,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #00e676, #00c853)",
                  boxShadow: "0 0 20px rgba(0, 230, 118, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: isDragging ? "none" : "left 0.1s",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#060b14", fontFamily: "'Outfit', sans-serif" }}>{guessedMinute}'</span>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {showResult && lastScore && (
            <div style={resultBox(getScoreColor(lastScore.score))}>
              <div style={{ fontSize: 30, fontWeight: 900, color: getScoreColor(lastScore.score), fontFamily: "'Outfit', sans-serif" }}>
                {getScoreLabel(lastScore.score)}
              </div>
              {lastScore.timeOut ? (
                <div style={{ fontSize: 14, color: "#5a6577", marginTop: 10 }}>
                  Czas minął! Bramka padła w <b style={{ color: "#e8eaed" }}>{lastScore.actual}'</b>
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "#5a6577", marginTop: 10 }}>
                  Twój typ: <b style={{ color: "#e8eaed" }}>{lastScore.guess}'</b> · Faktycznie: <b style={{ color: "#e8eaed" }}>{lastScore.actual}'</b> · Różnica: <b style={{ color: getScoreColor(lastScore.score) }}>{Math.abs(lastScore.guess - lastScore.actual)} min</b>
                </div>
              )}
              <div style={{ fontSize: 36, fontWeight: 900, color: getScoreColor(lastScore.score), marginTop: 10, fontFamily: "'Outfit', sans-serif" }}>+{lastScore.score}</div>

              {/* Visual bar */}
              <div style={{ position: "relative", height: 28, background: "rgba(255, 255, 255, 0.04)", borderRadius: 6, marginTop: 18, overflow: "visible" }}>
                {!lastScore.timeOut && (
                  <div style={{
                    position: "absolute", top: -2, left: `calc(${((lastScore.guess - 1) / (maxMin - 1)) * 100}% - 8px)`,
                    width: 16, height: 32, borderRadius: 6,
                    background: "#4a5568",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                  }}>
                    <span style={{ fontSize: 7, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>TY</span>
                  </div>
                )}
                <div style={{
                  position: "absolute", top: -2, left: `calc(${((lastScore.actual - 1) / (maxMin - 1)) * 100}% - 8px)`,
                  width: 16, height: 32, borderRadius: 6,
                  background: getScoreColor(lastScore.score),
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                  boxShadow: `0 0 12px ${getScoreColor(lastScore.score)}44`,
                }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: "#060b14", fontFamily: "'Outfit', sans-serif" }}>{lastScore.actual}'</span>
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
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
            {matches.map((_, i) => (
              <div key={i} style={progressDot(
                i < currentMatchIdx,
                i === currentMatchIdx,
                showResult ? getScoreColor(lastScore?.score || 0) : "#ffab00"
              )} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
