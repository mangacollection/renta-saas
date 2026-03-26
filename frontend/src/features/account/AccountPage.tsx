import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { getAccountPlan } from "./account.api";
import type { AccountPlan } from "./account.types";

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function InfoCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #eef2f7",
        borderRadius: 22,
        padding: 18,
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 12,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {props.title}
      </div>
      {props.children}
    </section>
  );
}

function Row(props: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 0",
        borderBottom: "1px solid #f1f5f9",
        alignItems: "center",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {props.label}
      </span>

      <span
        style={{
          color: "#0f172a",
          fontSize: 14,
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {props.value}
      </span>
    </div>
  );
}

function PlanBadge({ status }: { status: string }) {
  const s = String(status).toLowerCase();

  let bg = "#eef2ff";
  let color = "#4338ca";
  let label = status;

  if (s === "trial") {
    bg = "#fef3c7";
    color = "#92400e";
    label = "Trial";
  }

  if (s === "active") {
    bg = "#dcfce7";
    color = "#166534";
    label = "Activo";
  }

  if (s === "past_due") {
    bg = "#fee2e2";
    color = "#991b1b";
    label = "Pago vencido";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
        borderRadius: 999,
        background: bg,
        color,
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {label}
    </span>
  );
}

export default function AccountPage() {
  const { user } = useAuth();

  const [plan, setPlan] = useState<AccountPlan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      try {
        setLoadingPlan(true);
        const planData = await getAccountPlan();
        setPlan(planData);
        setPlanError(null);
      } catch (error: any) {
        setPlanError(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudo cargar el plan"
        );
      } finally {
        setLoadingPlan(false);
      }
    }

    void loadPlan();
  }, []);

  return (
    <div
      style={{
        padding: 8,
        maxWidth: 960,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* HEADER */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #eef2f7",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "linear-gradient(135deg, #6d5efc 0%, #8b7fff 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {(user?.email?.[0] ?? "R").toUpperCase()}
          </div>

          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Mi cuenta
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#64748b",
              }}
            >
              Información general y estado de tu suscripción SaaS.
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {/* OWNER */}
        <InfoCard title="Owner">
          <Row label="Correo" value={user?.email ?? "—"} />
          <Row label="Nombre" value={user?.displayName ?? "No informado"} />
          <Row label="UID" value={user?.uid ?? "—"} />
        </InfoCard>

        {/* PLAN */}
        <InfoCard title="Plan">
          {loadingPlan ? (
            <div style={{ fontSize: 14, color: "#64748b" }}>
              Cargando plan...
            </div>
          ) : planError ? (
            <div style={{ fontSize: 14, color: "#991b1b", fontWeight: 700 }}>
              {planError}
            </div>
          ) : plan ? (
            <>
              <Row label="Nombre" value="Early Adopter" />
              <Row label="Precio" value={formatCLP(plan.planPrice)} />
              <Row
                label="Estado"
                value={<PlanBadge status={plan.billingStatus} />}
              />

              {plan.billingStatus === "trial" && (
                <Row
                  label="Días restantes"
                  value={plan.daysRemaining ?? "—"}
                />
              )}
            </>
          ) : (
            <div style={{ fontSize: 14, color: "#64748b" }}>
              No hay información del plan.
            </div>
          )}
        </InfoCard>

        {/* SUSCRIPCIÓN */}
        <InfoCard title="Suscripción SaaS">
          <Row label="Estado general" value="Operativa" />
          <Row label="Cobro" value="Mensual" />
          <Row label="Versión app" value="Renta Control v1.0" />
          <Row label="Canal" value="Early Adopter" />
        </InfoCard>

        {/* HELP */}
        <InfoCard title="Ayuda">
          <div
            style={{
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            Aquí podrás revisar tu plan, el estado de la cuenta y próximamente
            gestionar tu suscripción SaaS y configuraciones avanzadas.
          </div>
        </InfoCard>
      </div>
    </div>
  );
}