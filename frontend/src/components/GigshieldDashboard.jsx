import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "../styles/Dashboard.css";
import gigshieldLogo from "../assets/Gigshield Logo.png";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import Icon from "./common/Icon";
import JobsPage from "./dashboard/JobsPage";
import ApplyModal from "./dashboard/ApplyModal";
import AccountSettingsModal from "./account/AccountSettingsModal";
import EarningsSection from "./dashboard/EarningsSection";
import ShiftHistorySection from "./dashboard/ShiftHistorySection";
import AlertsSection from "./dashboard/AlertsSection";
import HomeSection from "./dashboard/HomeSection";
import AccountSettingsPage from "../pages/AccountSettingsPage";
import SOSButton from "./SOSButton";

const NAV_LINKS = [
  { icon: "dashboard", label: "Home",             id: "home" },
  { icon: "payments",  label: "Earnings",          id: "earnings" },
  { icon: "history",   label: "Shift History",     id: "history" },
  { icon: "work",      label: "Jobs",              id: "jobs" },
  { icon: "warning",   label: "Alerts",            id: "alerts" },
  { icon: "manage_accounts", label: "Account Settings", id: "account" },
];

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

function msToHHMM(ms) {
  if (!ms || ms <= 0) return "0h 0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth() &&
    d1.getDate()     === d2.getDate()
  );
}

