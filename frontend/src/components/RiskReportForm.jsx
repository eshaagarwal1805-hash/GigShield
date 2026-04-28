import { useState, useEffect } from "react";
import api from "../api/axios";
const CATEGORIES = [
  { value: "theft",       label: "Theft",        icon: "local_police" },
  { value: "harassment",  label: "Harassment",   icon: "report"       },
  { value: "accident",    label: "Accident",     icon: "car_crash"    },
  { value: "road hazard", label: "Road Hazard",  icon: "warning"      },
  { value: "other",       label: "Other",        icon: "info"         },
];

const Icon = ({ name, style = {} }) => (
  <span
    className="material-symbols-outlined"
    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", lineHeight: 1, ...style }}
  >
    {name}
  </span>
);

export default function RiskReportForm() {
  const [description,     setDescription]     = useState("");
  const [category,        setCategory]        = useState("theft");
  const [coords,          setCoords]          = useState(null);
  const [locationStatus,  setLocationStatus]  = useState("Detecting location…");
  const [status,          setStatus]          = useState(null);
  const [submitting,      setSubmitting]      = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationStatus("Location unavailable"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("Location detected");
      },
      () => setLocationStatus("Location unavailable")
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true); setStatus(null);
    try {
      await api.post("/safety/report", {
        description: description.trim(),
        category,
        location: { coordinates: coords ? [coords.lng, coords.lat] : [0, 0] },
      });
      setStatus({ type: "success", message: "Report submitted anonymously. Thank you for keeping the community safe." });
      setDescription(""); setCategory("theft");
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCat = CATEGORIES.find((c) => c.value === category);

  return (
    <div style={{
      background: "var(--db-surface)",
      border: "1px solid var(--db-border)",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "var(--db-shadow)",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: "18px 24px",
        borderBottom: "1px solid var(--db-border)",
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(42,108,44,0.04)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(168,56,54,0.1)",
          border: "1px solid rgba(168,56,54,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="report" style={{ fontSize: 18, color: "var(--db-red)" }} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--db-font-head)", fontWeight: 700, fontSize: 15, color: "var(--db-text)" }}>
            Report a Risk Anonymously
          </div>
          <div style={{ fontSize: 12, color: "var(--db-muted)", marginTop: 1 }}>
            Your identity is never shared with this report
          </div>
        </div>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit} style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Status message */}
        {status && (
          <div style={{
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            display: "flex", alignItems: "flex-start", gap: 8,
            background: status.type === "success" ? "rgba(42,108,44,0.08)" : "rgba(168,56,54,0.08)",
            border: `1px solid ${status.type === "success" ? "rgba(42,108,44,0.2)" : "rgba(168,56,54,0.2)"}`,
            color: status.type === "success" ? "var(--db-primary)" : "var(--db-red)",
          }}>
            <Icon
              name={status.type === "success" ? "check_circle" : "error"}
              style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}
            />
            {status.message}
          </div>
        )}

        {/* Description */}
        <div>
          <label style={{
            display: "block", fontSize: 10.5, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            color: "var(--db-muted)", marginBottom: 8,
            fontFamily: "var(--db-font-head)",
          }}>
            Description <span style={{ color: "var(--db-red)" }}>*</span>
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the safety concern in detail…"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--db-bg)",
              border: "1.5px solid var(--db-border)",
              borderRadius: 10, padding: "12px 14px",
              color: "var(--db-text)", fontSize: 13,
              fontFamily: "var(--db-font-body)",
              resize: "vertical", minHeight: 96, outline: "none",
              transition: "border-color 0.18s ease, box-shadow 0.18s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(42,108,44,0.5)";
              e.target.style.boxShadow   = "0 0 0 3px rgba(42,108,44,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--db-border)";
              e.target.style.boxShadow   = "none";
            }}
          />
          <div style={{ fontSize: 11, color: "var(--db-muted)", marginTop: 5, textAlign: "right" }}>
            {description.length} / 500
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={{
            display: "block", fontSize: 10.5, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            color: "var(--db-muted)", marginBottom: 8,
            fontFamily: "var(--db-font-head)",
          }}>
            Category
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 20,
                    border: active
                      ? "1.5px solid rgba(42,108,44,0.5)"
                      : "1.5px solid var(--db-border)",
                    background: active ? "rgba(42,108,44,0.1)" : "var(--db-bg)",
                    color: active ? "var(--db-primary)" : "var(--db-muted)",
                    fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--db-font-head)",
                    transition: "all 0.15s ease",
                    textTransform: "capitalize",
                  }}
                >
                  <Icon name={c.icon} style={{ fontSize: 14, color: active ? "var(--db-primary)" : "var(--db-muted)" }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={{
            display: "block", fontSize: 10.5, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            color: "var(--db-muted)", marginBottom: 8,
            fontFamily: "var(--db-font-head)",
          }}>
            Location
          </label>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: coords ? "rgba(42,108,44,0.07)" : "rgba(148,163,184,0.07)",
            border: `1px solid ${coords ? "rgba(42,108,44,0.25)" : "var(--db-border)"}`,
            borderRadius: 20, padding: "7px 14px",
            fontSize: 13, fontWeight: 500,
            color: coords ? "var(--db-primary)" : "var(--db-muted)",
          }}>
            <Icon
              name={coords ? "location_on" : "location_off"}
              style={{ fontSize: 15, color: coords ? "var(--db-primary)" : "var(--db-muted)" }}
            />
            {locationStatus}
            {coords && (
              <span style={{ fontSize: 11, opacity: 0.65, fontFamily: "monospace" }}>
                ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
              </span>
            )}
          </div>
          {!coords && (
            <p style={{ fontSize: 11, color: "var(--db-muted)", marginTop: 6 }}>
              Enable location for a more accurate report. It won't be shown publicly.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !description.trim()}
          style={{
            padding: "13px 28px",
            borderRadius: 10, border: "none",
            background: submitting || !description.trim()
              ? "var(--db-border)"
              : "var(--db-red)",
            color: submitting || !description.trim() ? "var(--db-muted)" : "#fff",
            fontWeight: 700, fontSize: 13,
            fontFamily: "var(--db-font-head)",
            cursor: submitting || !description.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.18s ease",
            letterSpacing: "0.02em",
          }}
        >
          <Icon name={submitting ? "hourglass_top" : "send"} style={{ fontSize: 15, color: "inherit" }} />
          {submitting ? "Submitting…" : "Submit Report"}
        </button>

      </form>
    </div>
  );
}