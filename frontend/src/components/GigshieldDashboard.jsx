import { useState } from "react";

const materialIcon = (name, fill = 0, extraStyle = {}) => (
  <span
    className="material-symbols-outlined"
    style={{
      fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      verticalAlign: "middle",
      ...extraStyle,
    }}
  >
    {name}
  </span>
);

const navLinks = [
  { icon: "dashboard", label: "Home", active: true },
  { icon: "payments", label: "Earnings" },
  { icon: "history", label: "Shift History" },
  { icon: "group", label: "Community" },
  { icon: "warning", label: "Alerts" },
  { icon: "person", label: "Profile" },
];

export default function GigShieldDashboard() {
  const [mapMode, setMapMode] = useState("SAFETY");
  const [alertAcknowledged, setAlertAcknowledged] = useState(false);

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .btn-primary-gradient {
          background: linear-gradient(135deg, #2a6c2c 0%, #1d5f21 100%);
        }
        .glass-panel {
          background: rgba(221, 228, 227, 0.6);
          backdrop-filter: blur(20px);
        }
        .heatmap-overlay {
          background:
            radial-gradient(circle at 40% 40%, rgba(42, 108, 44, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(172, 244, 164, 0.5) 0%, transparent 35%),
            radial-gradient(circle at 20% 80%, rgba(168, 56, 54, 0.2) 0%, transparent 30%);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      <div
        style={{
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#f8faf9",
          color: "#2d3433",
          minHeight: "100vh",
        }}
      >
        {/* ── Top Nav ── */}
        <header
          style={{
            position: "fixed",
            top: 0,
            zIndex: 40,
            width: "100%",
            height: "80px",
            padding: "0 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8faf9",
            borderBottom: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "#0D7C66",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              GigShield
            </span>
            <div style={{ position: "relative", width: "384px" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#757c7b",
                  fontSize: "20px",
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search safety reports, earnings, or shifts..."
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(172,179,178,0.2)",
                  outline: "none",
                  paddingLeft: "40px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "14px",
                  color: "#2d3433",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {["notifications", "help_outline", "settings"].map((icon) => (
              <button
                key={icon}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "9999px",
                  color: "#596060",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {materialIcon(icon)}
              </button>
            ))}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "9999px",
                overflow: "hidden",
                marginLeft: "8px",
                outline: "2px solid rgba(172,244,164,0.3)",
              }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBy1sVbpS5kjKtIvBL37amEmwpnTLOovh-1OT78-LoIkM26ZhUmosH0l2s5p7_0CAPY5Pm2mhNns8F5rUkXJK63ydwsQyVswyoMJ8zOO11rTffhbHUWHErcQoh7d_-X2L4rNGBrucEUFA7wGh3eiX72G80akAtjurtzmD1hoSGxxaW5FFbJvwEJsNm88IYmWKsyagPwhoOgjC_SqFm2y4qCwtQNadAxqXpwEvzVPSJ3EWgVunEEIqvjQW0Y_7phDc6A4W8Zx4GDJ0"
                alt="User Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </header>

        {/* ── Sidebar ── */}
        <aside
          style={{
            position: "fixed",
            left: 0,
            height: "100%",
            width: "288px",
            paddingTop: "112px",
            paddingBottom: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            backgroundColor: "#f0f4f3",
          }}
        >
          <div style={{ padding: "0 40px", marginBottom: "32px" }}>
            <h3
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                color: "#2d3433",
              }}
            >
              Professional Shield
            </h3>
            <p
              style={{
                fontSize: "11px",
                color: "#596060",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: "4px",
              }}
            >
              Active Protection
            </p>
          </div>

          <nav
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {navLinks.map(({ icon, label, active }) =>
              active ? (
                <a
                  key={label}
                  href="#"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#2a6c2c",
                    fontWeight: 700,
                    borderRadius: "9999px 0 0 9999px",
                    marginLeft: "16px",
                    paddingLeft: "24px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    textDecoration: "none",
                    transform: "translateX(4px)",
                  }}
                >
                  {materialIcon(icon)}
                  <span
                    style={{
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {label}
                  </span>
                </a>
              ) : (
                <a
                  key={label}
                  href="#"
                  style={{
                    paddingLeft: "40px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    color: "#2d3433",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#2a6c2c")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#2d3433")
                  }
                >
                  {materialIcon(icon)}
                  <span
                    style={{
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {label}
                  </span>
                </a>
              )
            )}
          </nav>

          <div style={{ padding: "0 32px", marginTop: "auto" }}>
            <button
              className="glass-panel"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(168,56,54,0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              {materialIcon("emergency_share", 1, { color: "#a83836", fontSize: "24px" })}
              <span
                style={{
                  color: "#a83836",
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Emergency Help
              </span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main
          style={{
            marginLeft: "288px",
            marginTop: "80px",
            padding: "40px",
            minHeight: "100vh",
            backgroundColor: "#f8faf9",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {/* Page Header */}
            <header
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "40px",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#2a6c2c",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Member Dashboard
                </span>
                <h1
                  style={{
                    fontSize: "36px",
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 800,
                    color: "#2d3433",
                    letterSpacing: "-0.025em",
                    margin: 0,
                  }}
                >
                  Good afternoon, Arjun.
                </h1>
                <p
                  style={{
                    color: "#596060",
                    marginTop: "8px",
                    fontSize: "18px",
                  }}
                >
                  Your shift is active and monitored by GigShield Guardian.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    backgroundColor: "#acf4a4",
                    color: "#004b0f",
                    padding: "12px 24px",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    className="animate-pulse"
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#004b0f",
                      borderRadius: "9999px",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    SHIFT ON
                  </span>
                </div>
              </div>
            </header>

            {/* Bento Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "32px",
                alignItems: "start",
              }}
            >
              {/* Left Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Shift Status Card */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "32px",
                    boxShadow: "0px 12px 32px rgba(45,52,51,0.04)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "128px",
                      height: "128px",
                      backgroundColor: "rgba(42,108,44,0.05)",
                      borderRadius: "9999px",
                      marginRight: "-64px",
                      marginTop: "-64px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "32px", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#596060",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          marginBottom: "24px",
                        }}
                      >
                        Current Session
                      </p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "60px",
                            fontFamily: "Manrope, sans-serif",
                            fontWeight: 800,
                            color: "#2d3433",
                            lineHeight: 1,
                          }}
                        >
                          02:15
                        </span>
                        <span
                          style={{
                            fontSize: "20px",
                            fontFamily: "Manrope, sans-serif",
                            fontWeight: 600,
                            color: "#596060",
                          }}
                        >
                          HRS
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: "32px",
                          display: "flex",
                          alignItems: "center",
                          gap: "24px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "#757c7b",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Active Location
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {materialIcon("location_on", 0, { fontSize: "16px" })}
                            Koramangala, BLR
                          </span>
                        </div>
                        <div
                          style={{
                            width: "1px",
                            height: "32px",
                            backgroundColor: "rgba(172,179,178,0.3)",
                          }}
                        />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "#757c7b",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Battery Level
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "4px",
                              color: "#2a6c2c",
                            }}
                          >
                            {materialIcon("battery_charging_full", 0, { fontSize: "16px", color: "#2a6c2c" })}
                            88%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: "256px",
                        height: "192px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.1)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUp-rEMpmWXwkkU5InmdpY2vxOZvWx68zTwY-zt6H4NIj3_dVDeylPRHKwQR5MsyZAEqNunl7UKrRvSAlMlaL72qt6TqYibcq_6_4gHCZmBIBZEv3Eo8OhhdKCplmNlKqg82_4IfgxqyOkE6_z6BLw3KczNHkVVW4SzXSEDTnIJdMPdi95FhevbcDlfEMUbwTVsqs2LvT_dCDQyK31kULHMuQJhbY-4hdnZlU-H55sAnKmk7ytJWLioL9c0uS8Bg4GTYMPF9GsHJA"
                        alt="City map"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "grayscale(1)",
                          opacity: 0.4,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(42,108,44,0.1)",
                          mixBlendMode: "multiply",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#2a6c2c",
                            borderRadius: "9999px",
                            boxShadow: "0 0 0 16px rgba(42,108,44,0.2)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Hero Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                  {/* Earnings */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      padding: "32px",
                      boxShadow: "0px 12px 32px rgba(45,52,51,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "24px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#596060",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                        }}
                      >
                        Today's Earnings
                      </p>
                      {materialIcon("trending_up", 0, { color: "#2a6c2c" })}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span
                        style={{
                          fontSize: "18px",
                          fontFamily: "Manrope, sans-serif",
                          fontWeight: 700,
                          color: "#2d3433",
                        }}
                      >
                        ₹
                      </span>
                      <span
                        style={{
                          fontSize: "36px",
                          fontFamily: "Manrope, sans-serif",
                          fontWeight: 800,
                          color: "#2d3433",
                        }}
                      >
                        850.00
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "24px",
                        paddingTop: "24px",
                        borderTop: "1px solid rgba(172,179,178,0.1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "#596060" }}>
                        3 Deliveries completed
                      </span>
                      <a
                        href="#"
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#2a6c2c",
                          textDecoration: "none",
                        }}
                      >
                        View Details
                      </a>
                    </div>
                  </div>

                  {/* Safety Alert */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      padding: "32px",
                      boxShadow: "0px 12px 32px rgba(45,52,51,0.04)",
                      borderLeft: "4px solid rgba(168,56,54,0.4)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "16px",
                        color: "#a83836",
                      }}
                    >
                      {materialIcon("report", 1, { fontSize: "16px", color: "#a83836" })}
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                        }}
                      >
                        Proximity Alert
                      </span>
                    </div>
                    <h4
                      style={{
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 700,
                        fontSize: "18px",
                        color: "#2d3433",
                        margin: 0,
                      }}
                    >
                      Unsafe Area Warning
                    </h4>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#596060",
                        marginTop: "8px",
                        lineHeight: 1.6,
                      }}
                    >
                      High incident rate reported in HSR Layout Sector 2. Maintain high
                      visibility and avoid dark alleys.
                    </p>
                    <div style={{ marginTop: "24px" }}>
                      <button
                        onClick={() => setAlertAcknowledged(true)}
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: alertAcknowledged ? "#2a6c2c" : "#2d3433",
                          border: `1px solid ${alertAcknowledged ? "#2a6c2c" : "rgba(172,179,178,1)"}`,
                          padding: "8px 16px",
                          borderRadius: "9999px",
                          background: "none",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {alertAcknowledged ? "✓ Acknowledged" : "Acknowledge"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Heat Map */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "32px",
                    boxShadow: "0px 12px 32px rgba(45,52,51,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: "Manrope, sans-serif",
                          fontWeight: 700,
                          fontSize: "20px",
                          margin: 0,
                        }}
                      >
                        City Heat Map
                      </h3>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#596060",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          marginTop: "4px",
                        }}
                      >
                        Real-time Safety & Activity
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["SAFETY", "DEMAND"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setMapMode(mode)}
                          style={{
                            backgroundColor:
                              mapMode === mode ? "rgba(42,108,44,0.1)" : "#f8faf9",
                            color: mapMode === mode ? "#2a6c2c" : "#596060",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "6px 12px",
                            borderRadius: "9999px",
                            border:
                              mapMode === mode
                                ? "1px solid rgba(42,108,44,0.2)"
                                : "1px solid rgba(172,179,178,0.2)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "21/9",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid rgba(172,179,178,0.1)",
                    }}
                  >
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUp-rEMpmWXwkkU5InmdpY2vxOZvWx68zTwY-zt6H4NIj3_dVDeylPRHKwQR5MsyZAEqNunl7UKrRvSAlMlaL72qt6TqYibcq_6_4gHCZmBIBZEv3Eo8OhhdKCplmNlKqg82_4IfgxqyOkE6_z6BLw3KczNHkVVW4SzXSEDTnIJdMPdi95FhevbcDlfEMUbwTVsqs2LvT_dCDQyK31kULHMuQJhbY-4hdnZlU-H55sAnKmk7ytJWLioL9c0uS8Bg4GTYMPF9GsHJA"
                      alt="City map"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "grayscale(1) contrast(1.25)",
                        opacity: 0.3,
                      }}
                    />
                    <div
                      className="heatmap-overlay"
                      style={{
                        position: "absolute",
                        inset: 0,
                        mixBlendMode: "multiply",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(42,108,44,0.05)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "16px",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(12px)",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(172,179,178,0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#757c7b",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        Map Legend
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {[
                          { color: "#2a6c2c", label: "Secure" },
                          { color: "#acf4a4", label: "Moderate" },
                          { color: "rgba(168,56,54,0.6)", label: "Caution" },
                        ].map(({ color, label }) => (
                          <div
                            key={label}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "9999px",
                                backgroundColor: color,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                              }}
                            />
                            <span style={{ fontSize: "10px", fontWeight: 600 }}>
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11px",
                      color: "#596060",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                      {materialIcon("update", 0, { fontSize: "14px", color: "#2a6c2c" })}
                      Auto-updates every 5 mins based on rider reports
                    </span>
                    <a
                      href="#"
                      style={{
                        fontWeight: 700,
                        color: "#2a6c2c",
                        textDecoration: "none",
                      }}
                    >
                      Open Interactive Map
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Emergency SOS */}
                <div
                  style={{
                    backgroundColor: "#a83836",
                    color: "#fff7f6",
                    borderRadius: "12px",
                    padding: "32px",
                    boxShadow: "0 8px 24px rgba(168,56,54,0.15)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "192px",
                      height: "192px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: "9999px",
                      marginRight: "-96px",
                      marginTop: "-96px",
                      pointerEvents: "none",
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 800,
                      fontSize: "24px",
                      margin: "0 0 8px",
                    }}
                  >
                    Emergency Response
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,247,246,0.8)",
                      marginBottom: "32px",
                      lineHeight: 1.6,
                    }}
                  >
                    One-tap connection to GigShield 24/7 Security Dispatch and Local Police.
                  </p>
                  <button
                    style={{
                      width: "100%",
                      backgroundColor: "#fff7f6",
                      color: "#a83836",
                      padding: "16px",
                      borderRadius: "12px",
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                    }}
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform = "scale(0.98)")
                    }
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    Initiate SOS Protocol
                  </button>
                </div>

                {/* Expert Advice */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "32px",
                    boxShadow: "0px 12px 32px rgba(45,52,51,0.04)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: 700,
                      fontSize: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    Expert Advice
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {[
                      {
                        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBREjkYUFDfTAFQJoVtIrKQWy8d7EtxrfrLR0oTEuO-FciZegdBsCgBEWxDFZxQvZGXd7ONt6xY_XI4NrQoWzGWh40txCVZ051V6B2uMggRqJ_8UeivfutjN7pzd-trdaXVbgki8KTB-9OSbXluOvd7D8YS2_tn4sJFD-lNRHwV2y17s6tX66zGTOt6IjVOcybUQMFRtebWTCgoxg3j7K48I0qCfbP0NAbGsqVUDjOCMF_4duCI7J7GOTOtwL1G86Om-hTbh5mVTFo",
                        badge: "LEGAL",
                        badgeBg: "#b2e8f8",
                        badgeColor: "#1e5764",
                        text: "Understanding your rights during night shifts.",
                        alt: "Motorcycle handlebar at night",
                      },
                      {
                        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVCGnv1FNHWAqQ5JaJMRLqCSYa-_BgkNVTsZQ_QQXhI7D98lHbZF6FvhAjqbW9zh-rmS4SuKx2zU9mkoQDRNp-IkdWKqumSWQdHcQqmPqWwXxHDhuY9Ucvp88NF0QQIFstAcazG2-s_-ygkf_ym-icnRSBIkxnDYDeJdLfDuDqcsjLG0WpHRa1MorPq2QxD46cUNViCg3dBpDmzn9pxufpQpDTHHcFlFQ9CSnLeExlYV-Tlf6UO10yVe5sLMZKnp9tm5-vCCiND04",
                        badge: "WELLNESS",
                        badgeBg: "#acf4a4",
                        badgeColor: "#1b5e20",
                        text: "5-minute posture reset for long delivery routes.",
                        alt: "Yoga pose at home",
                      },
                    ].map(({ src, badge, badgeBg, badgeColor, text, alt }) => (
                      <div
                        key={badge}
                        style={{ borderRadius: "12px", overflow: "hidden", cursor: "pointer" }}
                      >
                        <div
                          style={{ height: "128px", width: "100%", position: "relative" }}
                        >
                          <img
                            src={src}
                            alt={alt}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.5s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              bottom: "12px",
                              left: "12px",
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {badge}
                          </span>
                        </div>
                        <p
                          style={{
                            marginTop: "12px",
                            fontWeight: 700,
                            fontSize: "14px",
                            lineHeight: 1.4,
                          }}
                        >
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    style={{
                      width: "100%",
                      marginTop: "32px",
                      padding: "12px",
                      border: "1px solid rgba(172,179,178,0.3)",
                      borderRadius: "9999px",
                      background: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#eaefee")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    Explore Knowledge Hub
                  </button>
                </div>

                {/* Safety Score */}
                <div
                  style={{
                    backgroundColor: "rgba(42,108,44,0.05)",
                    borderRadius: "12px",
                    padding: "32px",
                    border: "1px solid rgba(42,108,44,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#596060",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      Safety Score
                    </span>
                    <span
                      style={{
                        backgroundColor: "#acf4a4",
                        color: "#004b0f",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: "9999px",
                      }}
                    >
                      GOLD TIER
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}
                    >
                      <svg
                        viewBox="0 0 36 36"
                        style={{ width: "100%", height: "100%" }}
                      >
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(42,108,44,0.1)"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2a6c2c"
                          strokeWidth="3"
                          strokeDasharray="92, 100"
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Manrope, sans-serif",
                          fontWeight: 700,
                          fontSize: "20px",
                        }}
                      >
                        92
                      </div>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                        Excellent Safety Record
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#596060",
                          marginTop: "4px",
                        }}
                      >
                        Keep it up to unlock lower insurance premiums.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}