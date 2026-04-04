import { useState, useEffect, useCallback, useRef } from "react";
import { STADIUMS } from "./data/stadiums";
import {
  shuffleArray, difficultyLabels, difficultyColors,
  S, ExitConfirm,
  topBar, exitBtn, timerBarContainer, progressDot, resultBox,
  inputStyle, leaderboardRow, summaryMatchRow, getTimerColor,
} from "./shared";

const ROUNDS_PER_GAME = 8;
const TIMER_HINTS = 45;
const TIMER_MAP = 30;
const OPTIONS_COUNT = 4;

// ─── Haversine distance in km ───
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapScore(distKm) {
  if (distKm <= 5) return 100;
  if (distKm <= 20) return 90;
  if (distKm <= 50) return 75;
  if (distKm <= 100) return 60;
  if (distKm <= 250) return 40;
  if (distKm <= 500) return 20;
  if (distKm <= 1000) return 10;
  return 0;
}

function mapScoreLabel(score) {
  if (score === 100) return "STRZAŁ W DZIESIĄTKĘ!";
  if (score >= 90) return "BARDZO BLISKO!";
  if (score >= 75) return "NIEDALEKO!";
  if (score >= 60) return "DOBRE MIEJSCE";
  if (score >= 40) return "ŚREDNIO";
  if (score >= 20) return "DALEKO";
  return "PUDŁO";
}

function generateOptions(correctName, all) {
  const opts = [correctName];
  const pool = shuffleArray(all.filter((s) => s.name !== correctName));
  for (let i = 0; i < OPTIONS_COUNT - 1 && i < pool.length; i++) {
    opts.push(pool[i].name);
  }
  return shuffleArray(opts);
}

