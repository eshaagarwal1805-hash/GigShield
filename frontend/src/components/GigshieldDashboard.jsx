import { useState, useMemo, useEffect } from "react";
import "../styles/Dashboard.css";
import gigshieldLogo from "../assets/Gigshield Logo.png"; // adjust path
import { useNavigate } from "react-router-dom";

// NAV without Profile and without numeric badge
const NAV_LINKS = [
  { icon: "dashboard", label: "Home", id: "home" },
  { icon: "payments", label: "Earnings", id: "earnings" },
  { icon: "history", label: "Shift History", id: "history" },
  { icon: "group", label: "Community", id: "community" },
  { icon: "warning", label: "Alerts", id: "alerts" },
];

const Icon = ({ name, fill = 0, className = "", style = {} }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      ...style,
    }}
  >
    {name}
  </span>
);

const JOBS = [
  { id: 1, title: "Grocery Delivery", location: "Koramangala, BLR" },
  { id: 2, title: "Food Delivery", location: "HSR Layout Sector 2" },
  { id: 3, title: "Parcel Pickup", location: "Indiranagar, BLR" },
];

const SHIFTS = [
  { id: 1, date: "Today", hours: "02:15", location: "Koramangala, BLR" },
  { id: 2, date: "Yesterday", hours: "05:40", location: "HSR Layout Sector 2" },
  { id: 3, date: "2 days ago", hours: "04:10", location: "Indiranagar, BLR" },
];

const NOTIFICATION_TYPES = {
  SHIFT_START: "Shift started",
  SHIFT_END: "Shift ended",
  EARNING: "Earning added",
};

