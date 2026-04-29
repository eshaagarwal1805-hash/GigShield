// frontend/src/components/dashboard/JobsPage.jsx
import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import Icon from "../common/Icon";
import { fmtDate } from "../dashboardUtils";
import ApplyModal from "./ApplyModal";

export default function JobsPage({
  jobs,
  appliedJobIds,
  onApply,
  loadingJobs,
  jobSearch,
  setJobSearch,
  jobLocation,
  setJobLocation,
  fetchJobs,
}) {
  const [selectedJob, setSelectedJob]   = useState(null);
  const [tab, setTab]                   = useState("browse"); // 'browse' | 'applications'
  const [myApps, setMyApps]             = useState([]);
  const [appsLoading, setAppsLoading]   = useState(false);

  // Debounce: fire fetchJobs 400 ms after the user stops typing
  const debounceRef = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setJobSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchJobs(val, jobLocation), 400);
  };

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setJobLocation(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchJobs(jobSearch, val), 400);
  };

  const handleClearFilters = () => {
    setJobSearch("");
    setJobLocation("");
    clearTimeout(debounceRef.current);
    fetchJobs("", "");
  };

  useEffect(() => {
    if (tab !== "applications") return;
    setAppsLoading(true);
    api
      .get("/jobs/my-applications")
      .then((res) => setMyApps(res.data ?? []))
      .catch((err) => console.error("Applications fetch failed:", err))
      .finally(() => setAppsLoading(false));
  }, [tab]);

  const statusColor = (s) =>
    ({
      pending: "var(--db-muted)",
      reviewed: "#b07d00",
      accepted: "#2a6c2c",
      rejected: "#a83836",
    }[s] || "var(--db-muted)");

  const statusIcon = (s) =>
    ({
      pending: "pending",
      reviewed: "visibility",
      accepted: "check_circle",
      rejected: "cancel",
    }[s] || "pending");

  return (
    <div className="db-card" style={{ maxWidth: 780 }}>
      {/* Tabs */}
      <div className="db-modal-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`db-modal-tab ${tab === "browse" ? "db-modal-tab--active" : ""}`}
          onClick={() => setTab("browse")}
        >
          <Icon name="work" style={{ fontSize: 14 }} /> Browse Jobs
          {jobs.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                background: "#2a6c2c",
                color: "#fff",
                borderRadius: 99,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {jobs.length}
            </span>
          )}
        </button>
        <button
          className={`db-modal-tab ${tab === "applications" ? "db-modal-tab--active" : ""}`}
          onClick={() => setTab("applications")}
        >
          <Icon name="assignment" style={{ fontSize: 14 }} /> My Applications
          {appliedJobIds.size > 0 && (
            <span
              style={{
                marginLeft: 6,
                background: "#2a6c2c",
                color: "#fff",
                borderRadius: 99,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {appliedJobIds.size}
            </span>
          )}
        </button>
      </div>

      {/* ── Browse Jobs tab ── */}
      {tab === "browse" && (
        <>
          <div className="db-card-header" style={{ marginBottom: 12 }}>
            <div>
              <span className="db-card-eyebrow">Open Gig Jobs</span>
              <h3 className="db-card-title">Available Postings</h3>
            </div>
            <span style={{ fontSize: 13, color: "var(--db-primary)", fontWeight: 600 }}>
              {jobs.length} available
            </span>
          </div>

          {/* ── Search & Location filter ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {/* Search input */}
            <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  color: "var(--db-muted)",
                  pointerEvents: "none",
                  fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
                }}
              >
                search
              </span>
              <input
                className="db-field-input"
                style={{ paddingLeft: 34, margin: 0 }}
                placeholder="Search by title or platform…"
                value={jobSearch}
                onChange={handleSearchChange}
              />
            </div>

            {/* Location filter */}
            <div style={{ position: "relative", flex: "1 1 160px", minWidth: 140 }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  color: "var(--db-muted)",
                  pointerEvents: "none",
                  fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
                }}
              >
                location_on
              </span>
              <input
                className="db-field-input"
                style={{ paddingLeft: 34, margin: 0 }}
                placeholder="Filter by location…"
                value={jobLocation}
                onChange={handleLocationChange}
              />
            </div>

            {/* Clear button — only shown when a filter is active */}
            {(jobSearch || jobLocation) && (
              <button
                onClick={handleClearFilters}
                style={{
                  padding: "0 14px",
                  borderRadius: 8,
                  border: "1px solid var(--db-border)",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--db-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon name="close" style={{ fontSize: 14 }} /> Clear
              </button>
            )}
          </div>

          {loadingJobs ? (
            <p style={{ fontSize: 13, color: "var(--db-muted)" }}>Loading jobs…</p>
          ) : jobs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--db-muted)",
              }}
            >
              <Icon
                name="work_off"
                style={{ fontSize: 36, display: "block", marginBottom: 8 }}
              />
              <p style={{ fontSize: 13 }}>
                {jobSearch || jobLocation
                  ? "No jobs match your search. Try adjusting your filters."
                  : "No open jobs right now. Check back later!"}
              </p>
            </div>
          ) : (
            <div className="db-advice-list">
              {jobs.map((job) => {
                const applied = appliedJobIds.has(job._id);
                return (
                  <div
                    key={job._id}
                    className="db-advice-item"
                    style={{ alignItems: "flex-start" }}
                  >
                    <div className="db-advice-icon-wrap" style={{ marginTop: 4 }}>
                      <Icon
                        name="work"
                        fill={1}
                        style={{ fontSize: 20, color: "#2a6c2c" }}
                      />
                    </div>
                    <div className="db-advice-body" style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="db-badge db-badge--green">
                          {job.platform}
                        </span>
                        <span className="db-badge db-badge--blue">
                          {job.location}
                        </span>
                      </div>
                      <p
                        className="db-advice-title"
                        style={{ marginBottom: 4 }}
                      >
                        {job.title}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="db-advice-meta"
                          style={{
                            color: "var(--db-primary)",
                            fontWeight: 700,
                          }}
                        >
                          ₹{job.pay}/day
                        </span>
                        <span
                          className="db-advice-meta"
                          style={{ color: "var(--db-muted)" }}
                        >
                          {(job.description || "").slice(0, 80)}
                          {job.description?.length > 80 ? "…" : ""}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => !applied && setSelectedJob(job)}
                      disabled={applied}
                      style={{
                        flexShrink: 0,
                        padding: "6px 16px",
                        borderRadius: 8,
                        border: "none",
                        cursor: applied ? "default" : "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        background: applied
                          ? "rgba(42,108,44,0.1)"
                          : "#2a6c2c",
                        color: applied ? "#2a6c2c" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon
                        name={applied ? "check" : "send"}
                        style={{ fontSize: 14 }}
                      />
                      {applied ? "Applied" : "Apply"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── My Applications tab ── */}
      {tab === "applications" && (
        <>
          <div className="db-card-header" style={{ marginBottom: 12 }}>
            <div>
              <span className="db-card-eyebrow">My Applications</span>
              <h3 className="db-card-title">Application Status</h3>
            </div>
          </div>
          {appsLoading ? (
            <p style={{ fontSize: 13, color: "var(--db-muted)" }}>Loading…</p>
          ) : myApps.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--db-muted)",
              }}
            >
              <Icon
                name="assignment_late"
                style={{ fontSize: 36, display: "block", marginBottom: 8 }}
              />
              <p style={{ fontSize: 13 }}>
                No applications yet. Browse jobs and apply!
              </p>
            </div>
          ) : (
            <div className="db-advice-list">
              {myApps.map((app) => (
                <div
                  key={app._id}
                  className="db-advice-item"
                  style={{ alignItems: "flex-start" }}
                >
                  <div className="db-advice-icon-wrap" style={{ marginTop: 4 }}>
                    <Icon
                      name={statusIcon(app.status)}
                      fill={1}
                      style={{
                        fontSize: 20,
                        color: statusColor(app.status),
                      }}
                    />
                  </div>
                  <div className="db-advice-body" style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="db-badge db-badge--green">
                        {app.job?.platform}
                      </span>
                      <span className="db-badge db-badge--blue">
                        {app.job?.location}
                      </span>
                    </div>
                    <p
                      className="db-advice-title"
                      style={{ marginBottom: 2 }}
                    >
                      {app.job?.title}
                    </p>
                    <span
                      className="db-advice-meta"
                      style={{
                        color: "var(--db-primary)",
                        fontWeight: 700,
                      }}
                    >
                      ₹{app.job?.pay}/day
                    </span>
                    {app.coverNote && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--db-muted)",
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        "{app.coverNote}"
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--db-muted)",
                        marginTop: 4,
                      }}
                    >
                      Applied {fmtDate(app.createdAt)}
                    </p>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      background: `${statusColor(app.status)}18`,
                      color: statusColor(app.status),
                      border: `1px solid ${statusColor(app.status)}40`,
                    }}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={(jobId) => {
            onApply(jobId);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}