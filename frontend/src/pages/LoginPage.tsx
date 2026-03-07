import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { api } from "@/lib/axios";

export function LoginPage() {
  const { login, user, initializing } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initializing) return;
    if (!user) return;

    (async () => {
      try {
        const res = await api.get<{ role: string }>("/auth/me");
        const role = res.data.role;

        if (role === "admin") {
          navigate("/admin/account-payments", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch {
        navigate("/", { replace: true });
      }
    })();
  }, [initializing, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email.trim(), password);

      const res = await api.get<{ role: string }>("/auth/me");
      const role = res.data.role;

      if (role === "admin") {
        navigate("/admin/account-payments", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      const msg =
        err?.code === "auth/invalid-credential"
          ? "Credenciales incorrectas"
          : "Credenciales incorrectas";

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "12vh",
        minHeight: "100vh",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1 className="h1">Iniciar sesión</h1>
        <p
          className="sub"
          style={{
            marginBottom: "24px",
          }}
        >
          Accede a tu cuenta
        </p>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Correo electrónico
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              autoFocus
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#ffffff",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </label>

          <label className="label">
            Contraseña
            <div style={{ position: "relative" }}>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  paddingRight: "56px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "#ffffff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </label>

          <button
            className="button"
            disabled={submitting}
            type="submit"
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.background = "#6d28d9";
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.background = "#7c3aed";
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: submitting ? "#a78bfa" : "#7c3aed",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.9 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>

          {error && (
            <div
              className="errorBox"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "14px",
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}