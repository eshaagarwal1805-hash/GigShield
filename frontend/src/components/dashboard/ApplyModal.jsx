// frontend/src/components/dashboard/ApplyModal.jsx
import { useState } from "react";
import api from "../../api/axios"; // adjust relative path if needed
import Icon from "../common/Icon"; // adjust if your Icon path differs

export default function ApplyModal({ job, onClose, onSuccess }) {
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleApply = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post(`/jobs/${job._id}/apply`, { coverNote: coverNote.trim() });
      onSuccess(job._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="db-modal-header">
          <h3 className="db-modal-title">Apply — {job.title}</h3>
          <button className="db-modal-close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="db-modal-body">
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="db-badge db-badge--green">{job.platform}</span>
              <span className="db-badge db-badge--blue">{job.location}</span>
              <span className="db-badge db-badge--green" style={{ fontWeight: 700 }}>
                ₹{job.pay}/day
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--db-muted)", margin: 0 }}>
              {job.description}
            </p>
          </div>

          <label className="db-field-label">
            Cover Note{" "}
            <span style={{ fontWeight: 400, color: "var(--db-muted)" }}>
              (optional, max 500 chars)
            </span>
            <textarea
              className="db-field-input"
              style={{ resize: "vertical", minHeight: 80 }}
              maxLength={500}
              placeholder="Tell the employer why you're a great fit…"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
            />
          </label>

          {error && <p className="db-modal-error">⚠ {error}</p>}
        </div>

        <div className="db-modal-footer">
          <button className="db-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="db-modal-save" onClick={handleApply} disabled={loading}>
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}