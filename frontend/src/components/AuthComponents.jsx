// ─────────────────────────────────────────────
//  Shared reusable components for Auth pages
//  Used by LoginPage.jsx and SignupPage.jsx
// ─────────────────────────────────────────────
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Particles } from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import logo from "../assets/interviewLens.png";

// ── 1. Particle background with tsParticles ───
export function ParticleBackground() {
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesOptions = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    particles: {
      color: { value: "#8B5CF6" },
      links: {
        color: "#6366F1",
        distance: 90,
        enable: true,
        opacity: 0.3,
        width: 0.5,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 0.5,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 60 },
      opacity: {
        value: { min: 0.08, max: 0.4 },
      },
      shape: { type: "circle" },
      size: {
        value: { min: 0.3, max: 1.2 },
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      init={particlesInit}
      options={particlesOptions}
      className="absolute inset-0 w-full h-full opacity-80 pointer-events-none"
    />
  );
}

// ── 2. Background decorations (orbs + grid) ────
export function AuthBackground() {
  return (
    <>
      <ParticleBackground />

      {/* Glow orbs */}
      <div
        className="absolute rounded-full pointer-events-none -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[60px]"
        style={{
          background:
            "radial-gradient(circle,rgba(59,130,246,0.1) 0%,rgba(139,92,246,0.08) 50%,transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none -bottom-16 right-[10%] w-[300px] h-[300px] blur-[60px]"
        style={{ background: "rgba(124,58,237,0.08)" }}
      />
      <div
        className="absolute rounded-full pointer-events-none top-[20%] left-[5%] w-[200px] h-[200px] blur-[50px]"
        style={{ background: "rgba(59,130,246,0.06)" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </>
  );
}

// ── 3. Auth Card wrapper ───────────────────────
export function AuthCard({ children }) {
  return (
    <div
      className="relative z-10 w-full max-w-[440px] rounded-3xl p-10 backdrop-blur-xl"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(139,92,246,0.15)",
        boxShadow:
          "0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.08)",
        animation: "cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-[20%] right-[20%] h-px rounded-sm"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)",
        }}
      />
      {children}
    </div>
  );
}

// ── 4. Logo ────────────────────────────────────
export function AuthLogo() {
  return (
    <div
      className="flex items-center justify-center gap-2.5 mb-8"
      style={{ animation: "fadeUp 0.5s 0.1s both" }}
    >
      <div
        className="p-[2px] rounded-[10px] flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}
      >
        <div className=" rounded-[8px] bg-[#07070f] flex items-center justify-center overflow-hidden">
          <img
            src={logo}
            alt="InterviewLens"
            className="w-80 h-20 object-contain"
          />
        </div>
      </div>
      {/* <span
        className="font-bold text-[17px] tracking-tight"
        style={{
          fontFamily: "'Sora', sans-serif",
          background: "linear-gradient(135deg,#60a5fa,#a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        InterviewLens
      </span> */}
    </div>
  );
}

// ── 5. Auth Heading ────────────────────────────
export function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-7" style={{ animation: "fadeUp 0.5s 0.15s both" }}>
      <h1
        className="font-extrabold text-[26px] tracking-tight leading-tight mb-2"
        style={{
          fontFamily: "'Sora', sans-serif",
          background: "linear-gradient(135deg,#e0e7ff,#c4b5fd)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {title}
      </h1>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(196,181,253,0.5)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}

// ── 6. Error Alert ─────────────────────────────
export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center gap-2 px-3.5 py-3 rounded-xl mb-5 text-sm"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#fca5a5",
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </div>
  );
}

// ── 7. Input Field ─────────────────────────────
export function InputField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  focused,
  error,
  icon,
  rightElement,
  extra,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "rgba(196,181,253,0.42)" }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
            style={{
              color: error
                ? "#ef4444"
                : focused
                  ? "#8B5CF6"
                  : "rgba(139,92,246,0.4)",
            }}
          >
            {icon}
          </div>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            padding: `11px ${rightElement ? "40px" : "14px"} 11px ${icon ? "42px" : "14px"}`,
            fontFamily: "'DM Sans', sans-serif",
            background: error
              ? "rgba(239,68,68,0.05)"
              : focused
                ? "rgba(139,92,246,0.07)"
                : "rgba(255,255,255,0.03)",
            border: `1px solid ${
              error
                ? "rgba(239,68,68,0.4)"
                : focused
                  ? "rgba(139,92,246,0.4)"
                  : "rgba(139,92,246,0.12)"
            }`,
            color: "#e0e7ff",
            boxShadow: error
              ? "0 0 0 3px rgba(239,68,68,0.07)"
              : focused
                ? "0 0 0 3px rgba(139,92,246,0.08)"
                : "none",
          }}
        />

        {/* Right element (eye toggle, etc.) */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Inline error */}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-[11px]" style={{ color: "#fca5a5" }}>
            {error}
          </span>
        </div>
      )}

      {/* Extra slot (password strength, match check, etc.) */}
      {extra}
    </div>
  );
}