export default function GigShieldDashboard() {
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────
  const [activeNav,   setActiveNav]   = useState("home");
  const [alertAck,    setAlertAck]    = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [faqOpen,     setFaqOpen]     = useState(false);
  const [faqInput,    setFaqInput]    = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [lastAlertId, setLastAlertId] = useState(null);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("gs_theme") || "light"
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("gs_lang") || "en"
  );
  const [faqItems,       setFaqItems]       = useState([]);
  const [notifications,  setNotifications]  = useState([]);

  const [shiftStart, setShiftStart] = useState(() => {
    const saved = localStorage.getItem("shiftStart");
    return saved ? new Date(saved) : null;
  });

  // ── Live data ─────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [gigs,          setGigs]          = useState([]);
  const [alerts,        setAlerts]        = useState([]);
  const [loadingData,   setLoadingData]   = useState(() => !localStorage.getItem("user"));
  const [apiError,      setApiError]      = useState("");
  const [safetyScore,   setSafetyScore]   = useState(7.5);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [todayEarningsDB, setTodayEarningsDB] = useState(0);
  const [userLocation,  setUserLocation]  = useState("");
  const [gigLoading,    setGigLoading]    = useState(false);
  const [jobs,          setJobs]          = useState([]);
  const [loadingJobs,   setLoadingJobs]   = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [jobSearch,     setJobSearch]     = useState("");
  const [jobLocation,   setJobLocation]   = useState("");
  const [liveMs,        setLiveMs]        = useState(0);
  const timerRef = useRef(null);

  // ── Theme ─────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("gs_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("gs_lang", language);
  }, [language]);

  // ── Fetch FAQs ────────────────────────────────────────────
  useEffect(() => {
    api.get("/faq")
      .then((res) => setFaqItems(res.data))
      .catch((err) => console.error("FAQ fetch failed", err));
  }, []);

  // ── Reset at midnight ─────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeout = setTimeout(() => {
      localStorage.removeItem("shiftStart");
      setShiftStart(null);
      setNotifications((n) =>
        [{
          id: Date.now(), type: "RESET",
          title: "New Day Started",
          message: "Shift reset for new day",
          read: false, timestamp: new Date().toISOString(),
        }, ...n].slice(0, 50)
      );
    }, midnight - now);
    return () => clearTimeout(timeout);
  }, []);

  // ── Fetch dashboard ───────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    setApiError("");
    try {
      const res  = await api.get("/dashboard");
      const data = res.data;
      setUser(data.user);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      setAlerts(data.dashboard?.alerts ?? []);
      setSafetyScore(data.safetyScore ?? 7.5);
      setTodayEarningsDB(data.todayEarnings ?? 0);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setApiError("Failed to load dashboard");
    } finally {
      setLoadingData(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Fetch gigs ────────────────────────────────────────────
  useEffect(() => {
    api.get("/gigs/history")
      .then((res) => setGigs(res.data ?? []))
      .catch((err) => console.error("Gigs fetch failed:", err));
  }, []);

  // ── Fetch jobs ────────────────────────────────────────────
  const fetchJobs = useCallback(async (search = "", location = "") => {
    setLoadingJobs(true);
    try {
      const res = await api.get("/jobs", {
        params: {
          ...(search   ? { search }   : {}),
          ...(location ? { location } : {}),
        },
      });
      setJobs(res.data ?? []);
    } catch (err) {
      console.error("Jobs fetch failed:", err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── Save location to backend ──────────────────────────────
  const saveStatusToBackend = useCallback(async (locationData) => {
    try {
      await api.patch("/dashboard/status", { location: locationData });
    } catch (err) {
      console.error("Failed to save status:", err);
    }
  }, []);

  // ── Geolocation → userLocation ────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    if (userLocation && userLocation !== "Location unavailable") return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const cached     = localStorage.getItem("gs_location");
        const cachedTime = localStorage.getItem("gs_location_time");
        const fiveMin    = 5 * 60 * 1000;

        if (cached && cachedTime && Date.now() - parseInt(cachedTime, 10) < fiveMin) {
          setUserLocation(cached);
          return;
        }

        const saveLocation = (label) => {
          localStorage.setItem("gs_location", label);
          localStorage.setItem("gs_location_time", Date.now().toString());
          setUserLocation(label);
          saveStatusToBackend({ label, coordinates: [longitude, latitude] });
        };

        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then((r) => r.json())
          .then((data) => {
            if (data?.city) {
              const label = data.locality || data.city;
              const city  = data.city;
              saveLocation(label && label !== city ? `${label}, ${city.slice(0,3).toUpperCase()}` : city);
            } else throw new Error("No city");
          })
          .catch(() => {
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
              headers: { "Accept-Language": "en" },
            })
              .then((r) => r.json())
              .then((data) => {
                const addr = data?.address;
                if (!addr) throw new Error("No address");
                const label = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || "";
                const city  = addr.city || addr.town || addr.state || "";
                saveLocation(label && label !== city ? `${label}, ${city.slice(0,3).toUpperCase()}` : city || "Unknown");
              })
              .catch(() => setUserLocation(localStorage.getItem("gs_location") || "Location unavailable"));
          });
      },
      (err) => {
        console.error("Geolocation error:", err.code, err.message);
        setUserLocation(localStorage.getItem("gs_location") || "Location unavailable");
      },
      { enableHighAccuracy: true }
    );
  }, [saveStatusToBackend, userLocation]);

  // ── Geolocation → nearby reports / safetyScore ───────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res     = await api.get("/safety/nearby", { params: { lat: latitude, lng: longitude } });
          const reports = res.data ?? [];
          setNearbyReports(reports);
          setSafetyScore(parseFloat(Math.max(1, 10 - reports.length * 1.5).toFixed(1)));
        } catch (err) {
          console.error("Nearby fetch failed:", err);
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // ── Midnight notification cleanup ─────────────────────────
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const t = setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => !["SHIFT_START", "SHIFT_END", "SHIFT_TOTAL"].includes(n.type))
      );
    }, msUntilMidnight);
    return () => clearTimeout(t);
  }, []);

  const activeGig    = gigs.find((g) => g.status === "active") || null;
  const completedGigs = gigs.filter((g) => g.status === "completed");
  const shiftOn      = !!shiftStart;

  // ── Live timer ────────────────────────────────────────────
  useEffect(() => {
    if (!shiftStart) return;
    const interval = setInterval(() => {
      setLiveMs(Date.now() - new Date(shiftStart).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [shiftStart]);

  useEffect(() => {
    if (nearbyReports.length > 0) {
      const latestId = nearbyReports[0]._id;
      if (latestId !== lastAlertId) {
        setAlertAck(false);
        setLastAlertId(latestId);
      }
    }
  }, [nearbyReports, lastAlertId]);

  const todayWorkedMs = useMemo(() => {
    const completedToday = completedGigs
      .filter((g) => isSameDay(g.startTime, new Date()))
      .reduce((sum, g) => {
        if (!g.endTime) return sum;
        return sum + (new Date(g.endTime) - new Date(g.startTime));
      }, 0);
    return completedToday + (shiftOn ? liveMs : 0);
  }, [completedGigs, shiftOn, liveMs]);

  const todayEarnings = todayEarningsDB;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return gigs.filter(
      (g) => (g.location || "").toLowerCase().includes(q) || g.status.toLowerCase().includes(q)
    );
  }, [searchQuery, gigs]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ── Shift toggle ──────────────────────────────────────────
  const toggleShift = async () => {
    if (gigLoading) return;
    setGigLoading(true);
    const now = new Date();
    try {
      if (shiftStart) {
        const workedMs = now - shiftStart;
        localStorage.removeItem("shiftStart");
        setLiveMs(0);
        setShiftStart(null);
        setGigs([]);

        await api.post("/gigs/stop", { earnings: 0 });
        const res = await api.get("/gigs/history");
        setGigs(res.data ?? []);

        setNotifications((n) =>
          [{
            id: Date.now(), type: "SHIFT_END", icon: "logout",
            title: "Shift Ended", message: `Worked ${msToHHMM(workedMs)}`,
            read: false, timestamp: now.toISOString(),
          }, {
            id: Date.now() + 1, type: "SHIFT_TOTAL", icon: "payments",
            title: "Today's Earnings", message: `Total earned: ₹${todayEarnings.toFixed(2)}`,
            read: false, timestamp: now.toISOString(),
          }, ...n].slice(0, 50)
        );
      } else {
        localStorage.setItem("shiftStart", now.toISOString());
        setShiftStart(now);
        await api.post("/gigs/start", {
          location: { coordinates: [0, 0], label: userLocation || "" },
        });
        setNotifications((n) =>
          [{
            id: Date.now(), type: "SHIFT_START", icon: "login",
            title: "Shift Started", message: `Started at ${fmtTime(now)}`,
            read: false, timestamp: now.toISOString(),
          }, ...n].slice(0, 50)
        );
      }
    } catch (err) {
      console.error("Shift toggle failed:", err);
    } finally {
      setGigLoading(false);
    }
  };

  const handleJobApplied = useCallback((jobId) => {
    setAppliedJobIds((prev) => new Set([...prev, jobId]));
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("gs_token");
    localStorage.removeItem("gs_user");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleProfileUpdate = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const displayName = user?.name?.trim() || "User";
  const firstName   = displayName.split(" ")[0];
  const initials    = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };
  const greeting = getGreeting();

  const liveTimerStr = useMemo(() => {
    if (!shiftOn) return "00:00:00";
    const h = String(Math.floor(liveMs / 3600000)).padStart(2, "0");
    const m = String(Math.floor((liveMs % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((liveMs % 60000) / 1000)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [shiftOn, liveMs]);

  // ── Page renderer ─────────────────────────────────────────
  const renderPage = () => {
    if (activeNav === "earnings") return (
      <EarningsSection
        todayEarnings={todayEarnings}
        completedGigs={completedGigs}
        onEarningAdded={fetchAll}
      />
    );
    if (activeNav === "history") return (
      <ShiftHistorySection completedGigs={completedGigs} loading={loadingData} />
    );
    if (activeNav === "alerts")  return <AlertsSection />;
    if (activeNav === "account") return <AccountSettingsPage user={user} />;
    if (activeNav === "jobs") return (
      <JobsPage
        jobs={jobs}
        appliedJobIds={appliedJobIds}
        onApply={handleJobApplied}
        loadingJobs={loadingJobs}
        jobSearch={jobSearch}
        setJobSearch={setJobSearch}
        jobLocation={jobLocation}
        setJobLocation={setJobLocation}
        fetchJobs={fetchJobs}
      />
    );
    return (
      <HomeSection
        shiftOn={shiftOn}
        liveTimerStr={liveTimerStr}
        todayWorkedMs={todayWorkedMs}
        msToHHMM={msToHHMM}
        userLocation={userLocation}
        activeGig={activeGig}
        todayEarnings={todayEarnings}
        completedGigs={completedGigs}
        nearbyReports={nearbyReports}
        alertAck={alertAck}
        setAlertAck={setAlertAck}
        safetyScore={safetyScore}
        jobs={jobs}
        setActiveNav={setActiveNav}
      />
    );
  };

  // ── Loading screen ────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="db-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36,
            border: "3px solid rgba(42,108,44,0.2)",
            borderTop: "3px solid #2a6c2c",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
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

      {/* ── TOP NAV ── */}
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
              onClick={() => {
                setNotifOpen((o) => !o);
                setProfileOpen(false);
                setFaqOpen(false);
                if (!notifOpen) markAllNotificationsRead();
              }}
            >
              <Icon name="notifications" />
              {unreadCount > 0 && (
                <span className="db-notif-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
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
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div key={n.id} className={`db-notif-item ${
                      n.type === "SHIFT_START" ? "db-notif-item--start" :
                      n.type === "SHIFT_END"   ? "db-notif-item--end"   :
                      n.type === "SHIFT_TOTAL" ? "db-notif-item--total" : ""
                    }`}>
                      <div className="db-notif-icon-wrap">
                        <Icon
                          name={n.icon || (n.type === "SHIFT_START" ? "login" : n.type === "SHIFT_END" ? "logout" : "schedule")}
                          className="db-notif-icon"
                        />
                      </div>
                      <div className="db-notif-body">
                        <div className="db-notif-title">{n.title || n.type}</div>
                        <div className="db-notif-message">{n.message}</div>
                        {n.timestamp && <div className="db-notif-time">{fmtTime(n.timestamp)}</div>}
                      </div>
                    </div>
                  ))
                )}
                {notifications.length > 8 && (
                  <div className="db-notif-more">+{notifications.length - 8} more notifications</div>
                )}
              </div>
            )}
          </div>

          <button
            className="db-icon-btn"
            onClick={() => { setFaqOpen(true); setNotifOpen(false); setProfileOpen(false); }}
            title="FAQ / Ask a question"
          >
            <Icon name="help_outline" />
          </button>

          {/* Profile */}
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
                <button className="db-profile-item" onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}>
                  <Icon name={theme === "light" ? "dark_mode" : "light_mode"} />
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </button>
                <div className="db-profile-item db-profile-item--lang">
                  <Icon name="translate" />
                  <span style={{ flex: 1 }}>Language</span>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="db-lang-select">
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>
                <div className="db-profile-divider" />
                <button className="db-profile-item db-profile-item--logout" onClick={handleLogout}>
                  <Icon name="logout" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-user">
          <div className="db-sidebar-avatar">{initials}</div>
          <div>
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

        {/* ── SOS Button (self-contained) ── */}
        <SOSButton onShift={shiftOn} />
      </aside>

      {/* ── MAIN ── */}
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
          {activeNav === "home" && (
            <button
              className={`db-shift-toggle ${shiftOn ? "db-shift-toggle--on" : "db-shift-toggle--off"}`}
              onClick={toggleShift}
              disabled={gigLoading}
            >
              <span className="db-shift-dot" />
              {gigLoading ? "UPDATING…" : shiftOn ? "SHIFT ON" : "SHIFT OFF"}
            </button>
          )}
        </div>
        {renderPage()}
      </main>

      {/* ── FAQ Drawer ── */}
      {faqOpen && (
        <div className="db-faq-overlay" onClick={() => setFaqOpen(false)}>
          <div className="db-faq-panel" onClick={(e) => e.stopPropagation()}>
            <div className="db-faq-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Support &amp; FAQ</h3>
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
              ) : (
                faqItems.map((item) => (
                  <div key={item._id || item.id} className="db-faq-item">
                    <div className="db-faq-q">
                      <Icon name="help" style={{ fontSize: 14, color: "#2a6c2c", marginRight: 6 }} />
                      {item.question}
                    </div>
                    <div className="db-faq-a" style={{ color: item.answer ? "var(--db-text)" : "var(--db-muted)", fontStyle: item.answer ? "normal" : "italic" }}>
                      <Icon name={item.answer ? "check_circle" : "pending"} style={{ fontSize: 13, marginRight: 5 }} />
                      {item.answer || "Awaiting admin response…"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--db-muted)", marginTop: 4 }}>
                      {fmtDate(item.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {accountOpen && (
        <AccountSettingsModal
          user={user}
          onClose={() => setAccountOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}