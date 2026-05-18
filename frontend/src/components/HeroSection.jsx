import { Link } from "react-router-dom";
import { Particles } from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function HeroSection() {
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
        distance: 100,
        enable: true,
        opacity: 0.2,
        width: 0.5,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 0.6,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 120 },
      opacity: {
        value: { min: 0.1, max: 0.4 },
      },
      shape: { type: "circle" },
      size: {
        value: { min: 0.3, max: 1.5 },
      },
    },
    detectRetina: true,
  };

  const stats = [
    { value: "10k+", label: "Interviews Analyzed" },
    { value: "94%", label: "Success Rate" },
    { value: "50+", label: "Question Categories" },
  ];

  const badges = ["AI-Powered", "Real-time Feedback", "Industry Specific"];

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      style={{ background: "#07070f" }}
    >
      {/* Particle animation */}
      <Particles
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.7 }}
      />

      {/* Glow orbs */}
      <div
        className="absolute rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, #3B82F6 0%, #8B5CF6 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute rounded-full blur-[80px] opacity-15 pointer-events-none"
        style={{
          width: "300px",
          height: "300px",
          bottom: "10%",
          left: "10%",
          background: "#6366f1",
        }}
      />
      <div
        className="absolute rounded-full blur-[80px] opacity-10 pointer-events-none"
        style={{
          width: "250px",
          height: "250px",
          top: "20%",
          right: "8%",
          background: "#8B5CF6",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Badge pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
          style={{ animation: "fadeUp 0.6s 0.1s both" }}
        >
          {badges.map((b) => (
            <span
              key={b}
              className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                background: "rgba(139,92,246,0.08)",
                borderColor: "rgba(139,92,246,0.25)",
                color: "#c4b5fd",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {b}
            </span>
          ))}
        </div>

        {/* Heading */}
        <h1
          className="font-black leading-none tracking-tighter mb-6"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            animation: "fadeUp 0.7s 0.2s both",
          }}
        >
          <span
            style={{
              background:
                "linear-gradient(135deg, #e0e7ff 0%, #c4b5fd 40%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Crack Every
          </span>
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Interview
          </span>
          <span style={{ color: "#e0e7ff" }}> with</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Precision.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="text-lg leading-relaxed max-w-2xl mb-10"
          style={{
            color: "rgba(196,181,253,0.65)",
            fontFamily: "'DM Sans', sans-serif",
            animation: "fadeUp 0.7s 0.35s both",
          }}
        >
          InterviewLens uses AI to analyze your answers in real time — giving
          you instant feedback, personalized tips, and the confidence to walk
          into any interview ready to impress.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
          style={{ animation: "fadeUp 0.7s 0.45s both" }}
        >
          <Link
            to="/signup"
            className="relative flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-base overflow-hidden transition-all duration-200 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              boxShadow: "0 4px 24px rgba(139,92,246,0.4)",
              fontFamily: "'Sora', sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(139,92,246,0.6)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 24px rgba(139,92,246,0.4)")
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Practicing Free
          </Link>

          <a
            href="#how-to-use"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium text-base transition-all duration-200 hover:-translate-y-1 hover:bg-purple-500/10"
            style={{
              color: "rgba(196,181,253,0.8)",
              border: "1px solid rgba(139,92,246,0.25)",
              fontFamily: "'DM Sans', sans-serif",
              background: "rgba(139,92,246,0.05)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-px rounded-2xl overflow-hidden"
          style={{
            animation: "fadeUp 0.7s 0.55s both",
            border: "1px solid rgba(139,92,246,0.15)",
            background: "rgba(139,92,246,0.05)",
          }}
        >
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center px-10 py-5"
              style={{
                borderRight:
                  i < stats.length - 1
                    ? "1px solid rgba(139,92,246,0.12)"
                    : "none",
              }}
            >
              <span
                className="font-black text-3xl mb-1"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {value}
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: "rgba(196,181,253,0.5)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 flex flex-col items-center gap-2"
        style={{ animation: "fadeUp 0.7s 0.7s both" }}
      >
        <span
          className="text-xs"
          style={{
            color: "rgba(139,92,246,0.45)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          scroll to explore
        </span>
        <div
          className="w-[1px] h-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(139,92,246,0.5), transparent)",
            animation: "pulse 2s infinite",
          }}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
