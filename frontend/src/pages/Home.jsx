import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import gigshieldLogo from "../assets/Gigshield Logo.png";
import api from "../api/axios";

import geoImg      from "../assets/geolocation.jpg";
import sosImg      from "../assets/emergencysos.jpg";
import aiImg       from "../assets/airiskdetection.jpg";
import peerImg     from "../assets/anonymouspeer.png";
import payImg      from "../assets/payverifcation.jpg";
import heatImg     from "../assets/safetyheatmap.jpg";
import carbonImg   from "../assets/carbonfootprint.avif";
import offlineImg  from "../assets/offlineapp.png";
import unionImg    from "../assets/unionngo.jpg";
import step1Img from "../assets/shiftlog.webp";
import step2Img from "../assets/stayprotected.avif";
import step3Img from "../assets/raisevoice.jpg";
import step4Img from "../assets/getresolution.avif";
import gigworkersImg from "../assets/Gigworkershield.jpg";

const features = [
  { title: "Shift Logging & Geolocation",  desc: "Seamlessly log work sessions with GPS check-ins. Every shift is recorded so no hour goes unaccounted.", img: geoImg },
  { title: "Emergency SOS Alerts",          desc: "One tap sends instant alerts to unions, NGOs, or trusted contacts via push notification and SMS.",      img: sosImg },
  { title: "AI Risk Detection",             desc: "Detects irregular earnings, anomaly patterns, and workplace risks before they escalate.",               img: aiImg },
  { title: "Anonymous Peer Forums",         desc: "Share experiences of harassment, accidents, or safety concerns without fear — moderated and secure.",    img: peerImg },
  { title: "Payout Verification",           desc: "Employer-uploaded records matched against your logs. Dispute underpayments with evidence.",              img: payImg },
  { title: "Safety Heatmaps",              desc: "Community-sourced reports visualized across cities, helping you identify and avoid high-risk zones.",    img: heatImg },
  { title: "Carbon Footprint Tracker",      desc: "Monitor travel patterns and wellness insights — work smarter, live sustainably.",                        img: carbonImg },
  { title: "Offline Functionality",         desc: "Core safety features work even in low-connectivity zones — because protection can't wait for Wi-Fi.",   img: offlineImg },
  { title: "Union & NGO Integration",       desc: "Direct pipelines to verified labour unions and NGOs so disputes get resolved, not just reported.",       img: unionImg },
];

const CARDS_PER_PAGE = 4;
const TOTAL_PAGES = Math.ceil(features.length / CARDS_PER_PAGE);

const howSteps = [
  {
    step: "01",
    title: "Log your shift",
    desc: "Check in with geolocation when you start work. Offline? No problem — it syncs automatically once you're back online.",
    img: step1Img,
  },
  {
    step: "02",
    title: "Stay protected",
    desc: "AI monitors earnings anomalies and environmental risks in real time, alerting you proactively before things escalate.",
    img: step2Img,
  },
  {
    step: "03",
    title: "Raise your voice",
    desc: "Post anonymously in community forums, report unsafe zones, or trigger an SOS with one tap — safely and securely.",
    img: step3Img,
  },
  {
    step: "04",
    title: "Get resolution",
    desc: "Unions and NGOs receive dispute reports with verified evidence — faster outcomes, fairer pay, real accountability.",
    img: step4Img,
  },
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
  const [scrolled, setScrolled]   = useState(false);
  const [heroRef,      heroIn]      = useInView(0.05);
  const [featuresRef,  featuresIn]  = useInView(0.05);
  const [howRef,       howIn]       = useInView(0.05);
  const [communityRef, communityIn] = useInView(0.05);
  const [contactRef,   contactIn]   = useInView(0.05);
  const [ctaRef,       ctaIn]       = useInView(0.05);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "", type: "Worker" });  
  const [sent, setSent] = useState(false);
  const [showUnionModal, setShowUnionModal] = useState(false);

  // Carousel state
  const [carouselPage, setCarouselPage] = useState(0);
  const [carouselAnimating, setCarouselAnimating] = useState(false);
  const [carouselDirection, setCarouselDirection] = useState("next"); // "next" | "prev"

  // Community state
  const [communityPosts,    setCommunityPosts]   = useState([]);
  const [communityPage,     setCommunityPage]     = useState(1);
  const [communityTotal,    setCommunityTotal]    = useState(0);
  const [communityLoading,  setCommunityLoading]  = useState(false);
  const [postForm,          setPostForm]          = useState({ body: "", tag: "General", isAnonymous: false });
  const [postError,         setPostError]         = useState("");
  const [postSuccess,       setPostSuccess]       = useState("");
  const [postOpen,          setPostOpen]          = useState(false);

  const isLoggedIn    = !!localStorage.getItem("token");
  const handleAuthNav = () => navigate(isLoggedIn ? "/dashboard" : "/login");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleContact = async () => {
  if (!contactForm.name || !contactForm.email || !contactForm.message) return;
  try {
    await api.post("/contact", {
      name:    contactForm.name,
      email:   contactForm.email,
      message: contactForm.message,
    });
    setSent(true);
    setContactForm({ name: "", email: "", message: "" });
  } catch (err) {
    console.error("Contact form error:", err);
  }
};

