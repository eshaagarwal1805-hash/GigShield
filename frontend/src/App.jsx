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

// Admin
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";


// ─────────────────────────────────────────────
// AUTH GUARDS
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

// ✅ Admin protected (NEW)
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user?.role === "admin") {
      return children;
    }
  } catch {}

  return <Navigate to="/admin/login" replace />;
};

// ✅ Public route (FIXED)
const PublicRoute = ({ children }) => {
  const worker = localStorage.getItem("token");
  const employer = localStorage.getItem("employer_token");

  const currentPath = window.location.pathname;

  // ✅ allow admin pages ALWAYS
  if (currentPath.startsWith("/admin")) {
    return children;
  }

  if (worker) return <Navigate to="/dashboard" replace />;
  if (employer) return <Navigate to="/employer/dashboard" replace />;

  return children;
};


// ─────────────────────────────────────────────
// APP
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

      {/* ───────── ADMIN ───────── */}

      {/* Admin Login (public but bypass restriction) */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      <Route
        path="/admin/register"
        element={
          <PublicRoute>
            <AdminRegister />
          </PublicRoute>
        }
      />

      {/* Admin Dashboard (protected) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* ───────── FALLBACK ───────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}