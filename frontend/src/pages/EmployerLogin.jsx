import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

export default function EmployerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData]   = useState({ email: "", password: "" });
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/employer/login", formData);
      // Store employer token separately so worker session is not overwritten
      localStorage.setItem("employer_token", res.data.token);
      localStorage.setItem("employer_user",  JSON.stringify(res.data.employer));
      navigate("/employer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">

        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-wrap">
            {/* Briefcase icon — no image dependency */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="3"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <h1 className="auth-title">Employer Login</h1>
          <p className="auth-subtitle">Post gigs and manage applicants on GigShield</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="company@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in as Employer"}
          </button>
        </form>

        {/* Footer links */}
        <div className="auth-footer">
          <p>
            No employer account?{" "}
            <Link to="/employer/register" className="auth-link">
              Register your company
            </Link>
          </p>
          <p style={{ marginTop: 8 }}>
            Worker?{" "}
            <Link to="/login" className="auth-link">
              Worker login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}