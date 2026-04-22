import { useState } from "react";
import "../styles/Dashboard.css";
import gigshieldLogo from "../assets/Gigshield Logo.png"; // adjust path if needed

const NAV_LINKS = [
  { icon: "dashboard", label: "Home", id: "home" },
  { icon: "payments", label: "Earnings", id: "earnings" },
  { icon: "history", label: "Shift History", id: "history" },
  { icon: "group", label: "Community", id: "community" },
  { icon: "warning", label: "Alerts", id: "alerts" },
  { icon: "person", label: "Profile", id: "profile" },
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

// SVG map placeholder — no broken external images
function MapPlaceholder({ small = false }) {
  return (
    <div className={`db-map-placeholder ${small ? "db-map-placeholder--small" : ""}`}>
      <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="db-map-svg">
        {/* Grid lines */}
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="220" stroke="rgba(42,108,44,0.1)" strokeWidth="1"/>
        ))}
        {[0,1,2,3,4].map(i => (
          <line key={`h${i}`} x1="0" y1={i*55} x2="400" y2={i*55} stroke="rgba(42,108,44,0.1)" strokeWidth="1"/>
        ))}
        {/* Roads */}
        <path d="M0,110 Q100,90 200,110 Q300,130 400,110" stroke="rgba(42,108,44,0.2)" strokeWidth="3" fill="none"/>
        <path d="M200,0 Q210,55 200,110 Q190,165 200,220" stroke="rgba(42,108,44,0.2)" strokeWidth="3" fill="none"/>
        <path d="M0,60 Q80,55 160,65 Q240,75 320,60 Q360,55 400,60" stroke="rgba(42,108,44,0.12)" strokeWidth="2" fill="none"/>
        <path d="M0,160 Q100,155 200,165 Q300,175 400,160" stroke="rgba(42,108,44,0.12)" strokeWidth="2" fill="none"/>
        <path d="M80,0 Q85,110 80,220" stroke="rgba(42,108,44,0.1)" strokeWidth="1.5" fill="none"/>
        <path d="M320,0 Q315,110 320,220" stroke="rgba(42,108,44,0.1)" strokeWidth="1.5" fill="none"/>
        {/* Heatmap blobs */}
        <ellipse cx="200" cy="110" rx="60" ry="40" fill="rgba(42,108,44,0.18)"/>
        <ellipse cx="200" cy="110" rx="30" ry="20" fill="rgba(42,108,44,0.25)"/>
        <ellipse cx="310" cy="75" rx="35" ry="25" fill="rgba(172,244,164,0.3)"/>
        <ellipse cx="95" cy="155" rx="28" ry="20" fill="rgba(168,56,54,0.15)"/>
        <ellipse cx="340" cy="165" rx="22" ry="16" fill="rgba(172,244,164,0.2)"/>
        {/* Location pin */}
        <circle cx="200" cy="110" r="8" fill="#2a6c2c"/>
        <circle cx="200" cy="110" r="16" fill="rgba(42,108,44,0.2)"/>
        <circle cx="200" cy="110" r="26" fill="rgba(42,108,44,0.08)"/>
        {/* Other pins */}
        <circle cx="310" cy="75" r="5" fill="#acf4a4" stroke="#2a6c2c" strokeWidth="1.5"/>
        <circle cx="95" cy="155" r="5" fill="rgba(168,56,54,0.7)" stroke="#a83836" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