function MapPlaceholder({ small = false }) {
  return (
    <div
      className={`db-map-placeholder ${
        small ? "db-map-placeholder--small" : ""
      }`}
    >
      <svg
        viewBox="0 0 400 220"
        xmlns="http://www.w3.org/2000/svg"
        className="db-map-svg"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={`v${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="220"
            stroke="rgba(42,108,44,0.1)"
            strokeWidth="1"
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 55}
            x2="400"
            y2={i * 55}
            stroke="rgba(42,108,44,0.1)"
            strokeWidth="1"
          />
        ))}
        <path
          d="M0,110 Q100,90 200,110 Q300,130 400,110"
          stroke="rgba(42,108,44,0.2)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M200,0 Q210,55 200,110 Q190,165 200,220"
          stroke="rgba(42,108,44,0.2)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M0,60 Q80,55 160,65 Q240,75 320,60 Q360,55 400,60"
          stroke="rgba(42,108,44,0.12)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,160 Q100,155 200,165 Q300,175 400,160"
          stroke="rgba(42,108,44,0.12)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M80,0 Q85,110 80,220"
          stroke="rgba(42,108,44,0.1)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M320,0 Q315,110 320,220"
          stroke="rgba(42,108,44,0.1)"
          strokeWidth="1.5"
          fill="none"
        />
        <ellipse
          cx="200"
          cy="110"
          rx="60"
          ry="40"
          fill="rgba(42,108,44,0.18)"
        />
        <ellipse
          cx="200"
          cy="110"
          rx="30"
          ry="20"
          fill="rgba(42,108,44,0.25)"
        />
        <ellipse
          cx="310"
          cy="75"
          rx="35"
          ry="25"
          fill="rgba(172,244,164,0.3)"
        />
        <ellipse
          cx="95"
          cy="155"
          rx="28"
          ry="20"
          fill="rgba(168,56,54,0.15)"
        />
        <ellipse
          cx="340"
          cy="165"
          rx="22"
          ry="16"
          fill="rgba(172,244,164,0.2)"
        />
        <circle cx="200" cy="110" r="8" fill="#2a6c2c" />
        <circle cx="200" cy="110" r="16" fill="rgba(42,108,44,0.2)" />
        <circle cx="200" cy="110" r="26" fill="rgba(42,108,44,0.08)" />
        <circle
          cx="310"
          cy="75"
          r="5"
          fill="#acf4a4"
          stroke="#2a6c2c"
          strokeWidth="1.5"
        />
        <circle
          cx="95"
          cy="155"
          r="5"
          fill="rgba(168,56,54,0.7)"
          stroke="#a83836"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

/* ---------- PAGE SECTIONS ---------- */

function EarningsPage({ todayEarnings }) {
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
          <div className="db-meta-value" style={{ fontSize: 20 }}>
            ₹{todayEarnings.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="db-meta-label">This week (est.)</div>
          <div className="db-meta-value">₹4,250.00</div>
        </div>
        <div>
          <div className="db-meta-label">Best day this month</div>
          <div className="db-meta-value">₹1,780.00</div>
        </div>
      </div>
    </div>
  );
}

function ShiftHistoryPage() {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <span className="db-card-eyebrow">Shift History</span>
          <h3 className="db-card-title">Recent Shifts</h3>
        </div>
      </div>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead style={{ textAlign: "left", color: "var(--db-muted)" }}>
          <tr>
            <th style={{ padding: "8px 0" }}>Date</th>
            <th>Hours</th>
            <th>Location</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
          {SHIFTS.map((s) => (
            <tr key={s.id} style={{ borderTop: "1px solid var(--db-border)" }}>
              <td style={{ padding: "8px 0" }}>{s.date}</td>
              <td>{s.hours}</td>
              <td>{s.location}</td>
              <td>₹{s.id === 1 ? "850" : s.id === 2 ? "1,250" : "1,050"}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
        Connect with other delivery partners, share tips, and report unsafe
        zones together.
      </p>
      <ul style={{ fontSize: 13, color: "var(--db-muted)", lineHeight: 1.7 }}>
        <li>• Bengaluru Safety WhatsApp group</li>
        <li>• Monthly wellness webinar: “Night shift safety basics”</li>
        <li>• Local union meet-up: 28th April, Koramangala</li>
      </ul>
    </div>
  );
}

function AlertsPage() {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <span className="db-card-eyebrow">Alerts</span>
          <h3 className="db-card-title">Recent Safety Alerts</h3>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--db-red-bdr)",
            background: "var(--db-red-bg)",
            fontSize: 13,
          }}
        >
          <strong>Unsafe Area · HSR Layout Sector 2</strong>
          <br />
          Multiple incidents reported this week after 9PM. Prefer main roads and
          well-lit areas.
        </div>
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--db-border)",
            fontSize: 13,
          }}
        >
          <strong>Heavy Rain Alert · Today Evening</strong>
          <br />
          Expect slower trips and low visibility. Keep rain gear ready and
          avoid speeding.
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ language, theme }) {
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
        <div>
          <div className="db-meta-label">Name</div>
          <div className="db-meta-value">Arjun Kumar</div>
        </div>
        <div>
          <div className="db-meta-label">Email</div>
          <div className="db-meta-value">arjun@example.com</div>
        </div>
        <div>
          <div className="db-meta-label">Current language</div>
          <div className="db-meta-value">
            {language === "en"
              ? "English"
              : language === "hi"
              ? "Hindi"
              : "Unknown"
            }
          </div>
        </div>
        <div>
          <div className="db-meta-label">Theme</div>
          <div className="db-meta-value">
            {theme === "light" ? "Light" : "Dark"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- MAIN COMPONENT ---------- */

export default function GigShieldDashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [mapMode, setMapMode] = useState("SAFETY");
  const [alertAck, setAlertAck] = useState(false);
  const [shiftOn, setShiftOn] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: NOTIFICATION_TYPES.SHIFT_START,
      message: "Shift started at 11:30 AM",
      read: false,
    },
  ]);
  const [notifOpen, setNotifOpen] = useState(false);

  const [todayEarnings, setTodayEarnings] = useState(850);
  const [lastAdded, setLastAdded] = useState(0);

  const [faqOpen, setFaqOpen] = useState(false);
  const [faqInput, setFaqInput] = useState("");
  const [faqItems, setFaqItems] = useState([
    {
      id: 1,
      question: "How does GigShield track my shifts?",
      answer: "Admin: Shifts are tracked using GPS check-ins and app activity logs.",
    },
  ]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("gs_lang", language);
  }, [language]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const jobMatches = JOBS.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
    ).map((j) => ({ type: "job", ...j }));
    const shiftMatches = SHIFTS.filter(
      (s) =>
        s.location.toLowerCase().includes(q) ||
        s.date.toLowerCase().includes(q)
    ).map((s) => ({ type: "shift", ...s }));
    return [...jobMatches, ...shiftMatches];
  }, [searchQuery]);

  const toggleShift = () => {
    setShiftOn((prev) => {
      const next = !prev;
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setNotifications((n) => [
        {
          id: Date.now(),
          type: next
            ? NOTIFICATION_TYPES.SHIFT_START
            : NOTIFICATION_TYPES.SHIFT_END,
          message: next ? `Shift started at ${time}` : `Shift ended at ${time}`,
          read: false,
        },
        ...n,
      ]);
      return next;
    });
  };

  const addEarning = (amount) => {
    setTodayEarnings((prev) => prev + amount);
    setLastAdded(amount);
    setNotifications((n) => [
      {
        id: Date.now(),
        type: NOTIFICATION_TYPES.EARNING,
        message: `+₹${amount} added to today's earnings`,
        read: false,
      },
      ...n,
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));
  };

  const handleFaqSubmit = (e) => {
    e.preventDefault();
    if (!faqInput.trim()) return;
    setFaqItems((items) => [
      ...items,
      { id: Date.now(), question: faqInput.trim(), answer: null },
    ]);
    setFaqInput("");
  };

  const handleLogout = () => {
    localStorage.removeItem("gs_token");
    localStorage.removeItem("gs_user");
    alert("Logged out! (Hook this to navigate to /login)");
  };

  // Emergency SOS handler
  const handleEmergencySOS = () => {
    const confirmSOS = window.confirm(
      "Trigger Emergency SOS? This will alert GigShield Dispatch and your emergency contacts."
    );
    if (!confirmSOS) return;

    setNotifications((n) => [
      {
        id: Date.now(),
        type: "Emergency SOS",
        message: "Emergency SOS was triggered from this device.",
        read: false,
      },
      ...n,
    ]);

    alert(
      "SOS triggered. GigShield Dispatch and your registered contacts have been notified."
    );
  };

  // choose which main content to show
  const renderPage = () => {
    if (activeNav === "earnings")
      return <EarningsPage todayEarnings={todayEarnings} />;
    if (activeNav === "history") return <ShiftHistoryPage />;
    if (activeNav === "community") return <CommunityPage />;
    if (activeNav === "alerts") return <AlertsPage />;
    if (activeNav === "home") {
      // original dashboard bento
      return (
        <>
          <div className="db-grid">
           {/* Current Session (no small map) */}
<div className="db-card db-card--session">
  <div className="db-card-bg-circle" />
  <div className="db-session-content">
    <div className="db-session-left">
      <span className="db-card-eyebrow">Current Session</span>
      <div className="db-session-time">
        <span className="db-session-hrs">02:15</span>
        <span className="db-session-unit">HRS</span>
      </div>
      <div className="db-session-meta">
        <div className="db-session-meta-item">
          <span className="db-meta-label">Active Location</span>
          <span className="db-meta-value">
            <Icon name="location_on" style={{ fontSize: 14 }} />
            Koramangala, BLR
          </span>
        </div>
        <div className="db-session-meta-divider" />
        <div className="db-session-meta-item">
          <span className="db-meta-label">Battery Level</span>
          <span className="db-meta-value db-meta-value--green">
            <Icon
              name="battery_charging_full"
              style={{ fontSize: 14 }}
            />
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
    {/* right side now empty – or you can remove db-session-content flex gap if you want */}
  </div>
</div>

            {/* Earnings card (same as before) */}
            <div className="db-card db-card--earnings">
              <div className="db-card-header">
                <span className="db-card-eyebrow">Today's Earnings</span>
                <Icon name="trending_up" className="db-earnings-trend" />
              </div>
              <div className="db-earnings-amount">
                <span className="db-earnings-symbol">₹</span>
                <span className="db-earnings-value">
                  {todayEarnings.toFixed(2)}
                </span>
              </div>
              {lastAdded > 0 && (
                <div className="db-earnings-added">
                  +₹{lastAdded} just now
                </div>
              )}
              <div className="db-earnings-bar-wrap">
                <div className="db-earnings-bar">
                  <div
                    className="db-earnings-bar-fill"
                    style={{
                      width: `${Math.min(
                        (todayEarnings / 1250) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="db-earnings-bar-label">
                  Goal: ₹1,250 / day
                </span>
              </div>
              <div className="db-earnings-footer">
                <span className="db-earnings-deliveries">
                  <Icon name="local_shipping" style={{ fontSize: 14 }} />
                  3 deliveries
                </span>
                <button
                  className="db-link db-add-earning-btn"
                  onClick={() => addEarning(100)}
                >
                  + Add ₹100 test earning
                </button>
              </div>
            </div>

            {/* Alert card */}
            <div className="db-card db-card--alert">
              <div className="db-alert-header">
                <Icon name="report" fill={1} className="db-alert-icon" />
                <span className="db-alert-tag">Proximity Alert</span>
              </div>
              <h4 className="db-alert-title">Unsafe Area Warning</h4>
              <p className="db-alert-body">
                High incident rate reported near HSR Layout Sector 2. Maintain
                high visibility and avoid dark alleys after 9PM.
              </p>
              <button
                className={`db-ack-btn ${
                  alertAck ? "db-ack-btn--done" : ""
                }`}
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
                        {/* background ring */}
                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(42,108,44,0.15)"
                        strokeWidth="3"
                        />
                        {/* safety health ~ 75% */}
                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2a6c2c"
                        strokeWidth="3"
                        strokeDasharray="75, 100"
                        strokeLinecap="round"
                        />
                        </svg>
                        <div className="db-score-num">
                          7.5<span style={{ fontSize: 11, marginLeft: 2 }}>/10</span>
                          </div>
                          </div>
                          <div className="db-score-info">
                            <p className="db-score-label">Overall environment</p>
                            <p className="db-score-sub">
                              Conditions in your usual working areas are generally safe right now,with a few pockets marked for caution during late evening hours.</p>
                              <div className="db-score-badges">
                                <span className="db-score-badge">Most routes marked low‑risk</span>
                                <span className="db-score-badge">Isolated caution zones in HSR & BTM</span>
                                <span className="db-score-badge">Extra monitoring active after 9 PM</span>
                                </div>
                                </div>
                                </div>
                                <div
                                style={{
                                  marginTop: 12,
                                  paddingTop: 12,
                                  borderTop: "1px solid var(--db-border)",
                                  fontSize: 11,
                                  color: "var(--db-muted)",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 12,
                                  flexWrap: "wrap",
                                }}>
                                  <span>Last update: <strong>2 mins ago</strong></span>
                                  <button
                                  className="db-link"
                                  style={{ border: "none", background: "none", padding: 0 }}>
                                    See safety insights →</button>
                                    </div>
                            </div>
            {/* City Heatmap */}
            <div className="db-card db-card--map">
              <div className="db-card-header">
                <div>
                  <h3 className="db-card-title">City Heat Map</h3>
                  <span
                    className="db-card-eyebrow"
                    style={{ display: "block", marginTop: 2 }}
                  >
                    Real-time Safety & Activity
                  </span>
                </div>
                <div className="db-map-modes">
                  {["SAFETY", "DEMAND"].map((mode) => (
                    <button
                      key={mode}
                      className={`db-mode-btn ${
                        mapMode === mode ? "db-mode-btn--active" : ""
                      }`}
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
                    { color: "#2a6c2c", label: "Secure" },
                    { color: "#acf4a4", label: "Moderate" },
                    { color: "rgba(168,56,54,0.65)", label: "Caution" },
                  ].map(({ color, label }) => (
                    <div key={label} className="db-legend-item">
                      <span
                        className="db-legend-dot"
                        style={{ background: color }}
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="db-map-footer">
                <span className="db-map-update">
                  <Icon
                    name="update"
                    style={{ fontSize: 14, color: "#2a6c2c" }}
                  />
                  Auto-updates every 5 mins
                </span>
                <a href="#" className="db-link">
                  Open Interactive Map →
                </a>
              </div>
            </div>

            {/* Expert Advice */}
            <div className="db-card db-card--advice">
              <div className="db-card-header">
                <h3 className="db-card-title">Expert Advice</h3>
                <a href="#" className="db-link">
                  See all →
                </a>
              </div>
              <div className="db-advice-list">
                {[
                  {
                    badge: "LEGAL",
                    badgeClass: "db-badge--blue",
                    icon: "gavel",
                    title: "Understanding your rights during night shifts",
                    meta: "3 min read",
                  },
                  {
                    badge: "WELLNESS",
                    badgeClass: "db-badge--green",
                    icon: "self_improvement",
                    title: "5-minute posture reset for long delivery routes",
                    meta: "2 min read",
                  },
                  {
                    badge: "FINANCE",
                    badgeClass: "db-badge--amber",
                    icon: "account_balance_wallet",
                    title: "How to dispute underpayment with evidence",
                    meta: "4 min read",
                  },
                ].map(({ badge, badgeClass, icon, title, meta }) => (
                  <div key={badge} className="db-advice-item">
                    <div className="db-advice-icon-wrap">
                      <Icon
                        name={icon}
                        fill={1}
                        style={{ fontSize: 20, color: "#2a6c2c" }}
                      />
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

    // fallback: profile page if you want to navigate to it later
    return <ProfilePage language={language} theme={theme} />;
  };

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
            <img
              src={gigshieldLogo}
              alt="GigShield"
              className="db-brand-logo"
            />
          </div>

          {/* Search */}
          <div
            className={`db-search-wrap ${
              searchOpen ? "db-search-wrap--open" : ""
            }`}
          >
            <Icon name="search" className="db-search-icon" />
            <input
              type="text"
              placeholder="Search jobs, locations, shifts…"
              className="db-search"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => {
                setTimeout(() => setSearchOpen(false), 150);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="db-search-results">
                {searchResults.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="db-search-result-item"
                  >
                    <Icon
                      name={item.type === "job" ? "work" : "history"}
                      className="db-search-result-icon"
                    />
                    <div className="db-search-result-text">
                      <div className="db-search-result-title">
                        {item.type === "job"
                          ? item.title
                          : `${item.date} shift`}
                      </div>
                      <div className="db-search-result-meta">
                        {item.location || `${item.hours} · ${item.location}`}
                      </div>
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
              onClick={() => {
                setNotifOpen((o) => !o);
                if (!notifOpen) markAllNotificationsRead();
              }}
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
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div key={n.id} className="db-notif-item">
                      <Icon
                        name={
                          n.type === NOTIFICATION_TYPES.EARNING
                            ? "currency_rupee"
                            : n.type === NOTIFICATION_TYPES.SHIFT_END
                            ? "logout"
                            : "login"
                        }
                        className="db-notif-icon"
                      />
                      <div className="db-notif-body">
                        <div className="db-notif-title">{n.type}</div>
                        <div className="db-notif-message">{n.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* FAQ quick open */}
          <button
            className="db-icon-btn"
            onClick={() => setFaqOpen(true)}
            title="FAQ / Ask a question"
          >
            <Icon name="help_outline" />
          </button>

          {/* Profile dropdown (top-right) */}
          <div className="db-profile-wrapper">
            <button
              className="db-avatar"
              onClick={() => setProfileOpen((o) => !o)}
            >
              AK
            </button>
            {profileOpen && (
              <div className="db-profile-menu">
                <div className="db-profile-header">
                  <div className="db-profile-name">Arjun Kumar</div>
                  <div className="db-profile-email">arjun@example.com</div>
                </div>

                <button
                  className="db-profile-item"
                  onClick={() => alert("Account settings coming soon.")}
                >
                  <Icon name="manage_accounts" />
                  <span>Account settings</span>
                </button>

                <button
                  className="db-profile-item"
                  onClick={() => alert("Notification preferences coming soon.")}
                >
                  <Icon name="notifications_active" />
                  <span>Notification preferences</span>
                </button>

                <button
                  className="db-profile-item"
                  onClick={() =>
                    setTheme((t) => (t === "light" ? "dark" : "light"))
                  }
                >
                  <Icon
                    name={theme === "light" ? "dark_mode" : "light_mode"}
                  />
                  <span>
                    Switch to {theme === "light" ? "Dark" : "Light"} mode
                  </span>
                </button>

                <div className="db-profile-item" style={{ cursor: "default" }}>
                  <Icon name="translate" />
                  <span style={{ flex: 1 }}>Language</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="db-lang-select"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>

                <button
                  className="db-profile-item"
                  onClick={() => {
                    setFaqOpen(true);
                    setProfileOpen(false);
                  }}
                >
                  <Icon name="help_center" />
                  <span>FAQ & support</span>
                </button>

                <button className="db-profile-item" onClick={handleLogout}>
                  <Icon name="logout" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="db-sidebar-user">
          <div className="db-sidebar-avatar">AK</div>
          <div>
            <div className="db-sidebar-name">Arjun Kumar</div>
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
              className={`db-nav-item ${
                activeNav === id ? "db-nav-item--active" : ""
              }`}
              onClick={() => setActiveNav(id)}
            >
              <Icon
                name={icon}
                fill={activeNav === id ? 1 : 0}
                className="db-nav-icon"
              />
              <span className="db-nav-label">{label}</span>
            </button>
          ))}
        </nav>

                <div className="db-sos-btn-wrap">
          <button className="db-sos-btn" onClick={handleEmergencySOS}>
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
                ? "Good afternoon, Arjun."
                : NAV_LINKS.find((n) => n.id === activeNav)?.label}
            </h1>
            <p className="db-page-sub">
              {activeNav === "home"
                ? "Your shift is active and monitored by GigShield Guardian."
                : "View and manage your work with GigShield."}
            </p>
          </div>
          <button
            className={`db-shift-toggle ${
              shiftOn ? "db-shift-toggle--on" : "db-shift-toggle--off"
            }`}
            onClick={toggleShift}
          >
            <span className="db-shift-dot" />
            {shiftOn ? "SHIFT ON" : "SHIFT OFF"}
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
              <button
                className="db-faq-close"
                onClick={() => setFaqOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="db-faq-list">
              {faqItems.map((item) => (
                <div key={item.id} className="db-faq-item">
                  <div className="db-faq-q">Q: {item.question}</div>
                  <div className="db-faq-a">
                    {item.answer
                      ? `A: ${item.answer}`
                      : "A: Waiting for admin reply…"}
                  </div>
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
              <button type="submit" className="db-faq-submit">
                Send to Admin
              </button>
            </form>
            <p className="db-faq-note">
              Admins will review your question and respond here in the FAQ list.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}