// ─── GOLTIDO — SHARED UTILITIES & DESIGN SYSTEM ───

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getScoreColor(score) {
  if (score >= 85) return "#4ade80";
  if (score >= 65) return "#a3e635";
  if (score >= 40) return "#fbbf24";
  if (score >= 20) return "#fb923c";
  return "#f87171";
}

export const difficultyLabels = { easy: "ŁATWY", medium: "ŚREDNI", hard: "TRUDNY", hell: "PIEKŁO" };
export const difficultyColors = { easy: "#4ade80", medium: "#fbbf24", hard: "#fb923c", hell: "#f87171" };

// ─── DESIGN SYSTEM ───
const FONT_D = "'Bricolage Grotesque', sans-serif";
const FONT_B = "'Sora', sans-serif";

export const S = {
  app: {
    minHeight: "100vh",
    minHeight: "100dvh",
    background: "transparent",
    color: "#edf0f7",
    fontFamily: FONT_B,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px 40px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,
  },
  card: {
    background: "linear-gradient(170deg, rgba(18, 21, 30, 0.92), rgba(12, 14, 22, 0.97))",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: 22,
    padding: "32px 24px",
    width: "100%",
    maxWidth: 520,
    boxSizing: "border-box",
    backdropFilter: "blur(24px)",
    boxShadow: "0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 12px 48px rgba(0, 0, 0, 0.5)",
    animation: "fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
  },
  greenBtn: {
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#08090c",
    border: "none",
    borderRadius: 14,
    padding: "15px 28px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.6,
    width: "100%",
    textTransform: "uppercase",
    fontFamily: FONT_B,
    boxShadow: "0 4px 20px rgba(74, 222, 128, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)",
    transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  goldBtn: {
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: "#08090c",
    border: "none",
    borderRadius: 14,
    padding: "15px 28px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.6,
    width: "100%",
    textTransform: "uppercase",
    fontFamily: FONT_B,
    boxShadow: "0 4px 20px rgba(251, 191, 36, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3)",
  },
  ghostBtn: {
    background: "rgba(255, 255, 255, 0.03)",
    color: "#8892a4",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: "13px 22px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    fontFamily: FONT_B,
    letterSpacing: 0.4,
    transition: "all 0.2s",
  },
  dangerBtn: {
    background: "rgba(248, 113, 113, 0.06)",
    color: "#f87171",
    border: "1px solid rgba(248, 113, 113, 0.15)",
    borderRadius: 14,
    padding: "13px 22px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    fontFamily: FONT_B,
    letterSpacing: 0.4,
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    fontFamily: FONT_B,
    textTransform: "uppercase",
  },
  h1: {
    fontSize: 32,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.5,
    fontFamily: FONT_D,
  },
  h2: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    fontFamily: FONT_D,
    letterSpacing: -0.3,
  },
  sub: {
    color: "#8892a4",
    fontSize: 14,
    margin: "8px 0 0",
    lineHeight: 1.6,
  },
  center: { textAlign: "center" },
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(8, 9, 12, 0.88)",
    backdropFilter: "blur(16px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
    animation: "fadeIn 0.2s ease-out",
  },
};

// ─── MODE CARD STYLES (outline-style, not filled) ───
const modeBase = {
  background: "rgba(255, 255, 255, 0.02)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: 16,
  padding: "16px 20px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: 0.5,
  width: "100%",
  textTransform: "uppercase",
  fontFamily: FONT_B,
  color: "#edf0f7",
  transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
  boxShadow: "none",
};

export const modeButtons = {
  minute: { ...modeBase, borderColor: "rgba(74, 222, 128, 0.15)" },
  score: { ...modeBase, borderColor: "rgba(251, 191, 36, 0.15)" },
  scorer: { ...modeBase, borderColor: "rgba(248, 113, 113, 0.15)" },
  transfer: { ...modeBase, borderColor: "rgba(167, 139, 250, 0.15)" },
  learn: { ...modeBase, borderColor: "rgba(56, 189, 248, 0.15)" },
  stadium: { ...modeBase, borderColor: "rgba(45, 212, 191, 0.15)" },
};

// Accent colors per mode (for icon badges and active states)
export const modeAccents = {
  minute: "#4ade80",
  score: "#fbbf24",
  scorer: "#f87171",
  transfer: "#a78bfa",
  learn: "#38bdf8",
  stadium: "#2dd4bf",
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
        animation: "fadeInUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        border: "1px solid rgba(248, 113, 113, 0.12)",
      },
      onClick: (e) => e.stopPropagation()
    },
      createElement("div", {
        style: {
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(248, 113, 113, 0.06)",
          border: "1px solid rgba(248, 113, 113, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 24,
        }
      }, "🚪"),
      createElement("h2", {
        style: { ...S.h2, marginBottom: 8 }
      }, "Wyjść z gry?"),
      createElement("p", {
        style: { ...S.sub, marginBottom: 28, color: "#4b5264" }
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
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  color: "#8892a4",
  cursor: "pointer",
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 10,
  fontFamily: FONT_B,
  fontWeight: 500,
  transition: "all 0.15s",
};

export const timerBarContainer = {
  position: "absolute",
  top: 0, left: 0, right: 0,
  height: 3,
  borderRadius: "22px 22px 0 0",
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.03)",
};

export const matchInfoStyle = {
  fontSize: 11,
  color: "#4b5264",
  letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: 10,
  fontFamily: FONT_B,
  fontWeight: 600,
};

export const teamNameStyle = {
  fontSize: 18,
  fontWeight: 700,
  fontFamily: FONT_D,
};

export const scoreBoxStyle = {
  fontSize: 22,
  fontWeight: 800,
  color: "#fbbf24",
  padding: "6px 18px",
  background: "rgba(251, 191, 36, 0.06)",
  borderRadius: 12,
  border: "1px solid rgba(251, 191, 36, 0.12)",
  fontFamily: FONT_D,
  letterSpacing: 1,
};

export const progressDot = (isCompleted, isCurrent, color) => ({
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: isCompleted ? "#4ade80" : isCurrent ? color : "rgba(255, 255, 255, 0.06)",
  transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
  boxShadow: isCurrent ? `0 0 8px ${color}44` : "none",
});

export const resultBox = (color) => ({
  textAlign: "center",
  padding: "24px 20px",
  background: `${color}06`,
  borderRadius: 18,
  border: `1px solid ${color}18`,
  marginBottom: 20,
  animation: "fadeInUp 0.3s ease-out both",
});

export const inputStyle = {
  width: "100%",
  padding: "13px 18px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: 12,
  color: "#edf0f7",
  fontSize: 14,
  fontFamily: FONT_B,
  marginBottom: 12,
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s",
};

export const leaderboardRow = (i) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "13px 18px",
  background: i === 0 ? "rgba(251, 191, 36, 0.04)" : i < 3 ? "rgba(74, 222, 128, 0.03)" : "transparent",
  borderRadius: 12,
  marginBottom: 5,
  border: i === 0 ? "1px solid rgba(251, 191, 36, 0.1)" : "1px solid rgba(255, 255, 255, 0.03)",
  transition: "all 0.15s",
});

export const summaryMatchRow = {
  textAlign: "left",
  padding: "13px 16px",
  background: "rgba(255, 255, 255, 0.015)",
  borderRadius: 12,
  marginBottom: 6,
  border: "1px solid rgba(255, 255, 255, 0.03)",
};

export const getTimerColor = (timeLeft, maxTime) => {
  const pct = timeLeft / maxTime;
  if (pct <= 0.25) return "#f87171";
  if (pct <= 0.5) return "#fbbf24";
  return "#4ade80";
};
