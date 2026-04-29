//ShiftHistorySection.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";
import Icon from "../common/Icon";

function msToHHMM(ms) {
  if (!ms || ms <= 0) return "0h 0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getShiftMs(gig) {
  if (!gig.startTime || !gig.endTime) return 0;
  return new Date(gig.endTime) - new Date(gig.startTime);
}

// Get last 5 days labels and worked ms per day
function getLast7Days(gigs) {
  const days = [];
  // Start from last Sunday
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const d = new Date(lastSunday);
    d.setDate(lastSunday.getDate() + i);
    const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
    const dateStr = d.toDateString();
    const totalMs = gigs
      .filter((g) => g.endTime && new Date(g.endTime).toDateString() === dateStr)
      .reduce((sum, g) => sum + getShiftMs(g), 0);
    days.push({ label, totalMs, dateStr });
  }
  return days;
}

export default function ShiftHistorySection({ completedGigs: propGigs, loading: propLoading }) {
  const [gigs, setGigs] = useState(propGigs || []);
const [loading, setLoading] = useState(propLoading);

useEffect(() => {
  setGigs(propGigs || []);
  setLoading(false);
}, [propGigs]);

  const last7Days = getLast7Days(gigs);
const maxMs = Math.max(...last7Days.map((d) => d.totalMs), 1);
const totalAllDays = last7Days.reduce((sum, d) => sum + d.totalMs, 0);
const highestDay = totalAllDays > 0
  ? last7Days.reduce((max, d) => d.totalMs > max.totalMs ? d : max, last7Days[0])
  : null;

  if (loading) {
    return (
      <div className="db-card" style={{ color: "var(--db-muted)", fontSize: 14 }}>
        Loading shift history…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Chart card ── */}
      <div className="db-card">
        <div className="db-card-header">
          <div>
            <span className="db-card-eyebrow">Last 7 Days</span>
            <h3 className="db-card-title">Hours Worked</h3>
          </div>
          {highestDay && (
            <span style={{
    fontSize: 11, fontWeight: 600,
    color: "var(--db-primary)",
    background: "rgba(42,108,44,0.08)",
    padding: "4px 10px", borderRadius: 20,
  }}>
    Peak: {highestDay.label}
  </span>
)}
        </div>

        {/* Bar chart */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          height: 120,
          padding: "0 8px",
          marginBottom: 8,
        }}>
          {last7Days.map((day) => {
              const isHighest = day.dateStr === highestDay?.dateStr && day.totalMs > 0;
            const isToday = day.dateStr === new Date().toDateString();
            const heightPct = maxMs > 0 ? (day.totalMs / maxMs) * 100 : 0;

            return (
              <div key={day.dateStr} style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                height: "100%",
                justifyContent: "flex-end",
              }}>
                {/* Hours label on top */}
                {day.totalMs > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: isHighest ? "var(--db-primary)" : "var(--db-muted)",
                  }}>
                    {msToHHMM(day.totalMs)}
                  </span>
                )}

                {/* Bar */}
                <div style={{
                  width: "100%",
                  height: `${Math.max(heightPct, day.totalMs > 0 ? 8 : 4)}%`,
                  background: isHighest
                    ? "var(--db-primary)"
                    : day.totalMs > 0
                    ? "rgba(42,108,44,0.25)"
                    : "var(--db-border)",
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.4s ease",
                  position: "relative",
                  minHeight: 4,
                }} />

                {/* Day label */}
                <span style={{
                  fontSize: 10,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? "var(--db-primary)" : "var(--db-muted)",
                  textAlign: "center",
                  marginTop: 4,
                }}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Shift list card ── */}
      <div className="db-card">
        <div className="db-card-header">
          <div>
          <span className="db-card-eyebrow">Today's Shifts</span>
<h3 className="db-card-title">Recent Shifts</h3>
          </div>
          <span style={{
            fontSize: 11, color: "var(--db-muted)",
            fontWeight: 600,
          }}>
            {gigs.length} total
          </span>
        </div>

        {gigs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--db-muted)" }}>
            <Icon name="history" style={{ fontSize: 36, display: "block", marginBottom: 8 }} />
            <p style={{ fontSize: 13 }}>No completed shifts yet. Start your first shift!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {gigs.map((g, i) => {
              const shiftMs = getShiftMs(g);
              return (
                <div key={g._id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--db-border)",
                }}>
                  {/* Date badge */}
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 10,
                    background: "rgba(42,108,44,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--db-primary)", lineHeight: 1 }}>
                      {new Date(g.startTime).getDate()}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "var(--db-muted)", textTransform: "uppercase" }}>
                      {new Date(g.startTime).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>

                  {/* Shift details */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: 8, marginBottom: 4,
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: "var(--db-text)",
                      }}>
                        {fmtTime(g.startTime)} → {fmtTime(g.endTime)}
                      </span>
                    </div>
                    <div style={{
                      display: "flex", gap: 12,
                      alignItems: "center",
                    }}>
                      <span style={{
                        fontSize: 11, color: "var(--db-muted)",
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <Icon name="schedule" style={{ fontSize: 12 }} />
                        {msToHHMM(shiftMs)}
                      </span>
                      {g.location?.label && (
                        <span style={{
                          fontSize: 11, color: "var(--db-muted)",
                          display: "flex", alignItems: "center", gap: 3,
                        }}>
                          <Icon name="location_on" style={{ fontSize: 12 }} />
                          {g.location.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total worked badge */}
                  <div style={{
                    background: shiftMs > 0 ? "rgba(42,108,44,0.08)" : "var(--db-bg)",
                    border: "1px solid var(--db-border)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: shiftMs > 0 ? "var(--db-primary)" : "var(--db-muted)",
                    }}>
                      {msToHHMM(shiftMs)}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--db-muted)", fontWeight: 600 }}>
                      WORKED
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}