import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const CATEGORIES = ["theft", "harassment", "accident", "road hazard", "other"];

export default function RiskReportForm() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("theft");
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [locationStatus, setLocationStatus] = useState("Detecting location…");
  const [status, setStatus] = useState(null); // { type: "success"|"error", message }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Location unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("Location detected");
      },
      () => {
        setLocationStatus("Location unavailable");
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setStatus(null);

    const payload = {
      description: description.trim(),
      category,
      location: coords
        ? { coordinates: [coords.lng, coords.lat] }
        : { coordinates: [0, 0] },
    };

    try {
      // Public route — no auth needed. Using the axios instance is fine;
      // it will attach the token if present but the backend doesn't require it.
      await axiosInstance.post("/safety/report", payload);
      setStatus({ type: "success", message: "Report submitted anonymously" });
      setDescription("");
      setCategory("theft");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to submit report. Try again.";
      setStatus({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── styles ── */
  const card = {
    background: "var(--card-bg, #1e2130)",
    borderRadius: 12,
    padding: "24px",
    color: "var(--text-primary, #e2e8f0)",
  };
  const label = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "var(--text-secondary, #94a3b8)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const inputBase = {
    width: "100%",
    background: "var(--input-bg, #0f1117)",
    border: "1px solid var(--border, #2d3748)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "var(--text-primary, #e2e8f0)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const locationBadge = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: coords ? "rgba(34,197,94,0.12)" : "rgba(148,163,184,0.1)",
    border: `1px solid ${coords ? "rgba(34,197,94,0.35)" : "rgba(148,163,184,0.2)"}`,
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 13,
    color: coords ? "#4ade80" : "#94a3b8",
  };
  const submitBtn = {
    marginTop: 8,
    padding: "11px 28px",
    background: submitting ? "#6b2e2e" : "linear-gradient(135deg,#ef4444,#f97316)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: submitting ? "not-allowed" : "pointer",
    opacity: submitting ? 0.7 : 1,
    transition: "opacity 0.2s",
  };
  const alertBox = (type) => ({
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    background:
      type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
    border: `1px solid ${type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
    color: type === "success" ? "#4ade80" : "#f87171",
  });

  return (
    <div style={card}>
      <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>
        🚨 Report a Risk Anonymously
      </h3>

      {status && (
        <div style={{ ...alertBox(status.type), marginBottom: 18 }}>
          {status.type === "success" ? "✅" : "❌"} {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Description */}
        <div>
          <label style={label}>Description *</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the safety concern…"
            style={{ ...inputBase, resize: "vertical", minHeight: 90 }}
          />
        </div>

        {/* Category */}
        <div>
          <label style={label}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputBase}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label style={label}>Location</label>
          <span style={locationBadge}>
            <span>{coords ? "📍" : "📵"}</span>
            {locationStatus}
            {coords && (
              <span style={{ fontSize: 11, opacity: 0.7 }}>
                ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
              </span>
            )}
          </span>
        </div>

        <button type="submit" disabled={submitting} style={submitBtn}>
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </form>
    </div>
  );
}