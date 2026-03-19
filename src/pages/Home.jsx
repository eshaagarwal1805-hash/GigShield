import "../styles/Home.css";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <nav>
        <h2>GigShield</h2>
        <div>
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Community</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>Protecting India’s Gig Workforce with AI-Driven Safety</h1>
        <p>
          GigShield is a digital safety companion designed to support gig workers
          through real-time monitoring, financial transparency, and
          community-driven protection systems.
        </p>
        <button onClick={() => alert("Welcome to GigShield 🚀")}>
          Join the Platform
        </button>
      </section>

      {/* PROBLEM */}
      <section className="section">
        <h2>The Problem</h2>
        <p>
          India’s gig economy is expected to reach nearly 50 million workers by
          2026. Despite this growth, gig workers frequently face payment disputes,
          unsafe working environments, harassment, and lack of social security.
        </p>
      </section>

      {/* FEATURES */}
      <section className="section">
        <h2>How GigShield Helps</h2>

        <div className="cards">
          {features.map((f, i) => (
            <div key={i} className="card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stat">
          <h2>50M+</h2>
          <p>Projected Gig Workers by 2026</p>
        </div>

        <div className="stat">
          <h2>24/7</h2>
          <p>Safety Monitoring</p>
        </div>

        <div className="stat">
          <h2>AI</h2>
          <p>Risk Detection System</p>
        </div>

        <div className="stat">
          <h2>Nationwide</h2>
          <p>Community Protection</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Empowering Gig Workers Across India</h2>
        <p>
          GigShield combines AI insights, real-time safety tools, and community
          collaboration.
        </p>
        <button>Get Started</button>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2026 GigShield | AI Safety Platform for Gig Workers</p>
      </footer>
    </>
  );
}

const features = [
  {
    title: "Real-Time Safety Monitoring",
    desc: "Workers can log shifts with geolocation check-ins and safety tracking.",
  },
  {
    title: "Emergency SOS Alerts",
    desc: "Trigger instant alerts to unions or trusted contacts.",
  },
  {
    title: "AI Risk Detection",
    desc: "Detect unusual earnings patterns and risks.",
  },
  {
    title: "Community Support Forums",
    desc: "Anonymous discussions for safety awareness.",
  },
  {
    title: "Payout Verification",
    desc: "Compare payments with logs for transparency.",
  },
  {
    title: "Safety Heatmaps",
    desc: "Highlight high-risk zones across cities.",
  },
];