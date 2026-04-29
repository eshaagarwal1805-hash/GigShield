import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchHeatmap } from '../api/safety';
//import api from "../api/axios";
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

// ── Geocode cache — outside component so it persists ──
const geocodeCache = {};

function ReportListItem({ report, index }) {
  const cfg = CATEGORY_CONFIG[report.category] || CATEGORY_CONFIG.other;
  const coords = report.location?.coordinates;
  const hasCoords = coords && (coords[0] !== 0 || coords[1] !== 0);
  const [areaLabel, setAreaLabel] = useState("Locating…");

  useEffect(() => {
    if (!hasCoords) {
      setAreaLabel("No location");
      return;
    }

    const key = `${coords[1].toFixed(3)},${coords[0].toFixed(3)}`;

    // Return cached result immediately
    if (geocodeCache[key]) {
      setAreaLabel(geocodeCache[key]);
      return;
    }

    // Stagger each request by index to avoid rate limiting
    const timer = setTimeout(() => {
      fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords[1]}&longitude=${coords[0]}&localityLanguage=en`,
        { headers: { "Accept-Language": "en" } }
      )
        .then((r) => r.json())
        .then((data) => {
          const addr = data?.address;
          if (!addr) throw new Error("no address");
          const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.village || addr.town || addr.city || "";
          const city = addr.city || addr.town || addr.state_district || addr.state || "";
          const label = area && area !== city && city
            ? `${area}, ${city}`
            : area || city || `${coords[1].toFixed(3)}, ${coords[0].toFixed(3)}`;
          geocodeCache[key] = label;
          setAreaLabel(label);
        })
        .catch(() => {
          setAreaLabel(`${coords[1].toFixed(3)}, ${coords[0].toFixed(3)}`);
        });
    }, index * 600); // 600ms gap between each request

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--db-surface)",
      border: `1px solid var(--db-border)`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 10,
      animation: "fadeSlideIn 0.3s ease both",
      animationDelay: `${index * 0.04}s`,
    }}>
      {/* Top row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
        marginBottom: report.description ? 10 : 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%",
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: cfg.color, flexShrink: 0,
          }}>
            {index + 1}
          </span>
          <CategoryBadge category={report.category} />
          <span style={{ fontSize: 11, color: "var(--db-muted)" }}>
            {formatDate(report.reportedAt)}
          </span>
        </div>

        {/* Location label */}
        <span style={{
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.22)",
          color: "#60a5fa", borderRadius: 20, padding: "3px 10px",
          fontSize: 11, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 4,
          transition: "all 0.3s ease",
        }}>
          <Icon name={hasCoords ? "location_on" : "location_off"}
            style={{ fontSize: 12, color: "#60a5fa" }} />
          {areaLabel}
        </span>
      </div>

      {/* Description */}
      {report.description && (
        <div style={{
          fontSize: 13, color: "var(--db-text)",
          lineHeight: 1.55, padding: "10px 12px",
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 8,
        }}>
          {report.description}
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
//  Legend
// ─────────────────────────────────────────────────────────────

function HeatmapLegend({ counts, filter, setFilter, total }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      <button
        onClick={() => setFilter("all")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: filter === "all" ? "rgba(42,108,44,0.18)" : "rgba(42,108,44,0.08)",
          border: `1.5px solid ${filter === "all" ? "rgba(42,108,44,0.6)" : "rgba(42,108,44,0.3)"}`,
          borderRadius: 20, padding: "5px 12px",
          fontSize: 11, color: "#2a6c2c", fontWeight: 700,
          cursor: "pointer", transition: "all 0.15s ease", outline: "none",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a6c2c", flexShrink: 0 }} />
        All
        <span style={{ background: "rgba(42,108,44,0.15)", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
          {total}
        </span>
      </button>
      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
        const isActive = filter === key;
        return (
          <button
            key={key}
            onClick={() => setFilter(isActive ? "all" : key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isActive ? cfg.bg.replace("0.10", "0.22") : cfg.bg,
              border: `1.5px solid ${isActive ? cfg.color : cfg.border}`,
              borderRadius: 20, padding: "5px 12px",
              fontSize: 11, color: cfg.color, fontWeight: isActive ? 700 : 600,
              cursor: "pointer", transition: "all 0.15s ease", outline: "none",
              boxShadow: isActive ? `0 0 0 2px ${cfg.bg}` : "none",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
            {cfg.label}
            {counts[key] != null && (
              <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                {counts[key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function LeafletMap({ reports }) {
  const mapRef        = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef    = useRef([]);

  // Init map once
  useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Update markers when reports change
  useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map) return;

  map.invalidateSize();

  // Clear old markers
  markersRef.current.forEach((m) => m.remove());
  markersRef.current = [];

  // Add new markers with location label
  const labelPromises = reports.map(async (r) => {
    const coords = r.location?.coordinates;
    if (!coords || (coords[0] === 0 && coords[1] === 0)) return;

    const cfg = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.other;

    // Fetch area name from coordinates
    let areaLabel = `${coords[1].toFixed(3)}, ${coords[0].toFixed(3)}`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords[1]}&lon=${coords[0]}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const addr = data?.address;
      if (addr) {
        const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.village || addr.town || addr.city || "";
        const city = addr.city || addr.town || addr.state_district || addr.state || "";
        areaLabel = area && area !== city && city
          ? `${area}, ${city}`
          : area || city || areaLabel;
      }
    } catch { /* use coordinates as fallback */ }

    const marker = L.circleMarker([coords[1], coords[0]], {
      color: cfg.color,
      fillColor: cfg.color,
      fillOpacity: 0.5,
      radius: 12,
      weight: 2,
    }).bindPopup(`
      <div style="font-family: sans-serif; min-width: 160px;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${cfg.label}</div>
        <div style="font-size: 12px; color: #555; margin-bottom: 4px;">
          📍 ${areaLabel}
        </div>
        <div style="font-size: 12px; color: #333; margin-bottom: 4px;">
          ${r.description || ""}
        </div>
        <div style="font-size: 10px; color: #888;">
          ${new Date(r.reportedAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
          })}
        </div>
      </div>
    `).addTo(map);

    // Add area label as tooltip always visible
    marker.bindTooltip(areaLabel, {
      permanent: true,
      direction: "top",
      className: "heatmap-label",
      offset: [0, -10],
    });

    markersRef.current.push(marker);
  });

  // Zoom to markers after all labels loaded
  Promise.all(labelPromises).then(() => {
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.4));
    }
  });

}, [reports]);

  return <div ref={mapRef} style={{ height: "340px", width: "100%", borderRadius: 10 }} />;
}

// ─────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export default function HeatmapView({ refreshKey = 0, mapOnly = false, nearbyOnly = false, reports: externalReports = null }) {
  const [fetchedReports, setFetchedReports] = useState([]);
  const [loading, setLoading] = useState(!nearbyOnly);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("all");
  const [allCounts, setAllCounts] = useState({});

useEffect(() => {
  if (nearbyOnly) return;
  setLoading(true);
  setError(null);

  fetchHeatmap()
    .then(({ data }) => {
      const c = data.reduce((acc, r) => {
        const key = r.category || "other";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      setAllCounts(c);
      setFetchedReports(filter === "all" ? data : data.filter((r) => r.category === filter));
    })
    .catch((err) => {
      console.error("Heatmap fetch error:", err);
      setError("Failed to load heatmap data.");
    })
    .finally(() => setLoading(false));
}, [refreshKey, nearbyOnly, filter]);

const reports = nearbyOnly ? (externalReports ?? []) : fetchedReports;
  // Count by category
  const counts = reports.reduce((acc, r) => {
    const key = r.category || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filtered = reports;

  // ── Loading ──
  if (loading && fetchedReports.length === 0) {
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
    <style>{`
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>

    {/* ── Real Map ── */}
    <div style={{ position: "relative", borderRadius: 10, overflow: "clip", isolation: "isolate" }}>
  <LeafletMap key={filter} reports={filtered} />
  <div style={{
    position: "absolute", top: 10, right: 10, zIndex: 400,
        background: "rgba(15,20,32,0.85)",
        border: "1px solid rgba(42,108,44,0.3)",
        borderRadius: 20, padding: "4px 12px",
        fontSize: 11, color: "#acf4a4", fontWeight: 600,
        display: "flex", alignItems: "center", gap: 5,
        backdropFilter: "blur(4px)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2a6c2c", boxShadow: "0 0 6px #2a6c2c" }} />
        {filtered.length} incident{filtered.length !== 1 ? "s" : ""} plotted
      </div>
    </div>

    {/* ── Legend always shows ── */}
    <HeatmapLegend counts={allCounts} filter={filter} setFilter={setFilter} total={Object.values(allCounts).reduce((a, b) => a + b, 0)} />

    {/* ── Report list only on full view ── */}
    {!mapOnly && (
      <>
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
    )}
  </>
);
}