// ── Fetch posts from DB ──
const fetchCommunityPosts = async (page = 1, replace = false) => {
  setCommunityLoading(true);
  try {
    const { data } = await api.get(`/community?page=${page}&limit=6`);
    setCommunityPosts(prev => replace ? data.posts : [...prev, ...data.posts]);
    setCommunityTotal(data.total);
    setCommunityPage(page);
  } catch (err) {
    console.error("Failed to load posts:", err);
  } finally {
    setCommunityLoading(false);
  }
};

// ── Load more button ──
const handleLoadMore = () => {
  if (!communityLoading && communityPosts.length < communityTotal) {
    fetchCommunityPosts(communityPage + 1);
  }
};

// ── Submit new post (logged-in only) ──
const handlePostSubmit = async () => {
  if (!postForm.body.trim()) {
    setPostError("Please write something before sharing.");
    return;
  }
  setPostError("");
  try {
    await api.post("/community", postForm);
    setPostForm({ body: "", tag: "General", isAnonymous: false });
    setPostOpen(false);
    setPostSuccess("Your experience has been shared!");
    fetchCommunityPosts(1, true); // refresh list
    setTimeout(() => setPostSuccess(""), 4000);
  } catch (err) {
    setPostError(err?.response?.data?.message || "Failed to post. Try again.");
  }
};

