import { Link, Outlet, useLocation } from "react-router-dom";

function NavItem({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 10,
        textDecoration: "none",
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        background: active ? "#eef2ff" : "transparent",
        color: active ? "#4338ca" : "#475569",
      }}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f6f7fb",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "#fff",
          borderRight: "1px solid #eef2f7",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>
            Admin Panel
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            RentaControl
          </div>
        </div>

        {/* OPERACIÓN */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Operación
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <NavItem to="/admin/accounts" label="Cuentas" />
            <NavItem to="/admin/account-payments" label="Pagos SaaS" />
            <NavItem to="/admin/observability" label="Observabilidad" />
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Configuración
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <NavItem to="/admin/pricing" label="Pricing" />
          </div>
        </div>
      </aside>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: 20,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}