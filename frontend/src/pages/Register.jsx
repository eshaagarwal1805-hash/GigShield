import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const WORKER_TYPES = [
  { value: "delivery", label: "🛵 Delivery" },
  { value: "driver", label: "🚗 Driver" },
  { value: "freelancer", label: "💻 Freelancer" },
  { value: "domestic", label: "🏠 Domestic Worker" },
  { value: "construction", label: "🏗 Construction" },
  { value: "other", label: "⚙️ Other" },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    workerType: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStep1 = () => {
    setError("");
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    setError("");
    if (!form.workerType) {
      setError("Please select your worker type.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1400);
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel-bg">
          <div className="auth-grid" />
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>
        <div className="auth-panel-content">
          <div className="auth-logo" onClick={() => navigate("/")}>
            <span className="auth-logo-icon">🛡</span>
            <span className="auth-logo-text">GigShield</span>
          </div>
          <div className="auth-panel-body">
            <div className="auth-panel-tag">Free. Private. Powerful.</div>
            <h2 className="auth-panel-title">
              Join India's<br />gig worker<br />community.
            </h2>
            <p className="auth-panel-sub">
              Get real-time protection, fair pay tools, and a community that has your back — completely free.
            </p>
            <div className="auth-register-perks">
              {[
                { icon: "📍", text: "Automatic shift & earnings logging" },
                { icon: "🆘", text: "One-tap SOS to unions & NGOs" },
                { icon: "💰", text: "Dispute underpayments with proof" },
                { icon: "💬", text: "Anonymous peer support forums" },
              ].map((p, i) => (
                <div className="auth-perk" key={i}>
                  <span className="auth-perk-icon">{p.icon}</span>
                  <span className="auth-perk-text">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-panel-trust">
            <span>✓ Offline-ready</span>
            <span>✓ Privacy-first</span>
            <span>✓ Union integrated</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          {/* Mobile logo */}
          <div className="auth-logo auth-logo--mobile" onClick={() => navigate("/")}>
            <span className="auth-logo-icon">🛡</span>
            <span className="auth-logo-text">GigShield</span>
          </div>

          {/* Step indicator */}
          <div className="auth-steps">
            <div className={`auth-step-dot ${step >= 1 ? "auth-step-dot--active" : ""}`}>1</div>
            <div className={`auth-step-line ${step >= 2 ? "auth-step-line--active" : ""}`} />
            <div className={`auth-step-dot ${step >= 2 ? "auth-step-dot--active" : ""}`}>2</div>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">
              {step === 1 ? "Create your account" : "Almost there!"}
            </h1>
            <p className="auth-form-sub">
              {step === 1
                ? "Step 1 of 2 — Your basic details."
                : "Step 2 of 2 — Set your worker type & password."}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠</span>
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="auth-fields">
              <div className="auth-field">
                <label className="auth-label">Full name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Arjun Sharma"
                    className="auth-input"
                    onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="arjun@example.com"
                    className="auth-input"
                    onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Phone number</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="auth-input"
                    onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                  />
                </div>
              </div>

              <button className="auth-btn-primary" onClick={handleStep1}>
                Continue <span className="auth-btn-arrow">→</span>
              </button>
            </div>
          ) : (
            <div className="auth-fields">
              <div className="auth-field">
                <label className="auth-label">I work as a…</label>
                <div className="auth-worker-grid">
                  {WORKER_TYPES.map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      className={`auth-worker-btn ${form.workerType === w.value ? "auth-worker-btn--active" : ""}`}
                      onClick={() => setForm((p) => ({ ...p, workerType: w.value }))}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="auth-input"
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirm password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="auth-input"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
              </div>

              <div className="auth-btn-row">
                <button className="auth-btn-back" onClick={() => { setStep(1); setError(""); }}>
                  ← Back
                </button>
                <button
                  className={`auth-btn-primary auth-btn-primary--flex ${loading ? "auth-btn-primary--loading" : ""}`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner" />
                      Creating account…
                    </>
                  ) : (
                    <>Create Account <span className="auth-btn-arrow">→</span></>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">Already registered?</span>
            <span className="auth-divider-line" />
          </div>

          <button
            className="auth-btn-secondary"
            onClick={() => navigate("/login")}
          >
            Sign in to your account →
          </button>

          <p className="auth-footer-note">
            © 2026 GigShield · Privacy-First · Offline-Ready
          </p>
        </div>
      </div>
    </div>
  );
}
