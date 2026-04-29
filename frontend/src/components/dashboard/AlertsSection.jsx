// frontend/src/components/dashboard/AlertsSection.jsx
import { useState } from "react";
import RiskReportForm from "../RiskReportForm";

export default function AlertsSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div
      style={{
        maxWidth: 780,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <RiskReportForm onSubmitted={() => setRefreshKey((k) => k + 1)} />
      <div
        style={{
          borderTop: "1px solid var(--db-border)",
          paddingTop: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--db-font-head)",
            fontWeight: 700,
            fontSize: 16,
            color: "var(--db-text)",
            marginBottom: 16,
          }}
        >
          {/* Placeholder for future alerts list */}
        </div>
      </div>
    </div>
  );
}