import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { api } from "@/lib/axios";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export function LoginPage() {
  const { login, user, initializing } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function redirectUser() {
    try {
      const res = await api.get<{ role: string }>("/auth/me");
      const role = res.data.role;

      if (role === "admin") {
        navigate("/app/admin/account-payments", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch {
      navigate("/app", { replace: true });
    }
  }

  useEffect(() => {
    if (initializing) return;
    if (!user) return;

    void redirectUser();
  }, [initializing, user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResetMessage(null);

    try {
      await login(email.trim(), password);
      await redirectUser();
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setResetMessage("Ingresa tu correo primero");
      return;
    }

    setResetLoading(true);
    setResetMessage(null);

    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      setResetMessage("Te enviamos un correo para restablecer tu contraseña");
    } catch {
      setResetMessage("No se pudo enviar el correo");
    } finally {
      setResetLoading(false);
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
        <p className="sub" style={{ marginBottom: "24px" }}>
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
              required
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
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </label>

          <div
            style={{
              textAlign: "right",
              marginTop: "-8px",
              marginBottom: "12px",
            }}
          >
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetLoading}
              style={{
                background: "none",
                border: "none",
                color: "#7c3aed",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {resetLoading ? "Enviando..." : "¿Olvidaste tu contraseña?"}
            </button>
          </div>

          {resetMessage && (
            <div
              style={{
                marginBottom: "12px",
                fontSize: "13px",
                color: "#374151",
              }}
            >
              {resetMessage}
            </div>
          )}

          <button
            disabled={submitting}
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: submitting ? "#a78bfa" : "#7c3aed",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>

          {error && (
            <div
              style={{
                marginTop: "12px",
                color: "#b91c1c",
                fontSize: "14px",
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