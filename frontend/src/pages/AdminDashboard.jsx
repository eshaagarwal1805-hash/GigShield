// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import gigshieldLogo from "../assets/Gigshield Logo.png";
import "../styles/Auth.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sos", label: "SOS Alerts" },
  { id: "workers", label: "Workers" },
  { id: "employers", label: "Employers" },
  { id: "messages", label: "Messages" },
];

function StatCard({ label, value, colorClass = "green" }) {
  return (
    <div className={`stat-card stat-card--${colorClass}`}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value ?? "—"}</div>
    </div>
  );
}

function SOSBadge({ status }) {
  const isActive = status === "active";
  return (
    <span
      className={`sos-badge sos-badge--${
        isActive ? "active" : "resolved"
      }`}
    >
      {isActive ? "🔴 Active" : "✅ Resolved"}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [sos, setSos] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth check
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(stored);
    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
  }, [navigate]);

  // Fetch stats on mount
  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch tab data lazily
  useEffect(() => {
    if (tab === "sos" && sos.length === 0) {
      api.get("/admin/sos").then((r) => setSos(r.data));
    }
    if (tab === "workers" && workers.length === 0) {
      api.get("/admin/workers").then((r) => setWorkers(r.data));
    }
    if (tab === "employers" && employers.length === 0) {
      api.get("/admin/employers").then((r) => setEmployers(r.data));
    }
    if (tab === "messages" && messages.length === 0) {
      api.get("/admin/messages").then((r) => setMessages(r.data));
    }
  }, [tab, sos.length, workers.length, employers.length, messages.length]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  if (loading) {
    return (
      <div className="admin-root admin-root--center">
        <div className="admin-loading">Loading admin panel…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-root admin-root--center">
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      {/* Top bar */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img
            src={gigshieldLogo}
            alt="GigShield"
            className="admin-logo-img"
            onClick={() => navigate("/")}
          />
          <span className="admin-header-title">Admin</span>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          Logout
        </button>
      </header>

      <div className="admin-main">
        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`admin-tab ${
                tab === t.id ? "admin-tab--active" : ""
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && stats && (
          <div className="admin-section">
            <h2 className="admin-section-title">Platform Overview</h2>
            <div className="stat-grid">
              <StatCard label="Gig Workers" value={stats.totalWorkers} />
              <StatCard
                label="Employers"
                value={stats.totalEmployers}
                colorClass="blue"
              />
              <StatCard
                label="Active SOS"
                value={stats.activeSOS}
                colorClass="red"
              />
              {/* Resolved SOS removed from overview */}
              <StatCard
                label="Community Posts"
                value={stats.totalPosts}
                colorClass="purple"
              />
              <StatCard
                label="Unread Messages"
                value={stats.unreadMessages}
                colorClass="amber"
              />
            </div>
          </div>
        )}

        {/* SOS ALERTS */}
        {tab === "sos" && (
          <div className="admin-section">
            <h2 className="admin-section-title">SOS Alerts</h2>
            {sos.length === 0 ? (
              <p className="admin-empty-text">No SOS alerts found.</p>
            ) : (
              <div className="sos-list">
                {sos.map((s) => (
                  <div key={s._id} className="sos-card">
                    <div className="sos-card-col sos-card-col--worker">
                      <div className="sos-worker-name">
                        {s.userId?.name || "Unknown Worker"}
                      </div>
                      <div className="sos-worker-meta">
                        {s.userId?.email} · {s.userId?.phone}
                      </div>
                      <div className="sos-worker-type">
                        Type: {s.userId?.workerType || "—"}
                      </div>
                    </div>
                    <div className="sos-card-col sos-card-col--details">
                      <div className="sos-location">
                        📍{" "}
                        {s.location?.coordinates
                          ? `${s.location.coordinates[1]?.toFixed(
                              4
                            )}, ${s.location.coordinates[0]?.toFixed(4)}`
                          : "Location unavailable"}
                      </div>
                      <div className="sos-message">
                        {s.message || "No message"}
                      </div>
                    </div>
                    <div className="sos-card-col sos-card-col--meta">
                      <SOSBadge status={s.status} />
                      <div className="sos-date">{fmtDate(s.createdAt)}</div>
                      {s.resolvedAt && (
                        <div className="sos-resolved">
                          Resolved: {fmtDate(s.resolvedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WORKERS */}
        {tab === "workers" && (
          <div className="admin-section">
            <h2 className="admin-section-title">
              Registered Workers ({workers.length})
            </h2>
            {workers.length === 0 ? (
              <p className="admin-empty-text">No workers found.</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {["Name", "Email", "Phone", "Type", "Joined"].map(
                        (h) => (
                          <th key={h}>{h}</th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w, i) => (
                      <tr
                        key={w._id}
                        className={
                          i === workers.length - 1 ? "last-row" : ""
                        }
                      >
                        <td className="cell-strong">{w.name}</td>
                        <td>{w.email}</td>
                        <td>{w.phone || "—"}</td>
                        <td>
                          <span className="worker-type-badge">
                            {w.workerType}
                          </span>
                        </td>
                        <td className="cell-small">
                          {fmtDate(w.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EMPLOYERS */}
        {tab === "employers" && (
          <div className="admin-section">
            <h2 className="admin-section-title">
              Registered Employers ({employers.length})
            </h2>
            {employers.length === 0 ? (
              <p className="admin-empty-text">No employers found.</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {["Company", "Email", "Industry", "Joined"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employers.map((e, i) => (
                      <tr
                        key={e._id}
                        className={
                          i === employers.length - 1 ? "last-row" : ""
                        }
                      >
                        <td className="cell-strong">{e.companyName}</td>
                        <td>{e.email}</td>
                        <td>{e.industry || "—"}</td>
                        <td className="cell-small">
                          {fmtDate(e.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div className="admin-section">
            <h2 className="admin-section-title">
              Contact Messages ({messages.length})
            </h2>
            {messages.length === 0 ? (
              <p className="admin-empty-text">No messages yet.</p>
            ) : (
              <div className="messages-list">
                {messages.map((m) => (
                  <div key={m._id} className="message-card">
                    <div className="message-header">
                      <div className="message-header-left">
                        <span className="message-name">{m.name}</span>
                        <span className="message-email">{m.email}</span>
                      </div>
                      <div className="message-header-right">
                        <span
                          className={`message-status message-status--${
                            m.status === "unread" ? "unread" : "read"
                          }`}
                        >
                          {m.status}
                        </span>
                        <span className="message-date">
                          {fmtDate(m.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="message-body">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}