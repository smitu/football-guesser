// ─── SHARED UTILITIES & STYLES ───

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getScoreColor(score) {
  if (score >= 85) return "#22c55e";
  if (score >= 65) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

export const difficultyLabels = { easy: "ŁATWY", medium: "ŚREDNI", hard: "TRUDNY", hell: "PIEKŁO" };
export const difficultyColors = { easy: "#22c55e", medium: "#eab308", hard: "#f97316", hell: "#ef4444" };

export const S = {
  app: { minHeight: "100vh", background: "#080f0b", color: "#e8e8e3", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", boxSizing: "border-box" },
  card: { background: "linear-gradient(145deg, #0f1f15, #0a1610)", border: "1px solid #1a3a24", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 520, boxSizing: "border-box" },
  greenBtn: { background: "linear-gradient(135deg, #1db954, #15803d)", color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, width: "100%", textTransform: "uppercase", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 4px 20px rgba(29,185,84,0.3)" },
  goldBtn: { background: "linear-gradient(135deg, #f5c842, #d4a520)", color: "#0a1610", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, width: "100%" },
  ghostBtn: { background: "transparent", color: "#8a9a8e", border: "1px solid #1a3a24", borderRadius: 10, padding: "12px 24px", fontSize: 14, cursor: "pointer", width: "100%" },
  dangerBtn: { background: "transparent", color: "#ef4444", border: "1px solid #3a1a1a", borderRadius: 10, padding: "12px 24px", fontSize: 14, cursor: "pointer", width: "100%" },
  badge: { display: "inline-block", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1.5 },
  h1: { fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: 700, margin: 0 },
  sub: { color: "#8a9a8e", fontSize: 14, margin: "8px 0 0" },
  center: { textAlign: "center" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
};

// ─── EXIT CONFIRMATION COMPONENT ───
import { createElement } from "react";

export function ExitConfirm({ onConfirm, onCancel }) {
  return createElement("div", { style: S.overlay, onClick: onCancel },
    createElement("div", {
      style: { ...S.card, maxWidth: 360, textAlign: "center" },
      onClick: (e) => e.stopPropagation()
    },
      createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "🚪"),
      createElement("h2", { style: { ...S.h2, marginBottom: 8 } }, "Wyjść z gry?"),
      createElement("p", { style: { ...S.sub, marginBottom: 24 } }, "Twój postęp nie zostanie zapisany."),
      createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
        createElement("button", { style: S.dangerBtn, onClick: onConfirm }, "TAK, WYCHODZĘ"),
        createElement("button", { style: S.greenBtn, onClick: onCancel }, "GRAM DALEJ")
      )
    )
  );
}
