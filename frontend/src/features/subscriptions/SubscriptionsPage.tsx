import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { getSubscriptions } from "./subscriptions.api";
import type { Subscription } from "./subscriptions.types";
import { setPageTitle } from "@/lib/pageTitle";
import { EmptyState } from "@/components/EmptyState";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Subscription[] };

type SubscriptionView = "active" | "all" | "draft" | "cancelled";

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

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("es-CL");
}

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function sumItems(sub: Subscription) {
  return (sub.items ?? []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
}

function ChevronRightIcon({ color = "#94a3b8" }: { color?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M9 6L15 12L9 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({
  expanded = false,
  color = "#5b4ee6",
}: {
  expanded?: boolean;
  color?: string;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        display: "block",
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.15s ease",
      }}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusBadge({
  status,
  subscriptionId,
  onClick,
}: {
  status: Subscription["status"];
  subscriptionId: string;
  onClick?: (id: string) => void;
}) {
  const s = String(status).toLowerCase();

  let bg = "#eef2ff";
  let color = "#4338ca";
  let label: string = status;
  let clickable = false;

  if (s === "active") {
    bg = "#dcfce7";
    color = "#166534";
    label = "Activo";
  }

  if (s === "draft") {
    bg = "#fef3c7";
    color = "#92400e";
    label = "Borrador";
    clickable = true;
  }

  if (s === "cancelled") {
    bg = "#e2e8f0";
    color = "#475569";
    label = "Cancelado";
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        if (clickable) onClick?.(subscriptionId);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color,
        minWidth: 96,
        textAlign: "center",
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.15s ease",
        border: "1px solid rgba(15,23,42,0.04)",
      }}
    >
      {label}
      {clickable && <ChevronRightIcon color={color} />}
    </span>
  );
}

const th: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #eef2f7",
  fontWeight: 700,
  fontSize: 13,
  color: "#64748b",
  whiteSpace: "nowrap",
  textAlign: "left",
  background: "#fbfcfe",
};

const td: React.CSSProperties = {
  padding: "16px 12px",
  borderBottom: "1px solid #f1f5f9",
  color: "#0f172a",
  fontSize: 14,
  verticalAlign: "middle",
};

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "11px 16px",
        borderRadius: 999,
        border: "1px solid #6d5efc",
        background: "#6d5efc",
        color: "#ffffff",
        fontWeight: 700,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        boxShadow: props.disabled ? "none" : "0 8px 20px rgba(109,94,252,0.18)",
        ...props.style,
      }}
    />
  );
}

function StatCard({
  label,
  value,
  active = false,
  onClick,
}: {
  label: string;
  value: string | number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 16,
        borderRadius: 22,
        background: active
          ? "linear-gradient(180deg, rgba(109,94,252,0.12) 0%, rgba(109,94,252,0.08) 100%)"
          : "#ffffff",
        border: active ? "1px solid rgba(109,94,252,0.24)" : "1px solid #eef2f7",
        boxShadow: active
          ? "0 14px 30px rgba(109,94,252,0.10)"
          : "0 8px 24px rgba(15,23,42,0.04)",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.15s ease",
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: active ? "#5b4ee6" : "#64748b",
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 24,
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>
    </button>
  );
}

