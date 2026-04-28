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

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function EmployerDashboardMain() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("listings");

  const employer = (() => {
    try {
      return JSON.parse(localStorage.getItem("employer_user")) || {};
    } catch {
      return {};
    }
  })();

  // ✅ CENTRALIZED AUTH HEADER (FIXED)
  const getAuthHeader = () => {
    const token = localStorage.getItem("employer_token");
    if (!token) return null;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ── Fetch Jobs ─────────────────────────────
  const fetchJobs = useCallback(async () => {
    const config = getAuthHeader();

    if (!config) {
      navigate("/employer/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get("/employer/jobs/mine", config);
      setJobs(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/employer/login");
      } else {
        setError(err.response?.data?.message || "Failed to load jobs.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Fetch Applications ─────────────────────
  const fetchApplications = useCallback(async () => {
    const config = getAuthHeader();

    if (!config) {
      navigate("/employer/login");
      return;
    }

    setAppsLoading(true);

    try {
      const res = await api.get("/employer/applications/mine", config);
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
    if (!token) {
      navigate("/employer/login");
      return;
    }

    fetchJobs();
    fetchApplications();
  }, [fetchJobs, fetchApplications, navigate]);

  // ── Delete Job ─────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;

    try {
      await api.delete(`/employer/jobs/${id}`, getAuthHeader());
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch {
      alert("Failed to delete listing.");
    }
  };

  // ── Logout ────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("employer_token");
    localStorage.removeItem("employer_user");
    navigate("/employer/login");
  };

  // ── Derived Stats (SAFE) ───────────────────
  const totalApplicants = (jobs || []).reduce(
    (sum, job) =>
      sum + (job.applicants?.length ?? job.applicantCount ?? 0),
    0
  );

  const tabClass = (tab) =>
    tab === activeTab ? "emp-tab emp-tab--active" : "emp-tab";

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
            <div>Active Listings</div>
            <div>{jobs.length}</div>
          </div>

          <div className="emp-stat-card">
            <div>Total Applicants</div>
            <div>{totalApplicants}</div>
          </div>

          <div className="emp-stat-card">
            <div>Applications</div>
            <div>{applications.length}</div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="emp-alert-error">⚠ {error}</div>}

        {/* Tabs */}
        <div className="emp-tabs">
          <button className={tabClass("listings")} onClick={() => setActiveTab("listings")}>
            Listings
          </button>

          <button className={tabClass("post")} onClick={() => setActiveTab("post")}>
            Post Gig
          </button>

          <button className={tabClass("applications")} onClick={() => setActiveTab("applications")}>
            Applications
          </button>
        </div>

        {/* CONTENT */}
        {activeTab === "listings" && (
          loading ? (
            <p>Loading...</p>
          ) : jobs.length === 0 ? (
            <p>No jobs yet</p>
          ) : (
            jobs.map((job) => (
              <div key={job._id}>
                <h3>{job.title}</h3>
                <p>{job.location}</p>
                <button onClick={() => handleDelete(job._id)}>Delete</button>
              </div>
            ))
          )
        )}

        {activeTab === "applications" && (
          appsLoading ? (
            <p>Loading applications...</p>
          ) : (
            applications.map((app) => (
              <div key={app._id}>
                <p>{app.worker?.name}</p>
              </div>
            ))
          )
        )}

      </div>
    </div>
  );
}