// ─── Simple Interactive Map Component ───
function MapPicker({ onPick, picked, actual, showResult }) {
  const canvasRef = useRef(null);
  const [hovering, setHovering] = useState(null);

  // Simple equirectangular projection — Europe/South America focused
  const MAP_W = 480;
  const MAP_H = 320;
  const MIN_LAT = -45;
  const MAX_LAT = 65;
  const MIN_LNG = -80;
  const MAX_LNG = 60;

  const toXY = (lat, lng) => ({
    x: ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * MAP_W,
    y: ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * MAP_H,
  });

  const fromXY = (x, y) => ({
    lat: MAX_LAT - (y / MAP_H) * (MAX_LAT - MIN_LAT),
    lng: MIN_LNG + (x / MAP_W) * (MAX_LNG - MIN_LNG),
  });

  const handleClick = (e) => {
    if (showResult) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (MAP_W / rect.width);
    const y = (e.clientY - rect.top) * (MAP_H / rect.height);
    const coords = fromXY(x, y);
    onPick(coords);
  };

  const handleMove = (e) => {
    if (showResult) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (MAP_W / rect.width);
    const y = (e.clientY - rect.top) * (MAP_H / rect.height);
    setHovering(fromXY(x, y));
  };

  // Simplified continent outlines for visual reference
  const continentPaths = [
    // Europe rough outline
    "M 290,80 L 310,70 330,72 345,68 355,75 360,85 355,95 340,100 330,110 320,105 310,110 300,105 285,95 280,88 Z",
    // British Isles
    "M 268,75 L 275,70 280,72 278,80 272,82 Z",
    // Africa top
    "M 290,120 L 310,115 330,120 340,135 345,155 340,175 325,190 305,195 290,185 280,170 275,150 278,135 Z",
    // South America
    "M 120,165 L 135,155 150,160 160,175 165,195 160,215 150,235 140,250 125,255 115,240 110,220 105,200 108,180 Z",
    // Iberian Peninsula
    "M 270,95 L 280,92 285,98 282,108 272,110 268,105 Z",
    // Scandinavia
    "M 305,40 L 315,35 320,45 325,55 318,65 310,60 305,50 Z",
    // Italy boot
    "M 310,95 L 315,100 318,110 315,118 310,115 308,105 Z",
    // Turkey/Middle East
    "M 355,95 L 375,90 390,95 385,105 370,108 360,100 Z",
  ];

  const pinStyle = (x, y, color, label, glow = false) => ({
    position: "absolute",
    left: `${(x / MAP_W) * 100}%`,
    top: `${(y / MAP_H) * 100}%`,
    transform: "translate(-50%, -100%)",
    display: "flex", flexDirection: "column", alignItems: "center",
    pointerEvents: "none",
    zIndex: 10,
    animation: glow ? "fadeInUp 0.3s ease-out" : "none",
  });

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: MAP_W, margin: "0 auto", borderRadius: 14, overflow: "hidden" }}>
      <div
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setHovering(null)}
        style={{
          width: "100%",
          aspectRatio: `${MAP_W}/${MAP_H}`,
          background: "linear-gradient(180deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)",
          cursor: showResult ? "default" : "crosshair",
          position: "relative",
          borderRadius: 14,
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Grid lines */}
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Latitude lines */}
          {[0, 20, 40, 60].map((lat) => {
            const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * MAP_H;
            return <line key={`lat${lat}`} x1={0} y1={y} x2={MAP_W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />;
          })}
          {[-20, -40].map((lat) => {
            const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * MAP_H;
            return <line key={`lat${lat}`} x1={0} y1={y} x2={MAP_W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />;
          })}
          {/* Longitude lines */}
          {[-60, -40, -20, 0, 20, 40].map((lng) => {
            const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * MAP_W;
            return <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={MAP_H} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />;
          })}
          {/* Continent shapes */}
          {continentPaths.map((d, i) => (
            <path key={i} d={d} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
          ))}
          {/* Equator */}
          <line x1={0} y1={((MAX_LAT - 0) / (MAX_LAT - MIN_LAT)) * MAP_H} x2={MAP_W} y2={((MAX_LAT - 0) / (MAX_LAT - MIN_LAT)) * MAP_H} stroke="rgba(255,171,0,0.15)" strokeWidth="0.8" strokeDasharray="4,4" />
        </svg>

        {/* Hover coordinates */}
        {hovering && !showResult && (
          <div style={{
            position: "absolute", bottom: 6, right: 8,
            fontSize: 10, color: "#4a5568", fontFamily: "'Outfit', sans-serif",
            pointerEvents: "none",
          }}>
            {hovering.lat.toFixed(1)}°, {hovering.lng.toFixed(1)}°
          </div>
        )}

        {/* Picked pin */}
        {picked && (() => {
          const p = toXY(picked.lat, picked.lng);
          return (
            <div style={pinStyle(p.x, p.y, "#ffab00", "TY", true)}>
              <div style={{
                fontSize: 8, fontWeight: 800, color: "#060b14",
                background: "#ffab00", borderRadius: 6, padding: "2px 6px",
                fontFamily: "'Outfit', sans-serif", marginBottom: 2,
                boxShadow: "0 2px 8px rgba(255, 171, 0, 0.4)",
              }}>TY</div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffab00", boxShadow: "0 0 12px rgba(255, 171, 0, 0.6)" }} />
              <div style={{ width: 2, height: 8, background: "#ffab00" }} />
            </div>
          );
        })()}

        {/* Actual pin (shown after result) */}
        {showResult && actual && (() => {
          const a = toXY(actual.lat, actual.lng);
          return (
            <div style={pinStyle(a.x, a.y, "#00e676", "STADION", true)}>
              <div style={{
                fontSize: 8, fontWeight: 800, color: "#060b14",
                background: "#00e676", borderRadius: 6, padding: "2px 6px",
                fontFamily: "'Outfit', sans-serif", marginBottom: 2,
                boxShadow: "0 2px 8px rgba(0, 230, 118, 0.4)",
              }}>📍</div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00e676", boxShadow: "0 0 12px rgba(0, 230, 118, 0.6)" }} />
              <div style={{ width: 2, height: 8, background: "#00e676" }} />
            </div>
          );
        })()}

        {/* Line between picked and actual */}
        {showResult && picked && actual && (() => {
          const p = toXY(picked.lat, picked.lng);
          const a = toXY(actual.lat, actual.lng);
          return (
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <line x1={p.x} y1={p.y} x2={a.x} y2={a.y} stroke="#ff5252" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />
            </svg>
          );
        })()}
      </div>

      {/* Map labels */}
      <div style={{
        display: "flex", justifyContent: "space-between", padding: "6px 10px",
        fontSize: 9, color: "#3a4455", fontFamily: "'Outfit', sans-serif",
      }}>
        <span>Kliknij na mapie, aby zaznaczyć lokalizację stadionu</span>
        <span>Europa · Am. Płd. · Afryka</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════
export default function StadiumGuesser({ onBack }) {
  const [subMode, setSubMode] = useState(null); // null = pick, "hints" | "map"
  const [screen, setScreen] = useState("game");
  const [rounds, setRounds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_HINTS);
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

  // Hints mode state
  const [revealedHints, setRevealedHints] = useState(1);

  // Map mode state
  const [pickedLocation, setPickedLocation] = useState(null);

  const timerRef = useRef(null);

  const timerMax = subMode === "map" ? TIMER_MAP : TIMER_HINTS;

  const initGame = (mode) => {
    const shuffled = shuffleArray(STADIUMS).slice(0, ROUNDS_PER_GAME).map((s) => ({
      ...s,
      options: mode === "hints" ? generateOptions(s.name, STADIUMS) : [],
    }));
    setSubMode(mode);
    setRounds(shuffled);
    setCurrentIdx(0);
    setTimeLeft(mode === "map" ? TIMER_MAP : TIMER_HINTS);
    setTotalScore(0);
    setResults([]);
    setShowResult(false);
    setLastResult(null);
    setRevealedHints(1);
    setPickedLocation(null);
    setScreen("game");
  };

  const current = rounds[currentIdx];

  // Timer + hint reveal
  useEffect(() => {
    if (screen !== "game" || showResult || !current || showExitConfirm) return;

    // Progressive hint reveal (hints mode)
    let revealTimer;
    if (subMode === "hints" && current.hints) {
      setRevealedHints(1);
      revealTimer = setInterval(() => {
        setRevealedHints((prev) => {
          if (prev >= current.hints.length) { clearInterval(revealTimer); return prev; }
          return prev + 1;
        });
      }, Math.max(3000, (timerMax * 1000) / (current.hints.length + 1)));
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (revealTimer) clearInterval(revealTimer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      if (revealTimer) clearInterval(revealTimer);
    };
  }, [screen, showResult, currentIdx, current, showExitConfirm, subMode]);

  const handleTimeout = useCallback(() => {
    clearInterval(timerRef.current);
    if (!current) return;
    const entry = {
      stadium: current, points: 0, label: "CZAS!", isCorrect: false, timeOut: true,
      selected: null, distance: null,
    };
    setLastResult(entry);
    setResults((prev) => [...prev, entry]);
    setShowResult(true);
    if (subMode === "hints") setRevealedHints(current.hints.length);
  }, [current, subMode]);

  // ─── Hints mode: pick an option ───
  const handleHintsAnswer = useCallback((option) => {
    clearInterval(timerRef.current);
    if (!current) return;
    const correct = option === current.name;
    const hintBonus = correct ? Math.max(0, (current.hints.length - revealedHints) * 12) : 0;
    const points = correct ? 100 + hintBonus : 0;
    const label = correct ? (hintBonus > 0 ? "SZYBKI!" : "DOBRZE!") : "PUDŁO";
    const entry = {
      stadium: current, selected: option, points, label, isCorrect: correct,
      timeOut: false, distance: null,
    };
    setLastResult(entry);
    setTotalScore((prev) => prev + points);
    setResults((prev) => [...prev, entry]);
    setShowResult(true);
    setRevealedHints(current.hints.length);
  }, [current, revealedHints]);

  // ─── Map mode: confirm pick ───
  const handleMapConfirm = useCallback(() => {
    clearInterval(timerRef.current);
    if (!current || !pickedLocation) return;
    const dist = haversine(pickedLocation.lat, pickedLocation.lng, current.lat, current.lng);
    const points = mapScore(dist);
    const label = mapScoreLabel(points);
    const entry = {
      stadium: current, selected: null, points, label,
      isCorrect: points >= 75, timeOut: false, distance: Math.round(dist),
    };
    setLastResult(entry);
    setTotalScore((prev) => prev + points);
    setResults((prev) => [...prev, entry]);
    setShowResult(true);
  }, [current, pickedLocation]);

  const nextRound = () => {
    setShowResult(false);
    setLastResult(null);
    setPickedLocation(null);
    if (currentIdx + 1 < rounds.length) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(timerMax);
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

  const timerPct = (timeLeft / timerMax) * 100;
  const timerColor = getTimerColor(timeLeft, timerMax);
  const accentColor = "#40c4ff";

  // ─── SUB-MODE SELECTION ───
  if (!subMode) {
    return (
      <div style={S.app}>
        <div style={{ ...S.card, marginTop: 32, textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(64, 196, 255, 0.06)",
            border: "1px solid rgba(64, 196, 255, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 28,
          }}>🏟️</div>
          <h2 style={{ ...S.h2, fontSize: 24 }}>ZGADNIJ STADION</h2>
          <p style={{ ...S.sub, marginTop: 8, marginBottom: 32, color: "#5a6577" }}>
            Wybierz tryb odgadywania stadionów
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => initGame("hints")}
              style={{
                background: "rgba(64, 196, 255, 0.06)",
                border: "1px solid rgba(64, 196, 255, 0.15)",
                borderRadius: 16, padding: "20px", cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: 16,
                color: "#e8eaed", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(64, 196, 255, 0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(64, 196, 255, 0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(64, 196, 255, 0.1)", border: "1px solid rgba(64, 196, 255, 0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>💡</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#40c4ff" }}>PODPOWIEDZI</div>
                <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4, lineHeight: 1.4 }}>
                  Odkrywaj wskazówki jedna po drugiej i zgadnij, o który stadion chodzi
                </div>
              </div>
            </button>

            <button
              onClick={() => initGame("map")}
              style={{
                background: "rgba(0, 230, 118, 0.06)",
                border: "1px solid rgba(0, 230, 118, 0.15)",
                borderRadius: 16, padding: "20px", cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: 16,
                color: "#e8eaed", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0, 230, 118, 0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0, 230, 118, 0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(0, 230, 118, 0.1)", border: "1px solid rgba(0, 230, 118, 0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>🗺️</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#00e676" }}>MAPA</div>
                <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4, lineHeight: 1.4 }}>
                  Pokaż na mapie lokalizację stadionu — im bliżej, tym więcej punktów
                </div>
              </div>
            </button>
          </div>

          <button style={{ ...S.ghostBtn, marginTop: 20 }} onClick={onBack}>← WRÓĆ DO MENU</button>
        </div>
      </div>
    );
  }

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
    const correctCount = results.filter((r) => r.isCorrect).length;
    return (
      <div style={S.app}>
        <div style={{ ...S.card, textAlign: "center", marginTop: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏟️</div>
          <h2 style={{ ...S.h2, fontSize: 26 }}>KONIEC GRY!</h2>
          <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4, fontFamily: "'Outfit', sans-serif", letterSpacing: 2 }}>
            STADIONY · {subMode === "hints" ? "PODPOWIEDZI" : "MAPA"}
          </div>

          <div style={{ margin: "28px 0", padding: "24px", background: "rgba(0, 230, 118, 0.05)", borderRadius: 16, border: "1px solid rgba(0, 230, 118, 0.1)" }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#00e676", fontFamily: "'Outfit', sans-serif" }}>{totalScore}</div>
            <div style={{ color: "#5a6577", fontSize: 12, marginTop: 4, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>PUNKTÓW</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{rounds.length}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>RUND</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffab00", fontFamily: "'Outfit', sans-serif" }}>{correctCount}</div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: 2, fontFamily: "'Outfit', sans-serif" }}>TRAFIONE</div>
            </div>
          </div>

          {results.map((r, i) => (
            <div key={i} style={summaryMatchRow}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>🏟️ {r.stadium.name}</div>
                <div style={{ fontWeight: 800, color: r.isCorrect ? "#00e676" : "#ff5252", fontFamily: "'Outfit', sans-serif" }}>{r.points} pkt</div>
              </div>
              <div style={{ fontSize: 11, color: "#5a6577", marginTop: 4 }}>
                {r.stadium.club} · {r.distance !== null ? `${r.distance} km` : (r.timeOut ? "Czas minął" : (r.isCorrect ? "Trafione" : "Pudło"))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 28 }}>
            <input type="text" placeholder="Twoje imię / nick" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={inputStyle} />
            <button style={S.goldBtn} onClick={submitToLeaderboard}>ZAPISZ WYNIK</button>
          </div>
          <button style={{ ...S.ghostBtn, marginTop: 12 }} onClick={() => initGame(subMode)}>ZAGRAJ PONOWNIE</button>
          <button style={{ ...S.ghostBtn, marginTop: 8 }} onClick={() => setSubMode(null)}>ZMIEŃ TRYB</button>
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
          <div style={{ fontSize: 13, color: "#5a6577", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            {subMode === "hints" ? "🏟️" : "🗺️"} {roundNum}/{rounds.length}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#00e676", fontFamily: "'Outfit', sans-serif" }}>{totalScore} pkt</div>
        </div>

        <div style={{ ...S.card, position: "relative" }}>
          <div style={timerBarContainer}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}aa)`, transition: "width 1s linear, background 0.5s", boxShadow: `0 0 12px ${timerColor}44` }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 4 }}>
            <span style={{ ...S.badge, background: difficultyColors[current.difficulty] + "12", color: difficultyColors[current.difficulty], border: `1px solid ${difficultyColors[current.difficulty]}22` }}>
              {difficultyLabels[current.difficulty]}
            </span>
            <span style={{ fontSize: 26, fontWeight: 900, color: timerColor, fontVariantNumeric: "tabular-nums", fontFamily: "'Outfit', sans-serif", animation: timeLeft <= 10 ? "timerUrgent 0.5s ease-in-out infinite" : "none" }}>{timeLeft}s</span>
          </div>

          {/* ═══ HINTS MODE ═══ */}
          {subMode === "hints" && (
            <>
              <div style={{ textAlign: "center", fontSize: 10, color: "#4a5568", letterSpacing: 3, fontFamily: "'Outfit', sans-serif", fontWeight: 700, marginBottom: 16 }}>
                ODGADNIJ STADION
              </div>

              {/* Progressive hints */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {current.hints.map((hint, i) => {
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
                        fontSize: 9, fontWeight: 800, color: revealed ? "#40c4ff" : "#2a3444",
                        fontFamily: "'Outfit', sans-serif", letterSpacing: 1,
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
                      onClick={() => handleHintsAnswer(option)}
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "2px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: 14, padding: "16px 12px",
                        color: "#e8eaed", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                        textAlign: "center", fontFamily: "'DM Sans', sans-serif",
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
            </>
          )}

          {/* ═══ MAP MODE ═══ */}
          {subMode === "map" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: 3, fontFamily: "'Outfit', sans-serif", fontWeight: 700, marginBottom: 10 }}>
                  POKAŻ NA MAPIE
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#40c4ff", fontFamily: "'Outfit', sans-serif" }}>
                  {current.name}
                </div>
                <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4 }}>{current.club}</div>
              </div>

              <MapPicker
                onPick={setPickedLocation}
                picked={pickedLocation}
                actual={showResult ? current : null}
                showResult={showResult}
              />

              {!showResult && pickedLocation && (
                <button style={{ ...S.greenBtn, marginTop: 14 }} onClick={handleMapConfirm}>
                  ZATWIERDŹ LOKALIZACJĘ 📍
                </button>
              )}
            </>
          )}

          {/* Result */}
          {showResult && lastResult && (
            <div style={resultBox(lastResult.isCorrect ? "#00e676" : "#ff5252")}>
              <div style={{ fontSize: 28, fontWeight: 900, color: lastResult.isCorrect ? "#00e676" : "#ff5252", fontFamily: "'Outfit', sans-serif" }}>
                {lastResult.label}
              </div>

              {lastResult.timeOut ? (
                <div style={{ fontSize: 14, color: "#5a6577", marginTop: 10 }}>Czas minął!</div>
              ) : subMode === "hints" && !lastResult.isCorrect ? (
                <div style={{ fontSize: 14, color: "#5a6577", marginTop: 10 }}>
                  Twój typ: <b style={{ color: "#ff5252" }}>{lastResult.selected}</b>
                </div>
              ) : null}

              <div style={{ fontSize: 20, fontWeight: 700, color: "#e8eaed", marginTop: 12 }}>
                🏟️ <span style={{ color: "#40c4ff" }}>{current.name}</span>
              </div>
              <div style={{ fontSize: 12, color: "#5a6577", marginTop: 4 }}>{current.club}</div>

              {lastResult.distance !== null && (
                <div style={{ fontSize: 13, color: "#7a8599", marginTop: 8 }}>
                  Odległość: <b style={{ color: lastResult.isCorrect ? "#00e676" : "#ffab00" }}>{lastResult.distance} km</b>
                </div>
              )}

              <div style={{ fontSize: 36, fontWeight: 900, color: lastResult.isCorrect ? "#00e676" : "#ff5252", marginTop: 10, fontFamily: "'Outfit', sans-serif" }}>
                +{lastResult.points}
              </div>

              {lastResult.points > 100 && (
                <div style={{ fontSize: 11, color: "#40c4ff", marginTop: 4, fontFamily: "'Outfit', sans-serif" }}>
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
