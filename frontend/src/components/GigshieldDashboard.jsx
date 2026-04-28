import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import "../styles/Dashboard.css";
import gigshieldLogo from "../assets/Gigshield Logo.png";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import RiskReportForm from "./RiskReportForm";
import HeatmapView from "./HeatmapView";
import AccountSettingsPage from "../pages/AccountSettingsPage";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { icon: "dashboard",  label: "Home",         id: "home" },
  { icon: "payments",   label: "Earnings",      id: "earnings" },
  { icon: "history",    label: "Shift History", id: "history" },
  { icon: "group",      label: "Community",     id: "community" },
  { icon: "warning",    label: "Alerts",        id: "alerts" },
  { icon: "manage_accounts", label: "Account Settings", id: "account" },
];

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

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
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

function msToHHMM(ms) {
  if (!ms || ms <= 0) return "0h 0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

// ─────────────────────────────────────────────────────────────
//  Small reusable UI pieces
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
//  Account Settings Modal
// ─────────────────────────────────────────────────────────────

function AccountSettingsModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name:        user?.name        || "",
    email:       user?.email       || "",
    phone:       user?.phone       || "",
    job:         user?.job         || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("profile"); // 'profile' | 'security'

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (tab === "security") {
      if (form.newPassword !== form.confirmPassword) {
        setError("New passwords do not match."); return;
      }
      if (form.newPassword && form.newPassword.length < 6) {
        setError("Password must be at least 6 characters."); return;
      }
    }
    setSaving(true);
    try {
      const payload = tab === "profile"
        ? { name: form.name, email: form.email, phone: form.phone, job: form.job }
        : { oldPassword: form.oldPassword, newPassword: form.newPassword };
      const res = await api.put("/user/profile", payload);
      setSuccess("Saved successfully!");
      if (onSave) onSave(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={(e) => e.stopPropagation()}>
        <div className="db-modal-header">
          <h3 className="db-modal-title">Account Settings</h3>
          <button className="db-modal-close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="db-modal-tabs">
          <button
            className={`db-modal-tab ${tab === "profile" ? "db-modal-tab--active" : ""}`}
            onClick={() => setTab("profile")}
          >
            <Icon name="person" style={{ fontSize: 15 }} /> Profile
          </button>
          <button
            className={`db-modal-tab ${tab === "security" ? "db-modal-tab--active" : ""}`}
            onClick={() => setTab("security")}
          >
            <Icon name="lock" style={{ fontSize: 15 }} /> Security
          </button>
        </div>

        <div className="db-modal-body">
          {tab === "profile" && (
            <div className="db-modal-fields">
              <label className="db-field-label">
                Full Name
                <input
                  className="db-field-input"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Your full name"
                />
              </label>
              <label className="db-field-label">
                Email
                <input
                  className="db-field-input"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="your@email.com"
                />
              </label>
              <label className="db-field-label">
                Phone Number
                <input
                  className="db-field-input"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+91 00000 00000"
                />
              </label>
              <label className="db-field-label">
                Job / Role
                <input
                  className="db-field-input"
                  value={form.job}
                  onChange={handleChange("job")}
                  placeholder="e.g. Delivery Partner, Driver"
                />
              </label>
            </div>
          )}
          {tab === "security" && (
            <div className="db-modal-fields">
              <label className="db-field-label">
                Current Password
                <input
                  className="db-field-input"
                  type="password"
                  value={form.oldPassword}
                  onChange={handleChange("oldPassword")}
                  placeholder="Enter current password"
                />
              </label>
              <label className="db-field-label">
                New Password
                <input
                  className="db-field-input"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange("newPassword")}
                  placeholder="Min. 6 characters"
                />
              </label>
              <label className="db-field-label">
                Confirm New Password
                <input
                  className="db-field-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Repeat new password"
                />
              </label>
            </div>
          )}

          {error   && <p className="db-modal-error">⚠ {error}</p>}
          {success && <p className="db-modal-success">✓ {success}</p>}
        </div>

        <div className="db-modal-footer">
          <button className="db-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="db-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Page sections
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

function AlertsPage() {
  return (
    <div style={{ maxWidth: 780, display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Report a Risk ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(168,56,54,0.08)",
            border: "1px solid rgba(168,56,54,0.18)",
          }}>
            <span className="material-symbols-outlined"
              style={{ fontSize: 15, color: "var(--db-red)", fontVariationSettings: "'FILL' 1" }}>
              report
            </span>
          </span>
        </div>
        <RiskReportForm />
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid var(--db-border)" }} />

      {/* ── Safety Heatmap ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(42,108,44,0.08)",
            border: "1px solid rgba(42,108,44,0.18)",
          }}>
            <span className="material-symbols-outlined"
              style={{ fontSize: 15, color: "var(--db-primary)", fontVariationSettings: "'FILL' 1" }}>
              map
            </span>
          </span>
          <span style={{ fontFamily: "var(--db-font-head)", fontWeight: 700, fontSize: 16, color: "var(--db-text)" }}>
            Safety Heatmap
          </span>
        </div>
        <HeatmapView />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function GigShieldDashboard() {
  const navigate = useNavigate();

  // ── UI state ───────────────────────────────────────────────
  const [activeNav,       setActiveNav]       = useState("home");
  const [mapMode,         setMapMode]         = useState("SAFETY");
  const [alertAck,        setAlertAck]        = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [notifOpen,       setNotifOpen]       = useState(false);
  const [faqOpen,         setFaqOpen]         = useState(false);
  const [faqInput,        setFaqInput]        = useState("");
  const [profileOpen,     setProfileOpen]     = useState(false);
  const [accountOpen,     setAccountOpen]     = useState(false);
const [theme, setTheme] = useState(() =>
  localStorage.getItem("gs_theme") || "light"
);

/* GLOBAL THEME APPLIER */
useEffect(() => {
  localStorage.setItem("gs_theme", theme);

  // Apply to entire app (THIS is what makes everything switch)
  document.documentElement.setAttribute("data-theme", theme);

  // optional fallback for legacy css
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
}, [theme]);  const [language,        setLanguage]        = useState(() => localStorage.getItem("gs_lang") || "en");
  const [faqItems, setFaqItems] = useState([]);

useEffect(() => {
  const fetchFaqs = async () => {
    try {
      const res = await api.get("/faq");
      setFaqItems(res.data);
    } catch (err) {
      console.error("FAQ fetch failed", err);
    }
  };
  fetchFaqs();
}, []);
  const [notifications,   setNotifications]   = useState([]);
  const [shiftStart, setShiftStart] = useState(() => {
  const saved = localStorage.getItem("shiftStart");
  return saved ? new Date(saved) : null;
});

  // ── Live data state ────────────────────────────────────────
  const [user,        setUser]        = useState(null);
  const [gigs,        setGigs]        = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError,    setApiError]    = useState("");
  const [safetyScore,    setSafetyScore]    = useState(7.5);
  const [nearbyReports,  setNearbyReports]  = useState([]);
  const [todayEarningsDB, setTodayEarningsDB] = useState(0);
  const [userLocation, setUserLocation] = useState("");
  const [gigLoading,  setGigLoading]  = useState(false);
  const [jobs, setJobs] = useState([]);
  
  // ── Live timer state ───────────────────────────────────────
  const [liveMs,    setLiveMs]    = useState(0);   // ms elapsed since shift start
  const timerRef = useRef(null);

  // ── Theme / lang effects ───────────────────────────────────
  useEffect(() => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeout = setTimeout(() => {
    localStorage.removeItem("shiftStart");
    setShiftStart(null);

    setNotifications((n) => [
      {
        id: Date.now(),
        type: "RESET",
        title: "New Day Started",
        message: "Shift reset for new day",
        read: false,
        timestamp: new Date().toISOString(),
      },
      ...n,
    ]);
  }, midnight - now);

  return () => clearTimeout(timeout);
}, []);

  useEffect(() => { localStorage.setItem("gs_lang", language); }, [language]);

  // ── Fetch live data ────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    setApiError("");
    try {
      const [dashRes, gigsRes] = await Promise.all([
        api.get("/dashboard"), 
      ]);
      setUser(dashRes.data.user);
      setAlerts(dashRes.data.dashboard?.alerts ?? []);
      setGigs(gigsRes.data);
      } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoadingData(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  // Fetch jobs separately
useEffect(() => {
  api.get("/jobs")
    .then((res) => setJobs(res.data ?? []))
    .catch((err) => console.error("Jobs fetch failed:", err));
}, []);

// Fetch safety/earnings separately
useEffect(() => {
  api.get("/dashboard")
    .then((res) => {
      setSafetyScore(res.data.safetyScore ?? 7.5);
      setNearbyReports(res.data.nearbyReports ?? []);
      setTodayEarningsDB(res.data.todayEarnings ?? 0);
    })
    .catch((err) => console.error("Safety fetch failed:", err));
}, []);

  const saveStatusToBackend = useCallback(async (locationData) => {
  try {
    await api.patch("/dashboard/status", {
      location: locationData,
    });
  } catch (err) {
    console.error("Failed to save status:", err);
  }
}, []);
  useEffect(() => {
  if (!navigator.geolocation) return;
  if (userLocation && userLocation !== "Location unavailable") return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      const cached = localStorage.getItem("gs_location");
      const cachedTime = localStorage.getItem("gs_location_time");
      const fiveMinutes = 5 * 60 * 1000;

      if (cached && cachedTime && Date.now() - parseInt(cachedTime) < fiveMinutes) {
        setUserLocation(cached);
        return;
      }

      const saveLocation = (locationLabel) => {
        localStorage.setItem("gs_location", locationLabel);
        localStorage.setItem("gs_location_time", Date.now().toString());
        setUserLocation(locationLabel);
        saveStatusToBackend({ label: locationLabel, coordinates: [longitude, latitude] });
      };

      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.city) {
            const label = data.locality || data.city;
            const city = data.city;
            const locationLabel = label && label !== city
              ? `${label}, ${city.slice(0, 3).toUpperCase()}`
              : city;
            saveLocation(locationLabel);
          } else {
            throw new Error("No city");
          }
        })
        .catch(() => {
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            headers: { "Accept-Language": "en" }
          })
            .then((r) => r.json())
            .then((data) => {
              const addr = data?.address;
              if (!addr) throw new Error("No address");
              const label = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || "";
              const city = addr.city || addr.town || addr.state || "";
              const locationLabel = label && label !== city
                ? `${label}, ${city.slice(0, 3).toUpperCase()}`
                : city || "Unknown";
              saveLocation(locationLabel);
            })
            .catch(() => {
              const old = localStorage.getItem("gs_location");
              setUserLocation(old || "Location unavailable");
            });
        });
    },
    (err) => {
      console.error("Geolocation error:", err.code, err.message);
      const cached = localStorage.getItem("gs_location");
      setUserLocation(cached || "Location unavailable");
    },
    { enableHighAccuracy: true }
  );
}, [saveStatusToBackend]);

  // ── Daily notification reset at midnight ──────────────────
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const t = setTimeout(() => {
      // Clear today's shift notifications at midnight; keep others
      setNotifications((prev) =>
        prev.filter((n) => !["SHIFT_START", "SHIFT_END", "SHIFT_TOTAL"].includes(n.type))
      );
    }, msUntilMidnight);
    return () => clearTimeout(t);
  }, []);

  // ── Derived values ─────────────────────────────────────────
  const activeGig     = gigs.find((g) => g.status === "active") || null;
  const completedGigs = gigs.filter((g) => g.status === "completed");
  const shiftOn = !!shiftStart;

  // ── Live timer: tick every minute while shift is on ────────
  useEffect(() => {
  if (!shiftStart) return;

  const interval = setInterval(() => {
    setLiveMs(Date.now() - new Date(shiftStart).getTime());
  }, 1000);

  return () => clearInterval(interval);
}, [shiftStart]);

  // ── Today's worked time (completed gigs today + live) ──────
 const todayWorkedMs = shiftOn ? liveMs : 0;

  const todayEarnings = todayEarningsDB;

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

  // ── Gig actions ────────────────────────────────────────────
  const toggleShift = async () => {
  if (gigLoading) return;
  setGigLoading(true);
  const now = new Date();
  try {
    if (shiftStart) {
      const workedMs = now - new Date(shiftStart);
      localStorage.removeItem("shiftStart");
      setNotifications((n) => [
        {
          id: Date.now(),
          type: "SHIFT_END",
          icon: "logout",
          title: "Shift Ended",
          message: `Worked ${msToHHMM(workedMs)}`,
          read: false,
          timestamp: now.toISOString(),
        },
        {
          id: Date.now() + 1,
          type: "SHIFT_TOTAL",
          icon: "payments",
          title: "Today's Earnings",
          message: `Total earned: ₹${todayEarnings.toFixed(2)}`,
          read: false,
          timestamp: now.toISOString(),
        },
        ...n,
      ]);
      setShiftStart(null);
    } else {
      localStorage.setItem("shiftStart", now.toISOString());
      setShiftStart(now);
      setNotifications((n) => [
        {
          id: Date.now(),
          type: "SHIFT_START",
          icon: "login",
          title: "Shift Started",
          message: `Started at ${fmtTime(now)}`,
          read: false,
          timestamp: now.toISOString(),
        },
        ...n,
      ]);
    }
  } finally {
    setGigLoading(false);
  }
};

  const markAllNotificationsRead = () =>
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));

  const handleFaqSubmit = async (e) => {
  e.preventDefault();
  if (!faqInput.trim()) return;
  try {
    const res = await api.post("/faq", { question: faqInput.trim() });
    setFaqItems((items) => [res.data, ...items]);
    setFaqInput("");
  } catch (err) {
    console.error("FAQ submit failed", err);
  }
};

