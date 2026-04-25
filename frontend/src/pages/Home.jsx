import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import gigshieldLogo from "../assets/Gigshield Logo.png";

const features = [
  { title: "Shift Logging & Geolocation", desc: "Seamlessly log work sessions with GPS check-ins. Every shift is recorded so no hour goes unaccounted." },
  { title: "Emergency SOS Alerts", desc: "One tap sends instant alerts to unions, NGOs, or trusted contacts via push notification and SMS." },
  { title: "AI Risk Detection", desc: "Detects irregular earnings, anomaly patterns, and workplace risks before they escalate." },
  { title: "Anonymous Peer Forums", desc: "Share experiences of harassment, accidents, or safety concerns without fear — moderated and secure." },
  { title: "Payout Verification", desc: "Employer-uploaded records matched against your logs. Dispute underpayments with evidence." },
  { title: "Safety Heatmaps", desc: "Community-sourced reports visualized across cities, helping you identify and avoid high-risk zones." },
  { title: "Carbon Footprint Tracker", desc: "Monitor travel patterns and wellness insights — work smarter, live sustainably." },
  { title: "Offline Functionality", desc: "Core safety features work even in low-connectivity zones — because protection can't wait for Wi-Fi." },
  { title: "Union & NGO Integration", desc: "Direct pipelines to verified labour unions and NGOs so disputes get resolved, not just reported." },
];

const stats = [
  { value: "50M+", label: "Projected Gig Workers by 2026" },
  { value: "24/7", label: "Real-Time Safety Monitoring" },
  { value: "AI", label: "Predictive Risk Detection" },
  { value: "100%", label: "Anonymous Community Support" },
];

const steps = [
  { step: "01", title: "Log your shift", desc: "Check in with geolocation when you start work. Offline? No problem — it syncs automatically." },
  { step: "02", title: "Stay protected", desc: "AI monitors earnings anomalies and environmental risks in real time, alerting you proactively." },
  { step: "03", title: "Raise your voice", desc: "Post anonymously in community forums, report unsafe zones, or trigger an SOS with one tap." },
  { step: "04", title: "Get resolution", desc: "Unions and NGOs receive dispute reports with verified evidence — faster outcomes, fairer pay." },
];