// ── Fetch on mount ──
useEffect(() => {
  fetchCommunityPosts(1, true);
}, []);

  const goToPage = (targetPage, direction) => {
    if (carouselAnimating || targetPage === carouselPage) return;
    setCarouselDirection(direction);
    setCarouselAnimating(true);
    setTimeout(() => {
      setCarouselPage(targetPage);
      setCarouselAnimating(false);
    }, 320);
  };

  const handlePrev = () => {
    if (carouselPage > 0) goToPage(carouselPage - 1, "prev");
  };

  const handleNext = () => {
    if (carouselPage < TOTAL_PAGES - 1) goToPage(carouselPage + 1, "next");
  };

  const visibleFeatures = features.slice(
    carouselPage * CARDS_PER_PAGE,
    carouselPage * CARDS_PER_PAGE + CARDS_PER_PAGE
  );
  return (
    <div className="gs-root">

      {/* ── NAVBAR ── */}
      <nav className={`gs-nav ${scrolled ? "gs-nav--scrolled" : ""}`}>
        <div className="gs-nav-logo">
          <img src={gigshieldLogo} alt="GigShield" className="gs-nav-logo-img" />
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
              onClick={() => document.getElementById("how").scrollIntoView({ behavior: "smooth" })}
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES CAROUSEL ── */}
      <section
        id="features"
        className={`gs-section gs-features ${featuresIn ? "gs-visible" : ""}`}
        ref={featuresRef}
      >
        <div className="gs-section-inner">
          <h2 className="gs-section-title">
            Everything a gig worker needs —<br />
            <span className="gs-accent">in one shield.</span>
          </h2>
          <p className="gs-section-sub">
            Built ground-up for India's real working conditions — from bustling metros to low-connectivity zones.
          </p>

          {/* Carousel wrapper */}
          <div className="gs-carousel">
            {/* Cards track */}
            <div
              className={`gs-carousel-track ${
                carouselAnimating
                  ? carouselDirection === "next"
                    ? "gs-carousel-track--exit-left"
                    : "gs-carousel-track--exit-right"
                  : "gs-carousel-track--enter"
              }`}
            >
              {visibleFeatures.map((f, i) => (
                <div
                  className="gs-feature-card"
                  key={`${carouselPage}-${i}`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div
                    className="gs-feature-card-bg"
                    style={{ backgroundImage: `url(${f.img})` }}
                  />
                  <div className="gs-feature-card-overlay" />
                  <div className="gs-feature-card-content">
                    <div className="gs-feature-num">
                      {String(carouselPage * CARDS_PER_PAGE + i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="gs-feature-title">{f.title}</h3>
                    <p className="gs-feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls row */}
            <div className="gs-carousel-controls">
              <button
                className="gs-carousel-arrow gs-carousel-arrow--prev"
                onClick={handlePrev}
                disabled={carouselPage === 0}
                aria-label="Previous features"
              >
                ←
              </button>

              {/* Dots */}
              <div className="gs-carousel-dots">
                {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                  <button
                    key={i}
                    className={`gs-carousel-dot ${i === carouselPage ? "gs-carousel-dot--active" : ""}`}
                    onClick={() => goToPage(i, i > carouselPage ? "next" : "prev")}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>

              {/* Page counter */}
              <span className="gs-carousel-counter">
                {carouselPage + 1} / {TOTAL_PAGES}
              </span>

              <button
                className="gs-carousel-arrow gs-carousel-arrow--next"
                onClick={handleNext}
                disabled={carouselPage === TOTAL_PAGES - 1}
                aria-label="Next features"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how"
        className={`gs-section gs-how ${howIn ? "gs-visible" : ""}`}
        ref={howRef}
      >
        <div className="gs-section-inner">
          <div className="gs-how-header">
            <h2 className="gs-section-title">
              Simple. Powerful.<br />
              <span className="gs-accent">Always On.</span>
            </h2>
            <p className="gs-section-sub">
              Four steps stand between a gig worker and a safer, fairer work life. GigShield makes each one effortless.
            </p>
          </div>

          <div className="gs-how-rows">
            {howSteps.map((s, i) => (
              <div
                className={`gs-how-row ${i % 2 !== 0 ? "gs-how-row--reverse" : ""}`}
                key={i}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {/* IMAGE SIDE */}
                <div className="gs-how-img-side">
                  {s.img && s.img.startsWith && s.img.startsWith("PLACEHOLDER") ? (
                    <div className={`gs-how-placeholder gs-how-placeholder--${i + 1}`}>
                      <span className="gs-how-placeholder-icon">{s.icon}</span>
                    </div>
                  ) : (
                    <img src={s.img} alt={s.title} className="gs-how-img" />
                  )}
                  <div className="gs-how-img-overlay" />
                </div>

                {/* TEXT SIDE */}
                <div className="gs-how-text-side">
                  <div className="gs-how-step-label">STEP {s.step}</div>
                  <h3 className="gs-how-step-title">{s.title}</h3>
                  <p className="gs-how-step-desc">{s.desc}</p>
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

    {/* Section header */}
    <div className="gs-community-header-row">
      <div>
        <h2 className="gs-section-title">
          Workers speaking up.<br />
          <span className="gs-accent">Anonymously. Safely.</span>
        </h2>
        <p className="gs-section-sub">
          Thousands of gig workers share experiences, raise issues, and support each other every day on GigShield.
        </p>
      </div>
    </div>

    {/* ── Post box — logged in users only ── */}
    {isLoggedIn ? (
      <div style={{ marginBottom: 28 }}>
        {postSuccess && (
          <p style={{ color: "#2a6c2c", fontSize: 13, marginBottom: 10 }}>✓ {postSuccess}</p>
        )}
        {!postOpen ? (
          <button className="gs-community-load-more" onClick={() => setPostOpen(true)}>
            + Share your experience
          </button>
        ) : (
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e0e7e5" }}>
            <textarea
              rows={3}
              placeholder="Share your experience anonymously or with your name…"
              value={postForm.body}
              onChange={e => setPostForm(f => ({ ...f, body: e.target.value }))}
              style={{ width: "100%", borderRadius: 8, border: "1.5px solid #e0e7e5", padding: "10px 12px", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={postForm.tag}
                onChange={e => setPostForm(f => ({ ...f, tag: e.target.value }))}
                style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e0e7e5", fontSize: 12, outline: "none" }}
              >
                <option>General</option>
                <option>Safety</option>
                <option>Wages</option>
                <option>SOS</option>
              </select>
              <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={postForm.isAnonymous}
                  onChange={e => setPostForm(f => ({ ...f, isAnonymous: e.target.checked }))}
                />
                Post anonymously
              </label>
              <button
                className="gs-contact-submit"
                style={{ padding: "8px 20px", marginLeft: "auto" }}
                onClick={handlePostSubmit}
              >
                Share →
              </button>
              <button
                onClick={() => { setPostOpen(false); setPostError(""); }}
                style={{ background: "none", border: "none", color: "#999", fontSize: 12, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
            {postError && (
              <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{postError}</p>
            )}
          </div>
        )}
      </div>
    ) : (
      /* ── Guest prompt ── */
      <div style={{ marginBottom: 28, padding: "14px 20px", borderRadius: 10, background: "rgba(42,108,44,0.06)", border: "1px solid rgba(42,108,44,0.15)", fontSize: 13, color: "#2a6c2c" }}>
        <strong>Want to share your experience?</strong>{" "}
        <button
          onClick={() => navigate("/login/worker")}
          style={{ background: "none", border: "none", color: "#2a6c2c", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 13 }}
        >
          Log in to post
        </button>
      </div>
    )}

    {/* ── Posts grid ── */}
    {communityLoading && communityPosts.length === 0 ? (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#5a6362", fontSize: 14 }}>
        Loading posts…
      </div>
    ) : communityPosts.length === 0 ? (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#5a6362", fontSize: 14 }}>
        No posts yet. Be the first to share your experience!
      </div>
    ) : (
      <div className="gs-community-grid">
        {communityPosts.map((p, i) => (
          <div
            className="gs-community-card"
            key={p._id}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`gs-community-card-bar gs-community-card-bar--${(i % 3) + 1}`} />
            <div className="gs-community-card-inner">

              {/* Avatar + author */}
              <div className="gs-community-top">
                <div className={`gs-community-avatar gs-community-avatar--${(i % 3) + 1}`}>
                  {p.initials}
                </div>
                <div className="gs-community-author">
                  <div className="gs-community-name">{p.name}</div>
                  <div className="gs-community-role">{p.role}</div>
                </div>
                <span className="gs-community-time">
                  {new Date(p.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short"
                  })}
                </span>
              </div>

              {/* Tag badge */}
              {p.tag && p.tag !== "General" && (
                <span style={{
                  display: "inline-block", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  padding: "3px 10px", borderRadius: 4, marginBottom: 10,
                  background: p.tag === "Safety" ? "rgba(239,68,68,0.08)" : p.tag === "Wages" ? "rgba(245,158,11,0.1)" : "rgba(42,108,44,0.08)",
                  color:      p.tag === "Safety" ? "#ef4444"              : p.tag === "Wages" ? "#b45309"              : "#2a6c2c",
                }}>
                  {p.tag}
                </span>
              )}

              {/* Body */}
              <p className="gs-community-body">"{p.body}"</p>

              {/* Footer — like button */}
              <div className="gs-community-footer">
                <button
                  className="gs-community-like-btn"
                  onClick={async () => {
                    if (!isLoggedIn) { navigate("/login/worker"); return; }
                    try {
                      const { data } = await api.post(`/community/${p._id}/like`);
                      setCommunityPosts(prev =>
                        prev.map(post =>
                          post._id === p._id
                            ? { ...post, likes: data.likes }
                            : post
                        )
                      );
                    } catch (err) {
                      console.error("Like failed:", err);
                    }
                  }}
                >
                  <span className="gs-heart-icon">♥</span>
                  <span>{p.likes} found this helpful</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    )}

    {/* ── Load more ── */}
    <div className="gs-community-load-more-wrap">
      <button
        className="gs-community-load-more"
        onClick={handleLoadMore}
        disabled={communityLoading || communityPosts.length >= communityTotal}
      >
        {communityLoading
          ? "Loading…"
          : communityPosts.length >= communityTotal
          ? "All caught up ✓"
          : "Load more stories →"}
      </button>
    </div>

  </div>
</section>

      {/* ── CTA BANNER ── */}
      <section className={`gs-cta ${ctaIn ? "gs-visible" : ""}`} ref={ctaRef}>
        <div className="gs-cta-orb gs-cta-orb--1" />
        <div className="gs-cta-orb gs-cta-orb--2" />

        <div className="gs-cta-split">

          {/* LEFT — image */}
          <div className="gs-cta-img-side">
            <div className="gs-cta-img-frame">
              <img
                src={gigworkersImg}
                alt="Gig workers protected by GigShield"
                className="gs-cta-photo"
              />

            </div>
          </div>

          {/* RIGHT — text */}
          <div className="gs-cta-text-side">
            <h2>
              Every gig worker deserves a<br />
              <span className="gs-accent">shield on their side.</span>
            </h2>
            <p>
              GigShield is free, private, and built for India's real working
              conditions. Whether you drive, deliver, or freelance — we've got
              your back.
            </p>
            <div className="gs-cta-actions">
              <button
                className="gs-btn-outline"
                onClick={() =>
                  setShowUnionModal(true)}
              >
                For Unions &amp; NGOs →
              </button>
            </div>
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
                <div className="gs-contact-detail-icon-box">
                  {/* Mail icon — no emoji */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                </div>
                <div>
                  <div className="gs-contact-detail-label">Email</div>
                  <a href="mailto:support@gigshield.in" className="gs-contact-detail-val">
                    support@gigshield.in
                  </a>
                </div>
              </div>

              <div className="gs-contact-detail">
                <div className="gs-contact-detail-icon-box">
                  {/* Handshake / partnership icon */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <div>
                  <div className="gs-contact-detail-label">Partnerships</div>
                  <a href="mailto:partners@gigshield.in" className="gs-contact-detail-val">
                    partners@gigshield.in
                  </a>
                </div>
              </div>

              {/* ── DB: "Based in" removed for now — add back when location data is ready ── */}

            </div>
          </div>

          <div className="gs-contact-right">
            {sent ? (
              <div className="gs-contact-success">
                <div className="gs-contact-success-icon">✓</div>
                <h3>Message received!</h3>
                <p>We'll get back to you within 24 hours. Thank you for reaching out.</p>
                <button
                className="gs-contact-submit"
                style={{ marginTop: 20 }}

                onClick={() => setSent(false)}
                >
                  Send another message <span>→</span>
                  </button>
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

                {/*
                  ── DATABASE INTEGRATION POINT ──
                  When the user clicks Send Message:
                    1. POST the form data to your backend API
                    2. Backend saves it to the `contact_messages` table
                    3. Backend also inserts a record into `community_posts` table
                       so it appears in the Community section automatically

                  Replace handleContact with something like this:

                  ─────────────────────────────────────────────────────────────
                  const handleContact = async () => {
                    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

                    try {
                      const res = await fetch("/api/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name:    contactForm.name,
                          email:   contactForm.email,
                          message: contactForm.message,
                          // Backend uses these to derive initials, role, time
                          // and insert into community_posts automatically
                          postToCommunity: true,
                        }),
                      });

                      if (res.ok) {
                        setSent(true);
                        setContactForm({ name: "", email: "", message: "" });
                      }
                    } catch (err) {
                      console.error("Contact form error:", err);
                    }
                  };
                  ─────────────────────────────────────────────────────────────

                  Expected backend behaviour:
                  • Save to `contact_messages` table:
                      { id, name, email, message, created_at }
                  • Also insert into `community_posts` table:
                      { id, name, initials, role: "GigShield User", body: message,
                        time: "just now", likes: 0, verified: false }
                  • Community section fetches from /api/community/posts — new
                    message will appear there automatically once DB is connected.
                */}
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
            <img src={gigshieldLogo} alt="GigShield" className="gs-nav-logo-img" />
          </div>
        </div>
      <div className="gs-footer-divider" />
      <p className="gs-footer-copy">© 2026 GigShield · AI Safety Platform for India's Gig Workers · Privacy-First · Offline-Ready</p>
     </footer>
     {/* ── UNION / NGO MODAL ── */}
{showUnionModal && (
  <div
    style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}
    onClick={() => setShowUnionModal(false)}
  >
    <div
      style={{
        background: "#fff", borderRadius: 18, padding: "36px 32px",
        maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto",
        position: "relative",
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={() => setShowUnionModal(false)}
        style={{
          position: "absolute", top: 16, right: 18,
          background: "none", border: "none", fontSize: 22,
          cursor: "pointer", color: "#888",
        }}
      >
        ✕
      </button>

      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: "#1a1a1a" }}>
        Union &amp; NGO Resources
      </h3>
      <p style={{ fontSize: 13, color: "#5a6362", marginBottom: 24 }}>
        Official government bodies and helplines for labour rights in India.
      </p>

      {[
        {
          category: "Central Government",
          items: [
            { name: "Ministry of Labour & Employment", url: "https://labour.gov.in", phone: "011-23710933" },
            { name: "Labour Helpline (National)", url: null, phone: "1800-11-1459" },
            { name: "EPFO — Provident Fund", url: "https://epfindia.gov.in", phone: "1800-118-005" },
            { name: "ESIC — Health Insurance", url: "https://esic.in", phone: "1800-11-2526" },
          ],
        },
        {
          category: "Gig & Platform Worker Bodies",
          items: [
            { name: "IFAT — Indian Federation of App-based Transport", url: "https://ifat.in", phone: null },
            { name: "NITI Aayog Gig Economy Report", url: "https://niti.gov.in", phone: null },
          ],
        },
        {
          category: "NGOs & Legal Aid",
          items: [
            { name: "Jan Sahas — Migrant & Gig Workers", url: "https://jansahas.org", phone: "07324-220400" },
            { name: "National Legal Services Authority", url: "https://nalsa.gov.in", phone: "15100" },
            { name: "Aajeevika Bureau", url: "https://aajeevika.org", phone: "02942-432011" },
          ],
        },
      ].map((section, si) => (
        <div key={si} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#2a6c2c", marginBottom: 10,
          }}>
            {section.category}
          </div>
          {section.items.map((item, ii) => (
            <div key={ii} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", borderRadius: 10, marginBottom: 6,
              background: "#f7faf7", border: "1px solid #e0ede0",
              flexWrap: "wrap", gap: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                {item.name}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {item.phone && (
                  <a href={`tel:${item.phone}`} style={{
                    fontSize: 12, color: "#2a6c2c", fontWeight: 600,
                    textDecoration: "none", background: "rgba(42,108,44,0.08)",
                    padding: "4px 10px", borderRadius: 6,
                  }}>
                    📞 {item.phone}
                  </a>
                )}
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" style={{
                    fontSize: 12, color: "#fff", fontWeight: 600,
                    textDecoration: "none", background: "#2a6c2c",
                    padding: "4px 10px", borderRadius: 6,
                  }}>
                    Visit →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Bottom CTA — scroll to contact */}
      <button
        className="gs-contact-submit"
        style={{ width: "100%", marginTop: 8 }}
        onClick={() => {
          setShowUnionModal(false);
          setTimeout(() =>
            document.getElementById("contact").scrollIntoView({ behavior: "smooth" }), 100
          );
        }}
      >
        Contact GigShield directly →
      </button>
    </div>
  </div>
)}
    </div>
  );
}