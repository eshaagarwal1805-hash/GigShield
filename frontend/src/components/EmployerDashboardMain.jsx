// src/components/EmployerDashboardMain.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";
import "../styles/EmployerDashboard.css";

// ─────────────────────────────────────────────
// Helpers
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

const STATUS_COLORS = {
  Pending:     { bg: "#fef3c7", color: "#92400e" },
  Shortlisted: { bg: "#dbeafe", color: "#1e40af" },
  Hired:       { bg: "#d1fae5", color: "#065f46" },
  Rejected:    { bg: "#fee2e2", color: "#991b1b" },
};

const JOB_STATUS_COLORS = {
  open:   { bg: "#d1fae5", color: "#065f46" },
  closed: { bg: "#f3f4f6", color: "#6b7280" },
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function EmployerDashboardMain() {
  const navigate = useNavigate();

  const [jobs, setJobs]               = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError]             = useState("");
  const [formError, setFormError]     = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [activeTab, setActiveTab]     = useState("listings");
  const [form, setForm]               = useState(EMPTY_FORM);
  const [jobFilter, setJobFilter]     = useState("all"); // job _id or "all"
  const [appError, setAppError]       = useState("");

  const employer = (() => {
    try {
      return JSON.parse(localStorage.getItem("employer_user")) || {};
    } catch {
      return {};
    }
  })();

  // ── Fetch Jobs ─────────────────────────────
  const fetchJobs = useCallback(async () => {
    const token = localStorage.getItem("employer_token");
    if (!token) { navigate("/login/employer"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await api.get("/employer/jobs/mine");
      setJobs(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login/employer");
      else setError(err.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Fetch Applications ─────────────────────
  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem("employer_token");
    if (!token) { navigate("/login/employer"); return; }

    setAppsLoading(true);
    try {
      const res = await api.get("/employer/applications/mine");
      setApplications(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load applications.");
    } finally {
      setAppsLoading(false);
    }
  }, [navigate]);

  // ── Initial Load ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("employer_token");
    if (!token) { navigate("/login/employer"); return; }
    fetchJobs();
    fetchApplications();
  }, [fetchJobs, fetchApplications, navigate]);

  // ── Post Gig ──────────────────────────────
  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePostGig = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const { title, platform, pay, location, description } = form;
    if (!title || !platform || !pay || !location || !description) {
      setFormError("All fields are required.");
      return;
    }
    if (isNaN(pay) || Number(pay) <= 0) {
      setFormError("Pay must be a positive number.");
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post("/employer/jobs", {
        title,
        platform,
        pay: Number(pay),
        location,
        description,
      });
      setJobs((prev) => [res.data, ...prev]);
      setForm(EMPTY_FORM);
      setFormSuccess("Gig posted successfully!");
      setTimeout(() => { setFormSuccess(""); setActiveTab("listings"); }, 1800);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to post gig.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete Job ─────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    try {
      await api.delete(`/employer/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch {
      alert("Failed to delete listing.");
    }
  };

  // ── Toggle Job Status ──────────────────────
  const handleToggleStatus = async (job) => {
    const next = job.status === "open" ? "closed" : "open";
    try {
      const res = await api.patch(`/employer/jobs/${job._id}/status`, { status: next });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? res.data : j)));
    } catch {
      alert("Failed to update job status.");
    }
  };

  // ── Update Application Status ──────────────
  const handleAppStatus = async (appId, status) => {
    setAppError("");
    try {
      const res = await api.patch(`/employer/applications/${appId}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: res.data.status } : a))
      );
    } catch (err) {
      setAppError(err.response?.data?.message || "Failed to update application status.");
    }
  };

  // ── Jump to Applications tab filtered by job ──
  const viewApplicationsForJob = (jobId) => {
    setJobFilter(jobId);
    setActiveTab("applications");
  };

  // ── Derived: application count per job ────────
  const appCountByJob = applications.reduce((acc, a) => {
    const id = a.job?._id || a.job;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  // ── Derived: filtered applications ────────────
  const filteredApps =
    jobFilter === "all"
      ? applications
      : applications.filter((a) => (a.job?._id || a.job) === jobFilter);

  // ── Logout ────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("employer_token");
    localStorage.removeItem("employer_user");
    navigate("/login/employer");
  };

  // ── Derived Stats ──────────────────────────
  const openJobs      = jobs.filter((j) => j.status === "open").length;
  const pendingApps   = applications.filter((a) => a.status === "Pending").length;
  const hiredCount    = applications.filter((a) => a.status === "Hired").length;

  const tabClass = (tab) =>
    tab === activeTab ? "emp-tab emp-tab--active" : "emp-tab";

  // ─────────────────────────────────────────────
  return (
    <div className="emp-root">

      {/* TOPBAR */}
      <header className="emp-topbar">
        <div className="emp-topbar-brand">
          <span>GigShield <span>Employer</span></span>
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

      {/* BODY */}
      <div className="emp-body">

        <h1 className="emp-page-title">
          {employer.companyName || "Your Company"}
        </h1>

        {/* Stats */}
        <div className="emp-stats-row">
          <div className="emp-stat-card">
            <div className="emp-stat-label">Open Listings</div>
            <div className="emp-stat-value">{openJobs}</div>
          </div>
          <div className="emp-stat-card">
            <div className="emp-stat-label">Pending Review</div>
            <div className="emp-stat-value">{pendingApps}</div>
          </div>
          <div className="emp-stat-card">
            <div className="emp-stat-label">Hired</div>
            <div className="emp-stat-value">{hiredCount}</div>
          </div>
          <div className="emp-stat-card">
            <div className="emp-stat-label">Total Applications</div>
            <div className="emp-stat-value">{applications.length}</div>
          </div>
        </div>

        {/* Global error */}
        {error && <div className="emp-alert-error">⚠ {error}</div>}

        {/* Tabs */}
        <div className="emp-tabs">
          <button className={tabClass("listings")} onClick={() => setActiveTab("listings")}>
            My Listings
          </button>
          <button className={tabClass("post")} onClick={() => setActiveTab("post")}>
            + Post Gig
          </button>
          <button className={tabClass("applications")} onClick={() => { setJobFilter("all"); setActiveTab("applications"); }}>
            Applications {pendingApps > 0 && <span className="emp-tab-badge">{pendingApps} pending</span>}
          </button>
        </div>

        {/* ── TAB: LISTINGS ── */}
        {activeTab === "listings" && (
          <div className="emp-listings">
            {loading ? (
              <div className="emp-loading">Loading listings…</div>
            ) : jobs.length === 0 ? (
              <div className="emp-empty">
                <p>No gigs posted yet.</p>
                <button className="emp-btn-primary" onClick={() => setActiveTab("post")}>
                  Post your first gig →
                </button>
              </div>
            ) : (
              jobs.map((job) => {
                const sc = JOB_STATUS_COLORS[job.status] || JOB_STATUS_COLORS.open;
                return (
                  <div key={job._id} className="emp-job-card">
                    <div className="emp-job-card-header">
                      <div>
                        <h3 className="emp-job-title">{job.title}</h3>
                        <p className="emp-job-meta">
                          {job.platform} &middot; {job.location} &middot; ₹{job.pay}/day
                        </p>
                      </div>
                      <span
                        className="emp-job-status-badge"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="emp-job-desc">{job.description}</p>

                    <div className="emp-job-footer">
                      <span className="emp-job-date">Posted {fmtDate(job.postedAt)}</span>
                      <div className="emp-job-actions">
                        <button
                          className="emp-btn-secondary"
                          onClick={() => viewApplicationsForJob(job._id)}
                        >
                          Applications{appCountByJob[job._id] ? ` (${appCountByJob[job._id]})` : " (0)"}
                        </button>
                        <button
                          className="emp-btn-secondary"
                          onClick={() => handleToggleStatus(job)}
                        >
                          {job.status === "open" ? "Close listing" : "Reopen"}
                        </button>
                        <button
                          className="emp-btn-danger-sm"
                          onClick={() => handleDelete(job._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB: POST GIG ── */}
        {activeTab === "post" && (
          <div className="emp-post-wrap">
            <h2 className="emp-section-title">Post a New Gig</h2>

            {formError   && <div className="emp-alert-error">⚠ {formError}</div>}
            {formSuccess  && <div className="emp-alert-success">✓ {formSuccess}</div>}

            <form className="emp-post-form" onSubmit={handlePostGig} noValidate>

              <div className="emp-form-row">
                <div className="emp-form-field">
                  <label className="emp-label">Job Title *</label>
                  <input
                    className="emp-input"
                    name="title"
                    placeholder="e.g. Delivery Partner"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="emp-form-field">
                  <label className="emp-label">Platform *</label>
                  <input
                    className="emp-input"
                    name="platform"
                    placeholder="e.g. Swiggy, Dunzo, Urban Company"
                    value={form.platform}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="emp-form-row">
                <div className="emp-form-field">
                  <label className="emp-label">Pay (₹ / day) *</label>
                  <input
                    className="emp-input"
                    name="pay"
                    type="number"
                    min="1"
                    placeholder="e.g. 800"
                    value={form.pay}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="emp-form-field">
                  <label className="emp-label">Location *</label>
                  <input
                    className="emp-input"
                    name="location"
                    placeholder="e.g. Bhubaneswar, Odisha"
                    value={form.location}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="emp-form-field emp-form-field--full">
                <label className="emp-label">Description *</label>
                <textarea
                  className="emp-textarea"
                  name="description"
                  rows={4}
                  placeholder="Describe the role, requirements, and working hours…"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="emp-form-actions">
                <button
                  type="button"
                  className="emp-btn-secondary"
                  onClick={() => { setForm(EMPTY_FORM); setFormError(""); }}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="emp-btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? "Posting…" : "Post Gig"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB: APPLICATIONS ── */}
        {activeTab === "applications" && (
          <div className="emp-applications">

            {/* Filter bar */}
            <div className="emp-app-filter-bar">
              <label className="emp-label">Filter by job:</label>
              <select
                className="emp-input emp-app-filter-select"
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                <option value="all">All jobs ({applications.length})</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} · {j.platform} ({appCountByJob[j._id] || 0})
                  </option>
                ))}
              </select>
              {jobFilter !== "all" && (
                <button
                  className="emp-btn-secondary"
                  onClick={() => setJobFilter("all")}
                >
                  Clear filter
                </button>
              )}
            </div>

            {appError && <div className="emp-alert-error">⚠ {appError}</div>}

            {appsLoading ? (
              <div className="emp-loading">Loading applications…</div>
            ) : filteredApps.length === 0 ? (
              <div className="emp-empty">
                <p>{jobFilter === "all" ? "No applications received yet." : "No applications for this listing yet."}</p>
              </div>
            ) : (
              filteredApps.map((app) => {
                const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Pending;
                return (
                  <div key={app._id} className="emp-app-card">
                    <div className="emp-app-card-header">
                      <div>
                        <p className="emp-app-worker">
                          {app.worker?.name || "Unknown Worker"}
                        </p>
                        <p className="emp-app-worker-email">
                          {app.worker?.email}
                          {app.worker?.phone && ` · ${app.worker.phone}`}
                        </p>
                        {app.job && (
                          <p className="emp-app-job-ref">
                            Applied for: <strong>{app.job.title}</strong>
                            {app.job.platform && ` · ${app.job.platform}`}
                          </p>
                        )}
                      </div>
                      <span
                        className="emp-app-status-badge"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {app.status}
                      </span>
                    </div>

                    {app.message && (
                      <p className="emp-app-message">"{app.message}"</p>
                    )}

                    <div className="emp-app-footer">
                      <div className="emp-app-meta">
                        {app.expectedPay && <span>Expected: ₹{app.expectedPay}/day</span>}
                        {app.shiftPreference && app.shiftPreference !== "Not specified" && (
                          <span> · Shift: {app.shiftPreference}</span>
                        )}
                        <span> · {fmtDate(app.createdAt)}</span>
                      </div>

                      {/* Status action buttons — only show relevant next states */}
                      <div className="emp-app-actions">
                        {app.status === "Pending" && (
                          <>
                            <button
                              className="emp-btn-shortlist"
                              onClick={() => handleAppStatus(app._id, "Shortlisted")}
                            >
                              Shortlist
                            </button>
                            <button
                              className="emp-btn-reject"
                              onClick={() => handleAppStatus(app._id, "Rejected")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === "Shortlisted" && (
                          <>
                            <button
                              className="emp-btn-hire"
                              onClick={() => handleAppStatus(app._id, "Hired")}
                            >
                              Hire
                            </button>
                            <button
                              className="emp-btn-reject"
                              onClick={() => handleAppStatus(app._id, "Rejected")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(app.status === "Hired" || app.status === "Rejected") && (
                          <button
                            className="emp-btn-secondary"
                            onClick={() => handleAppStatus(app._id, "Pending")}
                          >
                            Reset to Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}