const communityPosts = [
  { initials: "RK", name: "Ravi Kumar", role: "Delivery Partner · Mumbai", time: "2h ago", body: "Used the SOS feature for the first time last night — response from my union rep was under 3 minutes. Genuinely lifesaving.", likes: 84 },
  { initials: "SP", name: "Sunita Patel", role: "Domestic Worker · Delhi", time: "5h ago", body: "Finally disputed my unpaid wages using the payout verification tool. Got ₹3,400 back. Never thought I had any power until now.", likes: 127 },
  { initials: "MR", name: "Mohammed Rashid", role: "Driver · Pune", time: "1d ago", body: "The offline mode saved me during a remote delivery — no signal but the shift kept logging. Really thought through for us.", likes: 61 },
];

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroRef, heroIn] = useInView(0.05);
  const [featuresRef, featuresIn] = useInView(0.05);
  const [howRef, howIn] = useInView(0.05);
  const [communityRef, communityIn] = useInView(0.05);
  const [contactRef, contactIn] = useInView(0.05);
  const [ctaRef, ctaIn] = useInView(0.05);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  // ── Smart login button: go to /dashboard if already authenticated ──
  const isLoggedIn = !!localStorage.getItem("token");
  const handleAuthNav = () => navigate(isLoggedIn ? "/dashboard" : "/login");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleContact = () => {
    if (contactForm.name && contactForm.email && contactForm.message) {
      setSent(true);
    }
  };

  return (
    <div className="gs-root">
      {/* ── NAVBAR ── */}
      <nav className={`gs-nav ${scrolled ? "gs-nav--scrolled" : ""}`}>
        <div className="gs-nav-logo">
          <img
            src={gigshieldLogo}
            alt="GigShield"
            className="gs-nav-logo-img"
          />
        </div>
        <div className="gs-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#community">Community</a>
          <a href="#contact">Contact</a>
          <button className="gs-nav-cta" onClick={handleAuthNav}>
            {isLoggedIn ? "Go to Dashboard" : "Login / Register"}
          </button>
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

        <div className="gs-hero-center">
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
            <a href="#features" className="gs-btn-primary gs-btn-primary-link">
              <span>Explore Features</span>
              <span className="gs-btn-arrow">→</span>
            </a>
            <button
              className="gs-btn-ghost-btn"
              onClick={() =>
                document.getElementById("how").scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className={`gs-section gs-features ${featuresIn ? "gs-visible" : ""}`}
        ref={featuresRef}
      >
        <div className="gs-section-inner">
          <div className="gs-section-label">Platform Features</div>
          <h2 className="gs-section-title">
            Everything a gig worker needs —<br />
            <span className="gs-accent">in one shield.</span>
          </h2>
          <p className="gs-section-sub">
            Built ground-up for India's real working conditions — from bustling metros to low-connectivity zones.
          </p>
          <div className="gs-features-grid">
            {features.map((f, i) => (
              <div
                className="gs-feature-card"
                key={i}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="gs-feature-num">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="gs-feature-title">{f.title}</h3>
                <p className="gs-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how"
        className={`gs-section gs-how ${howIn ? "gs-visible" : ""}`}
        ref={howRef}
      >
        <div className="gs-section-inner gs-how-inner">
          <div className="gs-how-left">
            <div className="gs-section-label">How It Works</div>
            <h2 className="gs-section-title">
              Simple. Powerful.<br />
              <span className="gs-accent">Always On.</span>
            </h2>
            <p className="gs-section-sub" style={{ marginBottom: 0 }}>
              Four steps stand between a gig worker and a safer, fairer work life. GigShield makes each one effortless.
            </p>
          </div>
          <div className="gs-how-right">
            {steps.map((s, i) => (
              <div
                className="gs-step"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
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

      {/* ── COMMUNITY ── */}
      <section
        id="community"
        className={`gs-section gs-community ${communityIn ? "gs-visible" : ""}`}
        ref={communityRef}
      >
        <div className="gs-section-inner">
          <div className="gs-section-label">Community</div>
          <h2 className="gs-section-title">
            Workers speaking up.<br />
            <span className="gs-accent">Anonymously. Safely.</span>
          </h2>
          <p className="gs-section-sub">
            Thousands of gig workers share experiences, raise issues, and support each other every day on GigShield.
          </p>
          <div className="gs-community-grid">
            {communityPosts.map((p, i) => (
              <div
                className="gs-community-card"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="gs-community-header">
                  <div className="gs-community-avatar">{p.initials}</div>
                  <div className="gs-community-author">
                    <div className="gs-community-name">{p.name}</div>
                    <div className="gs-community-role">{p.role}</div>
                  </div>
                  <span className="gs-community-time">{p.time}</span>
                </div>
                <p className="gs-community-body">"{p.body}"</p>
                <div className="gs-community-footer">
                  <span className="gs-community-likes">
                    ♥ {p.likes} workers found this helpful
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
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
            <button
              className="gs-btn-outline"
              onClick={() =>
                document.getElementById("contact").scrollIntoView({ behavior: "smooth" })
              }
            >
              For Unions &amp; NGOs →
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        id="contact"
        className={`gs-section gs-contact ${contactIn ? "gs-visible" : ""}`}
        ref={contactRef}
      >
        <div className="gs-section-inner gs-contact-inner">
          <div className="gs-contact-left">
            <div className="gs-section-label">Contact</div>
            <h2 className="gs-section-title" style={{ fontSize: "clamp(26px,3.5vw,40px)" }}>
              We'd love to<br />
              <span className="gs-accent">hear from you.</span>
            </h2>
            <p className="gs-section-sub" style={{ marginBottom: 36 }}>
              Whether you're a worker, union, NGO, or researcher — GigShield is built to
              collaborate. Reach out any time.
            </p>
            <div className="gs-contact-details">
              <div className="gs-contact-detail">
                <span className="gs-contact-detail-icon">✉</span>
                <div>
                  <div className="gs-contact-detail-label">Email</div>
                  <a href="mailto:support@gigshield.in" className="gs-contact-detail-val">
                    support@gigshield.in
                  </a>
                </div>
              </div>
              <div className="gs-contact-detail">
                <span className="gs-contact-detail-icon">🤝</span>
                <div>
                  <div className="gs-contact-detail-label">Partnerships</div>
                  <a href="mailto:partners@gigshield.in" className="gs-contact-detail-val">
                    partners@gigshield.in
                  </a>
                </div>
              </div>
              <div className="gs-contact-detail">
                <span className="gs-contact-detail-icon">📍</span>
                <div>
                  <div className="gs-contact-detail-label">Based in</div>
                  <span className="gs-contact-detail-val">Bengaluru, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="gs-contact-right">
            {sent ? (
              <div className="gs-contact-success">
                <div className="gs-contact-success-icon">✓</div>
                <h3>Message received!</h3>
                <p>We'll get back to you within 24 hours. Thank you for reaching out.</p>
              </div>
            ) : (
              <div className="gs-contact-form">
                <div className="gs-contact-field">
                  <label className="gs-contact-label">Your name</label>
                  <input
                    type="text"
                    className="gs-contact-input"
                    placeholder="Arjun Sharma"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="gs-contact-field">
                  <label className="gs-contact-label">Email address</label>
                  <input
                    type="email"
                    className="gs-contact-input"
                    placeholder="arjun@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="gs-contact-field">
                  <label className="gs-contact-label">Message</label>
                  <textarea
                    className="gs-contact-input gs-contact-textarea"
                    placeholder="Tell us about your work, your union, or how we can help…"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                  />
                </div>
                <button className="gs-contact-submit" onClick={handleContact}>
                  Send Message <span>→</span>
                </button>
              </div>
            )}
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
            <a href="#contact">Contact</a>
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