import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { LoadingScreen } from "./LoadingScreen";

export function ProtectedRoute() {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen label="Validando sesión..." />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}