// frontend/src/components/account/AccountSettingsModal.jsx
import { useState } from "react";
import api from "../../api/axios";
import Icon from "../common/Icon";

export default function AccountSettingsModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    job: user?.job || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("profile"); // profile | security

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (tab === "security") {
      if (form.newPassword !== form.confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      if (form.newPassword && form.newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload =
        tab === "profile"
          ? {
              name: form.name,
              email: form.email,
              phone: form.phone,
              job: form.job,
            }
          : {
              oldPassword: form.oldPassword,
              newPassword: form.newPassword,
            };

      const res = await api.put("/user/profile", payload);
      setSuccess("Saved successfully!");
      if (onSave) onSave(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={(e) => e.stopPropagation()}>
        <div className="db-modal-header">
          <h3 className="db-modal-title">Account Settings</h3>
          <button className="db-modal-close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="db-modal-tabs">
          <button
            className={`db-modal-tab ${
              tab === "profile" ? "db-modal-tab--active" : ""
            }`}
            onClick={() => setTab("profile")}
          >
            <Icon name="person" style={{ fontSize: 15 }} /> Profile
          </button>
          <button
            className={`db-modal-tab ${
              tab === "security" ? "db-modal-tab--active" : ""
            }`}
            onClick={() => setTab("security")}
          >
            <Icon name="lock" style={{ fontSize: 15 }} /> Security
          </button>
        </div>

        <div className="db-modal-body">
          {tab === "profile" && (
            <div className="db-modal-fields">
              <label className="db-field-label">
                Full Name
                <input
                  className="db-field-input"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Your full name"
                />
              </label>
              <label className="db-field-label">
                Email
                <input
                  className="db-field-input"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="your@email.com"
                />
              </label>
              <label className="db-field-label">
                Phone Number
                <input
                  className="db-field-input"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+91 00000 00000"
                />
              </label>
              <label className="db-field-label">
                Job / Role
                <input
                  className="db-field-input"
                  value={form.job}
                  onChange={handleChange("job")}
                  placeholder="e.g. Delivery Partner, Driver"
                />
              </label>
            </div>
          )}

          {tab === "security" && (
            <div className="db-modal-fields">
              <label className="db-field-label">
                Current Password
                <input
                  className="db-field-input"
                  type="password"
                  value={form.oldPassword}
                  onChange={handleChange("oldPassword")}
                  placeholder="Enter current password"
                />
              </label>
              <label className="db-field-label">
                New Password
                <input
                  className="db-field-input"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange("newPassword")}
                  placeholder="Min. 6 characters"
                />
              </label>
              <label className="db-field-label">
                Confirm New Password
                <input
                  className="db-field-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Repeat new password"
                />
              </label>
            </div>
          )}

          {error && <p className="db-modal-error">⚠ {error}</p>}
          {success && <p className="db-modal-success">✓ {success}</p>}
        </div>

        <div className="db-modal-footer">
          <button className="db-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="db-modal-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}