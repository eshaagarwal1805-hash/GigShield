import { useState, useMemo, useEffect, useCallback } from "react";
import "../styles/Dashboard.css";
import gigshieldLogo from "../assets/Gigshield Logo.png";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // ← the new axios file
import RiskReportForm from "./RiskReportForm"; // ── CHANGE 1 ──
import HeatmapView    from "./HeatmapView";     // ← ADDed in CHANGE 1, shows safety heatmap with community reports

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { icon: "dashboard",  label: "Home",          id: "home" },
  { icon: "payments",   label: "Earnings",       id: "earnings" },
  { icon: "history",    label: "Shift History",  id: "history" },
  { icon: "group",      label: "Community",      id: "community" },
  { icon: "warning",    label: "Alerts",         id: "alerts" },
];

const NOTIFICATION_TYPES = {
  SHIFT_START: "Shift started",
  SHIFT_END:   "Shift ended",
  EARNING:     "Earning added",
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

function shiftDuration(start, end) {
  if (!start) return "00:00";
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  return `${h}:${m}`;
}

// ─────────────────────────────────────────────────────────────
//  Small reusable UI pieces (unchanged)
// ─────────────────────────────────────────────────────────────

const Icon = ({ name, fill = 0, className = "", style = {} }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`, ...style }}
  >
    {name}
  </span>
);

function MapPlaceholder({ small = false }) {
  return (
    <div className={`db-map-placeholder ${small ? "db-map-placeholder--small" : ""}`}>
      <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="db-map-svg">
        {[0,1,2,3,4,5,6,7,8].map(i=>(
          <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="220" stroke="rgba(42,108,44,0.1)" strokeWidth="1"/>
        ))}
        {[0,1,2,3,4].map(i=>(
          <line key={`h${i}`} x1="0" y1={i*55} x2="400" y2={i*55} stroke="rgba(42,108,44,0.1)" strokeWidth="1"/>
        ))}
        <path d="M0,110 Q100,90 200,110 Q300,130 400,110" stroke="rgba(42,108,44,0.2)" strokeWidth="3" fill="none"/>
        <path d="M200,0 Q210,55 200,110 Q190,165 200,220" stroke="rgba(42,108,44,0.2)" strokeWidth="3" fill="none"/>
        <path d="M0,60 Q80,55 160,65 Q240,75 320,60 Q360,55 400,60" stroke="rgba(42,108,44,0.12)" strokeWidth="2" fill="none"/>
        <path d="M0,160 Q100,155 200,165 Q300,175 400,160" stroke="rgba(42,108,44,0.12)" strokeWidth="2" fill="none"/>
        <path d="M80,0 Q85,110 80,220" stroke="rgba(42,108,44,0.1)" strokeWidth="1.5" fill="none"/>
        <path d="M320,0 Q315,110 320,220" stroke="rgba(42,108,44,0.1)" strokeWidth="1.5" fill="none"/>
        <ellipse cx="200" cy="110" rx="60" ry="40" fill="rgba(42,108,44,0.18)"/>
        <ellipse cx="200" cy="110" rx="30" ry="20" fill="rgba(42,108,44,0.25)"/>
        <ellipse cx="310" cy="75"  rx="35" ry="25" fill="rgba(172,244,164,0.3)"/>
        <ellipse cx="95"  cy="155" rx="28" ry="20" fill="rgba(168,56,54,0.15)"/>
        <ellipse cx="340" cy="165" rx="22" ry="16" fill="rgba(172,244,164,0.2)"/>
        <circle cx="200" cy="110" r="8"  fill="#2a6c2c"/>
        <circle cx="200" cy="110" r="16" fill="rgba(42,108,44,0.2)"/>
        <circle cx="200" cy="110" r="26" fill="rgba(42,108,44,0.08)"/>
        <circle cx="310" cy="75"  r="5"  fill="#acf4a4" stroke="#2a6c2c" strokeWidth="1.5"/>
        <circle cx="95"  cy="155" r="5"  fill="rgba(168,56,54,0.7)" stroke="#a83836" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Page sections — now receive live data via props
// ─────────────────────────────────────────────────────────────

function EarningsPage({ todayEarnings, completedGigs }) {
  const weekTotal = completedGigs.slice(0, 7).reduce((s, g) => s + (g.earnings || 0), 0);
  const bestGig   = completedGigs.reduce((max, g) => Math.max(max, g.earnings || 0), 0);
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <span className="db-card-eyebrow">Earnings Overview</span>
          <h3 className="db-card-title">Your Earnings</h3>
        </div>
      </div>
      <p style={{ fontSize: 14, marginBottom: 16 }}>
        Track your daily, weekly, and monthly payouts across all platforms.
      </p>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div className="db-meta-label">Today</div>
          <div className="db-meta-value" style={{ fontSize: 20 }}>₹{todayEarnings.toFixed(2)}</div>
        </div>
        <div>
          <div className="db-meta-label">Recent gigs total</div>
          <div className="db-meta-value">₹{weekTotal.toFixed(2)}</div>
        </div>
        <div>
          <div className="db-meta-label">Best single gig</div>
          <div className="db-meta-value">₹{bestGig.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

function ShiftHistoryPage({ completedGigs, loading }) {
  if (loading) {
    return <div className="db-card" style={{ color: "var(--db-muted)", fontSize: 14 }}>Loading shift history…</div>;
  }
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <span className="db-card-eyebrow">Shift History</span>
          <h3 className="db-card-title">Recent Shifts</h3>
        </div>
      </div>
      {completedGigs.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--db-muted)" }}>No completed shifts yet. Start your first shift!</p>
      ) : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead style={{ textAlign: "left", color: "var(--db-muted)" }}>
            <tr>
              <th style={{ padding: "8px 0" }}>Date</th>
              <th>Duration</th>
              <th>Location</th>
              <th>Earnings</th>
            </tr>
          </thead>
          <tbody>
            {completedGigs.map((g) => (
              <tr key={g._id} style={{ borderTop: "1px solid var(--db-border)" }}>
                <td style={{ padding: "8px 0" }}>{fmtDate(g.startTime)}</td>
                <td>{shiftDuration(g.startTime, g.endTime)}</td>
                <td>{g.location || "—"}</td>
                <td>₹{(g.earnings || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CommunityPage() {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <span className="db-card-eyebrow">Community</span>
          <h3 className="db-card-title">GigShield Community</h3>
        </div>
      </div>
      <p style={{ fontSize: 14, marginBottom: 16 }}>
        Connect with other delivery partners, share tips, and report unsafe zones together.
      </p>
      <ul style={{ fontSize: 13, color: "var(--db-muted)", lineHeight: 1.7 }}>
        <li>• Bengaluru Safety WhatsApp group</li>
        <li>• Monthly wellness webinar: "Night shift safety basics"</li>
        <li>• Local union meet-up: 28th April, Koramangala</li>
      </ul>
    </div>
  );
}

// ── CHANGE 4 ── AlertsPage replaced with full version ────────────────────────
// REPLACE the entire AlertsPage function with:
function AlertsPage() {
  const sectionTitle = {
    fontSize: 16, fontWeight: 700,
    margin: "0 0 16px",
    color: "var(--text-primary, #e2e8f0)",
  };
  const divider = {
    border: "none",
    borderTop: "1px solid var(--db-border, #2d3748)",
    margin: "32px 0",
  };

  return (
    <div style={{ padding: "24px", maxWidth: 780 }}>

      {/* ── Section 1: Risk Report Form ── */}
      <h2 style={sectionTitle}>Report a Risk</h2>
      <RiskReportForm />

      <hr style={divider} />

      {/* ── Section 2: Safety Heatmap ── */}
      <h2 style={sectionTitle}>Safety Heatmap</h2>
      <HeatmapView />

    </div>
  );
  
  const reportCard = {
    background: "var(--db-card, #1e2130)",
    borderRadius: 10,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  };
  const categoryBadge = (cat) => {
    const colors = {
      theft:         { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)",   text: "#f87171" },
      harassment:    { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.35)",  text: "#fb923c" },
      accident:      { bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.35)",   text: "#facc15" },
      "road hazard": { bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.35)",  text: "#c084fc" },
      other:         { bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)",  text: "#94a3b8" },
    };
    const c = colors[cat] || colors.other;
    return {
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 12,
      fontWeight: 600,
      textTransform: "capitalize",
    };
  };
  const locationBadge = {
    background: "rgba(59,130,246,0.1)",
    border: "1px solid rgba(59,130,246,0.25)",
    color: "#60a5fa",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 500,
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={{ padding: "24px", maxWidth: 780 }}>

      {/* ── Section 1: Risk Report Form ── */}
      <h2 style={sectionTitle}>Report a Risk</h2>
      <RiskReportForm />

      <hr style={divider} />

      {/* ── Section 2: Community Alert History ── */}
      <h2 style={sectionTitle}>Recent Community Reports</h2>

      {loading && (
        <p style={{ color: "var(--db-muted, #94a3b8)", fontSize: 14 }}>Loading reports…</p>
      )}

      {error && (
        <p style={{ color: "#f87171", fontSize: 14 }}>❌ {error}</p>
      )}

      {!loading && !error && reports.length === 0 && (
        <p style={{ color: "var(--db-muted, #94a3b8)", fontSize: 14 }}>No community reports yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reports.map((r, i) => (
          <div key={r._id || i} style={reportCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={categoryBadge(r.category)}>{r.category}</span>
              <span style={{ fontSize: 13, color: "var(--db-muted, #94a3b8)" }}>
                {formatDate(r.reportedAt)}
              </span>
            </div>
            {r.location?.coordinates && (
              <span style={locationBadge}>
                📍 {r.location.coordinates[1]?.toFixed(3)},{" "}
                {r.location.coordinates[0]?.toFixed(3)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ user, language, theme }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <span className="db-card-eyebrow">Profile</span>
          <h3 className="db-card-title">Your Account</h3>
        </div>
      </div>
      <p style={{ fontSize: 14, marginBottom: 16 }}>
        Basic information and preferences for your GigShield account.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div><div className="db-meta-label">Name</div><div className="db-meta-value">{user?.name || "—"}</div></div>
        <div><div className="db-meta-label">Email</div><div className="db-meta-value">{user?.email || "—"}</div></div>
        <div><div className="db-meta-label">Worker ID</div><div className="db-meta-value">{user?.workerId || "—"}</div></div>
        <div><div className="db-meta-label">Current language</div><div className="db-meta-value">{language === "en" ? "English" : "Hindi"}</div></div>
        <div><div className="db-meta-label">Theme</div><div className="db-meta-value">{theme === "light" ? "Light" : "Dark"}</div></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function GigShieldDashboard() {
  const navigate = useNavigate();

  // ── UI state (unchanged from your original) ───────────────
  const [activeNav,    setActiveNav]    = useState("home");
  const [mapMode,      setMapMode]      = useState("SAFETY");
  const [alertAck,     setAlertAck]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [faqOpen,      setFaqOpen]      = useState(false);
  const [faqInput,     setFaqInput]     = useState("");
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [theme,        setTheme]        = useState("light");
  const [language,     setLanguage]     = useState("en");
  const [faqItems,     setFaqItems]     = useState([
    { id: 1, question: "How does GigShield track my shifts?", answer: "Admin: Shifts are tracked using GPS check-ins and app activity logs." },
  ]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: NOTIFICATION_TYPES.SHIFT_START, message: "Shift started at 11:30 AM", read: false },
  ]);

  // ── Live data state ───────────────────────────────────────
  const [user,        setUser]        = useState(null);
  const [gigs,        setGigs]        = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError,    setApiError]    = useState("");
  const [gigLoading,  setGigLoading]  = useState(false);

  // ── Theme / lang effects (unchanged) ─────────────────────
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("gs_lang", language); }, [language]);

  // ── Fetch live data ───────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    setApiError("");
    try {
      const [dashRes, gigsRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/gigs"),
      ]);
      setUser(dashRes.data);
      setAlerts(dashRes.data.alerts ?? []);
      setGigs(gigsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setApiError(
          err.response?.data?.message ||
          "Could not connect to backend. Is the server running on port 5000?"
        );
      }
    } finally {
      setLoadingData(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived values ────────────────────────────────────────
  const activeGig     = gigs.find((g) => g.status === "active") || null;
  const completedGigs = gigs.filter((g) => g.status === "completed");
  const shiftOn       = !!activeGig;

  const todayEarnings = useMemo(() => {
    const today = new Date().toDateString();
    return completedGigs
      .filter((g) => new Date(g.endTime).toDateString() === today)
      .reduce((s, g) => s + (g.earnings || 0), 0);
  }, [completedGigs]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return gigs.filter((g) =>
      (g.location || "").toLowerCase().includes(q) ||
      g.status.toLowerCase().includes(q)
    );
  }, [searchQuery, gigs]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ── Gig actions ───────────────────────────────────────────
  const toggleShift = async () => {
    if (gigLoading) return;
    setGigLoading(true);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    try {
      if (activeGig) {
        await api.post(`/gigs/${activeGig._id}/complete`);
        setNotifications((n) => [{ id: Date.now(), type: NOTIFICATION_TYPES.SHIFT_END,   message: `Shift ended at ${time}`,   read: false }, ...n]);
      } else {
        await api.post("/gigs/start");
        setNotifications((n) => [{ id: Date.now(), type: NOTIFICATION_TYPES.SHIFT_START, message: `Shift started at ${time}`, read: false }, ...n]);
      }
      await fetchAll();
    } catch (err) {
      setApiError(err.response?.data?.message || "Shift action failed.");
    } finally {
      setGigLoading(false);
    }
  };

  const markAllNotificationsRead = () =>
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));

  const handleFaqSubmit = (e) => {
    e.preventDefault();
    if (!faqInput.trim()) return;
    setFaqItems((items) => [...items, { id: Date.now(), question: faqInput.trim(), answer: null }]);
    setFaqInput("");
  };

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("gs_token");
    localStorage.removeItem("gs_user");
    navigate("/login");
  };

  // ── CHANGE 2 ── Emergency SOS with geolocation + API call ─
  const handleSOS = async () => {
    const confirmed = window.confirm("Send SOS alert to emergency contacts?");
    if (!confirmed) return;

    const getCoords = () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err)
        );
      });

    try {
      let coordinates = [0, 0]; // fallback if location denied
      try {
        const { lat, lng } = await getCoords();
        coordinates = [lng, lat]; // GeoJSON order: [longitude, latitude]
      } catch {
        // location unavailable — still send SOS without precise coords
      }

      await api.post("/safety/sos", {
        location: { coordinates },
        message: "SOS triggered by worker",
      });

      setNotifications((n) => [
        {
          id: Date.now(),
          type: "Emergency SOS",
          message: "Emergency SOS was triggered from this device.",
          read: false,
        },
        ...n,
      ]);
      window.alert("🆘 SOS Alert Sent!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send SOS. Try again.";
      window.alert(`❌ ${msg}`);
    }
  };

  // ── Display helpers ───────────────────────────────────────
  const displayName = user?.name || "Worker";
  const firstName   = displayName.split(" ")[0];
  const initials    = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const greeting    = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";

  // ── Page renderer ─────────────────────────────────────────
  const renderPage = () => {
    if (activeNav === "earnings")
      return <EarningsPage todayEarnings={todayEarnings} completedGigs={completedGigs} />;
    if (activeNav === "history")
      return <ShiftHistoryPage completedGigs={completedGigs} loading={loadingData} />;
    if (activeNav === "community") return <CommunityPage />;
    if (activeNav === "alerts")   return <AlertsPage />;  // ── CHANGE 3 ── wired to new AlertsPage
    if (activeNav === "home") {
      return (
        <>
          {apiError && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", borderRadius: 12, padding: "12px 18px",
              marginBottom: 20, fontSize: 13,
              display: "flex", justifyContent: "space-between",
            }}>
              <span>⚠ {apiError}</span>
              <button onClick={() => setApiError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>✕</button>
            </div>
          )}

          <div className="db-grid">

            {/* Current Session */}
            <div className="db-card db-card--session">
              <div className="db-card-bg-circle" />
              <div className="db-session-content">
                <div className="db-session-left">
                  <span className="db-card-eyebrow">Current Session</span>
                  <div className="db-session-time">
                    <span className="db-session-hrs">
                      {activeGig ? shiftDuration(activeGig.startTime) : "00:00"}
                    </span>
                    <span className="db-session-unit">HRS</span>
                  </div>
                  <div className="db-session-meta">
                    <div className="db-session-meta-item">
                      <span className="db-meta-label">Active Location</span>
                      <span className="db-meta-value">
                        <Icon name="location_on" style={{ fontSize: 14 }} />
                        {activeGig?.location || "Koramangala, BLR"}
                      </span>
                    </div>
                    <div className="db-session-meta-divider" />
                    <div className="db-session-meta-item">
                      <span className="db-meta-label">Battery Level</span>
                      <span className="db-meta-value db-meta-value--green">
                        <Icon name="battery_charging_full" style={{ fontSize: 14 }} />
                        88%
                      </span>
                    </div>
                    <div className="db-session-meta-divider" />
                    <div className="db-session-meta-item">
                      <span className="db-meta-label">Distance Today</span>
                      <span className="db-meta-value">
                        <Icon name="route" style={{ fontSize: 14 }} />
                        34.2 km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="db-card db-card--earnings">
              <div className="db-card-header">
                <span className="db-card-eyebrow">Today's Earnings</span>
                <Icon name="trending_up" className="db-earnings-trend" />
              </div>
              <div className="db-earnings-amount">
                <span className="db-earnings-symbol">₹</span>
                <span className="db-earnings-value">{todayEarnings.toFixed(2)}</span>
              </div>
              <div className="db-earnings-bar-wrap">
                <div className="db-earnings-bar">
                  <div className="db-earnings-bar-fill"
                    style={{ width: `${Math.min((todayEarnings / 1250) * 100, 100)}%` }}
                  />
                </div>
                <span className="db-earnings-bar-label">Goal: ₹1,250 / day</span>
              </div>
              <div className="db-earnings-footer">
                <span className="db-earnings-deliveries">
                  <Icon name="local_shipping" style={{ fontSize: 14 }} />
                  {completedGigs.length} gig{completedGigs.length !== 1 ? "s" : ""} completed
                </span>
              </div>
            </div>

            {/* Alert card */}
            <div className="db-card db-card--alert">
              <div className="db-alert-header">
                <Icon name="report" fill={1} className="db-alert-icon" />
                <span className="db-alert-tag">{alerts.length > 0 ? "Live Alert" : "Proximity Alert"}</span>
              </div>
              <h4 className="db-alert-title">{alerts[0]?.title || "Unsafe Area Warning"}</h4>
              <p className="db-alert-body">
                {alerts[0]?.message ||
                  "High incident rate reported near HSR Layout Sector 2. Maintain high visibility and avoid dark alleys after 9PM."}
              </p>
              <button
                className={`db-ack-btn ${alertAck ? "db-ack-btn--done" : ""}`}
                onClick={() => setAlertAck(true)}
              >
                {alertAck ? "✓ Acknowledged" : "Acknowledge"}
              </button>
            </div>

            {/* Safety Health */}
            <div className="db-card db-card--score">
              <div className="db-score-header">
                <div>
                  <span className="db-card-eyebrow">Safety health</span>
                  <h3 className="db-card-title">Current status</h3>
                </div>
                <span className="db-score-tier">STABLE</span>
              </div>
              <div className="db-score-body">
                <div className="db-score-ring-wrap">
                  <svg viewBox="0 0 36 36" className="db-score-ring">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="rgba(42,108,44,0.15)" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#2a6c2c" strokeWidth="3"
                      strokeDasharray="75, 100" strokeLinecap="round"/>
                  </svg>
                  <div className="db-score-num">7.5<span style={{ fontSize: 11, marginLeft: 2 }}>/10</span></div>
                </div>
                <div className="db-score-info">
                  <p className="db-score-label">Overall environment</p>
                  <p className="db-score-sub">
                    Conditions in your usual working areas are generally safe right now, with a few pockets marked for caution during late evening hours.
                  </p>
                  <div className="db-score-badges">
                    <span className="db-score-badge">Most routes marked low‑risk</span>
                    <span className="db-score-badge">Isolated caution zones in HSR & BTM</span>
                    <span className="db-score-badge">Extra monitoring active after 9 PM</span>
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--db-border)",
                fontSize: 11, color: "var(--db-muted)", display: "flex",
                justifyContent: "space-between", gap: 12, flexWrap: "wrap",
              }}>
                <span>Last update: <strong>2 mins ago</strong></span>
                <button className="db-link" style={{ border: "none", background: "none", padding: 0 }}>
                  See safety insights →
                </button>
              </div>
            </div>

            {/* City Heatmap */}
            <div className="db-card db-card--map">
              <div className="db-card-header">
                <div>
                  <h3 className="db-card-title">City Heat Map</h3>
                  <span className="db-card-eyebrow" style={{ display: "block", marginTop: 2 }}>
                    Real-time Safety & Activity
                  </span>
                </div>
                <div className="db-map-modes">
                  {["SAFETY", "DEMAND"].map((mode) => (
                    <button
                      key={mode}
                      className={`db-mode-btn ${mapMode === mode ? "db-mode-btn--active" : ""}`}
                      onClick={() => setMapMode(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="db-map-container">
                <MapPlaceholder />
                <div className="db-map-legend">
                  <span className="db-legend-title">Legend</span>
                  {[
                    { color: "#2a6c2c",              label: "Secure"   },
                    { color: "#acf4a4",              label: "Moderate" },
                    { color: "rgba(168,56,54,0.65)", label: "Caution"  },
                  ].map(({ color, label }) => (
                    <div key={label} className="db-legend-item">
                      <span className="db-legend-dot" style={{ background: color }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="db-map-footer">
                <span className="db-map-update">
                  <Icon name="update" style={{ fontSize: 14, color: "#2a6c2c" }} />
                  Auto-updates every 5 mins
                </span>
                <a href="#" className="db-link">Open Interactive Map →</a>
              </div>
            </div>

            {/* Expert Advice */}
            <div className="db-card db-card--advice">
              <div className="db-card-header">
                <h3 className="db-card-title">Expert Advice</h3>
                <a href="#" className="db-link">See all →</a>
              </div>
              <div className="db-advice-list">
                {[
                  { badge: "LEGAL",    badgeClass: "db-badge--blue",  icon: "gavel",                 title: "Understanding your rights during night shifts",   meta: "3 min read" },
                  { badge: "WELLNESS", badgeClass: "db-badge--green", icon: "self_improvement",       title: "5-minute posture reset for long delivery routes", meta: "2 min read" },
                  { badge: "FINANCE",  badgeClass: "db-badge--amber", icon: "account_balance_wallet", title: "How to dispute underpayment with evidence",       meta: "4 min read" },
                ].map(({ badge, badgeClass, icon, title, meta }) => (
                  <div key={badge} className="db-advice-item">
                    <div className="db-advice-icon-wrap">
                      <Icon name={icon} fill={1} style={{ fontSize: 20, color: "#2a6c2c" }} />
                    </div>
                    <div className="db-advice-body">
                      <span className={`db-badge ${badgeClass}`}>{badge}</span>
                      <p className="db-advice-title">{title}</p>
                      <span className="db-advice-meta">{meta}</span>
                    </div>
                    <Icon name="chevron_right" className="db-advice-arrow" />
                  </div>
                ))}
              </div>
              <button className="db-explore-btn">Explore Knowledge Hub</button>
            </div>

          </div>
        </>
      );
    }
    return <ProfilePage user={user} language={language} theme={theme} />;
  };

  // ── Loading screen ────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="db-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36,
            border: "3px solid rgba(42,108,44,0.2)",
            borderTop: "3px solid #2a6c2c", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, color: "var(--db-muted)" }}>Loading your GigShield dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────
  return (
    <div className="db-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />

      {/* TOP NAV */}
      <header className="db-topnav">
        <div className="db-topnav-left">
          <div className="db-brand">
            <img src={gigshieldLogo} alt="GigShield" className="db-brand-logo" />
          </div>
          <div className={`db-search-wrap ${searchOpen ? "db-search-wrap--open" : ""}`}>
            <Icon name="search" className="db-search-icon" />
            <input
              type="text"
              placeholder="Search gigs, locations…"
              className="db-search"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="db-search-results">
                {searchResults.map((item) => (
                  <div key={item._id} className="db-search-result-item">
                    <Icon name="history" className="db-search-result-icon" />
                    <div className="db-search-result-text">
                      <div className="db-search-result-title">{item.status} gig</div>
                      <div className="db-search-result-meta">{item.location || fmtDate(item.startTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="db-topnav-right">
          {/* Notifications */}
          <div className="db-notif-wrapper">
            <button
              className="db-icon-btn db-icon-btn--notif"
              onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) markAllNotificationsRead(); }}
            >
              <Icon name="notifications" />
              {unreadCount > 0 && <span className="db-notif-dot" />}
            </button>
            {notifOpen && (
              <div className="db-notif-dropdown">
                <div className="db-notif-header">
                  <span>Notifications</span>
                  <span className="db-notif-count">{unreadCount} new</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="db-notif-empty">No notifications yet.</div>
                ) : notifications.slice(0, 6).map((n) => (
                  <div key={n.id} className="db-notif-item">
                    <Icon
                      name={n.type === NOTIFICATION_TYPES.EARNING ? "currency_rupee" : n.type === NOTIFICATION_TYPES.SHIFT_END ? "logout" : "login"}
                      className="db-notif-icon"
                    />
                    <div className="db-notif-body">
                      <div className="db-notif-title">{n.type}</div>
                      <div className="db-notif-message">{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="db-icon-btn" onClick={() => setFaqOpen(true)} title="FAQ / Ask a question">
            <Icon name="help_outline" />
          </button>

          {/* Profile dropdown */}
          <div className="db-profile-wrapper">
            <button className="db-avatar" onClick={() => setProfileOpen((o) => !o)}>
              {initials}
            </button>
            {profileOpen && (
              <div className="db-profile-menu">
                <div className="db-profile-header">
                  <div className="db-profile-name">{displayName}</div>
                  <div className="db-profile-email">{user?.email || ""}</div>
                </div>
                <button className="db-profile-item" onClick={() => alert("Account settings coming soon.")}>
                  <Icon name="manage_accounts" /><span>Account settings</span>
                </button>
                <button className="db-profile-item" onClick={() => alert("Notification preferences coming soon.")}>
                  <Icon name="notifications_active" /><span>Notification preferences</span>
                </button>
                <button className="db-profile-item" onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}>
                  <Icon name={theme === "light" ? "dark_mode" : "light_mode"} />
                  <span>Switch to {theme === "light" ? "Dark" : "Light"} mode</span>
                </button>
                <div className="db-profile-item" style={{ cursor: "default" }}>
                  <Icon name="translate" />
                  <span style={{ flex: 1 }}>Language</span>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="db-lang-select">
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>
                <button className="db-profile-item" onClick={() => { setFaqOpen(true); setProfileOpen(false); }}>
                  <Icon name="help_center" /><span>FAQ & support</span>
                </button>
                <button className="db-profile-item" onClick={handleLogout}>
                  <Icon name="logout" /><span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="db-sidebar-user">
          <div className="db-sidebar-avatar">{initials}</div>
          <div>
            <div className="db-sidebar-name">{firstName}</div>
            <div className="db-sidebar-tier">
              <span className="db-tier-dot" />
              Professional Shield
            </div>
          </div>
        </div>
        <nav className="db-nav">
          {NAV_LINKS.map(({ icon, label, id }) => (
            <button
              key={id}
              className={`db-nav-item ${activeNav === id ? "db-nav-item--active" : ""}`}
              onClick={() => setActiveNav(id)}
            >
              <Icon name={icon} fill={activeNav === id ? 1 : 0} className="db-nav-icon" />
              <span className="db-nav-label">{label}</span>
            </button>
          ))}
        </nav>
        {/* ── CHANGE 2 ── SOS button now calls handleSOS ── */}
        <div className="db-sos-btn-wrap">
          <button className="db-sos-btn" onClick={handleSOS}>
            <Icon name="emergency_share" fill={1} className="db-sos-icon" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="db-main">
        <div className="db-page-header">
          <div className="db-page-header-text">
            <span className="db-page-eyebrow">Member Dashboard</span>
            <h1 className="db-page-title">
              {activeNav === "home"
                ? `Good ${greeting}, ${firstName}.`
                : NAV_LINKS.find((n) => n.id === activeNav)?.label}
            </h1>
            <p className="db-page-sub">
              {activeNav === "home"
                ? shiftOn
                  ? "Your shift is active and monitored by GigShield Guardian."
                  : "No active shift. Click SHIFT OFF to start monitoring."
                : "View and manage your work with GigShield."}
            </p>
          </div>
          <button
            className={`db-shift-toggle ${shiftOn ? "db-shift-toggle--on" : "db-shift-toggle--off"}`}
            onClick={toggleShift}
            disabled={gigLoading}
          >
            <span className="db-shift-dot" />
            {gigLoading ? "UPDATING…" : shiftOn ? "SHIFT ON" : "SHIFT OFF"}
          </button>
        </div>

        {renderPage()}
      </main>

      {/* FAQ Drawer */}
      {faqOpen && (
        <div className="db-faq-overlay" onClick={() => setFaqOpen(false)}>
          <div className="db-faq-panel" onClick={(e) => e.stopPropagation()}>
            <div className="db-faq-header">
              <h3>FAQ & Support</h3>
              <button className="db-faq-close" onClick={() => setFaqOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="db-faq-list">
              {faqItems.map((item) => (
                <div key={item.id} className="db-faq-item">
                  <div className="db-faq-q">Q: {item.question}</div>
                  <div className="db-faq-a">{item.answer ? `A: ${item.answer}` : "A: Waiting for admin reply…"}</div>
                </div>
              ))}
            </div>
            <form className="db-faq-form" onSubmit={handleFaqSubmit}>
              <label className="db-faq-label">
                Ask a question
                <textarea
                  value={faqInput}
                  onChange={(e) => setFaqInput(e.target.value)}
                  placeholder="Type your question about shifts, safety, or payments…"
                />
              </label>
              <button type="submit" className="db-faq-submit">Send to Admin</button>
            </form>
            <p className="db-faq-note">Admins will review your question and respond here in the FAQ list.</p>
          </div>
        </div>
      )}
    </div>
  );
}
