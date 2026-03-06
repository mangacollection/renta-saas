import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { useAuth } from "@/auth/useAuth";

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

const th: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 700,
  fontSize: 14,
  color: "#111827",
  whiteSpace: "nowrap",
  textAlign: "left",
};

const td: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #e5e7eb",
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
};

export default function AdminAccountPaymentsPage() {
  const [payments, setPayments] = useState<AccountPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { logout, user } = useAuth();

  // ✅ FASE 5: Simular Email (UI)
  const [simFrom, setSimFrom] = useState("dueno1@test.cl");
  const [simSubject, setSimSubject] = useState("Comprobante transferencia");
  const [simBody, setSimBody] = useState("Transferencia realizada por $6.990");
  const [simLoading, setSimLoading] = useState(false);
  const [simMsg, setSimMsg] = useState<string | null>(null);

  async function loadPayments() {
    try {
      setLoading(true);
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
    loadPayments();
  }, []);

  const filteredPayments = statusFilter
    ? payments.filter((p) => p.status === statusFilter)
    : payments;

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        Loading...
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
        fontFamily: "system-ui",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Header */}
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
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>
            Panel de Administración
          </h2>

          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            Aquí puedes revisar y aprobar los pagos de suscripción realizados
            por los dueños del sistema.
          </div>

          <div style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
            Sesión: <b>{user?.email ?? "—"}</b>
          </div>

          {/* Navegación Admin */}
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
                background: "#6d5efc",
                color: "#ffffff",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              Pagos
            </Link>

            <Link
              to="/admin/accounts"
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
            color: "#0f172a",
            fontWeight: 600,
            cursor: "pointer",
            height: 40,
          }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* ✅ FASE 5 — Simular Email */}
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
          Simular Email
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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
            marginTop: 12,
          }}
        >
          <button
            onClick={simulateEmail}
            disabled={simLoading}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "#0f172a",
              color: "#ffffff",
              fontWeight: 700,
              cursor: simLoading ? "not-allowed" : "pointer",
              opacity: simLoading ? 0.7 : 1,
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

      {/* Filter Buttons */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setStatusFilter(null)}
          style={{
            padding: "8px 16px",
            background: statusFilter === null ? "#6d5efc" : "#f0f0f0",
            color: statusFilter === null ? "#fff" : "#000",
            borderRadius: 12,
            border: "none",
            marginRight: 8,
            cursor: "pointer",
          }}
        >
          Todos
        </button>

        <button
          onClick={() => setStatusFilter("received")}
          style={{
            padding: "8px 16px",
            background: statusFilter === "received" ? "#6d5efc" : "#f0f0f0",
            color: statusFilter === "received" ? "#fff" : "#000",
            borderRadius: 12,
            border: "none",
            marginRight: 8,
            cursor: "pointer",
          }}
        >
          Recibidos
        </button>

        <button
          onClick={() => setStatusFilter("approved")}
          style={{
            padding: "8px 16px",
            background: statusFilter === "approved" ? "#6d5efc" : "#f0f0f0",
            color: statusFilter === "approved" ? "#fff" : "#000",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
          }}
        >
          Aprobados
        </button>
      </div>

      {/* Table */}
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
              <th style={th}>Fecha</th>
              <th style={th}>Account</th>
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
                <td style={td}>
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: p.currency,
                    maximumFractionDigits: 0,
                  }).format(p.amount)}
                </td>
                <td style={td}>
                  {p.status}
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
                            approvingId === p.id
                              ? "not-allowed"
                              : "pointer",
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
          </tbody>
        </table>
      </div>
    </div>
  );
}