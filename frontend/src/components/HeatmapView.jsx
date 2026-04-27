import { useEffect, useState } from "react";
import api from "../api/axios";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  theft: {
    color: "#f87171",
    border: "rgba(239,68,68,0.4)",
    bg: "rgba(239,68,68,0.10)",
    blob: "rgba(239,68,68,0.55)",
    ring: "rgba(239,68,68,0.18)",
    label: "Theft",
    icon: "local_police",
  },
  harassment: {
    color: "#fb923c",
    border: "rgba(249,115,22,0.4)",
    bg: "rgba(249,115,22,0.10)",
    blob: "rgba(249,115,22,0.55)",
    ring: "rgba(249,115,22,0.18)",
    label: "Harassment",
    icon: "report",
  },
  accident: {
    color: "#facc15",
    border: "rgba(234,179,8,0.4)",
    bg: "rgba(234,179,8,0.10)",
    blob: "rgba(234,179,8,0.55)",
    ring: "rgba(234,179,8,0.18)",
    label: "Accident",
    icon: "car_crash",
  },
  "road hazard": {
    color: "#c084fc",
    border: "rgba(168,85,247,0.4)",
    bg: "rgba(168,85,247,0.10)",
    blob: "rgba(168,85,247,0.55)",
    ring: "rgba(168,85,247,0.18)",
    label: "Road Hazard",
    icon: "warning",
  },
  other: {
    color: "#94a3b8",
    border: "rgba(148,163,184,0.3)",
    bg: "rgba(148,163,184,0.08)",
    blob: "rgba(148,163,184,0.45)",
    ring: "rgba(148,163,184,0.15)",
    label: "Other",
    icon: "info",
  },
};

// ─────────────────────────────────────────────────────────────
//  Coordinate helpers
// ─────────────────────────────────────────────────────────────

/**
 * Project [lng, lat] GeoJSON coordinates onto SVG viewport.
 * Falls back to a deterministic pseudo-position derived from
 * the document index so the map is never empty.
 */
function projectToSVG(coords, index, total, svgW = 520, svgH = 280) {
  if (coords && coords.length === 2 && coords[0] !== 0 && coords[1] !== 0) {
    // Clamp to rough India bounding box: lng 68–97, lat 8–37
    const lng = Math.max(68, Math.min(97, coords[0]));
    const lat = Math.max(8,  Math.min(37, coords[1]));
    const x = ((lng - 68) / (97 - 68)) * (svgW - 80) + 40;
    const y = svgH - (((lat - 8) / (37 - 8)) * (svgH - 80) + 40);
    return { x, y };
  }
  // Spread evenly across map with slight jitter when no real coords
  const cols = Math.ceil(Math.sqrt(total));
  const col  = index % cols;
  const row  = Math.floor(index / cols);
  const jitter = ((index * 37) % 40) - 20;
  return {
    x: 60 + col * ((svgW - 120) / Math.max(cols - 1, 1)) + jitter,
    y: 60 + row * ((svgH - 120) / Math.max(Math.ceil(total / cols) - 1, 1)) + jitter * 0.5,
  };
}

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

const Icon = ({ name, style = {} }) => (
  <span
    className="material-symbols-outlined"
    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", ...style }}
  >
    {name}
  </span>
);

function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  return (
    <span
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Icon name={cfg.icon} style={{ fontSize: 12, color: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function HeatmapSVG({ reports }) {
  const W = 520;
  const H = 280;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", borderRadius: 10, display: "block" }}
      aria-label="Safety heatmap"
    >
      {/* ── Background ── */}
      <rect width={W} height={H} rx="10" fill="rgba(15,20,32,0.95)" />

      {/* ── Grid lines ── */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line
          key={`v${i}`}
          x1={i * (W / 8)} y1="0" x2={i * (W / 8)} y2={H}
          stroke="rgba(42,108,44,0.07)" strokeWidth="1"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`h${i}`}
          x1="0" y1={i * (H / 4)} x2={W} y2={i * (H / 4)}
          stroke="rgba(42,108,44,0.07)" strokeWidth="1"
        />
      ))}

      {/* ── Road lines (decorative) ── */}
      <path d={`M0,${H * 0.5} Q${W * 0.25},${H * 0.42} ${W * 0.5},${H * 0.5} Q${W * 0.75},${H * 0.58} ${W},${H * 0.5}`}
        stroke="rgba(42,108,44,0.15)" strokeWidth="2.5" fill="none" />
      <path d={`M${W * 0.5},0 Q${W * 0.52},${H * 0.25} ${W * 0.5},${H * 0.5} Q${W * 0.48},${H * 0.75} ${W * 0.5},${H}`}
        stroke="rgba(42,108,44,0.15)" strokeWidth="2.5" fill="none" />
      <path d={`M0,${H * 0.27} Q${W * 0.4},${H * 0.24} ${W},${H * 0.27}`}
        stroke="rgba(42,108,44,0.08)" strokeWidth="1.5" fill="none" />
      <path d={`M0,${H * 0.73} Q${W * 0.6},${H * 0.77} ${W},${H * 0.73}`}
        stroke="rgba(42,108,44,0.08)" strokeWidth="1.5" fill="none" />

      {/* ── Heatmap blobs ── */}
      {reports.map((r, i) => {
        const { x, y } = projectToSVG(r.location?.coordinates, i, reports.length, W, H);
        const cfg = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.other;
        return (
          <g key={r._id || i}>
            {/* outer glow ring */}
            <ellipse cx={x} cy={y} rx="32" ry="24" fill={cfg.ring} />
            {/* mid ring */}
            <ellipse cx={x} cy={y} rx="18" ry="14" fill={`${cfg.blob}88`} />
            {/* core dot */}
            <circle cx={x} cy={y} r="6" fill={cfg.blob} />
            <circle cx={x} cy={y} r="3" fill={cfg.color} />
          </g>
        );
      })}

      {/* ── "You are here" marker ── */}
      <circle cx={W / 2} cy={H / 2} r="6" fill="#2a6c2c" />
      <circle cx={W / 2} cy={H / 2} r="12" fill="rgba(42,108,44,0.2)" />
      <circle cx={W / 2} cy={H / 2} r="20" fill="rgba(42,108,44,0.07)" />

      {/* ── Corner labels ── */}
      {[
        { x: 12, y: 16, t: "NW" },
        { x: W - 12, y: 16, t: "NE", anchor: "end" },
        { x: 12, y: H - 6, t: "SW" },
        { x: W - 12, y: H - 6, t: "SE", anchor: "end" },
      ].map(({ x, y, t, anchor = "start" }) => (
        <text key={t} x={x} y={y} fill="rgba(42,108,44,0.25)" fontSize="9"
          fontFamily="monospace" textAnchor={anchor}>{t}</text>
      ))}
    </svg>
  );
}

