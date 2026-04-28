import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";
import "../styles/EmployerDashboard.css";

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const EMPTY_FORM = {
  title: "",
  platform: "",
  pay: "",
  location: "",
  description: "",
};

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────

function StatCard({ label, value, accent = "#2a6c2c" }) {
  return (
    <div className="emp-stat-card">
      <div className="emp-stat-label">{label}</div>
      <div className="emp-stat-value" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function JobCard({ job, onDelete }) {
  const applicantCount = job.applicants?.length ?? job.applicantCount ?? 0;

  const platformColors = {
    swiggy: {
      bg: "rgba(252,128,25,0.12)",
      border: "rgba(252,128,25,0.35)",
      text: "#fb923c",
    },
    zomato: {
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.35)",
      text: "#f87171",
    },
    blinkit: {
      bg: "rgba(234,179,8,0.12)",
      border: "rgba(234,179,8,0.35)",
      text: "#facc15",
    },
    dunzo: {
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.35)",
      text: "#818cf8",
    },
    other: {
      bg: "rgba(148,163,184,0.1)",
      border: "rgba(148,163,184,0.2)",
      text: "#94a3b8",
    },
  };
  const pk = (job.platform || "other").toLowerCase();
  const pc = platformColors[pk] || platformColors.other;

  return (
    <div className="emp-job-card">
      {/* Top row */}
      <div className="emp-job-top">
        <div>
          <h3 className="emp-job-title">{job.title}</h3>
          <div className="emp-job-date">Posted {fmtDate(job.createdAt)}</div>
        </div>
        <span
          style={{
            background: pc.bg,
            border: `1px solid ${pc.border}`,
            color: pc.text,
            borderRadius: 20,
            padding: "3px 12px",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "capitalize",
            whiteSpace: "nowrap",
          }}
        >
          {job.platform || "Other"}
        </span>
      </div>

      {/* Description */}
      {job.description && (
        <p className="emp-job-desc">{job.description}</p>
      )}

      {/* Meta row */}
      <div className="emp-job-meta">
        <div className="emp-job-meta-item">
          <label>PAY</label>
          <span style={{ color: "#4ade80" }}>₹{job.pay}</span>
        </div>
        <div className="emp-job-meta-item">
          <label>LOCATION</label>
          <span>📍 {job.location}</span>
        </div>
        <div className="emp-job-meta-item">
          <label>APPLICANTS</label>
          <span style={{ color: applicantCount > 0 ? "#60a5fa" : "#94a3b8" }}>
            {applicantCount > 0 ? `👥 ${applicantCount}` : "—"}
          </span>
        </div>
      </div>

      {/* Delete */}
      <div className="emp-job-actions">
        <button
          onClick={() => onDelete(job._id)}
          className="emp-btn-danger"
        >
          Remove listing
        </button>
      </div>
    </div>
  );
}

