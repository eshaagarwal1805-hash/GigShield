import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/EmployerLogin.css";
import gigshieldLogo from "../assets/Gigshield Logo.png";


export default function EmployerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/employer/login", formData);
      localStorage.setItem("employer_token", res.data.token);
      localStorage.setItem("employer_user", JSON.stringify(res.data.employer));
      localStorage.getItem("employer_token");
      navigate("/employer/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="el-root">

      {/* ══ LEFT PANEL ══ */}
      <div className="el-panel--left">
        <div className="el-panel-bg">
          <div className="el-grid" />
          <div className="el-orb el-orb-1" />
          <div className="el-orb el-orb-2" />
        </div>

        <div className="el-panel-content">

          {/* Logo */}
          <div className="el-logo">
            <img src={gigshieldLogo} alt="GigShield" className="el-logo-img" />
          </div>

          {/* Body */}
          <div className="el-panel-body">
            <span className="el-panel-tag">Employer Portal</span>

            <h2 className="el-panel-title">
              Welcome back,<br />let's get hiring.
            </h2>

            <p className="el-panel-sub">
              Sign in to manage your gigs, review applicants, and handle
              payments — all from your employer dashboard.
            </p>

            {/* Stats */}
            <div className="el-panel-stats">
              <div className="el-panel-stat">
                <span className="el-panel-stat-val">10k+</span>
                <span className="el-panel-stat-lbl">Active Workers</span>
              </div>
              <div className="el-panel-stat-divider" />
              <div className="el-panel-stat">
                <span className="el-panel-stat-val">98%</span>
                <span className="el-panel-stat-lbl">On-time Pay</span>
              </div>
              <div className="el-panel-stat-divider" />
              <div className="el-panel-stat">
                <span className="el-panel-stat-val">4.9★</span>
                <span className="el-panel-stat-lbl">Employer Rating</span>
              </div>
            </div>

            {/* Features */}
            <div className="el-features">
              <div className="el-feature">
                <span className="el-feature-icon">📋</span>
                <span className="el-feature-text">Post and manage gigs from one dashboard</span>
              </div>
              <div className="el-feature">
                <span className="el-feature-icon">👥</span>
                <span className="el-feature-text">Review and shortlist verified applicants</span>
              </div>
              <div className="el-feature">
                <span className="el-feature-icon">💳</span>
                <span className="el-feature-text">Release payments securely with one click</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="el-panel-trust">
              <span>✓ Verified Employers</span>
              <span>✓ GDPR Compliant</span>
              <span>✓ 256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="el-panel--right">

        {/* Mobile-only logo */}
        <div className="el-logo el-logo--mobile">
          <img src={gigshieldLogo} alt="GigShield" className="el-logo-img" />
        </div>

        <div className="el-form-wrap">

          {/* Header */}
          <div className="el-form-header">
            <h1 className="el-form-title">Sign in as Employer</h1>
            <p className="el-form-sub">
              Post gigs and manage applicants on GigShield.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="el-error" role="alert">
              <span className="el-error-icon">⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="el-fields">

              {/* Work email */}
              <div className="el-field">
                <label htmlFor="email" className="el-label">
                  Work email
                </label>
                <div className="el-input-wrap">
                  <span className="el-input-icon">✉</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="el-input"
                    placeholder="abc@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="el-field">
                <div className="el-label-row">
                  <label htmlFor="password" className="el-label">
                    Password
                  </label>
                  <Link to="/employer/forgot-password" className="el-forgot">
                    Forgot password?
                  </Link>
                </div>
                <div className="el-input-wrap">
                  <span className="el-input-icon">🔑</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="el-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="el-eye"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="el-submit-wrap">
              <button
                type="submit"
                className="el-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="el-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in as Employer
                    <span className="el-btn-arrow">→</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="el-divider">
            <div className="el-divider-line" />
            <span className="el-divider-text">or</span>
            <div className="el-divider-line" />
          </div>

          {/* Footer links */}
          <div className="el-footer">
            <p className="el-footer-line">
              No employer account?{" "}
              <Link to="/register/employer" className="el-footer-link">
                Register your company
              </Link>
            </p>
            <p className="el-footer-line">
              Worker?{" "}
              <Link to="/login/worker" className="el-footer-link">
                Worker login
              </Link>
            </p>
          </div>

          <p className="el-legal">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}