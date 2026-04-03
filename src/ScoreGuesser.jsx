import { useState, useEffect, useCallback, useRef } from "react";
import { MATCHES } from "./data/matches";
import { shuffleArray, getScoreColor, difficultyLabels, difficultyColors, S, ExitConfirm } from "./shared";

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

const scoreInputStyle = {
  width: 64,
  height: 64,
  background: "#0a1610",
  border: "2px solid #1a3a24",
  borderRadius: 12,
  color: "#e8e8e3",
  fontSize: 28,
  fontWeight: 800,
  textAlign: "center",
  outline: "none",
  caretColor: "#1db954",
};

const scoreInputFocusStyle = {
  ...scoreInputStyle,
  borderColor: "#1db954",
  boxShadow: "0 0 12px rgba(29,185,84,0.3)",
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

  // Initialize game on mount
  useEffect(() => {
    const shuffled = shuffleArray(MATCHES).slice(0, MATCHES_PER_GAME);
    setMatches(shuffled);
  }, []);

  const currentMatch = matches[currentMatchIdx];
  const actualScore = currentMatch ? parseScore(currentMatch.score) : null;

  // Timer
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
  }, [screen, showResult, currentMatchIdx, gameOver, currentMatch]);

  // Focus home input on new match
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

      const entry = {
        match: currentMatch,
        guessHome: gh,
        guessAway: ga,
        actualHome: actualScore.home,
        actualAway: actualScore.away,
        ...result,
        timeOut,
      };

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
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 15 ? "#eab308" : "#22c55e";

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 40 }}>
          <h2 style={{ ...S.h2, ...S.center, marginBottom: 24 }}>🏆 RANKING — WYNIKI</h2>
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
    const perfectHits = matchResults.filter((mr) => mr.points === 100).length;
    const correctWinners = matchResults.filter((mr) => mr.tier !== "miss" && mr.tier !== "timeout").length;
    return (
      <div style={S.app}>
        <div style={{ ...S.card, ...S.center, marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={S.h2}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#8a9a8e", marginTop: 4 }}>TRYB: ZGADNIJ WYNIK</div>
          <div style={{ margin: "24px 0", padding: "20px", background: "rgba(29,185,84,0.08)", borderRadius: 12, border: "1px solid rgba(29,185,84,0.2)" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#1db954" }}>{totalScore}</div>
            <div style={{ color: "#8a9a8e", fontSize: 13, marginTop: 4 }}>PUNKTÓW</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>
            <div><div style={{ fontSize: 22, fontWeight: 700 }}>{matches.length}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>MECZY</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: "#f5c842" }}>{perfectHits}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>IDEALNE</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: "#84cc16" }}>{correctWinners}</div><div style={{ color: "#8a9a8e", fontSize: 11 }}>ZWYCIĘZCA</div></div>
          </div>

          {matchResults.map((mr, i) => (
            <div key={i} style={{ textAlign: "left", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 6, border: "1px solid #1a3a24" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{mr.match.home} vs {mr.match.away}</div>
                <div style={{ fontWeight: 800, color: getScoreColor(mr.points) }}>{mr.points} pkt</div>
              </div>
              <div style={{ fontSize: 11, color: "#8a9a8e" }}>
                {mr.timeOut ? "Czas minął" : `Twój typ: ${mr.guessHome}:${mr.guessAway}`} · Wynik: {mr.actualHome}:{mr.actualAway}
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

        <div style={{ width: "100%", maxWidth: 520, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => setShowExitConfirm(true)} style={{ background: "none", border: "none", color: "#8a9a8e", cursor: "pointer", fontSize: 13, padding: "4px 0" }}>← Wyjdź</button>
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

          {/* Match info — NO score shown */}
          <div style={{ ...S.center, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#8a9a8e", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>{currentMatch.competition} · {currentMatch.season}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 700, textAlign: "right", flex: 1 }}>{currentMatch.home}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#3a5a44", padding: "4px 14px" }}>vs</span>
              <span style={{ fontSize: 18, fontWeight: 700, textAlign: "left", flex: 1 }}>{currentMatch.away}</span>
            </div>
          </div>

          {/* Score input */}
          {!showResult && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...S.center, fontSize: 14, color: "#8a9a8e", marginBottom: 16 }}>Jaki był wynik tego meczu?</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }} onKeyDown={handleKeyDown}>
                <div style={{ ...S.center }}>
                  <div style={{ fontSize: 11, color: "#8a9a8e", marginBottom: 8, fontWeight: 600 }}>{currentMatch.home.split(" ").pop()}</div>
                  <input
                    ref={homeInputRef}
                    type="text"
                    inputMode="numeric"
                    value={guessHome}
                    onChange={(e) => handleScoreInput(e.target.value, setGuessHome, awayInputRef)}
                    onFocus={() => setFocusedInput("home")}
                    onBlur={() => setFocusedInput(null)}
                    style={focusedInput === "home" ? scoreInputFocusStyle : scoreInputStyle}
                    placeholder="?"
                  />
                </div>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#3a5a44", marginTop: 20 }}>:</span>
                <div style={{ ...S.center }}>
                  <div style={{ fontSize: 11, color: "#8a9a8e", marginBottom: 8, fontWeight: 600 }}>{currentMatch.away.split(" ").pop()}</div>
                  <input
                    ref={awayInputRef}
                    type="text"
                    inputMode="numeric"
                    value={guessAway}
                    onChange={(e) => handleScoreInput(e.target.value, setGuessAway, null)}
                    onFocus={() => setFocusedInput("away")}
                    onBlur={() => setFocusedInput(null)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) handleSubmit(false); }}
                    style={focusedInput === "away" ? scoreInputFocusStyle : scoreInputStyle}
                    placeholder="?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {showResult && lastResult && (
            <div style={{ ...S.center, padding: "20px", background: `${getScoreColor(lastResult.points)}11`, borderRadius: 12, border: `1px solid ${getScoreColor(lastResult.points)}33`, marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(lastResult.points) }}>{lastResult.label}</div>

              {/* Score comparison */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 16 }}>
                {!lastResult.timeOut && (
                  <div>
                    <div style={{ fontSize: 11, color: "#8a9a8e", marginBottom: 4 }}>TWÓJ TYP</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#8a9a8e" }}>{lastResult.guessHome}:{lastResult.guessAway}</div>
                  </div>
                )}
                {!lastResult.timeOut && <div style={{ fontSize: 20, color: "#3a5a44" }}>→</div>}
                <div>
                  <div style={{ fontSize: 11, color: "#8a9a8e", marginBottom: 4 }}>{lastResult.timeOut ? "WYNIK" : "FAKTYCZNIE"}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(lastResult.points) }}>{lastResult.actualHome}:{lastResult.actualAway}</div>
                </div>
              </div>

              {lastResult.timeOut && (
                <div style={{ fontSize: 13, color: "#8a9a8e", marginTop: 8 }}>Czas minął!</div>
              )}

              <div style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(lastResult.points), marginTop: 12 }}>+{lastResult.points}</div>

              {/* Scoring explanation */}
              <div style={{ fontSize: 11, color: "#5a7a64", marginTop: 8 }}>
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
              style={{ ...S.greenBtn, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "default" }}
              onClick={() => canSubmit && handleSubmit(false)}
            >
              {canSubmit ? `ZATWIERDŹ · ${guessHome}:${guessAway}` : "WPISZ WYNIK"}
            </button>
          ) : (
            <button style={S.greenBtn} onClick={nextMatch}>
              {currentMatchIdx + 1 < matches.length ? "NASTĘPNY MECZ →" : "ZOBACZ WYNIKI"}
            </button>
          )}

          {/* Match progress */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {matches.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < currentMatchIdx ? "#1db954" : i === currentMatchIdx ? (showResult ? getScoreColor(lastResult?.points || 0) : "#f5c842") : "#1a3a24", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
