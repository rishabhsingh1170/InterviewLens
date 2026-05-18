import React from "react";

const AboutSection = () => {
  return (
    <section id="about" style={{ background: "#07070f", padding: "80px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: 40, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", marginBottom: 12 }}>
          <span style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 700 }}>About</span>
        </div>

        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, color: "#e0e7ff", margin: "8px 0" }}>What is InterviewLens?</h2>
        <p style={{ color: "rgba(196,181,253,0.7)", maxWidth: 820, margin: "0 auto 28px" }}>
          InterviewLens helps job-seekers practice interviews with an AI-powered coach that listens, scores, and gives
          actionable feedback in real time. We combine realistic prompts, delivery analysis, and growth tracking so you
          can prepare confidently for any technical or behavioral interview.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginTop: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.06)", borderRadius: 12, padding: 18 }}>
            <h4 style={{ color: "#e0e7ff", margin: 0, fontFamily: "'Sora', sans-serif" }}>Mission</h4>
            <p style={{ color: "rgba(196,181,253,0.65)", marginTop: 8 }}>Make interview preparation efficient, measurable, and fair.</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.06)", borderRadius: 12, padding: 18 }}>
            <h4 style={{ color: "#e0e7ff", margin: 0, fontFamily: "'Sora', sans-serif" }}>How It Helps</h4>
            <p style={{ color: "rgba(196,181,253,0.65)", marginTop: 8 }}>Instant scoring, clear suggestions, and practice paths tailored to you.</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.06)", borderRadius: 12, padding: 18 }}>
            <h4 style={{ color: "#e0e7ff", margin: 0, fontFamily: "'Sora', sans-serif" }}>Who It's For</h4>
            <p style={{ color: "rgba(196,181,253,0.65)", marginTop: 8 }}>Students, career-changers, and experienced professionals aiming to sharpen interview skills.</p>
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500&display=swap');`}</style>
    </section>
  );
}

export default AboutSection
