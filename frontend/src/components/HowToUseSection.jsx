import { useEffect, useRef, useState } from "react";

const steps = [
  {
    id: 1,
    title: "Choose a Scenario",
    desc: "Select mock interview type, difficulty, and role to match your goal.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7h18" />
        <path d="M6 7v10a1 1 0 001 1h10a1 1 0 001-1V7" />
        <path d="M10 3h4v4h-4z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Start Interview",
    desc: "AI interviewer asks questions in real-time — answer out loud or type.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8M8 13h5" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Receive Instant Feedback",
    desc: "Get structured scoring and line-by-line suggestions right after each answer.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20v-6" />
        <path d="M9 10l3-3 3 3" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Review & Improve",
    desc: "Inspect analytics, re-run questions, and follow AI tips to level up.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 11h18" />
        <path d="M6 7v8" />
        <path d="M18 7v8" />
        <path d="M9 7v4" />
      </svg>
    ),
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

function StepCard({ step, index }) {
  const [ref, visible] = useInView(0.12);
  return (
    <div
      id="how-to-use"
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ${index * 0.08}s ease, transform 0.6s ${index * 0.08}s ease`,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(139,92,246,0.08)",
        borderRadius: 16,
        padding: "18px",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: "rgba(139,92,246,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a78bfa",
          flexShrink: 0,
        }}
      >
        {step.icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              color: "#e0e7ff",
            }}
          >
            {step.title}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "rgba(196,181,253,0.6)",
              marginLeft: "auto",
            }}
          >
            Step {step.id}
          </span>
        </div>
        <p
          style={{
            marginTop: 8,
            color: "rgba(196,181,253,0.6)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function HowToUseSection() {
  const [ref, visible] = useInView(0.12);

  return (
    <section
      id="how-to-use"
      ref={ref}
      style={{ background: "#07070f", padding: "80px 0", position: "relative" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 40,
              background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.14)",
              marginBottom: 12,
            }}
          >
            <span style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 700 }}>
              Workflow
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 28,
              color: "#e0e7ff",
              margin: 0,
            }}
          >
            Interview Flow
          </h2>
          <p
            style={{
              color: "rgba(196,181,253,0.65)",
              marginTop: 10,
              maxWidth: 760,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            A concise five-step loop that takes you from setup to measurable
            improvement — practice, get feedback, and iterate.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
            marginTop: 28,
          }}
        >
          {steps.map((s, i) => (
            <StepCard step={s} key={s.id} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500&display=swap');
      `}</style>
    </section>
  );
}
