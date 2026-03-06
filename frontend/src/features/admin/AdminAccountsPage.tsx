import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuth } from "@/auth/useAuth";
import { Link } from "react-router-dom";

type AccountOverview = {
  id: string;
  name: string;
  ownerEmail: string | null;
  ownerPhone: string | null; // 👈 ADD
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
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, user } = useAuth();

  async function loadAccounts() {
    try {
      setLoading(true);
      const res = await api.get<AccountOverview[]>(
        "/admin/accounts/overview"
      );
      setAccounts(res.data);
    } catch (err: any) {
      setError("Error cargando cuentas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  if (loading)
    return (
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        Cargando cuentas...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", color: "red" }}>
        {error}
      </div>
    );

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
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Panel de Administración</h2>
          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            Visión general de todas las cuentas activas del sistema.
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>
            Sesión: <b>{user?.email}</b>
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
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
          Cerrar sesión
        </button>
      </header>

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
              <th style={th}>Teléfono</th>
              <th style={th}>Plan</th>
              <th style={th}>Estado</th>
              <th style={th}>Meses</th>
              <th style={th}>Total Pagado</th>
              <th style={th}>Creado</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}