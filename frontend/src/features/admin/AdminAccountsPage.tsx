import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuth } from "@/auth/useAuth";
import { Link } from "react-router-dom";

type AccountOverview = {
  id: string;
  name: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  plan: string;
  billingStatus: string;
  createdAt: string;
  monthsSubscribed: number;
  totalPaid: number;
};

const th: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 700,
  fontSize: 14,
  color: "#111827",
  textAlign: "left",
};

const td: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: 14,
  verticalAlign: "middle",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #d7dbe6",
  outline: "none",
  fontSize: 14,
};

const modalButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, user } = useAuth();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rut, setRut] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [waText, setWaText] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<AccountOverview[]>("/admin/accounts/overview");
      setAccounts(res.data);
    } catch (err: any) {
      setError("Error cargando cuentas");
    } finally {
      setLoading(false);
    }
  }

  async function createOwner() {
    try {
      setCreating(true);
      setCreateMsg(null);
      setError(null);

      await api.post("/admin/accounts", {
        email: email.trim(),
        phone: phone.trim() || undefined,
        rut: rut.trim() || undefined,
        plan: "early_adopter",
        planPrice: 6990,
      });

      setCreateMsg("Owner creado correctamente ✅");
      setEmail("");
      setPhone("");
      setRut("");

      await loadAccounts();
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : null;

      setCreateMsg(backendMsg ?? "Error creando owner ❌");
    } finally {
      setCreating(false);
    }
  }

  async function updateBillingStatus(
    accountId: string,
    status: "active" | "past_due"
  ) {
    try {
      setUpdatingId(accountId);
      await api.patch(`/admin/accounts/${accountId}/billing`, {
        billingStatus: status,
      });

      await loadAccounts();
    } catch {
      alert("Error actualizando estado");
    } finally {
      setUpdatingId(null);
    }
  }

  function openWhatsAppModal(
    ownerEmail: string | null,
    ownerPhone?: string | null
  ) {
    if (!ownerPhone || !ownerEmail) {
      alert("Faltan datos del owner");
      return;
    }

    const appUrl = `${window.location.origin}/login`;

    const text = [
      "Hola,",
      "",
      "Ya creamos tu acceso a RentaControl.",
      "",
      "Puedes ingresar aqui:",
      appUrl,
      "",
      "Tu correo es:",
      ownerEmail,
      "",
      'Para crear tu contrasena, haz clic en "Olvide mi contrasena".',
      "",
      "Si necesitas ayuda, me escribes.",
    ].join("\n");

    setWaText(text);
    setWaPhone(ownerPhone.replace(/\D/g, ""));
    setCopyMsg(null);
    setShowModal(true);
  }

  async function copyWhatsAppText() {
    try {
      await navigator.clipboard.writeText(waText);
      setCopyMsg("Mensaje copiado ✅");
    } catch {
      setCopyMsg("No se pudo copiar ❌");
    }
  }

  function openWhatsAppChat() {
    if (!waPhone) {
      alert("No hay telefono cargado");
      return;
    }

    const encodedText = encodeURIComponent(waText);
    window.open(
      `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodedText}`,
      "_blank"
    );
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        Cargando cuentas...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ padding: 24, maxWidth: 1100, margin: "0 auto", color: "red" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: 18,
          borderRadius: 18,
          background: "#ffffff",
          border: "1px solid #e6e8ef",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          marginBottom: 18,
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Panel de Administracion</h2>

          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            Vision general de todas las cuentas activas del sistema.
          </div>

          <div style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>
            Sesion: <b>{user?.email}</b>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/admin/account-payments"
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                background: "#f1f5f9",
                color: "#0f172a",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 13,
                border: "1px solid #d7dbe6",
              }}
            >
              Pagos
            </Link>

            <Link
              to="/admin/accounts"
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                background: "#6d5efc",
                color: "#ffffff",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              Cuentas
            </Link>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid #d7dbe6",
            background: "#ffffff",
            cursor: "pointer",
          }}
        >
          Cerrar sesion
        </button>
      </header>

      <div
        style={{
          borderRadius: 18,
          background: "#ffffff",
          border: "1px solid #e6e8ef",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
          Crear Owner
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr)) auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Email
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="owner@correo.cl"
              type="email"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Telefono
            </div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              placeholder="+56 9 1234 5678"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              RUT
            </div>
            <input
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              style={inputStyle}
              placeholder="12.345.678-9"
            />
          </div>

          <button
            onClick={createOwner}
            disabled={creating || !email.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "#6d5efc",
              color: "#fff",
              border: "none",
              cursor: creating || !email.trim() ? "not-allowed" : "pointer",
              height: 42,
              opacity: creating || !email.trim() ? 0.7 : 1,
              fontWeight: 700,
            }}
          >
            {creating ? "Creando..." : "Crear"}
          </button>
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Plan: <b>early_adopter</b> · Precio: <b>$6.990</b> · Estado inicial:{" "}
          <b>trial</b>
        </div>

        {createMsg && (
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: createMsg.includes("✅") ? "#16a34a" : "#b91c1c",
              fontWeight: 600,
            }}
          >
            {createMsg}
          </div>
        )}
      </div>

      <div
        style={{
          borderRadius: 18,
          background: "#ffffff",
          border: "1px solid #e6e8ef",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={th}>Cuenta</th>
              <th style={th}>Owner</th>
              <th style={th}>Telefono</th>
              <th style={th}>Plan</th>
              <th style={th}>Estado</th>
              <th style={th}>Meses</th>
              <th style={th}>Total Pagado</th>
              <th style={th}>Creado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id}>
                <td style={td}>{acc.name}</td>
                <td style={td}>{acc.ownerEmail ?? "-"}</td>
                <td style={td}>{acc.ownerPhone ?? "—"}</td>
                <td style={td}>{acc.plan}</td>
                <td style={td}>{acc.billingStatus}</td>
                <td style={td}>{acc.monthsSubscribed}</td>
                <td style={td}>
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    maximumFractionDigits: 0,
                  }).format(acc.totalPaid)}
                </td>
                <td style={td}>
                  {new Date(acc.createdAt).toLocaleDateString("es-CL")}
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() =>
                        openWhatsAppModal(acc.ownerEmail, acc.ownerPhone)
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: "#25D366",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      WhatsApp
                    </button>

                    <button
                      onClick={() => updateBillingStatus(acc.id, "active")}
                      disabled={updatingId === acc.id}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: "#16a34a",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: updatingId === acc.id ? "not-allowed" : "pointer",
                        opacity: updatingId === acc.id ? 0.7 : 1,
                      }}
                    >
                      {updatingId === acc.id && acc.billingStatus !== "active"
                        ? "Actualizando..."
                        : "Activar"}
                    </button>

                    <button
                      onClick={() => updateBillingStatus(acc.id, "past_due")}
                      disabled={updatingId === acc.id}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: "#dc2626",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: updatingId === acc.id ? "not-allowed" : "pointer",
                        opacity: updatingId === acc.id ? 0.7 : 1,
                      }}
                    >
                      {updatingId === acc.id && acc.billingStatus !== "past_due"
                        ? "Actualizando..."
                        : "Past Due"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#ffffff",
              borderRadius: 18,
              border: "1px solid #e6e8ef",
              boxShadow: "0 20px 50px rgba(15,23,42,0.22)",
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              Mensaje WhatsApp
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 12,
              }}
            >
              Puedes revisar o editar el mensaje antes de enviarlo.
            </div>

            <textarea
              value={waText}
              onChange={(e) => setWaText(e.target.value)}
              style={{
                width: "100%",
                minHeight: 220,
                resize: "vertical",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #d7dbe6",
                outline: "none",
                fontSize: 14,
                lineHeight: 1.5,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            {copyMsg && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: copyMsg.includes("✅") ? "#16a34a" : "#b91c1c",
                  fontWeight: 600,
                }}
              >
                {copyMsg}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              <button
                onClick={copyWhatsAppText}
                style={{
                  ...modalButtonStyle,
                  background: "#f8fafc",
                  color: "#0f172a",
                  border: "1px solid #d7dbe6",
                }}
              >
                Copiar mensaje
              </button>

              <button
                onClick={openWhatsAppChat}
                style={{
                  ...modalButtonStyle,
                  background: "#25D366",
                  color: "#ffffff",
                }}
              >
                Abrir WhatsApp
              </button>

              <button
                onClick={() => {
                  setShowModal(false);
                  setCopyMsg(null);
                }}
                style={{
                  ...modalButtonStyle,
                  background: "#e5e7eb",
                  color: "#111827",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}