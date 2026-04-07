import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useMemo, useState } from "react";

const BRAND = "#6d5efc";
const BRAND_SOFT = "#f3f0ff";
const BRAND_BORDER = "#dcd6ff";

type MenuItem = {
  to: string;
  label: string;
  section: "Operación" | "Configuración";
  group?: string;
};

const menuItems: MenuItem[] = [
  {
    to: "/app/admin/accounts",
    label: "Cuentas",
    section: "Operación",
  },
  {
    to: "/app/admin/account-payments",
    label: "Pagos SaaS",
    section: "Operación",
  },
  {
    to: "/app/admin/observability",
    label: "Observabilidad",
    section: "Operación",
  },
  {
    to: "/app/admin/leads",
    label: "Leads",
    section: "Operación",
    group: "CRM",
  },
  {
    to: "/app/admin/pricing",
    label: "Pricing",
    section: "Configuración",
  },
];

function getItemDot(active: boolean) {
  return {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: active ? BRAND : "#cbd5e1",
    flexShrink: 0,
  } satisfies React.CSSProperties;
}

function NavRow({
  to,
  label,
  collapsed,
  nested = false,
}: {
  to: string;
  label: string;
  collapsed: boolean;
  nested?: boolean;
}) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 10,
        minHeight: 42,
        padding: collapsed
          ? "10px 0"
          : nested
            ? "10px 12px 10px 16px"
            : "10px 12px",
        marginLeft: collapsed ? 0 : nested ? 10 : 0,
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: active ? 700 : 500,
        fontSize: 14,
        background: active ? BRAND_SOFT : "transparent",
        color: active ? "#4338ca" : "#475569",
        border: active ? `1px solid ${BRAND_BORDER}` : "1px solid transparent",
        boxShadow: active ? "0 8px 18px rgba(109,94,252,0.10)" : "none",
        transition: "all 0.18s ease",
      }}
    >
      <span style={getItemDot(active)} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function SectionTitle({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) {
  if (collapsed) {
    return null;
  }

  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: 8,
        paddingLeft: 4,
      }}
    >
      {label}
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedSearch) {
      return menuItems;
    }

    return menuItems.filter((item) => {
      const haystack = `${item.label} ${item.section} ${item.group ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch]);

  const operationItems = filteredItems.filter(
    (item) => item.section === "Operación" && !item.group
  );

  const crmItems = filteredItems.filter(
    (item) => item.section === "Operación" && item.group === "CRM"
  );

  const configItems = filteredItems.filter(
    (item) => item.section === "Configuración"
  );

  const crmActive = location.pathname.startsWith("/app/admin/leads");

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut(firebaseAuth);
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f6f7fb",
      }}
    >
      <aside
        style={{
          width: collapsed ? 76 : 280,
          background: "#ffffff",
          borderRight: "1px solid #eef2f7",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          transition: "width 0.18s ease",
        }}
      >
        <div
          style={{
            border: "1px solid #eef2f7",
            borderRadius: 18,
            padding: collapsed ? 12 : 16,
            background: "linear-gradient(180deg, #ffffff 0%, #fafafe 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              gap: 10,
            }}
          >
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
                  Admin
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
                  RentaControl
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              title={collapsed ? "Expandir menú" : "Colapsar menú"}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#334155",
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>

          {!collapsed && (
            <>
              <div style={{ marginTop: 14 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar menú..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #d7dbe6",
                    outline: "none",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loggingOut ? "not-allowed" : "pointer",
                  opacity: loggingOut ? 0.7 : 1,
                }}
              >
                {loggingOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </>
          )}

          {collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Cerrar sesión"
              style={{
                width: "100%",
                marginTop: 12,
                padding: "10px 0",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#334155",
                fontWeight: 700,
                fontSize: 14,
                cursor: loggingOut ? "not-allowed" : "pointer",
                opacity: loggingOut ? 0.7 : 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {(operationItems.length > 0 || crmItems.length > 0) && (
            <div>
              <SectionTitle label="Operación" collapsed={collapsed} />

              <div style={{ display: "grid", gap: 6 }}>
                {operationItems.map((item) => (
                  <NavRow
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    collapsed={collapsed}
                  />
                ))}
              </div>

              {crmItems.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    padding: collapsed ? 0 : "10px",
                    borderRadius: 14,
                    background: collapsed
                      ? "transparent"
                      : crmActive
                        ? "#faf7ff"
                        : "#f8fafc",
                    border: collapsed
                      ? "none"
                      : crmActive
                        ? `1px solid ${BRAND_BORDER}`
                        : "1px solid #eef2f7",
                  }}
                >
                  {!collapsed && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: crmActive ? "#4338ca" : "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: 8,
                        paddingLeft: 4,
                      }}
                    >
                      CRM
                    </div>
                  )}

                  <div style={{ display: "grid", gap: 6 }}>
                    {crmItems.map((item) => (
                      <NavRow
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        collapsed={collapsed}
                        nested={!collapsed}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {configItems.length > 0 && (
            <div>
              <SectionTitle label="Configuración" collapsed={collapsed} />

              <div style={{ display: "grid", gap: 6 }}>
                {configItems.map((item) => (
                  <NavRow
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          )}

          {!collapsed && filteredItems.length === 0 && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "#f8fafc",
                color: "#64748b",
                fontSize: 13,
                border: "1px solid #eef2f7",
              }}
            >
              No hay resultados para tu búsqueda.
            </div>
          )}
        </div>
      </aside>

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