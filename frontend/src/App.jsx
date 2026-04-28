import './index.css'
import "./App.css"
import { Routes, Route, Navigate } from "react-router-dom"

import { AuthProvider } from "./contexts/AuthContext"
import { DEV_MODE } from "./config"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./layouts/AdminLayout.jsx"
import VolunteerLayout from "./layouts/VolunteerLayout.jsx"

// Auth pages (public — no login required)
import AdminLoginPage from "./pages/auth/AdminLoginPage.jsx"
import VolunteerLoginPage from "./pages/auth/VolunteerLoginPage.jsx"
import VolunteerSignupPage from "./pages/auth/VolunteerSignupPage.jsx"

function App() {
  const fallbackRoute = '/volunteer/login';

  console.log("🚀 App loading (Seva Setu) — Real Auth Flow Active");

  return (
    <AuthProvider>
      <Routes>
        {/* ── Public auth routes ─────────────────────────────────────────── */}
        <Route path="/admin/login"       element={<AdminLoginPage />} />
        <Route path="/volunteer/login"   element={<VolunteerLoginPage />} />
        <Route path="/volunteer/signup"  element={<VolunteerSignupPage />} />

        {/* ── Protected admin routes ─────────────────────────────────────── */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        } />

        {/* ── Protected volunteer routes ─────────────────────────────────── */}
        <Route path="/volunteer/*" element={
          <ProtectedRoute requiredRole="volunteer">
            <VolunteerLayout />
          </ProtectedRoute>
        } />

        {/* ── Fallback ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to={fallbackRoute} replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
