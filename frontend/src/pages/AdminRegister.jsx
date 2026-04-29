import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import api from "../api/axios";
import gigshieldLogo from "../assets/Gigshield Logo.png";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/admin/register", form);
      // expect: { token, user } with user.role === "admin"
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
            <img
              src={gigshieldLogo}
              alt="GigShield"
              className="auth-logo-img"
            />
          </div>
          <div className="auth-panel-body">
            <h2 className="auth-panel-title">
              Create an<br /> admin shield.
            </h2>
            <p className="auth-panel-sub">
              Set up a secure admin account to manage incidents, alerts and
              reports across GigShield.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          {/* Mobile logo */}
          <div
            className="auth-logo auth-logo--mobile"
            onClick={() => navigate("/")}
          >
            <span className="auth-logo-icon">🛡</span>
            <span className="auth-logo-text">GigShield Admin</span>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">Admin Registration</h1>
            <p className="auth-form-sub">
              Restricted area — only authorized administrators should sign up.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="auth-fields">
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handle}
                  placeholder="Admin name"
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Admin email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="admin@gigshield.in"
                  className="auth-input"
                  required
                />
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
                  onChange={handle}
                  placeholder="••••••••"
                  className="auth-input"
                  required
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
              type="submit"
              className={`auth-btn-primary ${
                loading ? "auth-btn-primary--loading" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating admin…
                </>
              ) : (
                <>
                  Create Admin Account{" "}
                  <span className="auth-btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">
              Already have an admin account?
            </span>
            <span className="auth-divider-line" />
          </div>

          <p className="auth-footer-note">
            <Link to="/admin/login" className="auth-footer-link">
              Back to Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}