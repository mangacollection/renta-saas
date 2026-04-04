import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { LoadingScreen } from "./LoadingScreen";

export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  // ⏳ Esperar auth
  if (initializing) {
    return <LoadingScreen label="Validando sesión..." />;
  }

  // 🔒 No autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 ADMIN → redirección inmediata
  if (
    user.email === "admin@rentacontrol.cl" &&
    !location.pathname.startsWith("/admin")
  ) {
    return <Navigate to="/admin/account-payments" replace />;
  }

  // ✅ Usuario válido
  return <Outlet />;
}