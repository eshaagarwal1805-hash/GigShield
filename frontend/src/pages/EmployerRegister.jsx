import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

export default function EmployerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    email:       "",
    password:    "",
    confirm:     "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/employer/register", {
        companyName: formData.companyName,
        email:       formData.email,
        password:    formData.password,
      });
      localStorage.setItem("employer_token", res.data.token);
      localStorage.setItem("employer_user",  JSON.stringify(res.data.employer));
      navigate("/employer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="3"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <h1 className="auth-title">Register as Employer</h1>
          <p className="auth-subtitle">Create a company account to post gigs on GigShield</p>
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
            <label htmlFor="companyName" className="auth-label">Company name</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className="auth-input"
              placeholder="Acme Deliveries Pvt. Ltd."
              value={formData.companyName}
              onChange={handleChange}
              required
              autoComplete="organization"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="hr@company.com"
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
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm" className="auth-label">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={formData.confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create employer account"}
          </button>
        </form>

        {/* Footer links */}
        <div className="auth-footer">
          <p>
            Already have an employer account?{" "}
            <Link to="/employer/login" className="auth-link">
              Sign in
            </Link>
          </p>
          <p style={{ marginTop: 8 }}>
            Worker?{" "}
            <Link to="/register" className="auth-link">
              Worker sign-up →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}