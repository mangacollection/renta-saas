import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { LoadingScreen } from "./LoadingScreen";

const ADMIN_EMAIL = "admin@rentacontrol.cl";

export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingScreen label="Validando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdmin && !isAdminRoute) {
    return <Navigate to="/admin/account-payments" replace />;
  }

  if (!isAdmin && isAdminRoute) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}