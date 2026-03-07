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

  // ✅ Si ya hay sesión, redirigir por rol (NO mandar siempre a "/")
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
        // fallback seguro
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
          ? "Credenciales inválidas"
          : err?.message ?? "Error de login";
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">Renta SaaS</h1>
        <p className="sub">Ingresa con tu email y contraseña</p>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Email
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              required
            />
          </label>

          <label className="label">
            Password
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>

          <button className="button" disabled={submitting} type="submit">
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>

          {error && <div className="errorBox">{error}</div>}
        </form>
      </div>
    </div>
  );
}