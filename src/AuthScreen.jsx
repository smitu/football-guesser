import { useState } from "react";
import { useAuth } from "./AuthContext";
import { S, inputStyle } from "./shared";

const FONT_D = "'Bricolage Grotesque', sans-serif";
const FONT_B = "'Sora', sans-serif";

const tabStyle = (active) => ({
  flex: 1,
  padding: "10px 0",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: FONT_B,
  letterSpacing: 0.5,
  cursor: "pointer",
  background: active ? "rgba(74, 222, 128, 0.06)" : "transparent",
  border: "none",
  borderBottom: active ? "2px solid #4ade80" : "2px solid transparent",
  color: active ? "#4ade80" : "#4b5264",
  transition: "all 0.2s",
  textTransform: "uppercase",
});

const errorBox = {
  background: "rgba(248, 113, 113, 0.06)",
  border: "1px solid rgba(248, 113, 113, 0.12)",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 12,
  color: "#f87171",
  marginBottom: 14,
  textAlign: "center",
};

const successBox = {
  background: "rgba(74, 222, 128, 0.06)",
  border: "1px solid rgba(74, 222, 128, 0.12)",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 12,
  color: "#4ade80",
  marginBottom: 14,
  textAlign: "center",
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#4ade80",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: FONT_B,
  padding: 0,
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

export default function AuthScreen({ onSkip }) {
  const { signUp, signIn, signInWithMagicLink } = useAuth();
  const [tab, setTab] = useState("login"); // login | register | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(translateError(error.message));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Hasło musi mieć min. 6 znaków"); return; }
    if (!displayName.trim()) { setError("Podaj swoją nazwę gracza"); return; }
    setLoading(true);
    const { error } = await signUp(email, password, displayName.trim());
    setLoading(false);
    if (error) setError(translateError(error.message));
    else setSuccess("Konto utworzone! Sprawdź email, żeby potwierdzić rejestrację.");
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) setError(translateError(error.message));
    else setSuccess("Link logowania wysłany na " + email + ". Sprawdź skrzynkę!");
  };

  const translateError = (msg) => {
    if (msg.includes("Invalid login")) return "Nieprawidłowy email lub hasło";
    if (msg.includes("already registered")) return "Ten email jest już zarejestrowany";
    if (msg.includes("rate limit")) return "Za dużo prób — spróbuj za chwilę";
    if (msg.includes("invalid email")) return "Nieprawidłowy adres email";
    if (msg.includes("Password")) return "Hasło musi mieć min. 6 znaków";
    return msg;
  };

  return (
    <div style={S.app}>
      <div style={{ ...S.card, ...S.center, marginTop: 24 }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          marginBottom: 4,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: "rgba(74, 222, 128, 0.08)",
            border: "1px solid rgba(74, 222, 128, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>⚽</div>
        </div>

        <h1 style={{
          fontFamily: FONT_D, fontSize: 36, fontWeight: 800,
          letterSpacing: -2,
          background: "linear-gradient(135deg, #4ade80, #22c55e 40%, #fbbf24)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "4px 0 2px", lineHeight: 1,
        }}>goltido</h1>

        <p style={{ color: "#4b5264", fontSize: 13, marginTop: 8, marginBottom: 24 }}>
          {tab === "login" && "Zaloguj się, żeby zapisywać wyniki"}
          {tab === "register" && "Utwórz konto gracza"}
          {tab === "magic" && "Zaloguj się bez hasła"}
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <button style={tabStyle(tab === "login")} onClick={() => { setTab("login"); setError(null); setSuccess(null); }}>Logowanie</button>
          <button style={tabStyle(tab === "register")} onClick={() => { setTab("register"); setError(null); setSuccess(null); }}>Rejestracja</button>
          <button style={tabStyle(tab === "magic")} onClick={() => { setTab("magic"); setError(null); setSuccess(null); }}>Magic link</button>
        </div>

        {error && <div style={errorBox}>{error}</div>}
        {success && <div style={successBox}>{success}</div>}

        {/* Login form */}
        {tab === "login" && !success && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <input
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={inputStyle}
            />
            <input
              type="password" placeholder="Hasło" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={{ ...S.greenBtn, marginTop: 6, opacity: loading ? 0.6 : 1 }}>
              {loading ? "LOGOWANIE..." : "ZALOGUJ SIĘ"}
            </button>
          </form>
        )}

        {/* Register form */}
        {tab === "register" && !success && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <input
              type="text" placeholder="Nazwa gracza" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} required
              style={inputStyle}
            />
            <input
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={inputStyle}
            />
            <input
              type="password" placeholder="Hasło (min. 6 znaków)" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={{ ...S.greenBtn, marginTop: 6, opacity: loading ? 0.6 : 1 }}>
              {loading ? "TWORZENIE..." : "UTWÓRZ KONTO"}
            </button>
          </form>
        )}

        {/* Magic link form */}
        {tab === "magic" && !success && (
          <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <input
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={{ ...S.greenBtn, marginTop: 6, opacity: loading ? 0.6 : 1 }}>
              {loading ? "WYSYŁANIE..." : "WYŚLIJ LINK"}
            </button>
            <p style={{ fontSize: 11, color: "#4b5264", marginTop: 8, lineHeight: 1.5 }}>
              Wyślemy ci jednorazowy link logowania na email — bez hasła.
            </p>
          </form>
        )}

        {/* Skip / play without account */}
        {onSkip && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <button onClick={onSkip} style={linkBtn}>
              Graj bez konta →
            </button>
            <p style={{ fontSize: 10, color: "#3a3f4c", marginTop: 6 }}>
              Wyniki nie będą zapisywane w rankingu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
