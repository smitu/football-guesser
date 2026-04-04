// ─── SHARED UTILITIES & STYLES — STADIUM NIGHT THEME ───

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getScoreColor(score) {
  if (score >= 85) return "#00e676";
  if (score >= 65) return "#76ff03";
  if (score >= 40) return "#ffab00";
  if (score >= 20) return "#ff9100";
  return "#ff5252";
}

export const difficultyLabels = { easy: "ŁATWY", medium: "ŚREDNI", hard: "TRUDNY", hell: "PIEKŁO" };
export const difficultyColors = { easy: "#00e676", medium: "#ffab00", hard: "#ff9100", hell: "#ff5252" };

// ─── DESIGN SYSTEM ───
export const S = {
  app: {
    minHeight: "100vh",
    minHeight: "100dvh",
    background: "transparent",
    color: "#e8eaed",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,
  },
  card: {
    background: "linear-gradient(165deg, rgba(14, 22, 38, 0.95), rgba(8, 14, 28, 0.98))",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: "32px 24px",
    width: "100%",
    maxWidth: 520,
    boxSizing: "border-box",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
    animation: "fadeInUp 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
  },
  greenBtn: {
    background: "linear-gradient(135deg, #00e676, #00c853)",
    color: "#060b14",
    border: "none",
    borderRadius: 14,
    padding: "16px 32px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.8,
    width: "100%",
    textTransform: "uppercase",
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 4px 24px rgba(0, 230, 118, 0.25), 0 2px 8px rgba(0, 0, 0, 0.3)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  goldBtn: {
    background: "linear-gradient(135deg, #ffab00, #ff8f00)",
    color: "#060b14",
    border: "none",
    borderRadius: 14,
    padding: "16px 32px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.8,
    width: "100%",
    textTransform: "uppercase",
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 4px 24px rgba(255, 171, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  ghostBtn: {
    background: "rgba(255, 255, 255, 0.03)",
    color: "#7a8599",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: "14px 24px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: 0.5,
    transition: "all 0.2s",
  },
  dangerBtn: {
    background: "rgba(255, 82, 82, 0.08)",
    color: "#ff5252",
    border: "1px solid rgba(255, 82, 82, 0.2)",
    borderRadius: 14,
    padding: "14px 24px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: 0.5,
  },
  badge: {
    display: "inline-block",
    padding: "5px 14px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2,
    fontFamily: "'Outfit', sans-serif",
    textTransform: "uppercase",
  },
  h1: {
    fontSize: 32,
    fontWeight: 900,
    margin: 0,
    letterSpacing: -1,
    fontFamily: "'Outfit', sans-serif",
  },
  h2: {
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: -0.3,
  },
  sub: {
    color: "#7a8599",
    fontSize: 14,
    margin: "8px 0 0",
    lineHeight: 1.6,
  },
  center: { textAlign: "center" },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(4, 6, 14, 0.85)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
    animation: "fadeIn 0.2s ease-out",
  },
};

// ─── MODE BUTTON STYLES ───
export const modeButtons = {
  minute: {
    ...S.greenBtn,
    background: "linear-gradient(135deg, #00e676 0%, #00c853 100%)",
    boxShadow: "0 4px 24px rgba(0, 230, 118, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  score: {
    ...S.greenBtn,
    background: "linear-gradient(135deg, #ffab00 0%, #ff8f00 100%)",
    boxShadow: "0 4px 24px rgba(255, 171, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  scorer: {
    ...S.greenBtn,
    background: "linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)",
    color: "#fff",
    boxShadow: "0 4px 24px rgba(255, 82, 82, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  transfer: {
    ...S.greenBtn,
    background: "linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)",
    color: "#fff",
    boxShadow: "0 4px 24px rgba(179, 136, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  learn: {
    ...S.greenBtn,
    background: "linear-gradient(135deg, #40c4ff 0%, #0091ea 100%)",
    color: "#fff",
    boxShadow: "0 4px 24px rgba(64, 196, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)",
  },
};

// ─── EXIT CONFIRMATION COMPONENT ───
import { createElement } from "react";

export function ExitConfirm({ onConfirm, onCancel }) {
  return createElement("div", { style: S.overlay, onClick: onCancel },
    createElement("div", {
      style: {
        ...S.card,
        maxWidth: 380,
        textAlign: "center",
        animation: "fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) both",
        border: "1px solid rgba(255, 82, 82, 0.15)",
      },
      onClick: (e) => e.stopPropagation()
    },
      createElement("div", {
        style: {
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(255, 82, 82, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: 28,
        }
      }, "🚪"),
      createElement("h2", {
        style: { ...S.h2, marginBottom: 8 }
      }, "Wyjść z gry?"),
      createElement("p", {
        style: { ...S.sub, marginBottom: 28, color: "#5a6577" }
      }, "Twój postęp nie zostanie zapisany."),
      createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
        createElement("button", { style: S.dangerBtn, onClick: onConfirm }, "TAK, WYCHODZĘ"),
        createElement("button", { style: S.greenBtn, onClick: onCancel }, "GRAM DALEJ")
      )
    )
  );
}

// ─── COMMON UI HELPERS ───
export const topBar = {
  width: "100%",
  maxWidth: 520,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
  animation: "slideDown 0.3s ease-out both",
};

export const exitBtn = {
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  color: "#7a8599",
  cursor: "pointer",
  fontSize: 13,
  padding: "6px 14px",
  borderRadius: 10,
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  transition: "all 0.15s",
};

export const timerBarContainer = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 3,
  borderRadius: "20px 20px 0 0",
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.04)",
};

