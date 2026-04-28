import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function SelectRole() {
  const navigate = useNavigate();

  return (
    <div className="auth-root">
      {/* Left panel (reuse your existing styling) */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel-content">
          <h2 className="auth-panel-title">
            Your safety<br />never clocks out.
          </h2>
          <p className="auth-panel-sub">
            Choose how you want to continue.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <h1 className="auth-form-title">Continue as</h1>

          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <button
              className="auth-btn-primary"
              onClick={() => navigate("/login/worker")}
            >
              Gig Worker →
            </button>

            <button
              className="auth-btn-secondary"
              onClick={() => navigate("/login/employer")}
            >
              Employer →
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}