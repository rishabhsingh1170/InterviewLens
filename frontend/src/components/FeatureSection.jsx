import { useEffect, useRef, useState } from "react";

const features = [
  {
    id: "01",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z" />
        <path d="M12 14c-7 0-9 3-9 5v1h18v-1c0-2-2-5-9-5z" />
        <circle
          cx="17"
          cy="8"
          r="3"
          fill="rgba(139,92,246,0.2)"
          stroke="#a78bfa"
        />
        <path d="M20.5 6.5l1-1M20.5 9.5l1 1M17 5V4M17 12v-1" />
      </svg>
    ),
    title: "AI Interview Coach",
    subtitle: "Real-time answer analysis",
    description:
      "Our AI listens to your responses and scores them instantly — clarity, confidence, structure, and relevance — just like a real interviewer would.",
    color: "#3B82F6",
    accent: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.2)",
    tag: "Core Feature",
  },
  {
    id: "02",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Performance Analytics",
    subtitle: "Track your growth over time",
    description:
      "Detailed dashboards show your improvement across sessions — weak spots, strong suits, and a roadmap to bridge the gap before the big day.",
    color: "#8B5CF6",
    accent: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.2)",
    tag: "Analytics",
  },
  {
    id: "03",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M7 8h10M7 11h6" />
      </svg>
    ),
    title: "Industry Question Bank",
    subtitle: "50+ categories, 1000+ questions",
    description:
      "From FAANG system design to behavioral rounds at startups — curated questions that mirror real interviews across every major industry.",
    color: "#6366f1",
    accent: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.2)",
    tag: "Library",
  },
  {
    id: "04",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8M8 13h5" />
      </svg>
    ),
    title: "Instant Feedback",
    subtitle: "Line-by-line response review",
    description:
      "Get specific, actionable suggestions on every answer — not vague tips. Know exactly what to say differently and why it matters.",
    color: "#a855f7",
    accent: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.2)",
    tag: "Feedback",
  },
  {
    id: "05",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Mock Interview Mode",
    subtitle: "Simulate the real thing",
    description:
      "Timed, pressure-tested mock interviews with randomized questions. Build muscle memory so you stay calm when it counts.",
    color: "#7c3aed",
    accent: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.2)",
    tag: "Practice",
  },
  {
    id: "06",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Confidence Scoring",
    subtitle: "Tone & delivery analysis",
    description:
      "Beyond words — we analyze pacing, filler words, and tone to help you sound as sharp as you think. Confidence is a skill, and we'll teach it.",
    color: "#4f46e5",
    accent: "rgba(79,70,229,0.12)",
    border: "rgba(79,70,229,0.2)",
    tag: "Advanced",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FeatureCard({ feature, index }) {
  const [ref, visible] = useInView(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      id="features"
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ${index * 0.08}s ease, transform 0.6s ${index * 0.08}s cubic-bezier(0.22,1,0.36,1)`,
        background: hovered ? feature.accent : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? feature.border : "rgba(139,92,246,0.1)"}`,
        borderRadius: "20px",
        padding: "28px",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered ? `0 8px 40px ${feature.accent}` : "none",
        transition: `opacity 0.6s ${index * 0.08}s ease, transform 0.6s ${index * 0.08}s cubic-bezier(0.22,1,0.36,1), background 0.3s, border-color 0.3s, box-shadow 0.3s`,
      }}
    >
      {/* Number watermark */}
      <span
        style={{
          position: "absolute",
          top: "12px",
          right: "20px",
          fontSize: "64px",
          fontWeight: 900,
          fontFamily: "'Sora', sans-serif",
          color: feature.color,
          opacity: 0.05,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {feature.id}
      </span>

      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: feature.accent,
            border: `1px solid ${feature.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: feature.color,
            flexShrink: 0,
            transition: "transform 0.3s",
            transform: hovered ? "scale(1.08) rotate(-3deg)" : "scale(1)",
          }}
        >
          {feature.icon}
        </div>

        {/* Tag */}
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: feature.color,
            background: feature.accent,
            border: `1px solid ${feature.border}`,
            borderRadius: "20px",
            padding: "3px 10px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {feature.tag}
        </span>
      </div>

      {/* Text */}
      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "17px",
          fontWeight: 700,
          color: "#e0e7ff",
          marginBottom: "4px",
          letterSpacing: "-0.02em",
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          color: feature.color,
          marginBottom: "12px",
          opacity: 0.8,
        }}
      >
        {feature.subtitle}
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          lineHeight: "1.7",
          color: "rgba(196,181,253,0.6)",
        }}
      >
        {feature.description}
      </p>

      {/* Bottom line accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, ${feature.color}, transparent)`,
          opacity: hovered ? 0.6 : 0,
          transition: "opacity 0.3s",
          borderRadius: "0 0 20px 20px",
        }}
      />
    </div>
  );
}

export default function FeaturesSection() {
  const [headerRef, headerVisible] = useInView(0.2);

  return (
    <section
      id="features"
      style={{
        background: "#07070f",
        padding: "100px 0 120px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "800px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Horizontal rule top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div
          ref={headerRef}
          style={{
            textAlign: "center",
            marginBottom: "72px",
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(24px)",
            transition:
              "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "40px",
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#a78bfa",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Everything You Need
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg,#e0e7ff,#c4b5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Built to get you
            </span>{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#3B82F6,#8B5CF6,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              hired.
            </span>
          </h2>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "17px",
              color: "rgba(196,181,253,0.55)",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            From your first mock interview to your final offer — InterviewLens
            gives you every tool to outperform, every time.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          style={{
            marginTop: "72px",
            padding: "32px 40px",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))",
            border: "1px solid rgba(139,92,246,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#e0e7ff",
                marginBottom: "6px",
              }}
            >
              Ready to start practicing?
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "rgba(196,181,253,0.5)",
              }}
            >
              Join thousands of candidates who landed their dream jobs.
            </p>
          </div>
          <a
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "12px",
              background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
              color: "#fff",
              fontFamily: "'Sora', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(139,92,246,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(139,92,246,0.35)";
            }}
          >
            Get Started Free
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
          </a>
        </div>
      </div>

      {/* Bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes pulse {
          0%,100% { opacity:0.5; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.3); }
        }
        @media (max-width: 640px) {
          #features { padding: 60px 0 80px; }
        }
      `}</style>
    </section>
  );
}