export const matchInfoStyle = {
  fontSize: 11,
  color: "#5a6577",
  letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: 10,
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 600,
};

export const teamNameStyle = {
  fontSize: 18,
  fontWeight: 700,
  fontFamily: "'Outfit', sans-serif",
};

export const scoreBoxStyle = {
  fontSize: 22,
  fontWeight: 900,
  color: "#ffab00",
  padding: "6px 18px",
  background: "rgba(255, 171, 0, 0.08)",
  borderRadius: 10,
  border: "1px solid rgba(255, 171, 0, 0.15)",
  fontFamily: "'Outfit', sans-serif",
  letterSpacing: 1,
};

export const progressDot = (isCompleted, isCurrent, color) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: isCompleted ? "#00e676" : isCurrent ? color : "rgba(255, 255, 255, 0.08)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: isCurrent ? `0 0 8px ${color}44` : "none",
});

export const resultBox = (color) => ({
  textAlign: "center",
  padding: "24px 20px",
  background: `${color}08`,
  borderRadius: 16,
  border: `1px solid ${color}22`,
  marginBottom: 20,
  animation: "fadeInUp 0.3s ease-out both",
});

export const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 12,
  color: "#e8eaed",
  fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
  marginBottom: 12,
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s",
};

export const leaderboardRow = (i) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 18px",
  background: i === 0 ? "rgba(255, 171, 0, 0.06)" : i < 3 ? "rgba(0, 230, 118, 0.04)" : "transparent",
  borderRadius: 12,
  marginBottom: 6,
  border: i === 0 ? "1px solid rgba(255, 171, 0, 0.12)" : "1px solid rgba(255, 255, 255, 0.04)",
  transition: "all 0.15s",
});

export const summaryMatchRow = {
  textAlign: "left",
  padding: "14px 16px",
  background: "rgba(255, 255, 255, 0.02)",
  borderRadius: 12,
  marginBottom: 8,
  border: "1px solid rgba(255, 255, 255, 0.04)",
};

export const getTimerColor = (timeLeft, maxTime) => {
  const pct = timeLeft / maxTime;
  if (pct <= 0.25) return "#ff5252";
  if (pct <= 0.5) return "#ffab00";
  return "#00e676";
};
