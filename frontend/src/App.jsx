import { Routes, Route, Navigate } from "react-router-dom";
import Home              from "./pages/Home";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import EmployerLogin     from "./pages/EmployerLogin";
import EmployerRegister  from "./pages/EmployerRegister";
import EmployerDashboard from "./pages/EmployerDashboard";
import { useEffect } from "react";

// ── Auth guards ───────────────────────────────────────────────
const PrivateRoute  = ({ children }) =>
  localStorage.getItem("token")          ? children : <Navigate to="/login"          />;

const EmployerRoute = ({ children }) =>
  localStorage.getItem("employer_token") ? children : <Navigate to="/employer/login" />;

// ─────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("gs_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/"          element={<Home />}     />
      <Route path="/login"     element={<Login />}    />
      <Route path="/register"  element={<Register />} />

      {/* ── Worker dashboard (protected) ── */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
  
      {/* ── Employer pages ── */}
      <Route path="/employer/login"    element={<EmployerLogin />}    />
      <Route path="/employer/register" element={<EmployerRegister />} />
      <Route
        path="/employer/dashboard"
        element={
          <EmployerRoute>
            <EmployerDashboard />
          </EmployerRoute>
        }
      />

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}