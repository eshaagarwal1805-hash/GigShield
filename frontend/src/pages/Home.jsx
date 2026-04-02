import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const features = [
  { icon: "📍", title: "Shift Logging & Geolocation", desc: "Seamlessly log work sessions with GPS check-ins. Every shift is recorded so no hour goes unaccounted." },
  { icon: "🆘", title: "Emergency SOS Alerts", desc: "One tap sends instant alerts to unions, NGOs, or trusted contacts via push notification and SMS." },
  { icon: "🤖", title: "AI Risk Detection", desc: "Detects irregular earnings, anomaly patterns, and workplace risks before they escalate." },
  { icon: "💬", title: "Anonymous Peer Forums", desc: "Share experiences of harassment, accidents, or safety concerns without fear — moderated and secure." },
  { icon: "💰", title: "Payout Verification", desc: "Employer-uploaded records matched against your logs. Dispute underpayments with evidence." },
  { icon: "🗺️", title: "Safety Heatmaps", desc: "Community-sourced reports visualized across cities, helping you identify and avoid high-risk zones." },
  { icon: "🌱", title: "Carbon Footprint Tracker", desc: "Monitor travel patterns and wellness insights — work smarter, live sustainably." },
  { icon: "📶", title: "Offline Functionality", desc: "Core safety features work even in low-connectivity zones — because protection can't wait for Wi-Fi." },
];

const stats = [
  { value: "50M+", label: "Projected Gig Workers by 2026" },
  { value: "24/7", label: "Real-Time Safety Monitoring" },
  { value: "AI", label: "Predictive Risk Detection" },
  { value: "100%", label: "Anonymous Community Support" },
];

const problems = [
  { icon: "⚠️", text: "Payment disputes with no recourse" },
  { icon: "🚧", text: "Unsafe working conditions & accidents" },
  { icon: "😶", text: "Workplace harassment left unreported" },
  { icon: "🏥", text: "No social security or compensation" },
  { icon: "📵", text: "Zero real-time safety assistance" },
  { icon: "🔇", text: "Silenced workers with no community" },
];

