//eEarningsSection.jsx
// frontend/src/components/dashboard/EarningsSection.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";

const Icon = ({ name, style = {} }) => (
  <span
    className="material-symbols-outlined"
    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", lineHeight: 1, ...style }}
  >
    {name}
  </span>
);

export default function EarningsSection({ onEarningAdded }) {
  const [summary,      setSummary]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
const [formOpen,   setFormOpen]   = useState(false);
const [formData,   setFormData]   = useState({ amount: "", source: "", note: "" });
const [submitting, setSubmitting] = useState(false);
const [formMsg,    setFormMsg]    = useState(null);

const handleFormChange = (e) =>
  setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

const handleManualSubmit = async (e) => {
  e.preventDefault();
  if (!formData.amount) return;
  setSubmitting(true); setFormMsg(null);
  try {
    await api.post("/transactions/manual", {
      amount: Number(formData.amount),
      source: formData.source || "Manual Entry",
      note:   formData.note,
      type:   "credit",
    });
    setFormMsg({ type: "ok", text: "Earning added!" });
    setFormData({ amount: "", source: "", note: "" });
    setFormOpen(false);
    fetchData(); // refresh list and summary
  } catch (err) {
    setFormMsg({ type: "err", text: err?.response?.data?.message || "Failed to save." });
  } finally {
    setSubmitting(false);
  }
};

  const fetchData = () => {
  setLoading(true);
  Promise.all([
    api.get("/transactions/summary"),
    api.get("/transactions"),
  ])
    .then(([sumRes, txRes]) => {
      setSummary(sumRes.data);
      setTransactions(txRes.data);
    })
    .catch(() => setError("Failed to load earnings. Is the server running?"))
    .finally(() => setLoading(false));
};

useEffect(() => {
  fetchData();
}, []);

  if (loading) return (
    <div className="db-card" style={{ color: "var(--db-muted)", fontSize: 14 }}>
      Loading earnings…
    </div>
  );

  if (error) return (
    <div className="db-card" style={{ color: "#f87171", fontSize: 14 }}>⚠ {error}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Summary cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14 }}>
        {[
          { label: "Today",      value: summary?.today  || 0, icon: "today"        },
          { label: "This Week",  value: summary?.week   || 0, icon: "date_range"   },
          { label: "This Month", value: summary?.month  || 0, icon: "calendar_month"},
        ].map(({ label, value, icon }) => (
          <div key={label} className="db-card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon name={icon} style={{ fontSize: 16, color: "var(--db-primary)" }} />
              <span className="db-meta-label" style={{ margin: 0 }}>{label}</span>
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: "var(--db-primary)",
              fontFamily: "var(--db-font-head)",
            }}>
              ₹{value.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      {/* ── Add Earning manually ── */}
<div className="db-card">
  <div className="db-card-header">
    <div>
      <span className="db-card-eyebrow">Manual Entry</span>
      <h3 className="db-card-title">Add Earning</h3>
    </div>
    <button
      onClick={() => setFormOpen(o => !o)}
      style={{
        background: "rgba(42,108,44,0.08)", border: "1px solid rgba(42,108,44,0.2)",
        color: "var(--db-primary)", borderRadius: 8, padding: "6px 14px",
        fontSize: 12, fontWeight: 700, cursor: "pointer",
      }}
    >
      {formOpen ? "Cancel" : "+ Add"}
    </button>
  </div>

  {formOpen && (
    <form onSubmit={handleManualSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>

      {formMsg && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, fontSize: 13,
          background: formMsg.type === "ok" ? "rgba(42,108,44,0.08)" : "rgba(239,68,68,0.08)",
          color: formMsg.type === "ok" ? "var(--db-primary)" : "#f87171",
          border: `1px solid ${formMsg.type === "ok" ? "rgba(42,108,44,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}>
          {formMsg.text}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--db-muted)",
            display: "block", marginBottom: 6, textTransform: "uppercase" }}>
            Amount (₹) *
          </label>
          <input
            name="amount" type="number" min="1" required
            value={formData.amount} onChange={handleFormChange}
            placeholder="e.g. 450"
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px",
              borderRadius: 8, border: "1.5px solid var(--db-border)",
              background: "var(--db-bg)", color: "var(--db-text)", fontSize: 13,
            }}
          />
        </div>
        <div style={{ flex: 2, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--db-muted)",
            display: "block", marginBottom: 6, textTransform: "uppercase" }}>
            Platform / Source
          </label>
          <input
            name="source" type="text"
            value={formData.source} onChange={handleFormChange}
            placeholder="e.g. Swiggy, Uber, Zomato"
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px",
              borderRadius: 8, border: "1.5px solid var(--db-border)",
              background: "var(--db-bg)", color: "var(--db-text)", fontSize: 13,
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--db-muted)",
          display: "block", marginBottom: 6, textTransform: "uppercase" }}>
          Note (optional)
        </label>
        <input
          name="note" type="text"
          value={formData.note} onChange={handleFormChange}
          placeholder="e.g. Evening delivery batch"
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 12px",
            borderRadius: 8, border: "1.5px solid var(--db-border)",
            background: "var(--db-bg)", color: "var(--db-text)", fontSize: 13,
          }}
        />
      </div>

      <button type="submit" disabled={submitting} style={{
        padding: "11px 0", borderRadius: 9,
        background: submitting ? "var(--db-border)" : "#2a6c2c",
        color: submitting ? "var(--db-muted)" : "#fff",
        border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
      }}>
        {submitting ? "Saving…" : "Save Earning"}
      </button>
    </form>
  )}
</div>
      {/* ── Transaction list ── */}
      <div className="db-card">
        <div className="db-card-header">
          <div>
            <span className="db-card-eyebrow">Transaction History</span>
            <h3 className="db-card-title">All Earnings</h3>
          </div>
          <span style={{
            fontSize: 11, color: "var(--db-muted)", fontWeight: 600,
            background: "var(--db-bg)", padding: "4px 10px",
            borderRadius: 20, border: "1px solid var(--db-border)",
          }}>
            {summary?.count || 0} records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--db-muted)" }}>
            <Icon name="payments" style={{ fontSize: 36, display: "block", marginBottom: 8 }} />
            <p style={{ fontSize: 13 }}>No transactions yet.</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Complete a shift to see earnings here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {transactions.map((t, i) => {
              const isCredit = t.type === "credit";
              return (
                <div key={t._id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--db-border)",
                }}>

                  {/* Type icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: isCredit ? "rgba(42,108,44,0.08)" : "rgba(239,68,68,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon
                      name={isCredit ? "arrow_downward" : "arrow_upward"}
                      style={{ fontSize: 18, color: isCredit ? "var(--db-primary)" : "#f87171" }}
                    />
                  </div>

                  {/* Source + date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: "var(--db-text)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {t.source || "General Gig"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--db-muted)", marginTop: 2 }}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 800,
                      color: isCredit ? "var(--db-primary)" : "#f87171",
                      fontFamily: "var(--db-font-head)",
                    }}>
                      {isCredit ? "+" : "−"}₹{(t.amount || 0).toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 600, marginTop: 3,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      color: t.status === "verified" ? "var(--db-primary)"
                           : t.status === "disputed" ? "#f87171"
                           : "#f59e0b",
                    }}>
                      {t.status}
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