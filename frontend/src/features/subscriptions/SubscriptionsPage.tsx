import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { getSubscriptions } from "./subscriptions.api";
import type { Subscription } from "./subscriptions.types";
import { getAccountPlan } from "@/features/account/account.api";
import type { AccountPlan } from "@/features/account/account.types";
import { setPageTitle } from "@/lib/pageTitle";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Subscription[] };

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

function StatusBadge({ status }: { status: Subscription["status"] }) {
  const s = String(status).toLowerCase();
  let bg = "#e5e7eb";
  let color = "#374151";
  let label: string = status;

  if (s === "active") {
    bg = "#16a34a";
    color = "#ffffff";
    label = "Activo";
  }
  if (s === "draft") {
    bg = "#f59e0b";
    color = "#ffffff";
    label = "Borrador";
  }
  if (s === "cancelled") {
    bg = "#64748b";
    color = "#ffffff";
    label = "Cancelado";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color,
        minWidth: 95,
        textAlign: "center",
      }}
    >
      {label}
    </span>
  );
}

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

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid #6d5efc",
        background: "#6d5efc",
        color: "#ffffff",
        fontWeight: 700,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        ...props.style,
      }}
    />
  );
}

function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid #d7dbe6",
        background: "#ffffff",
        color: "#0f172a",
        fontWeight: 600,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        ...props.style,
      }}
    />
  );
}

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [ui, setUi] = useState<UiState>({ status: "loading" });
  const [plan, setPlan] = useState<AccountPlan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

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
    setPageTitle("Nuevo Arriendo");
  }, []);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    async function loadPlan() {
      try {
        const planData = await getAccountPlan();
        setPlan(planData);
        setPlanError(null);
      } catch (error: any) {
        setPlanError(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudo cargar el plan"
        );
      }
    }

    void loadPlan();
  }, []);

  const stats = useMemo(() => {
    if (ui.status !== "success") return null;
    const total = ui.data.length;
    const active = ui.data.filter((s) => s.status === "active").length;
    const draft = ui.data.filter((s) => s.status === "draft").length;
    const cancelled = ui.data.filter((s) => s.status === "cancelled").length;
    return { total, active, draft, cancelled };
  }, [ui]);

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 1100,
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
          <h2 style={{ margin: 0, color: "#0f172a" }}>Contratos</h2>
          <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
            Sesión: <b>{user?.email ?? "—"}</b>
          </div>

          {stats && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              <span>
                Total: <b style={{ color: "#64748b" }}>{stats.total}</b>
              </span>
              <span>
                Activos: <b style={{ color: "#64748b" }}>{stats.active}</b>
              </span>
              <span>
                Borrador: <b style={{ color: "#64748b" }}>{stats.draft}</b>
              </span>
              <span>
                Cancelados: <b style={{ color: "#64748b" }}>{stats.cancelled}</b>
              </span>
            </div>
          )}

          {plan && (
            <div
              style={{
                marginTop: 12,
                padding: "12px 14px",
                borderRadius: 14,
                background:
                  plan.billingStatus === "trial"
                    ? "#FEF9C3"
                    : plan.billingStatus === "active"
                    ? "#DCFCE7"
                    : "#FEE2E2",
                border: "1px solid #e6e8ef",
                fontSize: 13,
                color: "#0f172a",
                minWidth: 260,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13 }}>
                Plan Early Adopter
              </div>

              <div style={{ marginTop: 4, fontWeight: 800, fontSize: 18 }}>
                {formatCLP(plan.planPrice)}{" "}
                <span style={{ fontWeight: 600, fontSize: 13 }}>/ mes</span>
              </div>

              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "#334155" }}>
                  Estado: <b>{plan.billingStatus}</b>
                </span>

                {plan.billingStatus === "past_due" && (
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#991b1b",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    Pago vencido
                  </span>
                )}
              </div>

              {plan.billingStatus === "trial" && (
                <div style={{ marginTop: 6, color: "#334155" }}>
                  Te quedan <b>{plan.daysRemaining}</b> días
                </div>
              )}
            </div>
          )}

          {planError && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 12,
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                fontSize: 13,
                color: "#9a3412",
              }}
            >
              No se pudo cargar el plan: <b>{planError}</b>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <PrimaryButton onClick={() => navigate("/subscriptions/new")}>
            + Nuevo contrato
          </PrimaryButton>

          <GhostButton onClick={() => navigate("/invoices")}>
            Ver facturas
          </GhostButton>

          <GhostButton onClick={() => navigate("/tenant-payments")}>
            Pagos inquilinos
          </GhostButton>

          <GhostButton onClick={() => navigate("/tenant-payment-senders")}>
            Remitentes bancarios
          </GhostButton>

          <GhostButton onClick={load}>Refrescar</GhostButton>

          <GhostButton onClick={logout}>Logout</GhostButton>
        </div>
      </header>

      <div style={{ height: 18 }} />

      {ui.status === "loading" && (
        <p style={{ color: "#0f172a" }}>Cargando contratos…</p>
      )}

      {ui.status === "error" && (
        <div
          style={{
            padding: 12,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            borderRadius: 12,
          }}
        >
          <strong>Error:</strong> {ui.message}
        </div>
      )}

      {ui.status === "success" && ui.data.length === 0 && (
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            border: "1px dashed #cbd5e1",
            background: "#f8fafc",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Aún no tienes contratos</h3>
          <p style={{ margin: 0, color: "#475569" }}>
            Crea tu primer contrato y luego agrega items para que se generen
            facturas.
          </p>
          <div style={{ marginTop: 12 }}>
            <PrimaryButton onClick={() => navigate("/subscriptions/new")}>
              + Crear mi primer contrato
            </PrimaryButton>
          </div>
        </div>
      )}

      {ui.status === "success" && ui.data.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            borderRadius: 16,
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={th}>Arrendatario</th>
                <th style={th}>Estado</th>
                <th style={th}>Día cobro</th>
                <th style={th}>Inicio</th>
                <th style={th}>Items</th>
                <th style={th}>Total mensual</th>
                <th style={th}>Creado</th>
              </tr>
            </thead>
            <tbody>
              {ui.data.map((s) => {
                const total = sumItems(s);
                return (
                  <tr key={s.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 800 }}>{s.tenantName}</div>

                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {s.tenantEmail ?? "—"}
                        {s.tenantRut ? ` • ${s.tenantRut}` : ""}
                      </div>

                      <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                        {s.tenantPhone ? `📞 ${s.tenantPhone}` : "📞 —"}
                      </div>

                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        <code>{s.id}</code>
                      </div>
                    </td>

                    <td style={td}>
                      <StatusBadge status={s.status} />
                    </td>

                    <td style={td}>{s.billingDay}</td>
                    <td style={td}>{formatDate(s.startDate)}</td>
                    <td style={td}>{(s.items ?? []).length}</td>
                    <td style={{ ...td, fontWeight: 800 }}>{formatCLP(total)}</td>
                    <td style={td}>{formatDate(s.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}