// ── 8. Eye toggle button ───────────────────────
export function EyeToggle({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 transition-colors duration-200 cursor-pointer bg-transparent border-none"
      style={{ color: "rgba(139,92,246,0.45)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#8B5CF6")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "rgba(139,92,246,0.45)")
      }
    >
      {show ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

// ── 9. Submit Button ───────────────────────────
export function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full mt-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200"
      style={{
        fontFamily: "'Sora', sans-serif",
        background: loading
          ? "rgba(139,92,246,0.4)"
          : "linear-gradient(135deg,#3B82F6,#8B5CF6)",
        boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.35)",
        cursor: loading ? "not-allowed" : "pointer",
        animation: "fadeUp 0.5s 0.3s both",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(139,92,246,0.52)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = loading
          ? "none"
          : "0 4px 20px rgba(139,92,246,0.35)";
      }}
    >
      {loading ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: "spin 0.8s linear infinite" }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  );
}

// ── 10. Divider ────────────────────────────────
export function OrDivider({ text = "or continue with" }) {
  return (
    <div
      className="flex items-center gap-3 my-6"
      style={{ animation: "fadeUp 0.5s 0.35s both" }}
    >
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(139,92,246,0.12)" }}
      />
      <span
        className="text-xs font-medium"
        style={{ color: "rgba(196,181,253,0.3)" }}
      >
        {text}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(139,92,246,0.12)" }}
      />
    </div>
  );
}

// ── 11. Google Button ──────────────────────────
export function GoogleButton({ label = "Continue with Google", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(139,92,246,0.15)",
        color: "rgba(196,181,253,0.75)",
        animation: "fadeUp 0.5s 0.4s both",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(139,92,246,0.07)";
        e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
        e.currentTarget.style.color = "#e0e7ff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
        e.currentTarget.style.color = "rgba(196,181,253,0.75)";
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {label}
    </button>
  );
}

// ── 12. Auth Footer link ───────────────────────
export function AuthFooter({ text, linkText, to }) {
  return (
    <p
      className="text-center mt-6 text-[13px]"
      style={{
        color: "rgba(196,181,253,0.38)",
        animation: "fadeUp 0.5s 0.45s both",
      }}
    >
      {text}{" "}
      <Link
        to={to}
        className="font-semibold transition-colors duration-200"
        style={{ color: "#8B5CF6", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#8B5CF6")}
      >
        {linkText}
      </Link>
    </p>
  );
}

// ── 13. Global keyframes (inject once) ─────────
export function AuthStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
      @keyframes cardIn {
        from { opacity:0; transform:translateY(24px) scale(0.98); }
        to   { opacity:1; transform:translateY(0)    scale(1);    }
      }
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(12px); }
        to   { opacity:1; transform:translateY(0);    }
      }
      @keyframes spin {
        from { transform:rotate(0deg);   }
        to   { transform:rotate(360deg); }
      }
      input::placeholder { color: rgba(196,181,253,0.25); }
      input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 100px #0d0b1e inset !important;
        -webkit-text-fill-color: #e0e7ff !important;
      }
    `}</style>
  );
}
