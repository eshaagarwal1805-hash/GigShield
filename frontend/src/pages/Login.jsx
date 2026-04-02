import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    // Simulated auth — replace with real API call later
    setTimeout(() => {
      setLoading(false);
      // Any email/password works for now
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f0f4f3",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "48px 40px",
            boxShadow: "0 20px 60px rgba(45,52,51,0.08)",
            animation: "fadeUp 0.5s ease both",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "32px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <span style={{ fontSize: "28px" }}>🛡</span>
            <span
              style={{
                fontSize: "22px",
                fontFamily: "Manrope, sans-serif",
                fontWeight: 800,
                color: "#0D7C66",
                letterSpacing: "-0.02em",
              }}
            >
              GigShield
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Manrope, sans-serif",
              fontWeight: 800,
              fontSize: "26px",
              color: "#2d3433",
              margin: "0 0 6px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "#596060", fontSize: "14px", marginBottom: "32px" }}>
            Sign in to access your GigShield dashboard.
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: "rgba(168,56,54,0.08)",
                border: "1px solid rgba(168,56,54,0.3)",
                color: "#a83836",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {/* Form — no <form> tag, using div + onClick */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{ fontSize: "13px", fontWeight: 600, color: "#2d3433" }}
              >
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="arjun@example.com"
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #dde4e3",
                  outline: "none",
                  fontSize: "14px",
                  color: "#2d3433",
                  backgroundColor: "#f8faf9",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2a6c2c")}
                onBlur={(e) => (e.target.style.borderColor = "#dde4e3")}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  style={{ fontSize: "13px", fontWeight: 600, color: "#2d3433" }}
                >
                  Password
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: "12px",
                    color: "#2a6c2c",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #dde4e3",
                  outline: "none",
                  fontSize: "14px",
                  color: "#2d3433",
                  backgroundColor: "#f8faf9",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2a6c2c")}
                onBlur={(e) => (e.target.style.borderColor = "#dde4e3")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2a6c2c 0%, #1d5f21 100%)",
                color: "#eaffe2",
                fontFamily: "Manrope, sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "opacity 0.2s, transform 0.1s",
              }}
              onMouseDown={(e) =>
                !loading && (e.currentTarget.style.transform = "scale(0.98)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign In to GigShield"
              )}
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "28px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "#dde4e3" }} />
            <span style={{ fontSize: "12px", color: "#9b9d9d" }}>
              New to GigShield?
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#dde4e3" }} />
          </div>

          {/* Register */}
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "10px",
              border: "1.5px solid #acb3b2",
              background: "none",
              color: "#2d3433",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2a6c2c";
              e.currentTarget.style.backgroundColor = "#f0f4f3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#acb3b2";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Create a free account →
          </button>
        </div>

        {/* Footer note */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "12px",
            color: "#9b9d9d",
            textAlign: "center",
          }}
        >
          © 2026 GigShield · Privacy-First · Offline-Ready
        </p>
      </div>
    </>
  );
}