export default function GigShieldDashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [mapMode, setMapMode] = useState("SAFETY");
  const [alertAck, setAlertAck] = useState(false);
  const [shiftOn, setShiftOn] = useState(true);

  return (
    <div className="db-root">
      {/* Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />

      {/* ── TOP NAV ── */}
      <header className="db-topnav">
        <div className="db-topnav-left">
          <div className="db-brand">
            <img
              src={gigshieldLogo}
              alt="GigShield"
              className="db-brand-logo"
            />
          </div>
          <div className="db-search-wrap">
            <Icon name="search" className="db-search-icon" />
            <input
              type="text"
              placeholder="Search reports, earnings, shifts…"
              className="db-search"
            />
          </div>
        </div>
        <div className="db-topnav-right">
          <button className="db-icon-btn db-icon-btn--notif">
            <Icon name="notifications" />
            <span className="db-notif-dot" />
          </button>
          <button className="db-icon-btn"><Icon name="help_outline" /></button>
          <button className="db-icon-btn"><Icon name="settings" /></button>
          <div className="db-avatar">AK</div>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
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
              className={`db-nav-item ${activeNav === id ? "db-nav-item--active" : ""}`}
              onClick={() => setActiveNav(id)}
            >
              <Icon name={icon} fill={activeNav === id ? 1 : 0} className="db-nav-icon" />
              <span className="db-nav-label">{label}</span>
              {id === "alerts" && (
                <span className="db-nav-badge">2</span>
              )}
            </button>
          ))}
        </nav>

        <div className="db-sos-btn-wrap">
          <button className="db-sos-btn">
            <Icon name="emergency_share" fill={1} className="db-sos-icon" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="db-main">

        {/* Page header */}
        <div className="db-page-header">
          <div className="db-page-header-text">
            <span className="db-page-eyebrow">Member Dashboard</span>
            <h1 className="db-page-title">Good afternoon, Arjun.</h1>
            <p className="db-page-sub">Your shift is active and monitored by GigShield Guardian.</p>
          </div>
          <button
            className={`db-shift-toggle ${shiftOn ? "db-shift-toggle--on" : "db-shift-toggle--off"}`}
            onClick={() => setShiftOn(v => !v)}
          >
            <span className="db-shift-dot" />
            {shiftOn ? "SHIFT ON" : "SHIFT OFF"}
          </button>
        </div>

        {/* Bento grid */}
        <div className="db-grid">

          {/* ── Current Session ── */}
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
              <MapPlaceholder small />
            </div>
          </div>

          {/* ── Earnings ── */}
          <div className="db-card db-card--earnings">
            <div className="db-card-header">
              <span className="db-card-eyebrow">Today's Earnings</span>
              <Icon name="trending_up" className="db-earnings-trend" />
            </div>
            <div className="db-earnings-amount">
              <span className="db-earnings-symbol">₹</span>
              <span className="db-earnings-value">850.00</span>
            </div>
            <div className="db-earnings-bar-wrap">
              <div className="db-earnings-bar">
                <div className="db-earnings-bar-fill" style={{ width: "68%" }} />
              </div>
              <span className="db-earnings-bar-label">68% of daily goal</span>
            </div>
            <div className="db-earnings-footer">
              <span className="db-earnings-deliveries">
                <Icon name="local_shipping" style={{ fontSize: 14 }} />
                3 deliveries
              </span>
              <a href="#" className="db-link">View Details →</a>
            </div>
          </div>

          {/* ── Safety Alert ── */}
          <div className="db-card db-card--alert">
            <div className="db-alert-header">
              <Icon name="report" fill={1} className="db-alert-icon" />
              <span className="db-alert-tag">Proximity Alert</span>
            </div>
            <h4 className="db-alert-title">Unsafe Area Warning</h4>
            <p className="db-alert-body">
              High incident rate reported near HSR Layout Sector 2. Maintain high visibility and avoid dark alleys after 9PM.
            </p>
            <button
              className={`db-ack-btn ${alertAck ? "db-ack-btn--done" : ""}`}
              onClick={() => setAlertAck(true)}
            >
              {alertAck ? "✓ Acknowledged" : "Acknowledge"}
            </button>
          </div>

          {/* ── Safety Score ── */}
          <div className="db-card db-card--score">
            <div className="db-score-header">
              <span className="db-card-eyebrow">Safety Score</span>
              <span className="db-score-tier">GOLD TIER</span>
            </div>
            <div className="db-score-body">
              <div className="db-score-ring-wrap">
                <svg viewBox="0 0 36 36" className="db-score-ring">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="rgba(42,108,44,0.12)" strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#2a6c2c" strokeWidth="3"
                    strokeDasharray="92, 100" strokeLinecap="round"
                  />
                </svg>
                <div className="db-score-num">92</div>
              </div>
              <div className="db-score-info">
                <p className="db-score-label">Excellent Safety Record</p>
                <p className="db-score-sub">Keep it up to unlock lower insurance premiums.</p>
                <div className="db-score-badges">
                  <span className="db-score-badge">🛡 No incidents</span>
                  <span className="db-score-badge">⚡ Always online</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── City Heatmap ── */}
          <div className="db-card db-card--map">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-title">City Heat Map</h3>
                <span className="db-card-eyebrow" style={{ display: "block", marginTop: 2 }}>Real-time Safety & Activity</span>
              </div>
              <div className="db-map-modes">
                {["SAFETY", "DEMAND"].map(mode => (
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
                  { color: "#2a6c2c", label: "Secure" },
                  { color: "#acf4a4", label: "Moderate" },
                  { color: "rgba(168,56,54,0.65)", label: "Caution" },
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

          {/* ── Emergency SOS ── */}
          <div className="db-card db-card--sos">
            <div className="db-sos-card-bg" />
            <div className="db-sos-card-content">
              <div className="db-sos-card-icon">
                <Icon name="emergency_share" fill={1} style={{ fontSize: 28, color: "#fff7f6" }} />
              </div>
              <h3 className="db-sos-card-title">Emergency Response</h3>
              <p className="db-sos-card-body">
                One-tap alert to GigShield 24/7 Dispatch, your union rep, and local police.
              </p>
              <button className="db-sos-card-btn">
                Initiate SOS Protocol
              </button>
              <div className="db-sos-contacts">
                <div className="db-sos-contact">
                  <Icon name="support_agent" style={{ fontSize: 14 }} />
                  GigShield Dispatch
                </div>
                <div className="db-sos-contact">
                  <Icon name="groups" style={{ fontSize: 14 }} />
                  Union Rep
                </div>
                <div className="db-sos-contact">
                  <Icon name="local_police" style={{ fontSize: 14 }} />
                  Local Police
                </div>
              </div>
            </div>
          </div>

          {/* ── Expert Advice ── */}
          <div className="db-card db-card--advice">
            <div className="db-card-header">
              <h3 className="db-card-title">Expert Advice</h3>
              <a href="#" className="db-link">See all →</a>
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
      </main>
    </div>
  );
}