function PostGigForm({ onPosted }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.title || !form.pay || !form.location) {
      setError("Title, pay, and location are required.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/employer/jobs", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("employer_token")}`,
        },
      });
      setForm(EMPTY_FORM);
      setSuccess(true);
      onPosted();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to post gig. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emp-form-card">
      <h3 className="emp-form-title">📋 Post a New Gig</h3>

      {error && (
        <div className="emp-alert-error">
          <span>⚠ {error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="emp-alert-success">
          ✓ Gig posted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="emp-form-grid">
          {/* Title */}
          <div className="emp-form-field emp-form-field--full">
            <label className="emp-form-label">Job Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Delivery Partner – Night Shift"
              className="emp-form-input"
              required
            />
          </div>

          {/* Platform */}
          <div className="emp-form-field">
            <label className="emp-form-label">Platform</label>
            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
              className="emp-form-select"
            >
              <option value="">Select platform</option>
              <option value="Swiggy">Swiggy</option>
              <option value="Zomato">Zomato</option>
              <option value="Blinkit">Blinkit</option>
              <option value="Dunzo">Dunzo</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Pay */}
          <div className="emp-form-field">
            <label className="emp-form-label">Pay (₹) *</label>
            <input
              name="pay"
              type="number"
              min="0"
              value={form.pay}
              onChange={handleChange}
              placeholder="e.g. 800"
              className="emp-form-input"
              required
            />
          </div>

          {/* Location */}
          <div className="emp-form-field emp-form-field--full">
            <label className="emp-form-label">Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Koramangala, Bengaluru"
              className="emp-form-input"
              required
            />
          </div>

          {/* Description */}
          <div className="emp-form-field emp-form-field--full">
            <label className="emp-form-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Shift timings, requirements, perks…"
              rows={3}
              className="emp-form-textarea"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="emp-btn-primary"
        >
          {loading ? "Posting…" : "Post Gig →"}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────

export default function EmployerDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("listings"); // "listings" | "post"

  const employer = (() => {
    try {
      return JSON.parse(localStorage.getItem("employer_user")) || {};
    } catch {
      return {};
    }
  })();

  const authHeader = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("employer_token")}`,
    },
  };

  // ── Fetch jobs ────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
        const res = await api.get("/employer/jobs/mine", authHeader);      setJobs(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/employer/login");
      } else {
        setError(
          err.response?.data?.message || "Could not load job listings."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Delete job ────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    try {
        await api.delete(`/employer/jobs/${id}`, authHeader);      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch {
      alert("Failed to delete listing.");
    }
  };

  // ── Logout ─────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("employer_token");
    localStorage.removeItem("employer_user");
    navigate("/employer/login");
  };

  // ── Derived stats ─────────────────────────────
  const totalApplicants = jobs.reduce(
    (s, j) => s + (j.applicants?.length ?? j.applicantCount ?? 0),
    0
  );

  const tabClass = (tab) =>
    tab === activeTab ? "emp-tab emp-tab--active" : "emp-tab";

  return (
    <div className="emp-root">
      {/* ── TOPBAR ── */}
      <header className="emp-topbar">
        <div className="emp-topbar-brand">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2a6c2c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="3" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          <span>
            GigShield <span>Employer</span>
          </span>
        </div>

        <div className="emp-topbar-right">
          <span className="emp-topbar-company">
            {employer.companyName || employer.email || "Employer"}
          </span>
          <button onClick={handleLogout} className="emp-btn-danger">
            Logout
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="emp-body">
        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <p className="emp-page-eyebrow">Employer Dashboard</p>
          <h1 className="emp-page-title">
            {employer.companyName || "Your Company"}
          </h1>
        </div>

        {/* Stat cards */}
        <div className="emp-stats-row">
          <StatCard label="Active Listings" value={jobs.length} />
          <StatCard
            label="Total Applicants"
            value={totalApplicants}
            accent="#60a5fa"
          />
          <StatCard
            label="Gigs This Month"
            value={
              jobs.filter(
                (j) =>
                  new Date(j.createdAt) >
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length
            }
            accent="#c084fc"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="emp-alert-error">
            <span>⚠ {error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div className="emp-tabs">
          <button
            className={tabClass("listings")}
            onClick={() => setActiveTab("listings")}
          >
            📋 Job Listings
          </button>
          <button
            className={tabClass("post")}
            onClick={() => setActiveTab("post")}
          >
            ＋ Post a Gig
          </button>
        </div>

        {/* ── TAB: LISTINGS ── */}
        {activeTab === "listings" && (
          <>
            {loading ? (
              <div className="emp-spinner-wrap">
                <div className="emp-spinner" />
                Loading your listings…
              </div>
            ) : jobs.length === 0 ? (
              <div className="emp-empty">
                <div className="emp-empty-icon">📭</div>
                <p className="emp-empty-title">No gigs posted yet.</p>
                <p className="emp-empty-sub">
                  Switch to "Post a Gig" to create your first listing.
                </p>
                <button
                  onClick={() => setActiveTab("post")}
                  className="emp-btn-ghost"
                >
                  Post a Gig →
                </button>
              </div>
            ) : (
              <div className="emp-job-list">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB: POST GIG ── */}
        {activeTab === "post" && (
          <PostGigForm
            onPosted={() => {
              fetchJobs();
              setActiveTab("listings");
            }}
          />
        )}
      </div>
    </div>
  );
}