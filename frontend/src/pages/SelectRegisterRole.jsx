import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function SelectRegisterRole() {
  const navigate = useNavigate();

  return (
    <div className="auth-root">
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel-content">
          <h2 className="auth-panel-title">
            Join GigShield
          </h2>
          <p className="auth-panel-sub">
            Choose how you want to register.
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <h1 className="auth-form-title">Create account as</h1>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              className="auth-btn-primary"
              onClick={() => navigate("/register/worker")}
            >
              Gig Worker →
            </button>

            <button
              className="auth-btn-secondary"
              onClick={() => navigate("/register/employer")}
            >
              Employer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}