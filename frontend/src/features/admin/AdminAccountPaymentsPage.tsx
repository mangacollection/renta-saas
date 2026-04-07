import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";

type AccountPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference?: string | null;
  createdAt: string;
  account: {
    id: string;
    name: string;
  };
};

type PaymentFilter = "all" | "received" | "approved";

const BRAND = "#6d5efc";
const BRAND_SOFT = "#f3f0ff";
const BRAND_BORDER = "#dcd6ff";
const BRAND_SHADOW = "0 10px 24px rgba(109,94,252,0.14)";

const th: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #eef2f7",
  fontWeight: 700,
  fontSize: 13,
  color: "#475569",
  whiteSpace: "nowrap",
  textAlign: "left",
  background: "#f8fafc",
};

const td: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #eef2f7",
  color: "#111827",
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
  boxSizing: "border-box",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #e6e8ef",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

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

function MetricFilterCard({
  label,
  value,
  active,
  onClick,
  valueColor,
}: {
  label: string;
  value: string | number;
  active: boolean;
  onClick: () => void;
  valueColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...cardStyle,
        padding: 20,
        cursor: "pointer",
        textAlign: "left",
        background: active ? BRAND_SOFT : "#ffffff",
        border: active ? `1px solid ${BRAND_BORDER}` : "1px solid #e6e8ef",
        boxShadow: active ? BRAND_SHADOW : "0 10px 30px rgba(15,23,42,0.06)",
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
          color: active ? BRAND : valueColor ?? "#0f172a",
        }}
      >
        {value}
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isApproved = status === "approved";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: isApproved ? "#dcfce7" : "#fef3c7",
        color: isApproved ? "#166534" : "#92400e",
      }}
    >
      {status}
    </span>
  );
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminAccountPaymentsPage() {
  const [payments, setPayments] = useState<AccountPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentFilter>("received");

  const [simFrom, setSimFrom] = useState("dueno1@test.cl");
  const [simSubject, setSimSubject] = useState("Comprobante transferencia");
  const [simBody, setSimBody] = useState("Transferencia realizada por $6.990");
  const [simLoading, setSimLoading] = useState(false);
  const [simMsg, setSimMsg] = useState<string | null>(null);

  async function loadPayments() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<AccountPayment[]>("/admin/account-payments");
      setPayments(res.data);
    } catch (err: any) {
      setError("Error loading payments");
    } finally {
      setLoading(false);
    }
  }

  async function approvePayment(id: string) {
    try {
      setApprovingId(id);
      setError(null);
      await api.patch(`/admin/account-payments/${id}/approve`);
      await loadPayments();
    } catch (err: any) {
      setError("Error al aprobar el pago");
    } finally {
      setApprovingId(null);
    }
  }

  async function simulateEmail() {
    try {
      setSimMsg(null);
      setError(null);
      setSimLoading(true);

      await api.post("/admin/account-payments/from-email", {
        from: simFrom,
        subject: simSubject,
        body: simBody,
      });

      setSimMsg("Email simulado enviado ✅");
      await loadPayments();
    } catch (err: any) {
      setSimMsg(null);
      setError("Error al simular email");
    } finally {
      setSimLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, []);

  const stats = useMemo(() => {
    const total = payments.length;
    const receivedCount = payments.filter((p) => p.status === "received").length;
    const approvedCount = payments.filter((p) => p.status === "approved").length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      total,
      receivedCount,
      approvedCount,
      totalAmount,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === "all") {
      return payments;
    }

    return payments.filter((p) => p.status === statusFilter);
  }, [payments, statusFilter]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        Cargando pagos...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 24,
          color: "red",
        }}
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
              Pagos SaaS
            </h1>
            <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
              Gestión, conciliación y aprobación de pagos de suscripción.
            </div>
          </div>

          <button
            onClick={() => {
              void loadPayments();
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: `1px solid ${BRAND_BORDER}`,
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
              color: BRAND,
              boxShadow: "0 6px 18px rgba(109,94,252,0.08)",
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
        <MetricFilterCard
          label="Todos"
          value={stats.total}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />

        <MetricFilterCard
          label="Recibidos"
          value={stats.receivedCount}
          active={statusFilter === "received"}
          onClick={() => setStatusFilter("received")}
          valueColor="#92400e"
        />

        <MetricFilterCard
          label="Aprobados"
          value={stats.approvedCount}
          active={statusFilter === "approved"}
          onClick={() => setStatusFilter("approved")}
          valueColor="#166534"
        />

        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            Monto total
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              lineHeight: 1.1,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {formatCurrency(stats.totalAmount, "CLP")}
          </div>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          padding: 18,
        }}
      >
        <SectionTitle
          title="Simular email"
          subtitle="Útil para probar conciliación y alta de pagos desde correo."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              From
            </div>
            <input
              value={simFrom}
              onChange={(e) => setSimFrom(e.target.value)}
              style={inputStyle}
              placeholder="dueno@correo.cl"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Subject
            </div>
            <input
              value={simSubject}
              onChange={(e) => setSimSubject(e.target.value)}
              style={inputStyle}
              placeholder="Comprobante transferencia"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Body
            </div>
            <textarea
              value={simBody}
              onChange={(e) => setSimBody(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: 90,
                resize: "vertical",
                fontFamily: "inherit",
              }}
              placeholder="Transferencia realizada por $6.990 ..."
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={simulateEmail}
            disabled={simLoading}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: BRAND,
              color: "#ffffff",
              fontWeight: 700,
              cursor: simLoading ? "not-allowed" : "pointer",
              opacity: simLoading ? 0.7 : 1,
              boxShadow: "0 10px 20px rgba(109,94,252,0.18)",
            }}
          >
            {simLoading ? "Enviando..." : "Simular Email"}
          </button>

          {simMsg && (
            <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>
              {simMsg}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 18, borderBottom: "1px solid #eef2f7" }}>
          <SectionTitle
            title="Historial de pagos"
            subtitle="Revisa pagos recibidos, pagos aprobados y acciones pendientes."
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Fecha</th>
                <th style={th}>Cuenta</th>
                <th style={th}>Monto</th>
                <th style={th}>Estado</th>
                <th style={th}>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td style={td}>
                    {new Date(p.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td style={td}>{p.account.name}</td>
                  <td style={td}>{formatCurrency(p.amount, p.currency)}</td>
                  <td style={td}>
                    <StatusBadge status={p.status} />

                    {p.status === "received" && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          onClick={() => approvePayment(p.id)}
                          disabled={approvingId === p.id}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 12,
                            border: "none",
                            background: "#16a34a",
                            color: "#ffffff",
                            fontWeight: 600,
                            cursor:
                              approvingId === p.id ? "not-allowed" : "pointer",
                            opacity: approvingId === p.id ? 0.6 : 1,
                          }}
                        >
                          {approvingId === p.id ? "Aprobando..." : "Aprobar"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={td}>{p.reference ?? "-"}</td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: 14,
                    }}
                  >
                    No hay pagos para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}