function SubscriptionItemsDetail({ items }: { items: Subscription["items"] }) {
  const safeItems = items ?? [];

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 16,
        background: "#fafbff",
        border: "1px solid #eef2f7",
        display: "grid",
        gap: 10,
      }}
    >
      {safeItems.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            paddingBottom: index === safeItems.length - 1 ? 0 : 10,
            borderBottom:
              index === safeItems.length - 1 ? "none" : "1px solid #eef2f7",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              {item.type}
            </div>
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              whiteSpace: "nowrap",
            }}
          >
            {formatCLP(Number(item.amount) || 0)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionCard({
  subscription,
  onOpenDraft,
}: {
  subscription: Subscription;
  onOpenDraft: (id: string) => void;
}) {
  const total = sumItems(subscription);
  const [expanded, setExpanded] = useState(false);
  const items = subscription.items ?? [];
  const hasItems = items.length > 0;
  const isDraft = subscription.status === "draft";

  return (
    <div
      onClick={() => {
        if (isDraft) {
          onOpenDraft(subscription.id);
        }
      }}
      style={{
        padding: 16,
        borderRadius: 24,
        background: "#ffffff",
        border: "1px solid #eef2f7",
        boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
        display: "grid",
        gap: 14,
        cursor: isDraft ? "pointer" : "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              color: "#0f172a",
              fontSize: 17,
              letterSpacing: "-0.02em",
            }}
          >
            {subscription.tenantName}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#64748b",
              wordBreak: "break-word",
            }}
          >
            {subscription.tenantEmail ?? "Sin email"}
          </div>
        </div>

        <StatusBadge
          status={subscription.status}
          subscriptionId={subscription.id}
          onClick={onOpenDraft}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: "#fafbff",
            border: "1px solid #eef2f7",
          }}
        >
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
            Cobro mensual
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 16,
              fontWeight: 750,
              color: "#0f172a",
            }}
          >
            {formatCLP(total)}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
            Día {subscription.billingDay}
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: "#fafbff",
            border: "1px solid #eef2f7",
          }}
        >
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
            Resumen
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 16,
              fontWeight: 750,
              color: "#0f172a",
            }}
          >
            {items.length} {items.length === 1 ? "item" : "items"}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
            Inicio {formatDate(subscription.startDate)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          Creado {formatDate(subscription.createdAt)}
        </div>
      </div>

      {hasItems && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 16,
            border: "1px solid #eef2f7",
            background: "#ffffff",
            color: "#5b4ee6",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <span>{expanded ? "Ocultar detalle" : "Ver detalle"}</span>
          <ChevronDownIcon expanded={expanded} />
        </button>
      )}

      {hasItems && expanded && <SubscriptionItemsDetail items={items} />}
    </div>
  );
}

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [ui, setUi] = useState<UiState>({ status: "loading" });
  const [expandedDesktopId, setExpandedDesktopId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<SubscriptionView>("active");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  async function load() {
    try {
      setUi({ status: "loading" });
      const subs = await getSubscriptions();
      setUi({ status: "success", data: subs });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "No se pudo cargar subscriptions";
      setUi({ status: "error", message: String(msg) });
    }
  }

  useEffect(() => {
    setPageTitle("Contratos");
  }, []);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  const stats = useMemo(() => {
    if (ui.status !== "success") return null;
    const total = ui.data.length;
    const active = ui.data.filter((s) => s.status === "active").length;
    const draft = ui.data.filter((s) => s.status === "draft").length;
    const cancelled = ui.data.filter((s) => s.status === "cancelled").length;
    return { total, active, draft, cancelled };
  }, [ui]);

  const filteredSubscriptions = useMemo(() => {
    if (ui.status !== "success") return [];

    let result = ui.data;

    if (currentView === "draft") {
      result = result.filter((s) => s.status === "draft");
    } else if (currentView === "cancelled") {
      result = result.filter((s) => s.status === "cancelled");
    } else if (currentView === "active") {
      result = result.filter((s) => s.status === "active");
    }

    return [...result].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? db - da : da - db;
    });
  }, [ui, currentView, sortOrder]);

  const currentViewLabel = useMemo(() => {
    if (currentView === "all") return "Todos los contratos";
    if (currentView === "draft") return "Borradores";
    if (currentView === "cancelled") return "Cancelados";
    return "Activos";
  }, [currentView]);

  const currentSortLabel =
    sortOrder === "desc" ? "↓ Más nuevos" : "↑ Más antiguos";

  return (
    <div
      style={{
        padding: 8,
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: 1180,
        margin: "0 auto",
      }}
    >
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          padding: isMobile ? 16 : 20,
          borderRadius: 28,
          background: "#ffffff",
          border: "1px solid #eef2f7",
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.5,
              maxWidth: 520,
            }}
          >
            {isMobile
              ? "Revisa tus contratos y continúa los borradores."
              : "Administra arriendos, revisa estados y continúa contratos en borrador."}
          </div>

          {!isMobile && (
            <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
              Sesión: <b style={{ color: "#475569" }}>{user?.email ?? "—"}</b>
            </div>
          )}
        </div>

        <div
          style={{
            width: isMobile ? "100%" : "auto",
          }}
        >
          <PrimaryButton
            onClick={() => navigate("/subscriptions/new")}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            + Nuevo contrato
          </PrimaryButton>
        </div>
      </section>

      {stats && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <StatCard
            label="Total contratos"
            value={stats.total}
            active={currentView === "all"}
            onClick={() => {
              setExpandedDesktopId(null);
              setCurrentView("all");
            }}
          />
          <StatCard
            label="Activos"
            value={stats.active}
            active={currentView === "active"}
            onClick={() => {
              setExpandedDesktopId(null);
              setCurrentView("active");
            }}
          />
          <StatCard
            label="Borradores"
            value={stats.draft}
            active={currentView === "draft"}
            onClick={() => {
              setExpandedDesktopId(null);
              setCurrentView("draft");
            }}
          />
          <StatCard
            label="Cancelados"
            value={stats.cancelled}
            active={currentView === "cancelled"}
            onClick={() => {
              setExpandedDesktopId(null);
              setCurrentView("cancelled");
            }}
          />
        </div>
      )}

      {stats && (
        <div
          style={{
            marginTop: 14,
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Vista actual
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(109,94,252,0.10)",
              color: "#5b4ee6",
              fontSize: 13,
              fontWeight: 700,
              border: "1px solid rgba(109,94,252,0.18)",
            }}
          >
            {currentViewLabel}
          </span>
        </div>
      )}

      {stats && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            Ordenar por fecha de creación
          </div>

          <button
            type="button"
            onClick={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            {currentSortLabel}
          </button>
        </div>
      )}

      <div style={{ height: 18 }} />

      {ui.status === "loading" && (
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: "#ffffff",
            border: "1px solid #eef2f7",
            color: "#64748b",
          }}
        >
          Cargando contratos...
        </div>
      )}

      {ui.status === "error" && (
        <div
          style={{
            padding: 14,
            border: "1px solid #fecaca",
            background: "#fff1f2",
            borderRadius: 16,
            color: "#991b1b",
            fontWeight: 700,
          }}
        >
          Error: {ui.message}
        </div>
      )}

      {ui.status === "success" && ui.data.length === 0 && (
        <EmptyState
          title="Aún no tienes contratos"
          description="Crea tu primer contrato, agrega cargos y deja listo el flujo de cobro mensual."
          action={
            <PrimaryButton onClick={() => navigate("/subscriptions/new")}>
              + Crear mi primer contrato
            </PrimaryButton>
          }
        />
      )}

      {ui.status === "success" &&
        ui.data.length > 0 &&
        filteredSubscriptions.length === 0 && (
          <EmptyState
            title="No hay contratos en esta vista"
            description={`La vista actual es ${currentViewLabel} y no tiene registros por ahora.`}
          />
        )}

      {ui.status === "success" && filteredSubscriptions.length > 0 && (
        <>
          {isMobile ? (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredSubscriptions.map((s) => (
                <SubscriptionCard
                  key={s.id}
                  subscription={s}
                  onOpenDraft={(id) =>
                    navigate(`/subscriptions/new?subscriptionId=${id}`)
                  }
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                borderRadius: 22,
                background: "#ffffff",
                border: "1px solid #eef2f7",
                boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Arrendatario</th>
                    <th style={th}>Estado</th>
                    <th style={th}>Cobro</th>
                    <th style={th}>Inicio</th>
                    <th style={th}>Items</th>
                    <th style={th}>Creado</th>
                    <th style={th}>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((s) => {
                    const total = sumItems(s);
                    const isExpanded = expandedDesktopId === s.id;
                    const items = s.items ?? [];
                    const hasItems = items.length > 0;

                    return (
                      <>
                        <tr key={s.id}>
                          <td style={td}>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>
                              {s.tenantName}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                marginTop: 4,
                              }}
                            >
                              {s.tenantEmail ?? "Sin email"}
                            </div>
                          </td>

                          <td style={td}>
                            <StatusBadge
                              status={s.status}
                              subscriptionId={s.id}
                              onClick={(id) =>
                                navigate(`/subscriptions/new?subscriptionId=${id}`)
                              }
                            />
                          </td>

                          <td style={td}>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>
                              {formatCLP(total)}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                marginTop: 4,
                              }}
                            >
                              Día {s.billingDay} / mes
                            </div>
                          </td>

                          <td style={td}>{formatDate(s.startDate)}</td>

                          <td style={{ ...td, fontWeight: 700 }}>
                            {items.length}
                          </td>

                          <td style={td}>{formatDate(s.createdAt)}</td>

                          <td style={td}>
                            {hasItems ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedDesktopId((prev) =>
                                    prev === s.id ? null : s.id
                                  )
                                }
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: 0,
                                  border: "none",
                                  background: "transparent",
                                  color: "#5b4ee6",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                <span>
                                  {isExpanded
                                    ? "Ocultar detalle"
                                    : "Ver detalle"}
                                </span>
                                <ChevronDownIcon expanded={isExpanded} />
                              </button>
                            ) : (
                              <span
                                style={{ fontSize: 12, color: "#cbd5e1" }}
                              >
                                —
                              </span>
                            )}
                          </td>
                        </tr>

                        {hasItems && isExpanded && (
                          <tr key={`${s.id}-detail`}>
                            <td
                              colSpan={7}
                              style={{
                                ...td,
                                background: "#ffffff",
                              }}
                            >
                              <SubscriptionItemsDetail items={items} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}