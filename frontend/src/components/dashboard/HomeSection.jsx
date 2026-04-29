// frontend/src/components/dashboard/HomeSection.jsx
import Icon from "../common/Icon";
import HeatmapView from "../HeatmapView";

export default function HomeSection({
  shiftOn,
  liveTimerStr,
  todayWorkedMs,
  msToHHMM,
  userLocation,
  activeGig,
  todayEarnings,
  completedGigs,
  nearbyReports,
  alertAck,
  setAlertAck,
  safetyScore,
  jobs,
  setActiveNav,
  lastRefreshed,
}) {
  return (
    <>
      <div className="db-grid">

        {/* ── Current Session ── */}
        <div className="db-card db-card--session">
          <div className="db-card-bg-circle" />
          <div className="db-session-content">
            <div className="db-session-left">
              <span className="db-card-eyebrow">Current Session</span>
              <div className="db-session-time">
                <span className={`db-session-hrs ${shiftOn ? "db-session-hrs--live" : ""}`}>
                  {liveTimerStr}
                </span>
                {shiftOn && <span className="db-session-live-dot" title="Live" />}
              </div>
              <div className="db-session-meta">
                <div className="db-session-meta-item">
                  <span className="db-meta-label">Active Location</span>
                  <span className="db-meta-value">
                    <Icon name="location_on" style={{ fontSize: 14 }} />
                    {userLocation || activeGig?.location || "Fetching…"}
                  </span>
                </div>
                <div className="db-session-meta-divider" />
                <div className="db-session-meta-item">
                  <span className="db-meta-label">Today Worked</span>
                  <span className="db-meta-value">
                    <Icon name="schedule" style={{ fontSize: 14 }} />
                    {msToHHMM(todayWorkedMs)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Safety Score card (with alert embedded below ring) ── */}
        <div className="db-card db-card--score">
          <div className="db-score-header">
            <div>
              <span className="db-card-eyebrow">Safety health</span>
              <h3 className="db-card-title">Current status</h3>
            </div>
            <span className="db-score-tier" style={{
              background: safetyScore >= 8 ? "var(--db-accent)" : safetyScore >= 6 ? "#fef3da" : safetyScore >= 4 ? "rgba(249,115,22,0.15)" : "rgba(168,56,54,0.15)",
              color:      safetyScore >= 8 ? "#004b0f"          : safetyScore >= 6 ? "#7a4f0c" : safetyScore >= 4 ? "#c2410c"              : "var(--db-red)",
            }}>
              {safetyScore >= 8 ? "SAFE" : safetyScore >= 6 ? "STABLE" : safetyScore >= 4 ? "CAUTION" : "DANGER"}
            </span>
          </div>

          {/* Score ring */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "28px 0 20px" }}>
            <div className="db-score-ring-wrap" style={{ width: 110, height: 110 }}>
              <svg viewBox="0 0 36 36" className="db-score-ring">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="rgba(42,108,44,0.1)" strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={safetyScore >= 8 ? "#2a6c2c" : safetyScore >= 6 ? "#f59e0b" : safetyScore >= 4 ? "#f97316" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${(safetyScore / 10) * 100}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="db-score-num" style={{ fontSize: 26 }}>
                {safetyScore}
                <span style={{ fontSize: 12, marginLeft: 2, fontWeight: 500, color: "var(--db-muted)" }}>/10</span>
              </div>
            </div>
          </div>


          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--db-border)", margin: "0 0 20px" }} />

          {/* Overall environment text */}
          <div style={{ textAlign: "center", padding: "0 12px" }}>
            <p style={{ fontFamily: "var(--db-font-head)", fontWeight: 700, fontSize: 15, color: "var(--db-text)", marginBottom: 8 }}>
              Overall environment
            </p>
            <p style={{ fontSize: 13, color: "var(--db-muted)", lineHeight: 1.6 }}>
              {nearbyReports.length === 0
                ? "No risk reports near your location. Conditions look safe right now."
                : `${nearbyReports.length} risk report${nearbyReports.length > 1 ? "s" : ""} found within 5km of your location. Stay alert.`}
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--db-border)", margin: "20px 0 0" }} />

          {/* Last updated footer */}
          <div style={{
            paddingTop: 14, fontSize: 11, color: "var(--db-muted)",
            textAlign: "center", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: safetyScore >= 6 ? "#2a6c2c" : "#f97316",
              boxShadow: `0 0 6px ${safetyScore >= 6 ? "#2a6c2c" : "#f97316"}`,
              flexShrink: 0,
            }} />
            Last updated: <strong>
              {lastRefreshed
                ? lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "Just now"}
            </strong>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--db-border)", margin: "0 0 20px" }} />

          {/* ── Proximity Alert — below the ring ── */}
          <div style={{
            margin: "0 0 20px",
            padding: "12px 14px",
            borderRadius: 10,
            background: nearbyReports.length === 0
              ? "rgba(42,108,44,0.06)"
              : "rgba(239,68,68,0.06)",
            border: `1px solid ${nearbyReports.length === 0
              ? "rgba(42,108,44,0.15)"
              : "rgba(239,68,68,0.2)"}`,
          }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon
                name={nearbyReports.length === 0 ? "check_circle" : "report"}
                style={{
                  fontSize: 16,
                  color: nearbyReports.length === 0 ? "#2a6c2c" : "#ef4444",
                }}
              />
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: nearbyReports.length === 0 ? "#2a6c2c" : "#ef4444",
              }}>
                {nearbyReports.length === 0 ? "Area Clear" : "Proximity Alert"}
              </span>
              {nearbyReports.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--db-muted)", fontWeight: 600 }}>
                  {new Date(nearbyReports[0].reportedAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              )}
            </div>

            {/* Title */}
            <p style={{ fontSize: 13, color: "var(--db-text)", fontWeight: 700, margin: "0 0 4px" }}>
              {nearbyReports.length === 0
                ? "Your area looks safe"
                : `${nearbyReports[0].category.charAt(0).toUpperCase() + nearbyReports[0].category.slice(1)} Reported Nearby`}
            </p>

            {/* Body */}
            <p style={{ fontSize: 12, color: "var(--db-muted)", margin: 0, lineHeight: 1.5 }}>
              {nearbyReports.length === 0
                ? "No risk reports within 5km right now."
                : `${nearbyReports[0].description} · ${nearbyReports.length} report${nearbyReports.length > 1 ? "s" : ""} nearby`}
            </p>

            {/* Acknowledge button */}
            {nearbyReports.length > 0 && (
              <button
                onClick={() => setAlertAck(true)}
                style={{
                  marginTop: 10, padding: "5px 14px", borderRadius: 6,
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: alertAck ? "rgba(42,108,44,0.1)" : "rgba(239,68,68,0.1)",
                  color:      alertAck ? "#2a6c2c"             : "#ef4444",
                  border: `1px solid ${alertAck ? "rgba(42,108,44,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
              >
                {alertAck ? "✓ Acknowledged" : "Acknowledge"}
              </button>
            )}
          </div>
        </div>
        

        {/* ── Safety Heatmap ── */}
        <div className="db-card db-card--map">
          <div className="db-card-header">
            <div>
              <h3 className="db-card-title">Safety Heat Map</h3>
              <span className="db-card-eyebrow" style={{ display: "block", marginTop: 2 }}>
                Real-time Safety &amp; Activity
              </span>
            </div>
          </div>
          <HeatmapView mapOnly={false} />
        </div>

        {/* ── Open Jobs ── */}
        <div className="db-card db-card--advice">
          <div className="db-card-header">
            <h3 className="db-card-title">Open Gig Jobs</h3>
            <span className="db-card-eyebrow" style={{ color: "var(--db-primary)" }}>
              {jobs.length} available
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="db-jobs-empty">
              <Icon name="work_off" />
              <p>No open jobs right now. Check back later!</p>
            </div>
          ) : (
            <div className="db-jobs-list">
              {jobs.slice(0, 4).map((job) => (
                <div key={job._id} className="db-job-item">
                  <div className="db-job-icon-wrap">
                    <Icon name="work" fill={1} style={{ fontSize: 20, color: "#2a6c2c" }} />
                  </div>
                  <div className="db-job-body">
                    <div className="db-job-tags">
                      <span className="db-badge db-badge--green">{job.platform}</span>
                      <span className="db-badge db-badge--blue">{job.location}</span>
                    </div>
                    <p className="db-job-title">{job.title}</p>
                    <div className="db-job-meta">
                      <span className="db-job-pay">₹{job.pay}/day</span>
                      <span className="db-job-desc">{job.description}</span>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="db-job-arrow" />
                </div>
              ))}
            </div>
          )}

          <button className="db-explore-btn" onClick={() => setActiveNav("jobs")}>
            View All Jobs →
          </button>
        </div>

      </div>
    </>
  );
}