const steps = [
  { step: "01", title: "Log your shift", desc: "Check in with geolocation when you start work. Offline? No problem — it syncs automatically." },
  { step: "02", title: "Stay protected", desc: "AI monitors earnings anomalies and environmental risks in real time, alerting you proactively." },
  { step: "03", title: "Raise your voice", desc: "Post anonymously in community forums, report unsafe zones, or trigger an SOS with one tap." },
  { step: "04", title: "Get resolution", desc: "Unions and NGOs receive dispute reports with verified evidence — faster outcomes, fairer pay." },
];

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroRef, heroIn] = useInView(0.05);
  const [problemRef, problemIn] = useInView(0.08);
  const [statsRef, statsIn] = useInView(0.1);
  const [featuresRef, featuresIn] = useInView(0.05);
  const [howRef, howIn] = useInView(0.08);
  const [ctaRef, ctaIn] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="gs-root">

      {/* ── NAVBAR ── */}
      <nav className={`gs-nav ${scrolled ? "gs-nav--scrolled" : ""}`}>
        <div className="gs-nav-logo">
          <div className="gs-nav-logo-icon">🛡</div>
          <span className="gs-logo-text">GigShield</span>
        </div>
        <div className="gs-nav-links">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Community</a>
          <a href="#">Contact</a>
          <button className="gs-nav-login" onClick={() => navigate("/login")}>Login</button>
          <button className="gs-nav-cta" onClick={() => navigate("/login")}>Join Now</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={`gs-hero ${heroIn ? "gs-visible" : ""}`} ref={heroRef}>
        <div className="gs-hero-bg">
          <div className="gs-hero-grid" />
          <div className="gs-orb gs-orb-1" />
          <div className="gs-orb gs-orb-2" />
          <div className="gs-orb gs-orb-3" />
        </div>

        <div className="gs-hero-content">
          <div className="gs-hero-badge">
            <span className="gs-badge-dot" />
            🇮🇳 Built for India's 50 Million Gig Workers
          </div>
          <h1 className="gs-hero-title">
            Safety. Transparency.<br />
            <span className="gs-accent">Community.</span>
          </h1>
          <p className="gs-hero-sub">
            GigShield is an AI-powered digital safety companion — delivering real-time
            monitoring, financial protection, and anonymous peer support to India's
            hardworking gig economy.
          </p>
          <div className="gs-hero-actions">
            <button className="gs-btn-primary" onClick={() => navigate("/login")}>
              <span>Join the Platform</span>
              <span className="gs-btn-arrow">→</span>
            </button>
            <a href="#how" className="gs-btn-ghost">See How It Works</a>
          </div>
          <div className="gs-hero-trust">
            <span>✓ Offline-ready</span>
            <span>✓ Anonymous &amp; Private</span>
            <span>✓ Union &amp; NGO Integrated</span>
          </div>
        </div>

        {/* Floating preview cards */}
        <div className="gs-hero-float-cards">
          <div className="gs-float-card gs-float-card--1">
            <div className="gs-float-card-icon">🛡</div>
            <div>
              <div className="gs-float-card-val">92</div>
              <div className="gs-float-card-lbl">Safety Score</div>
            </div>
          </div>
          <div className="gs-float-card gs-float-card--2">
            <div className="gs-float-card-icon">💰</div>
            <div>
              <div className="gs-float-card-val">₹850</div>
              <div className="gs-float-card-lbl">Today's Earnings</div>
            </div>
          </div>
          <div className="gs-float-card gs-float-card--3">
            <span className="gs-float-sos">SOS</span>
            <div className="gs-float-card-lbl">24/7 Response</div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className={`gs-section gs-problem ${problemIn ? "gs-visible" : ""}`} ref={problemRef}>
        <div className="gs-section-inner">
          <div className="gs-section-tag">The Challenge</div>
          <h2 className="gs-section-title">
            India's gig workers are growing fast —<br />
            <span className="gs-accent">their protections are not.</span>
          </h2>
          <p className="gs-section-sub">
            With nearly 50 million workers projected by 2026, the gig economy boom hides a crisis
            of exploitation, silence, and vulnerability. Existing platforms like eShram only
            register workers — they don't protect them.
          </p>
          <div className="gs-problem-grid">
            {problems.map((p, i) => (
              <div className="gs-problem-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="gs-problem-icon">{p.icon}</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={`gs-stats-band ${statsIn ? "gs-visible" : ""}`} ref={statsRef}>
        {stats.map((s, i) => (
          <div className="gs-stat" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="gs-stat-value">{s.value}</div>
            <div className="gs-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section className={`gs-section gs-features ${featuresIn ? "gs-visible" : ""}`} ref={featuresRef}>
        <div className="gs-section-inner">
          <div className="gs-section-tag">Platform Features</div>
          <h2 className="gs-section-title">
            Everything a gig worker needs —<br />
            <span className="gs-accent">in one shield.</span>
          </h2>
          <div className="gs-features-grid">
            {features.map((f, i) => (
              <div className="gs-feature-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="gs-feature-icon">{f.icon}</div>
                <h3 className="gs-feature-title">{f.title}</h3>
                <p className="gs-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className={`gs-section gs-how ${howIn ? "gs-visible" : ""}`} ref={howRef}>
        <div className="gs-section-inner">
          <div className="gs-section-tag">How It Works</div>
          <h2 className="gs-section-title">
            Simple. Powerful. <span className="gs-accent">Always On.</span>
          </h2>
          <div className="gs-steps">
            {steps.map((s, i) => (
              <div className="gs-step" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="gs-step-num">{s.step}</div>
                <div className="gs-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`gs-cta ${ctaIn ? "gs-visible" : ""}`} ref={ctaRef}>
        <div className="gs-cta-bg">
          <div className="gs-cta-orb gs-cta-orb--1" />
          <div className="gs-cta-orb gs-cta-orb--2" />
        </div>
        <div className="gs-cta-inner">
          <div className="gs-cta-tag">Join the Movement</div>
          <h2>
            Every gig worker deserves a<br />
            <span className="gs-accent">shield on their side.</span>
          </h2>
          <p>
            GigShield is free, private, and built for India's real working conditions.
            Whether you drive, deliver, or freelance — we've got your back.
          </p>
          <div className="gs-cta-actions">
            <button className="gs-btn-primary gs-btn-primary--light" onClick={() => navigate("/login")}>
              <span>Get Started Free</span>
              <span className="gs-btn-arrow">→</span>
            </button>
            <button className="gs-btn-outline">For Unions &amp; NGOs →</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="gs-footer">
        <div className="gs-footer-top">
          <div className="gs-footer-brand">
            <span className="gs-shield-icon">🛡</span>
            <span className="gs-logo-text">GigShield</span>
          </div>
          <div className="gs-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="gs-footer-divider" />
        <p className="gs-footer-copy">
          © 2026 GigShield · AI Safety Platform for India's Gig Workers · Privacy-First · Offline-Ready
        </p>
      </footer>
    </div>
  );
}