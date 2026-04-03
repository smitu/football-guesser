import { useState, useEffect, useCallback, useRef } from "react";
import { MATCHES } from "./data/matches";
import {
  shuffleArray, getScoreColor, difficultyLabels, difficultyColors,
  S, ExitConfirm,
  topBar, exitBtn, timerBarContainer, matchInfoStyle, teamNameStyle,
  progressDot, resultBox, inputStyle, leaderboardRow, summaryMatchRow, getTimerColor,
} from "./shared";

const TIMER_SECONDS = 30;
const MATCHES_PER_GAME = 10;

function parseScore(scoreStr) {
  const match = scoreStr.match(/^(\d+):(\d+)/);
  if (!match) return null;
  return { home: parseInt(match[1]), away: parseInt(match[2]) };
}

function calculateScorePoints(guessHome, guessAway, actualHome, actualAway) {
  if (guessHome === actualHome && guessAway === actualAway) return { points: 100, label: "IDEALNIE!", tier: "exact" };
  const guessWinner = guessHome > guessAway ? "home" : guessHome < guessAway ? "away" : "draw";
  const actualWinner = actualHome > actualAway ? "home" : actualHome < actualAway ? "away" : "draw";
  const guessDiff = guessHome - guessAway;
  const actualDiff = actualHome - actualAway;
  if (guessWinner === actualWinner && guessDiff === actualDiff) return { points: 75, label: "PRAWIE!", tier: "diff" };
  if (guessWinner === actualWinner && (guessHome === actualHome || guessAway === actualAway)) return { points: 50, label: "NIEŹLE!", tier: "partial" };
  if (guessWinner === actualWinner) return { points: 25, label: "KIERUNEK!", tier: "winner" };
  return { points: 0, label: "PUDŁO", tier: "miss" };
}

const scoreInputBase = {
  width: 68,
  height: 68,
  background: "rgba(255, 255, 255, 0.03)",
  border: "2px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 14,
  color: "#e8eaed",
  fontSize: 30,
  fontWeight: 900,
  textAlign: "center",
  outline: "none",
  caretColor: "#ffab00",
  fontFamily: "'Outfit', sans-serif",
  transition: "all 0.2s",
};

const scoreInputFocusStyle = {
  ...scoreInputBase,
  borderColor: "#ffab00",
  boxShadow: "0 0 20px rgba(255, 171, 0, 0.15)",
  background: "rgba(255, 171, 0, 0.04)",
};