function ReportListItem({ report, index }) {
  const cfg = CATEGORY_CONFIG[report.category] || CATEGORY_CONFIG.other;
  const coords = report.location?.coordinates;
  const hasCoords = coords && (coords[0] !== 0 || coords[1] !== 0);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 16px",
        background: "var(--db-surface, rgba(255,255,255,0.03))",
        border: `1px solid var(--db-border, rgba(255,255,255,0.06))`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 10,
        flexWrap: "wrap",
        animation: `fadeSlideIn 0.3s ease both`,
        animationDelay: `${index * 0.04}s`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Index badge */}
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: cfg.color, flexShrink: 0,
        }}>
          {index + 1}
        </span>
        <CategoryBadge category={report.category} />
        <span style={{ fontSize: 12, color: "var(--db-muted, #94a3b8)" }}>
          {formatDate(report.reportedAt)}
        </span>
      </div>
      {hasCoords ? (
        <span style={{
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.22)",
          color: "#60a5fa",
          borderRadius: 20, padding: "3px 10px",
          fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 4,
        }}>
          <Icon name="location_on" style={{ fontSize: 12, color: "#60a5fa" }} />
          {coords[1]?.toFixed(4)}, {coords[0]?.toFixed(4)}
        </span>
      ) : (
        <span style={{
          fontSize: 11, color: "var(--db-muted, #64748b)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <Icon name="location_off" style={{ fontSize: 12 }} />
          No coordinates
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Legend
// ─────────────────────────────────────────────────────────────

function HeatmapLegend({ counts }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10,
    }}>
      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
        <div key={key} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 20, padding: "4px 10px",
          fontSize: 11, color: cfg.color, fontWeight: 600,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: cfg.color, flexShrink: 0,
          }} />
          {cfg.label}
          {counts[key] != null && (
            <span style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "1px 6px",
              fontSize: 10, fontWeight: 700,
            }}>
              {counts[key]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export default function HeatmapView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("all");

  useEffect(() => {
    api
      .get("/safety/heatmap")
      .then((res) => setReports(res.data))
      .catch(() => setError("Failed to load heatmap data."))
      .finally(() => setLoading(false));
  }, []);

  // Count by category
  const counts = reports.reduce((acc, r) => {
    const key = r.category || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filtered = filter === "all"
    ? reports
    : reports.filter((r) => r.category === filter);

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        color: "var(--db-muted, #94a3b8)", fontSize: 13, padding: "32px 0",
      }}>
        <div style={{
          width: 16, height: 16,
          border: "2px solid rgba(42,108,44,0.2)",
          borderTop: "2px solid #2a6c2c",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading heatmap data…
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 10, padding: "14px 18px",
        color: "#f87171", fontSize: 13,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Icon name="error" style={{ fontSize: 16, color: "#f87171" }} />
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── SVG Map ── */}
      <div style={{ position: "relative" }}>
        <HeatmapSVG reports={filtered} />

        {/* floating report count chip */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(15,20,32,0.85)",
          border: "1px solid rgba(42,108,44,0.3)",
          borderRadius: 20, padding: "4px 12px",
          fontSize: 11, color: "#acf4a4", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 5,
          backdropFilter: "blur(4px)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#2a6c2c",
            boxShadow: "0 0 6px #2a6c2c",
          }} />
          {filtered.length} incident{filtered.length !== 1 ? "s" : ""} plotted
        </div>
      </div>

      {/* ── Legend ── */}
      <HeatmapLegend counts={counts} />

      {/* ── Filter tabs ── */}
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap", marginTop: 20, marginBottom: 14,
      }}>
        {["all", ...Object.keys(CATEGORY_CONFIG)].map((key) => {
          const cfg  = CATEGORY_CONFIG[key];
          const isActive = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: isActive
                  ? `1px solid ${cfg?.color || "#2a6c2c"}`
                  : "1px solid var(--db-border, rgba(255,255,255,0.08))",
                background: isActive
                  ? (cfg?.bg || "rgba(42,108,44,0.12)")
                  : "transparent",
                color: isActive
                  ? (cfg?.color || "#acf4a4")
                  : "var(--db-muted, #94a3b8)",
                fontSize: 11, fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                textTransform: "capitalize",
              }}
            >
              {key === "all" ? `All (${reports.length})` : `${CATEGORY_CONFIG[key].label} ${counts[key] ? `(${counts[key]})` : ""}`}
            </button>
          );
        })}
      </div>

      {/* ── Report list ── */}
      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--db-muted, #94a3b8)", padding: "16px 0" }}>
          No reports found for this category.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((r, i) => (
            <ReportListItem key={r._id || i} report={r} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
