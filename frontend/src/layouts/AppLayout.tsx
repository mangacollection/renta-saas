import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { getAutomationRecommendations } from "@/features/invoices/invoices.api";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M4 10.5L12 4L20 10.5V19C20 19.5523 19.5523 20 19 20H15V14H9V20H5C4.44772 20 4 19.5523 4 19V10.5Z"
        fill={active ? "#6d5efc" : "#94a3b8"}
      />
    </svg>
  );
}

function BellIcon({ mobile = false }: { mobile?: boolean }) {
  return (
    <svg
      width={mobile ? "20" : "19"}
      height={mobile ? "20" : "19"}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M12 4C9.79086 4 8 5.79086 8 8V9.2C8 10.2801 7.68322 11.3364 7.08811 12.2378L6.2 13.5833C5.76244 14.2462 6.23781 15.125 7.03281 15.125H16.9672C17.7622 15.125 18.2376 14.2462 17.8 13.5833L16.9119 12.2378C16.3168 11.3364 16 10.2801 16 9.2V8C16 5.79086 14.2091 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M10 18C10.4 18.6 11.1 19 12 19C12.9 19 13.6 18.6 14 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M4 7H20M4 12H20M4 17H20"
        stroke={active ? "#6d5efc" : "#64748b"}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocumentIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M8 4H13L18 9V19C18 19.5523 17.5523 20 17 20H8C6.89543 20 6 19.1046 6 18V6C6 4.89543 6.89543 4 8 4Z"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13 4V9H18"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 13H15"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 16H13"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoneyIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M4 8C4 6.89543 4.89543 6 6 6H18C19.1046 6 20 6.89543 20 8V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16V8Z"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="2.75"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
      />
      <path
        d="M7 10C7.55228 10 8 9.55228 8 9"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 15C16 14.4477 16.4477 14 17 14"
        stroke={active ? "#6d5efc" : "#94a3b8"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavItem({
  to,
  label,
  variant,
}: {
  to: string;
  label: string;
  variant: "home" | "document" | "money" | "menu";
}) {
  const location = useLocation();
  const active =
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  function renderIcon() {
    if (variant === "home") return <HomeIcon active={active} />;
    if (variant === "document") return <DocumentIcon active={active} />;
    if (variant === "money") return <MoneyIcon active={active} />;
    return <MenuIcon active={active} />;
  }

  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        background: active ? "rgba(109, 94, 252, 0.10)" : "transparent",
        color: active ? "#5b4ee6" : "#475569",
        transition: "all 0.15s ease",
      }}
    >
      <span
        style={{
          width: 20,
          minWidth: 20,
          textAlign: "center",
          display: "inline-flex",
          justifyContent: "center",
        }}
      >
        {renderIcon()}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({
  to,
  label,
  variant,
}: {
  to: string;
  label: string;
  variant: "home" | "document" | "money" | "menu";
}) {
  const location = useLocation();
  const active =
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  function renderIcon() {
    if (variant === "home") return <HomeIcon active={active} />;
    if (variant === "document") return <DocumentIcon active={active} />;
    if (variant === "money") return <MoneyIcon active={active} />;
    return <MenuIcon active={active} />;
  }

  return (
    <Link
      to={to}
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textDecoration: "none",
        color: active ? "#6d5efc" : "#64748b",
        fontWeight: active ? 600 : 500,
        fontSize: 11,
        padding: "4px 4px",
        transition: "all 0.15s ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? "rgba(109, 94, 252, 0.14)" : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        {renderIcon()}
      </span>

      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {label}
      </span>
    </Link>
  );
}

function SheetAction({
  title,
  subtitle,
  onClick,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        border: "1px solid #eef2f7",
        background: "#ffffff",
        borderRadius: 16,
        padding: "14px 16px",
        display: "grid",
        gap: 4,
        cursor: "pointer",
        color: danger ? "#991b1b" : "#0f172a",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
      {subtitle && (
        <span
          style={{
            fontSize: 13,
            color: danger ? "#b91c1c" : "#94a3b8",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </span>
      )}
    </button>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  const pageTitle = useMemo(() => {
    if (location.pathname === "/") return "Contratos";
    if (location.pathname.startsWith("/subscriptions/new")) return "Contrato";
    if (location.pathname.startsWith("/invoices")) return "Facturas";
    if (location.pathname.startsWith("/tenant-payments")) return "Pagos";
    if (location.pathname.startsWith("/tenant-payment-senders")) return "Remitentes";
    if (location.pathname.startsWith("/account")) return "Mi cuenta";
    if (location.pathname.startsWith("/menu")) return "Menú";
    if (location.pathname.startsWith("/notifications")) return "Notificaciones";
    if (location.pathname.startsWith("/help")) return "Ayuda";
    if (location.pathname.startsWith("/admin/account-payments")) return "Pagos SaaS";
    if (location.pathname.startsWith("/admin/accounts")) return "Cuentas";
    return "Renta Control";
  }, [location.pathname]);

  useEffect(() => {
    setShowQuickActions(false);
  }, [location.pathname]);

  useEffect(() => {
    async function checkNotifications() {
      try {
        const data = await getAutomationRecommendations();
        setHasNotifications(data.length > 0);
      } catch (err) {
        console.error("Error loading notifications", err);
      }
    }

    checkNotifications();
  }, [location.pathname]);

  async function handleLogout() {
    setShowQuickActions(false);
    await logout();
  }

  const headerButtonStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.20)",
    background: "rgba(255,255,255,0.10)",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        background: "#f6f7fb",
        color: "#0f172a",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {!isMobile && (
        <aside
          style={{
            width: 232,
            padding: 14,
            background: "#ffffff",
            borderRight: "1px solid #eef2f7",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ padding: "8px 8px 4px" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 24,
                color: "#1e293b",
                letterSpacing: "-0.03em",
              }}
            >
              Renta Control
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#94a3b8",
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              Gestión simple de arriendos
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "0 10px",
                marginBottom: 8,
              }}
            >
              Navegación
            </div>

            <nav style={{ display: "grid", gap: 4 }}>
              <NavItem to="/" label="Contratos" variant="home" />
              <NavItem to="/invoices" label="Facturas" variant="document" />
              <NavItem to="/tenant-payments" label="Pagos" variant="money" />
              <NavItem to="/menu" label="Menú" variant="menu" />
            </nav>
          </div>

          <div
            style={{
              marginTop: "auto",
              padding: 14,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6d5efc 0%, #8b7fff 100%)",
              color: "#ffffff",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 600 }}>
              Workspace
            </div>
            <div
              style={{
                marginTop: 4,
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "-0.02em",
              }}
            >
              Owner activo
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                opacity: 0.96,
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              Accede rápido a contratos, facturas, pagos y configuración.
            </div>
          </div>
        </aside>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "#6d5efc",
            color: "#ffffff",
            boxShadow: "0 8px 24px rgba(109,94,252,0.18)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: isMobile ? "14px 16px" : "16px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              minHeight: isMobile ? 72 : 74,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
              }}
            >
              {location.pathname !== "/" ? (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={headerButtonStyle}
                  aria-label="Volver"
                >
                  <BackIcon />
                </button>
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <HomeIcon active />
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: isMobile ? 22 : 20,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#ffffff",
                    lineHeight: 1.05,
                  }}
                >
                  {pageTitle}
                </div>

                {!isMobile && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.82)",
                      fontWeight: 500,
                    }}
                  >
                    Gestión simple y clara para owners
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  style={headerButtonStyle}
                  aria-label="Notificaciones"
                  onClick={() => navigate("/notifications")}
                >
                  <BellIcon mobile={isMobile} />
                </button>

                {hasNotifications && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "2px solid white",
                    }}
                  />
                )}
              </div>

              <button
                type="button"
                style={headerButtonStyle}
                aria-label="Qué quieres hacer"
                onClick={() => setShowQuickActions(true)}
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: isMobile ? "14px 12px 118px" : 20,
          }}
        >
          <div
            style={{
              maxWidth: isMobile ? "100%" : 1180,
              margin: "0 auto",
            }}
          >
            <Outlet />
          </div>
        </main>

        {isMobile && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 40,
              background: "#f6f7fb",
              padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
            }}
          >
            <nav
              style={{
                background: "rgba(109,94,252,0.06)",
                borderRadius: 18,
                border: "1px solid rgba(109,94,252,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "8px",
                boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <MobileNavItem to="/" label="Contratos" variant="home" />
              <MobileNavItem to="/invoices" label="Facturas" variant="document" />
              <MobileNavItem to="/tenant-payments" label="Pagos" variant="money" />
              <MobileNavItem to="/menu" label="Menú" variant="menu" />
            </nav>
          </div>
        )}

        {showQuickActions && (
          <>
            <button
              type="button"
              aria-label="Cerrar panel"
              onClick={() => setShowQuickActions(false)}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 55,
                background: "rgba(15,23,42,0.40)",
                border: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 60,
                background: "#f8fafc",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: "18px 16px calc(18px + env(safe-area-inset-bottom, 0px))",
                boxShadow: "0 -10px 30px rgba(15,23,42,0.12)",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 5,
                  borderRadius: 999,
                  background: "#d7dbe6",
                  margin: "0 auto 14px auto",
                }}
              />

              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ marginBottom: 4 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0f172a",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    ¿Qué quieres hacer?
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    Accesos rápidos para tareas frecuentes
                  </div>
                </div>

                <SheetAction
                  title="Nuevo contrato"
                  subtitle="Crear un contrato y agregar cargos"
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate("/subscriptions/new");
                  }}
                />
                <SheetAction
                  title="Ver facturas"
                  subtitle="Ir al resumen de cobros"
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate("/invoices");
                  }}
                />
                <SheetAction
                  title="Ver pagos"
                  subtitle="Revisar pagos registrados"
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate("/tenant-payments");
                  }}
                />
                <SheetAction
                  title="Remitentes bancarios"
                  subtitle="Configurar remitentes para conciliación"
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate("/tenant-payment-senders");
                  }}
                />
                <SheetAction
                  title="Salir"
                  subtitle="Cerrar sesión actual"
                  danger
                  onClick={() => void handleLogout()}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}