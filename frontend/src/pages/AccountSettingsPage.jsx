import { useState, useEffect } from "react";
import "../styles/AccountSettings.css";
import api from "../api/axios";

export default function AccountSettingsPage() {
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [emailMsg,    setEmailMsg]    = useState("");
  const [phoneMsg,    setPhoneMsg]    = useState("");
  const [passMsg,     setPassMsg]     = useState("");

  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [passLoading,  setPassLoading]  = useState(false);

  const updateEmail = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim())          { setEmailMsg("error:Email cannot be empty"); return; }
  if (!emailRegex.test(email)){ setEmailMsg("error:Enter a valid email address"); return; }
  setEmailLoading(true); setEmailMsg("");
  try {
    await api.put("/user/profile", { email });
    setEmailMsg("success:Email updated successfully");
  } catch (err) {
    setEmailMsg(`error:${err.response?.data?.message || "Failed to update email"}`);
  } finally { setEmailLoading(false); }
};

const updatePhone = async () => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone.trim())           { setPhoneMsg("error:Phone cannot be empty"); return; }
  if (!phoneRegex.test(phone.replace(/\s+/g, "").replace(/^\+91/, ""))) {
    setPhoneMsg("error:Enter a valid 10-digit Indian mobile number"); return;
  }
  setPhoneLoading(true); setPhoneMsg("");
  try {
    await api.put("/user/profile", { phone });
    setPhoneMsg("success:Phone updated successfully");
  } catch (err) {
    setPhoneMsg(`error:${err.response?.data?.message || "Failed to update phone"}`);
  } finally { setPhoneLoading(false); }
};

const updatePassword = async () => {
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!oldPassword || !newPassword) { setPassMsg("error:Fill both fields"); return; }
  if (newPassword.length < 6)       { setPassMsg("error:Minimum 6 characters"); return; }
  if (!strongPassword.test(newPassword)) {
    setPassMsg("error:Password needs uppercase, lowercase and a number"); return;
  }
  if (newPassword === oldPassword)  { setPassMsg("error:New password must differ from current"); return; }
  setPassLoading(true); setPassMsg("");
  try {
    await api.put("/user/password", { oldPassword, newPassword });
    setPassMsg("success:Password updated successfully");
    setOldPassword(""); setNewPassword("");
  } catch (err) {
    setPassMsg(`error:${err.response?.data?.message || "Failed to update password"}`);
  } finally { setPassLoading(false); }
};

  // msg format is "success:text" or "error:text"
  const Msg = ({ raw }) => {
    if (!raw) return null;
    const [type, ...rest] = raw.split(":");
    const text = rest.join(":");
    return (
      <div className={`as-msg ${type === "success" ? "as-msg--success" : "as-msg--error"}`}>
        {type === "success" ? "✓" : "✕"} {text}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 600 }}>

      {/* ── EMAIL CARD ── */}
      <div className="as-card">
        <div className="as-card-head">
          <div className="as-icon-box">
            <span className="material-symbols-outlined">alternate_email</span>
          </div>
          <div>
            <div className="as-card-title">Email Address</div>
          <div className="as-card-subtitle">Change your registered email address</div>
          </div>
        </div>

        <label className="as-label">Email</label>
        <input
          className="as-input"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailMsg(""); }}
          placeholder="your@email.com"
        />
        <button className="as-btn" onClick={updateEmail} disabled={emailLoading}>
          {emailLoading ? "Saving…" : "Update Email"}
        </button>
        <Msg raw={emailMsg} />
      </div>

      {/* ── PHONE CARD ── */}
      <div className="as-card">
        <div className="as-card-head">
          <div className="as-icon-box">
            <span className="material-symbols-outlined">phone_iphone</span>
          </div>
          <div>
            <div className="as-card-title">Phone Number</div>
            <div className="as-card-subtitle">Change your contact number</div>
          </div>
        </div>

        <label className="as-label">Phone</label>
        <input
          className="as-input"
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setPhoneMsg(""); }}
          placeholder="+91 98765 43210"
        />
        <button className="as-btn" onClick={updatePhone} disabled={phoneLoading}>
          {phoneLoading ? "Saving…" : "Update Phone"}
        </button>
        <Msg raw={phoneMsg} />
      </div>

      {/* ── PASSWORD CARD ── */}
      <div className="as-card">
        <div className="as-card-head">
          <div className="as-icon-box">
            <span className="material-symbols-outlined">lock_reset</span>
          </div>
          <div>
            <div className="as-card-title">Change Password</div>
            <div className="as-card-subtitle">Update your account password</div>
          </div>
        </div>

        <label className="as-label">Current Password</label>
        <input
          className="as-input"
          type="password"
          value={oldPassword}
          onChange={(e) => { setOldPassword(e.target.value); setPassMsg(""); }}
          placeholder="Enter current password"
          style={{ marginBottom: 14 }}
        />
        <label className="as-label">New Password</label>
        <input
          className="as-input"
          type="password"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); setPassMsg(""); }}
          placeholder="Min. 6 characters"
        />
        <button className="as-btn" onClick={updatePassword} disabled={passLoading}>
          {passLoading ? "Updating…" : "Update Password"}
        </button>
        <Msg raw={passMsg} />
      </div>
    </div>
  );
}