useEffect(() => {
  const handleClickOutside = () => {
    setNotifOpen(false);
    setProfileOpen(false);
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("gs_token");
    localStorage.removeItem("gs_user");
    navigate("/login");
  };

  // ── Emergency SOS ──────────────────────────────────────────
  const handleSOS = async () => {
    const confirmed = window.confirm("Send SOS alert to emergency contacts?");
    if (!confirmed) return;
    const getCoords = () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("Geolocation not supported")); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err)
        );
      });
    try {
      let coordinates = [0, 0];
      try {
        const { lat, lng } = await getCoords();
        coordinates = [lng, lat];
      } catch { /* location unavailable */ }
      await api.post("/safety/sos", {
        location: { coordinates },
        message: "SOS triggered by worker",
      });
      setNotifications((n) => [{
        id: Date.now(),
        type: "SOS",
        icon: "emergency_share",
        title: "Emergency SOS",
        message: "Emergency SOS was triggered from this device.",
        read: false,
        timestamp: new Date().toISOString(),
      }, ...n]);
      window.alert("🆘 SOS Alert Sent!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send SOS. Try again.";
      window.alert(`❌ ${msg}`);
    }
  };

  // ── Profile update callback ─────────────────────────────────
  const handleProfileUpdate = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  // ── Display helpers ────────────────────────────────────────
  const displayName = user?.name?.trim() || "User";
  const firstName = displayName.split(" ")[0];
  const initials    = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const getGreeting = () => {
  const h = new Date().getHours(); // automatically uses device's local timezone
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const greeting = getGreeting();

  // Live display string for the timer card
  const liveTimerStr = useMemo(() => {
    const ms = shiftOn ? liveMs : todayWorkedMs;
    const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [shiftOn, liveMs, todayWorkedMs]);

  // ── Page renderer ──────────────────────────────────────────
  const renderPage = () => {
    if (activeNav === "earnings")
      return <EarningsPage todayEarnings={todayEarnings} completedGigs={completedGigs} />;
    if (activeNav === "history")
      return <ShiftHistoryPage completedGigs={completedGigs} loading={loadingData} />;
    if (activeNav === "community") return <CommunityPage />;
    if (activeNav === "alerts")   return <AlertsPage />;
    if (activeNav === "account") return <AccountSettingsPage />;    if (activeNav === "home") {
      return (
        <>
          <div className="db-grid">

            {/* Current Session */}
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
            <div className={`db-card db-card--alert ${nearbyReports.length === 0 ? "db-card--alert-safe" : ""}`}>
              <div className="db-alert-header">
                <Icon
      name={nearbyReports.length === 0 ? "check_circle" : "report"}
      fill={1}
      className={nearbyReports.length === 0 ? "db-alert-icon--safe" : "db-alert-icon"}
    />
    <span className={nearbyReports.length === 0 ? "db-alert-tag--safe" : "db-alert-tag"}>
      {nearbyReports.length === 0 ? "AREA CLEAR" : "PROXIMITY ALERT"}
    </span>
  </div>
  <h4 className="db-alert-title">
    {nearbyReports.length === 0
      ? "Your Area Looks Safe"
      : `${nearbyReports[0].category.charAt(0).toUpperCase() + nearbyReports[0].category.slice(1)} Reported Nearby`}
  </h4>
  <p className="db-alert-body">
    {nearbyReports.length === 0
      ? "No risk reports within 5km of your location right now. Stay alert and safe!"
      : nearbyReports[0].description}
  </p>
  {nearbyReports.length > 0 && (
    <button
      className={`db-ack-btn ${alertAck ? "db-ack-btn--done" : ""}`}
      onClick={() => setAlertAck(true)}
    >
      {alertAck ? "✓ Acknowledged" : "Acknowledge"}
    </button>
  )}
</div>

            {/* Safety Health */}
            <div className="db-card db-card--score">
              <div className="db-score-header">
                <div>
                  <span className="db-card-eyebrow">Safety health</span>
                  <h3 className="db-card-title">Current status</h3>
                </div>
                <span className="db-score-tier">
                  {safetyScore >= 8 ? "SAFE" : safetyScore >= 6 ? "STABLE" : safetyScore >= 4 ? "CAUTION" : "DANGER"}
                  </span>
              </div>
              <div className="db-score-body">
                <div className="db-score-ring-wrap">
                  <svg viewBox="0 0 36 36" className="db-score-ring">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="rgba(42,108,44,0.15)" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#2a6c2c" strokeWidth="3"
                      strokeDasharray={`${(safetyScore / 10) * 100}, 100`} strokeLinecap="round"/>
                  </svg>
                  <div className="db-score-num">{safetyScore}<span style={{ fontSize: 11, marginLeft: 2 }}>/10</span></div>                </div>
                <div className="db-score-info">
                  <p className="db-score-label">Overall environment</p>
                  <p className="db-score-sub">
                    {nearbyReports.length === 0
                    ? "No risk reports near your location. Conditions look safe right now."
                    : `${nearbyReports.length} risk report${nearbyReports.length > 1 ? "s" : ""} found within 5km of your location. Stay alert.`}                  </p>
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

            {/* Open Jobs */}
<div className="db-card db-card--advice">
  <div className="db-card-header">
    <h3 className="db-card-title">Open Gig Jobs</h3>
    <span className="db-card-eyebrow" style={{ color: "var(--db-primary)" }}>
      {jobs.length} available
    </span>
  </div>

  {jobs.length === 0 ? (
    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--db-muted)" }}>
      <Icon name="work_off" style={{ fontSize: 32, marginBottom: 8, display: "block" }} />
      <p style={{ fontSize: 13 }}>No open jobs right now. Check back later!</p>
    </div>
  ) : (
    <div className="db-advice-list">
      {jobs.slice(0, 4).map((job) => (
        <div key={job._id} className="db-advice-item">
          <div className="db-advice-icon-wrap">
            <Icon name="work" fill={1} style={{ fontSize: 20, color: "#2a6c2c" }} />
          </div>
          <div className="db-advice-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="db-badge db-badge--green">{job.platform}</span>
              <span className="db-badge db-badge--blue">{job.location}</span>
            </div>
            <p className="db-advice-title">{job.title}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <span className="db-advice-meta" style={{ color: "var(--db-primary)", fontWeight: 700 }}>
                ₹{job.pay}/day
              </span>
              <span className="db-advice-meta">{job.description.slice(0, 60)}...</span>
            </div>
          </div>
          <Icon name="chevron_right" className="db-advice-arrow" />
        </div>
      ))}
    </div>
  )}

  <button className="db-explore-btn" onClick={() => setActiveNav("community")}>
    View All Jobs →
  </button>
</div>

          </div>
        </>
      );
    }
    return null;
  };

  // ── Loading screen ─────────────────────────────────────────
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

  // ── Main render ────────────────────────────────────────────
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
          <div className="db-notif-wrapper" onClick={(e) => e.stopPropagation()}>
            <button
              className="db-icon-btn db-icon-btn--notif"
              onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); setFaqOpen(false); if (!notifOpen) markAllNotificationsRead(); }}
            >
              <Icon name="notifications" />
              {unreadCount > 0 && <span className="db-notif-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className="db-notif-dropdown">
                <div className="db-notif-header">
                  <span>Notifications</span>
                  <span className="db-notif-count">{unreadCount} new</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="db-notif-empty">
                    <Icon name="notifications_none" style={{ fontSize: 28, color: "var(--db-muted)", marginBottom: 6 }} />
                    <p>No notifications yet.</p>
                    <p style={{ fontSize: 11 }}>Start a shift to see updates here.</p>
                  </div>
                ) : notifications.slice(0, 8).map((n) => (
                  <div key={n.id} className={`db-notif-item ${n.type === "SHIFT_START" ? "db-notif-item--start" : n.type === "SHIFT_END" ? "db-notif-item--end" : n.type === "SHIFT_TOTAL" ? "db-notif-item--total" : ""}`}>
                    <div className="db-notif-icon-wrap">
                      <Icon
                        name={n.icon || (n.type === "SHIFT_START" ? "login" : n.type === "SHIFT_END" ? "logout" : "schedule")}
                        className="db-notif-icon"
                      />
                    </div>
                    <div className="db-notif-body">
                      <div className="db-notif-title">{n.title || n.type}</div>
                      <div className="db-notif-message">{n.message}</div>
                      {n.timestamp && (
                        <div className="db-notif-time">{fmtTime(n.timestamp)}</div>
                      )}
                    </div>
                  </div>
                ))}
                {notifications.length > 8 && (
                  <div className="db-notif-more">
                    +{notifications.length - 8} more notifications
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="db-icon-btn" onClick={() => { setFaqOpen(true); setNotifOpen(false); setProfileOpen(false); }} title="FAQ / Ask a question">
            <Icon name="help_outline" />
          </button>

          {/* Profile dropdown — simplified */}
          <div className="db-profile-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="db-avatar" onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); setFaqOpen(false); }}>
              {initials}
            </button>
            {profileOpen && (
              <div className="db-profile-menu">
                <div className="db-profile-header">
                  <div className="db-profile-name">{displayName}</div>
                  <div className="db-profile-email">{user?.email || ""}</div>
                </div>

                {/* Dark / Light mode */}
                <button
                  className="db-profile-item"
                  onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}
                >
                  <Icon name={theme === "light" ? "dark_mode" : "light_mode"} />
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </button>

                {/* Language */}
                <div className="db-profile-item db-profile-item--lang">
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

                {/* Logout */}
                <div className="db-profile-divider" />
                <button className="db-profile-item db-profile-item--logout" onClick={handleLogout}>
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
            {/* Show actual user name from database */}
            <div className="db-sidebar-name">{displayName}</div>
            <div className="db-sidebar-tier">
              <span className="db-tier-dot" />
              {user?.workerType || "Gig Worker"}
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
            <h1 className="db-page-title">
              {activeNav === "home"
                ? `${greeting}, ${firstName}.`
                : NAV_LINKS.find((n) => n.id === activeNav)?.label}
            </h1>
            <p className="db-page-sub">
  {activeNav === "home"
    ? shiftOn
      ? `Shift active — ${msToHHMM(liveMs)} and counting. GigShield is monitoring.`
      : "No active shift. Click SHIFT OFF to start monitoring."
    : ""}
</p>
          </div>

          {/* Shift Toggle */}
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
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Support & FAQ</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--db-muted)" }}>
            Questions are reviewed by our admin team
          </p>
        </div>
        <button className="db-faq-close" onClick={() => setFaqOpen(false)}>
          <Icon name="close" />
        </button>
      </div>

      <form className="db-faq-form" onSubmit={handleFaqSubmit}>
        <label className="db-faq-label">
          Ask a question
          <textarea
            value={faqInput}
            onChange={(e) => setFaqInput(e.target.value)}
            placeholder="Type your question about shifts, safety, or payments…"
            rows={3}
          />
        </label>
        <button type="submit" className="db-faq-submit">
          <Icon name="send" style={{ fontSize: 15 }} /> Submit Question
        </button>
      </form>

      <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 600, color: "var(--db-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
        Your Questions ({faqItems.length})
      </div>

      <div className="db-faq-list">
        {faqItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--db-muted)" }}>
            <Icon name="help_outline" style={{ fontSize: 32, marginBottom: 8, display: "block" }} />
            <p style={{ fontSize: 13 }}>No questions yet. Ask something above!</p>
          </div>
        ) : faqItems.map((item) => (
          <div key={item._id || item.id} className="db-faq-item">
            <div className="db-faq-q">
              <Icon name="help" style={{ fontSize: 14, color: "#2a6c2c", marginRight: 6 }} />
              {item.question}
            </div>
            <div className="db-faq-a" style={{
              color: item.answer ? "var(--db-text)" : "var(--db-muted)",
              fontStyle: item.answer ? "normal" : "italic"
            }}>
              <Icon name={item.answer ? "check_circle" : "pending"} style={{ fontSize: 13, marginRight: 5 }} />
              {item.answer || "Awaiting admin response…"}
            </div>
            <div style={{ fontSize: 10, color: "var(--db-muted)", marginTop: 4 }}>
              {fmtDate(item.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </div>
  );
}