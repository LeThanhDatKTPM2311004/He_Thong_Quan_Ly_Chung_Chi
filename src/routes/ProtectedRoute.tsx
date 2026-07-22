import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ALLOWED_ROUTES_BY_ROLE, DEFAULT_ROUTE_BY_ROLE } from "../config/roleConfig";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const allowedRoutes = ALLOWED_ROUTES_BY_ROLE[user.role];
  const isAllowed = allowedRoutes.some((r) => location.pathname.startsWith(r));

  if (!isAllowed) {
    // Role này không có quyền vào route -> đưa về trang mặc định của họ
    return <Navigate to={DEFAULT_ROUTE_BY_ROLE[user.role]} replace />;
  }

  return <>{children}</>;
}
