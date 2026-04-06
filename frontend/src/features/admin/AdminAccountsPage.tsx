import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";

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

type PlatformBillingConfig = {
  id: string;
  billingPhone: string | null;
  billingBankName: string | null;
  billingAccountType: string | null;
  billingAccountNumber: string | null;
  billingAccountHolder: string | null;
  billingAccountRut: string | null;
  billingTransferEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #d7dbe6",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
  background: "#ffffff",
};

const modalButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #e6e8ef",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "danger";
}) {
  const color =
    tone === "success" ? "#166534" : tone === "danger" ? "#991b1b" : "#0f172a";

  return (
    <div
      style={{
        ...cardStyle,
        padding: 18,
      }}
    >
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 28,
          lineHeight: 1.1,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>
        {title}
      </div>
      {subtitle ? (
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isActive = normalized === "active";
  const isPastDue = normalized === "past_due";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: isActive ? "#dcfce7" : isPastDue ? "#fee2e2" : "#ede9fe",
        color: isActive ? "#166534" : isPastDue ? "#991b1b" : "#5b21b6",
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        background: "#f8fafc",
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#475569",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  const [billingPhone, setBillingPhone] = useState("");
  const [billingBankName, setBillingBankName] = useState("");
  const [billingAccountType, setBillingAccountType] = useState("");
  const [billingAccountNumber, setBillingAccountNumber] = useState("");
  const [billingAccountHolder, setBillingAccountHolder] = useState("");
  const [billingAccountRut, setBillingAccountRut] = useState("");
  const [billingTransferEmail, setBillingTransferEmail] = useState("");
 
  const [loadingBillingConfig, setLoadingBillingConfig] = useState(true);
  const [savingBillingConfig, setSavingBillingConfig] = useState(false);
  const [billingConfigMsg, setBillingConfigMsg] = useState<string | null>(null);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<AccountOverview[]>("/admin/accounts/overview");
      setAccounts(res.data);
    } catch {
      setError("Error cargando cuentas");
    } finally {
      setLoading(false);
    }
  }

  async function loadPlatformBillingConfig() {
    try {
      setLoadingBillingConfig(true);
      setBillingConfigMsg(null);

      const res = await api.get<PlatformBillingConfig>(
        "/admin/platform-billing-config"
      );

      
      setBillingPhone(res.data.billingPhone ?? "");
      setBillingBankName(res.data.billingBankName ?? "");
      setBillingAccountType(res.data.billingAccountType ?? "");
      setBillingAccountNumber(res.data.billingAccountNumber ?? "");
      setBillingAccountHolder(res.data.billingAccountHolder ?? "");
      setBillingAccountRut(res.data.billingAccountRut ?? "");
      setBillingTransferEmail(res.data.billingTransferEmail ?? "");
    } catch {
      setBillingConfigMsg("Error cargando configuración SaaS ❌");
    } finally {
      setLoadingBillingConfig(false);
    }
  }

  async function savePlatformBillingConfig() {
    try {
      setSavingBillingConfig(true);
      setBillingConfigMsg(null);

      const payload = {
        billingPhone: billingPhone.trim() || undefined,
        billingBankName: billingBankName.trim() || undefined,
        billingAccountType: billingAccountType.trim() || undefined,
        billingAccountNumber: billingAccountNumber.trim() || undefined,
        billingAccountHolder: billingAccountHolder.trim() || undefined,
        billingAccountRut: billingAccountRut.trim() || undefined,
        billingTransferEmail: billingTransferEmail.trim() || undefined,
      };

      const res = await api.patch<PlatformBillingConfig>(
        "/admin/platform-billing-config",
        payload
      );

     
      setBillingPhone(res.data.billingPhone ?? "");
      setBillingBankName(res.data.billingBankName ?? "");
      setBillingAccountType(res.data.billingAccountType ?? "");
      setBillingAccountNumber(res.data.billingAccountNumber ?? "");
      setBillingAccountHolder(res.data.billingAccountHolder ?? "");
      setBillingAccountRut(res.data.billingAccountRut ?? "");
      setBillingTransferEmail(res.data.billingTransferEmail ?? "");
      setBillingConfigMsg("Configuración SaaS guardada correctamente ✅");
    } catch (err: any) {
      const backendMsg =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : null;

      setBillingConfigMsg(
        backendMsg
          ? `${backendMsg} ❌`
          : "Error guardando configuración SaaS ❌"
      );
    } finally {
      setSavingBillingConfig(false);
    }
  }

  async function createOwner() {
    try {
      setCreating(true);
      setCreateMsg(null);
      setError(null);

      await api.post("/admin/accounts", {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        rut: rut.trim() || undefined,
        plan: "early_adopter",
        planPrice: 6990,
      });

      setCreateMsg("Owner creado correctamente ✅");
      setFirstName("");
      setLastName("");
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
    loadPlatformBillingConfig();
  }, []);

  const stats = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((acc) => acc.billingStatus === "active").length;
    const pastDue = accounts.filter((acc) => acc.billingStatus === "past_due").length;
    const totalPaid = accounts.reduce((sum, acc) => sum + acc.totalPaid, 0);

    return { total, active, pastDue, totalPaid };
  }, [accounts]);

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 1240, margin: "0 auto" }}>
        Cargando cuentas...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ padding: 24, maxWidth: 1240, margin: "0 auto", color: "red" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1240,
        margin: "0 auto",
        display: "grid",
        gap: 18,
      }}
    >
      <div style={{ ...cardStyle, padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.1,
                color: "#0f172a",
                letterSpacing: "-0.03em",
              }}
            >
              Cuentas
            </h1>
            <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
              Gestión de owners, configuración de cobranza SaaS y estado comercial.
            </div>
          </div>

          <button
            onClick={() => {
              void loadAccounts();
              void loadPlatformBillingConfig();
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #d7dbe6",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <StatCard label="Total cuentas" value={stats.total} />
        <StatCard label="Activas" value={stats.active} tone="success" />
        <StatCard label="Past due" value={stats.pastDue} tone="danger" />
        <StatCard label="Total pagado" value={formatCurrency(stats.totalPaid)} />
      </div>

<div style={{ ...cardStyle, padding: 18 }}>
  <SectionTitle
    title="Configuración de cobro SaaS"
    subtitle="Estos datos se usan en los emails y WhatsApp de cobranza."
  />

  {loadingBillingConfig ? (
    <div style={{ fontSize: 14, color: "#64748b" }}>
      Cargando configuración SaaS...
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
        gap: 16,
      }}
    >
      {/* FORM */}
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            WhatsApp cobranza
          </div>
          <input
            value={billingPhone}
            onChange={(e) =>
              setBillingPhone(e.target.value.replace(/[^\d]/g, ""))
            }
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Email confirmación
          </div>
          <input
            value={billingTransferEmail}
            onChange={(e) => setBillingTransferEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Banco
          </div>
          <input
            value={billingBankName}
            onChange={(e) => setBillingBankName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Tipo cuenta
          </div>
          <input
            value={billingAccountType}
            onChange={(e) => setBillingAccountType(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Número cuenta
          </div>
          <input
            value={billingAccountNumber}
            onChange={(e) => setBillingAccountNumber(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Titular
          </div>
          <input
            value={billingAccountHolder}
            onChange={(e) => setBillingAccountHolder(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            RUT
          </div>
          <input
            value={billingAccountRut}
            onChange={(e) => setBillingAccountRut(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={savePlatformBillingConfig}
          disabled={savingBillingConfig}
          style={{
            marginTop: 10,
            padding: "12px",
            borderRadius: 12,
            background: "#0f172a",
            color: "#fff",
            border: "none",
            fontWeight: 700,
          }}
        >
          {savingBillingConfig ? "Guardando..." : "Guardar configuración"}
        </button>

        {billingConfigMsg && (
          <div style={{ fontSize: 13 }}>{billingConfigMsg}</div>
        )}
      </div>

      {/* PREVIEW */}
      <PreviewCard title="Preview mensaje">
        <div style={{ whiteSpace: "pre-line", fontSize: 13 }}>
{`Hola 👋

Para regularizar tu plan RentaControl puedes transferir a:

Banco: ${billingBankName || "-"}
Tipo: ${billingAccountType || "-"}
Cuenta: ${billingAccountNumber || "-"}
Titular: ${billingAccountHolder || "-"}
RUT: ${billingAccountRut || "-"}

Enviar comprobante a:
${billingTransferEmail || "-"}

O escribir a WhatsApp:
${billingPhone || "-"}`}
        </div>
      </PreviewCard>
    </div>
  )}
</div>

      <div style={{ ...cardStyle, padding: 18 }}>
        <SectionTitle
          title="Crear cuenta"
          subtitle="Alta rápida de una nueva cuenta en plan early_adopter."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Nombre
            </div>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
              placeholder="Juan"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Apellido
            </div>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
              placeholder="Perez"
            />
          </div>

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
              Teléfono
            </div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              placeholder="+56 9 1234 5678"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
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
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#475569",
          }}
        >
          Plan: <b>early_adopter</b> · Precio: <b>$6.990</b> · Estado inicial:{" "}
          <b>trial</b>
        </div>

        <div style={{ marginTop: 14 }}>
          <button
            onClick={createOwner}
            disabled={
              creating ||
              !email.trim() ||
              !firstName.trim() ||
              !lastName.trim()
            }
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "#6d5efc",
              color: "#fff",
              border: "none",
              cursor:
                creating ||
                !email.trim() ||
                !firstName.trim() ||
                !lastName.trim()
                  ? "not-allowed"
                  : "pointer",
              opacity:
                creating ||
                !email.trim() ||
                !firstName.trim() ||
                !lastName.trim()
                  ? 0.7
                  : 1,
              fontWeight: 700,
            }}
          >
            {creating ? "Creando..." : "Crear cuenta"}
          </button>
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

      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid #eef2f7" }}>
          <SectionTitle
            title="Listado de cuentas"
            subtitle="Estado comercial, datos del owner y acciones rápidas."
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}
          >
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Cuenta
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Owner
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Teléfono
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Plan
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Estado
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Meses
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Total pagado
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Creado
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} style={{ borderTop: "1px solid #eef2f7" }}>
                  <td style={{ padding: "14px 12px", fontSize: 14, fontWeight: 700 }}>
                    {acc.name}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>
                    {acc.ownerEmail ?? "-"}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>
                    {acc.ownerPhone ?? "—"}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>{acc.plan}</td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>
                    <StatusBadge status={acc.billingStatus} />
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>
                    {acc.monthsSubscribed}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>
                    {formatCurrency(acc.totalPaid)}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>
                    {new Date(acc.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: 14 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() =>
                          openWhatsAppModal(acc.ownerEmail, acc.ownerPhone)
                        }
                        style={{
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: "#25D366",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        WhatsApp
                      </button>

                      <button
                        onClick={() => updateBillingStatus(acc.id, "active")}
                        disabled={updatingId === acc.id}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: "#16a34a",
                          color: "#fff",
                          fontWeight: 700,
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
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: "#dc2626",
                          color: "#fff",
                          fontWeight: 700,
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

              {accounts.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: 14,
                    }}
                  >
                    No hay cuentas registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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