import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { IssueCertificatePage } from "../pages/IssueCertificatePage";
import { MyCertificatesPage } from "../pages/MyCertificatesPage";
import { VerifyCertificatePage } from "../pages/VerifyCertificatePage";
import { AdminPage } from "../pages/AdminPage";
import { ProfileSettingsPage } from "../pages/ProfileSettingsPage";
import { DEFAULT_ROUTE_BY_ROLE } from "../config/roleConfig";

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={DEFAULT_ROUTE_BY_ROLE[user.role]} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/issue" element={<IssueCertificatePage />} />
        <Route path="/certificates" element={<MyCertificatesPage />} />
        <Route path="/verify" element={<VerifyCertificatePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
