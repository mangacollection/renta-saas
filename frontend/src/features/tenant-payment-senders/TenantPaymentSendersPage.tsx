import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSubscriptions } from "@/features/subscriptions/subscriptions.api";
import type { Subscription } from "@/features/subscriptions/subscriptions.types";
import { createTenantPaymentSender } from "./tenantPaymentSenders.api";

function normalizeError(err: any): string {
  const msg =
    err?.response?.data?.message ??
    err?.message ??
    "No se pudo guardar el remitente bancario";
  return Array.isArray(msg) ? msg.join("\n") : String(msg);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d7dbe6",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #6d5efc",
        background: "#6d5efc",
        color: "#ffffff",
        fontWeight: 800,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        ...props.style,
      }}
    />
  );
}

export default function TenantPaymentSendersPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [email, setEmail] = useState("");
  const [bank, setBank] = useState("");

  const [loadingSubs, setLoadingSubs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadSubscriptions() {
    try {
      setLoadingSubs(true);
      const data = await getSubscriptions();
      setSubscriptions(data.filter((s) => s.status === "active"));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "No se pudieron cargar contratos"
      );
    } finally {
      setLoadingSubs(false);
    }
  }

  useEffect(() => {
    void loadSubscriptions();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!tenantId) {
      setError("Debes seleccionar un inquilino.");
      return;
    }

    if (!email.trim()) {
      setError("El email del banco es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      await createTenantPaymentSender({
        tenantId,
        email: email.trim(),
        bank: bank.trim() || undefined,
      });

      setSuccess("Remitente bancario guardado correctamente.");
      setEmail("");
      setBank("");
    } catch (err: any) {
      setError(normalizeError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          padding: 18,
          borderRadius: 18,
          background: "#ffffff",
          border: "1px solid #e6e8ef",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>
            Remitentes Bancarios
          </h2>
          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            Asocia correos bancarios a inquilinos para conciliación automática.
          </div>
        </div>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid #d7dbe6",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 600,
            textDecoration: "none",
            minHeight: 40,
            boxSizing: "border-box",
          }}
        >
          Volver
        </Link>
      </header>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#991b1b",
            fontWeight: 700,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #bbf7d0",
            background: "#f0fdf4",
            color: "#166534",
            fontWeight: 700,
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          border: "1px solid #e6e8ef",
          background: "#ffffff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        <div style={{ fontWeight: 900, color: "#0f172a" }}>
          Registrar remitente
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
          Ejemplo: notificaciones@banco.cl → inquilino correcto
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Inquilino</label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                disabled={loadingSubs || saving}
                style={inputStyle}
              >
                <option value="">
                  {loadingSubs ? "Cargando contratos..." : "Selecciona un inquilino"}
                </option>
                {subscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.tenantName} {sub.tenantEmail ? `— ${sub.tenantEmail}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Email banco</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
                placeholder="Ej: notificaciones@banco.cl"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Banco (opcional)</label>
              <input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                disabled={saving}
                placeholder="Ej: Banco de Chile"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ButtonPrimary type="submit" disabled={saving || loadingSubs}>
                {saving ? "Guardando..." : "Guardar remitente"}
              </ButtonPrimary>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
