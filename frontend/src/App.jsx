import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";

// Worker
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Employer
import EmployerLogin from "./pages/EmployerLogin";
import EmployerRegister from "./pages/EmployerRegister";
import EmployerDashboard from "./pages/EmployerDashboard";

// Role selection
import SelectRole from "./pages/SelectRole";
import SelectRegisterRole from "./pages/SelectRegisterRole";


// ─────────────────────────────────────────────
// Auth Guards
// ─────────────────────────────────────────────

// Worker protected
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Employer protected
const EmployerRoute = ({ children }) => {
  const token = localStorage.getItem("employer_token");
  return token ? children : <Navigate to="/login" replace />;
};

// Prevent logged-in users from seeing auth pages
const PublicRoute = ({ children }) => {
  const worker = localStorage.getItem("token");
  const employer = localStorage.getItem("employer_token");

  if (worker) return <Navigate to="/dashboard" replace />;
  if (employer) return <Navigate to="/employer/dashboard" replace />;

  return children;
};


// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("gs_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <Routes>

      {/* ───────── PUBLIC ───────── */}
      <Route path="/" element={<Home />} />

      {/* LOGIN FLOW */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <SelectRole />
          </PublicRoute>
        }
      />

      <Route
        path="/login/worker"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/login/employer"
        element={
          <PublicRoute>
            <EmployerLogin />
          </PublicRoute>
        }
      />

      {/* REGISTER FLOW */}
      <Route
        path="/register"
        element={
          <PublicRoute>
            <SelectRegisterRole />
          </PublicRoute>
        }
      />

      <Route
        path="/register/worker"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/register/employer"
        element={
          <PublicRoute>
            <EmployerRegister />
          </PublicRoute>
        }
      />

      {/* ───────── PROTECTED ───────── */}

      {/* Worker */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Employer */}
      <Route
        path="/employer/dashboard"
        element={
          <EmployerRoute>
            <EmployerDashboard />
          </EmployerRoute>
        }
      />

      {/* ───────── FALLBACK ───────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}