export default function ScoreGuesser({ onBack }) {
  const [screen, setScreen] = useState("game");
  const [matches, setMatches] = useState([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [guessHome, setGuessHome] = useState("");
  const [guessAway, setGuessAway] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [totalScore, setTotalScore] = useState(0);
  const [matchResults, setMatchResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [leaderboard, setLeaderboard] = useState([
    { name: "Maciek K.", score: 680 },
    { name: "Kuba W.", score: 550 },
    { name: "Tomek R.", score: 475 },
    { name: "Ania M.", score: 400 },
    { name: "Piotr S.", score: 325 },
  ]);
  const timerRef = useRef(null);
  const homeInputRef = useRef(null);
  const awayInputRef = useRef(null);

  useEffect(() => {
    const shuffled = shuffleArray(MATCHES).slice(0, MATCHES_PER_GAME);
    setMatches(shuffled);
  }, []);

  const currentMatch = matches[currentMatchIdx];
  const actualScore = currentMatch ? parseScore(currentMatch.score) : null;

  useEffect(() => {
    if (screen !== "game" || showResult || gameOver || !currentMatch || showExitConfirm) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, showResult, currentMatchIdx, gameOver, currentMatch, showExitConfirm]);

  useEffect(() => {
    if (screen === "game" && !showResult && homeInputRef.current) {
      homeInputRef.current.focus();
    }
  }, [currentMatchIdx, screen, showResult]);

  const handleSubmit = useCallback(
    (timeOut = false) => {
      clearInterval(timerRef.current);
      if (!actualScore) return;
      const gh = timeOut ? -1 : parseInt(guessHome) || 0;
      const ga = timeOut ? -1 : parseInt(guessAway) || 0;
      const result = timeOut
        ? { points: 0, label: "CZAS!", tier: "timeout" }
        : calculateScorePoints(gh, ga, actualScore.home, actualScore.away);
      const entry = { match: currentMatch, guessHome: gh, guessAway: ga, actualHome: actualScore.home, actualAway: actualScore.away, ...result, timeOut };
      setLastResult(entry);
      setTotalScore((prev) => prev + result.points);
      setMatchResults((prev) => [...prev, entry]);
      setShowResult(true);
    },
    [currentMatch, actualScore, guessHome, guessAway]
  );

  const nextMatch = () => {
    setShowResult(false);
    setLastResult(null);
    setGuessHome("");
    setGuessAway("");
    if (currentMatchIdx + 1 < matches.length) {
      setCurrentMatchIdx((prev) => prev + 1);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setGameOver(true);
      setScreen("summary");
    }
  };

  const handleScoreInput = (value, setter, nextRef) => {
    const num = value.replace(/[^0-9]/g, "");
    if (num.length <= 2) {
      setter(num);
      if (num.length >= 1 && nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !showResult && guessHome !== "" && guessAway !== "") {
      handleSubmit(false);
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
    const shuffled = shuffleArray(MATCHES).slice(0, MATCHES_PER_GAME);
    setMatches(shuffled);
    setCurrentMatchIdx(0);
    setGuessHome("");
    setGuessAway("");
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

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 32 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>
            <span style={{ fontSize: 24, marginRight: 8 }}>🏆</span>RANKING — WYNIKI
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
    const perfectHits = matchResults.filter((mr) => mr.points === 100).length;
    const correctWinners = matchResults.filter((mr) => mr.tier !== "miss" && mr.tier !== "timeout").length;
    return (
      <div style={S.app}>
        <div style={{ ...S.card, ...S.center, marginTop: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h2 style={{ ...S.h2, fontSize: 26 }}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4, fontFamily: "'Outfit', sans-serif", letterSpacing: 2 }}>TRYB: ZGADNIJ WYNIK</div>

          <div style={{ margin: "28px 0", padding: "24px", background: "rgba(0, 230, 118, 0.05)", borderRadius: 16, border: "1px solid rgba(0, 230, 118, 0.1)" }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#00e676", fontFamily: "'Outfit', sans-serif" }}>{totalScore}</div>
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
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#76ff03", fontFamily: "'Outfit', sans-serif" }}>{correctWinners}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>ZWYCIĘZCA</div>
            </div>
          </div>

          {matchResults.map((mr, i) => (
            <div key={i} style={summaryMatchRow}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{mr.match.home} vs {mr.match.away}</div>
                <div style={{ fontWeight: 800, color: getScoreColor(mr.points), fontFamily: "'Outfit', sans-serif" }}>{mr.points} pkt</div>
              </div>
              <div style={{ fontSize: 11, color: "#5a6577", marginTop: 4 }}>
                {mr.timeOut ? "Czas minął" : `Twój typ: ${mr.guessHome}:${mr.guessAway}`} · Wynik: {mr.actualHome}:{mr.actualAway}
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
  if (screen === "game" && currentMatch && actualScore) {
    const matchNum = currentMatchIdx + 1;
    const canSubmit = guessHome !== "" && guessAway !== "";

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
          <div style={{ fontSize: 13, color: "#5a6577", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Mecz {matchNum}/{matches.length}</div>
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
            <span style={{ fontSize: 26, fontWeight: 900, color: timerColor, fontVariantNumeric: "tabular-nums", fontFamily: "'Outfit', sans-serif", animation: timeLeft <= 10 ? "timerUrgent 0.5s ease-in-out infinite" : "none" }}>{timeLeft}s</span>
          </div>

          {/* Match info — NO score shown */}
          <div style={{ ...S.center, marginBottom: 28 }}>
            <div style={matchInfoStyle}>{currentMatch.competition} · {currentMatch.season}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <span style={{ ...teamNameStyle, textAlign: "right", flex: 1 }}>{currentMatch.home}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#2a3444", padding: "4px 14px", fontFamily: "'Outfit', sans-serif" }}>vs</span>
              <span style={{ ...teamNameStyle, textAlign: "left", flex: 1 }}>{currentMatch.away}</span>
            </div>
          </div>

          {/* Score input */}
          {!showResult && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ ...S.center, fontSize: 14, color: "#5a6577", marginBottom: 18 }}>Jaki był wynik tego meczu?</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }} onKeyDown={handleKeyDown}>
                <div style={{ ...S.center }}>
                  <div style={{ fontSize: 11, color: "#5a6577", marginBottom: 10, fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: 1 }}>{currentMatch.home.split(" ").pop()}</div>
                  <input
                    ref={homeInputRef}
                    type="text"
                    inputMode="numeric"
                    value={guessHome}
                    onChange={(e) => handleScoreInput(e.target.value, setGuessHome, awayInputRef)}
                    onFocus={() => setFocusedInput("home")}
                    onBlur={() => setFocusedInput(null)}
                    style={focusedInput === "home" ? scoreInputFocusStyle : scoreInputBase}
                    placeholder="?"
                  />
                </div>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#2a3444", marginTop: 24, fontFamily: "'Outfit', sans-serif" }}>:</span>
                <div style={{ ...S.center }}>
                  <div style={{ fontSize: 11, color: "#5a6577", marginBottom: 10, fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: 1 }}>{currentMatch.away.split(" ").pop()}</div>
                  <input
                    ref={awayInputRef}
                    type="text"
                    inputMode="numeric"
                    value={guessAway}
                    onChange={(e) => handleScoreInput(e.target.value, setGuessAway, null)}
                    onFocus={() => setFocusedInput("away")}
                    onBlur={() => setFocusedInput(null)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) handleSubmit(false); }}
                    style={focusedInput === "away" ? scoreInputFocusStyle : scoreInputBase}
                    placeholder="?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {showResult && lastResult && (
            <div style={resultBox(getScoreColor(lastResult.points))}>
              <div style={{ fontSize: 30, fontWeight: 900, color: getScoreColor(lastResult.points), fontFamily: "'Outfit', sans-serif" }}>{lastResult.label}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 18 }}>
                {!lastResult.timeOut && (
                  <div>
                    <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 6, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>TWÓJ TYP</div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: "#5a6577", fontFamily: "'Outfit', sans-serif" }}>{lastResult.guessHome}:{lastResult.guessAway}</div>
                  </div>
                )}
                {!lastResult.timeOut && <div style={{ fontSize: 20, color: "#2a3444" }}>→</div>}
                <div>
                  <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 6, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>{lastResult.timeOut ? "WYNIK" : "FAKTYCZNIE"}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: getScoreColor(lastResult.points), fontFamily: "'Outfit', sans-serif" }}>{lastResult.actualHome}:{lastResult.actualAway}</div>
                </div>
              </div>
              {lastResult.timeOut && <div style={{ fontSize: 13, color: "#5a6577", marginTop: 8 }}>Czas minął!</div>}
              <div style={{ fontSize: 36, fontWeight: 900, color: getScoreColor(lastResult.points), marginTop: 14, fontFamily: "'Outfit', sans-serif" }}>+{lastResult.points}</div>
              <div style={{ fontSize: 11, color: "#4a5568", marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
                {lastResult.tier === "exact" && "Dokładny wynik!"}
                {lastResult.tier === "diff" && "Dobra różnica bramek!"}
                {lastResult.tier === "partial" && "Dobry zwycięzca + bramki jednej drużyny!"}
                {lastResult.tier === "winner" && "Dobry zwycięzca, ale wynik daleki"}
                {lastResult.tier === "miss" && "Zły zwycięzca meczu"}
                {lastResult.tier === "timeout" && "Nie zdążyłeś odpowiedzieć"}
              </div>
            </div>
          )}

          {/* Action button */}
          {!showResult ? (
            <button
              style={{ ...S.greenBtn, opacity: canSubmit ? 1 : 0.35, cursor: canSubmit ? "pointer" : "default" }}
              onClick={() => canSubmit && handleSubmit(false)}
            >
              {canSubmit ? `ZATWIERDŹ · ${guessHome}:${guessAway}` : "WPISZ WYNIK"}
            </button>
          ) : (
            <button style={S.greenBtn} onClick={nextMatch}>
              {currentMatchIdx + 1 < matches.length ? "NASTĘPNY MECZ →" : "ZOBACZ WYNIKI"}
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
            {matches.map((_, i) => (
              <div key={i} style={progressDot(
                i < currentMatchIdx,
                i === currentMatchIdx,
                showResult ? getScoreColor(lastResult?.points || 0) : "#ffab00"
              )} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
