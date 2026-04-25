import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import api from "../api/axios"; // your axios instance with JWT interceptor

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // Save the JWT — your axios interceptor will pick it up automatically
      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            <div className="auth-panel-tag">Trusted by workers across India</div>
            <h2 className="auth-panel-title">
              Your safety<br />never clocks out.
            </h2>
            <p className="auth-panel-sub">
              From shift logging to SOS alerts — GigShield protects you every step of the way.
            </p>
            <div className="auth-panel-stats">
              <div className="auth-panel-stat">
                <span className="auth-panel-stat-val">50M+</span>
                <span className="auth-panel-stat-lbl">Workers Protected</span>
              </div>
              <div className="auth-panel-stat-divider" />
              <div className="auth-panel-stat">
                <span className="auth-panel-stat-val">24/7</span>
                <span className="auth-panel-stat-lbl">Live Monitoring</span>
              </div>
              <div className="auth-panel-stat-divider" />
              <div className="auth-panel-stat">
                <span className="auth-panel-stat-val">100%</span>
                <span className="auth-panel-stat-lbl">Anonymous</span>
              </div>
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

          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-sub">Sign in to access your GigShield dashboard.</p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠</span>
              {error}
            </div>
          )}

          <div className="auth-fields">
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
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                <a href="#" className="auth-forgot">Forgot password?</a>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="auth-input"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
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

            <button
              className={`auth-btn-primary ${loading ? "auth-btn-primary--loading" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : (
                <>Sign In to GigShield <span className="auth-btn-arrow">→</span></>
              )}
            </button>
          </div>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">New to GigShield?</span>
            <span className="auth-divider-line" />
          </div>

          <button
            className="auth-btn-secondary"
            onClick={() => navigate("/register")}
          >
            Create a free account →
          </button>

          <p className="auth-footer-note">
            © 2026 GigShield · Privacy-First · Offline-Ready
          </p>
        </div>
      </div>
    </div>
  );
}