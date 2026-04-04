import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import {
  getAccountPlan,
  getAccountProfile,
  updateAccountProfile,
} from "./account.api";
import type { AccountPlan, AccountProfile } from "./account.types";

const BILLING_PHONE = import.meta.env.VITE_BILLING_PHONE ?? "";

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPlanLabel(plan: string) {
  if (plan === "early_adopter") return "Early Adopter";
  return plan || "—";
}

function getStatusMessage(plan: AccountPlan) {
  if (plan.billingStatus === "active") {
    return "Tu suscripción está activa.";
  }

  if (plan.billingStatus === "trial") {
    return `Estás en periodo de prueba hasta ${formatDate(plan.trialEndsAt)}.`;
  }

  if (plan.billingStatus === "past_due") {
    return "Tu suscripción está vencida. Debes pagar para seguir usando el sistema.";
  }

  return "Estamos revisando el estado de tu suscripción.";
}

function getWhatsAppLink(phone: string) {
  if (!phone) return "#";

  const normalizedPhone = phone.replace(/\D/g, "");
  const text = encodeURIComponent(
    "Hola, quiero pagar mi suscripción de RentaControl"
  );

  return `https://wa.me/${normalizedPhone}?text=${text}`;
}

function sanitizePhoneInput(value: string) {
  const cleaned = value.replace(/[^0-9+\s]/g, "");
  const plusCount = (cleaned.match(/\+/g) || []).length;

  if (plusCount === 0) return cleaned;

  if (cleaned.startsWith("+")) {
    return `+${cleaned.slice(1).replace(/\+/g, "")}`;
  }

  return cleaned.replace(/\+/g, "");
}

function normalizeChileMobilePhone(value: string) {
  const cleaned = value.trim().replace(/[^\d+]/g, "");

  if (!cleaned) return "";

  if (cleaned.startsWith("+")) {
    if (!/^\+569\d{8}$/.test(cleaned)) {
      throw new Error("Ingresa un celular válido de Chile");
    }
    return cleaned;
  }

  const digits = cleaned.replace(/\D/g, "");

  if (/^9\d{8}$/.test(digits)) {
    return `+56${digits}`;
  }

  if (/^569\d{8}$/.test(digits)) {
    return `+${digits}`;
  }

  throw new Error("Ingresa un celular válido de Chile");
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

  const [, setProfile] = useState<AccountProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [phoneSaved, setPhoneSaved] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);

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

    async function loadProfile() {
      try {
        setLoadingProfile(true);
        const profileData = await getAccountProfile();
        setProfile(profileData);
        setPhoneSaved(profileData.phone ?? "");
        setPhoneInput(profileData.phone ?? "");
        setProfileError(null);
      } catch (error: any) {
        setProfileError(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudo cargar el perfil"
        );
      } finally {
        setLoadingProfile(false);
      }
    }

    void loadPlan();
    void loadProfile();
  }, []);

  const statusMessage = useMemo(() => {
    if (!plan) return null;
    return getStatusMessage(plan);
  }, [plan]);

  const statusBannerStyles = useMemo(() => {
    if (!plan) {
      return {
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        titleColor: "#334155",
        textColor: "#475569",
      };
    }

    if (plan.billingStatus === "active") {
      return {
        background: "#dcfce7",
        border: "1px solid #bbf7d0",
        titleColor: "#166534",
        textColor: "#166534",
      };
    }

    if (plan.billingStatus === "trial") {
      return {
        background: "#fef3c7",
        border: "1px solid #fde68a",
        titleColor: "#92400e",
        textColor: "#92400e",
      };
    }

    if (plan.billingStatus === "past_due") {
      return {
        background: "#fee2e2",
        border: "1px solid #fecaca",
        titleColor: "#991b1b",
        textColor: "#7f1d1d",
      };
    }

    return {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      titleColor: "#334155",
      textColor: "#475569",
    };
  }, [plan]);

  const billingWhatsAppUrl = useMemo(() => {
    return getWhatsAppLink(BILLING_PHONE);
  }, []);

  const isBillingPhoneConfigured = BILLING_PHONE.trim().length > 0;

  async function handleSavePhone() {
    try {
      setSavingPhone(true);
      setPhoneSuccess(null);
      setProfileError(null);

      const valueToSave = phoneInput.trim()
        ? normalizeChileMobilePhone(phoneInput)
        : "";

      const updated = await updateAccountProfile({
        phone: valueToSave || undefined,
      });

      setProfile(updated);
      setPhoneSaved(updated.phone ?? "");
      setPhoneInput(updated.phone ?? "");
      setIsEditingPhone(false);
      setPhoneSuccess("Teléfono guardado correctamente.");
    } catch (error: any) {
      setProfileError(
        error?.response?.data?.message ??
          error?.message ??
          "No se pudo guardar el teléfono"
      );
    } finally {
      setSavingPhone(false);
    }
  }

  function handleCancelEditPhone() {
    setPhoneInput(phoneSaved);
    setIsEditingPhone(false);
    setPhoneSuccess(null);
    setProfileError(null);
  }

  return (
    <div
      style={{
        padding: 8,
        maxWidth: 960,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {plan && !loadingPlan && !planError && (
        <div
          style={{
            marginBottom: 16,
            padding: "14px 16px",
            borderRadius: 16,
            background: statusBannerStyles.background,
            border: statusBannerStyles.border,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: statusBannerStyles.titleColor,
            }}
          >
            Estado de tu suscripción SaaS
          </div>

          <div
            style={{
              fontSize: 13,
              color: statusBannerStyles.textColor,
              lineHeight: 1.5,
            }}
          >
            {statusMessage}
          </div>

          {isBillingPhoneConfigured ? (
            <a
              href={billingWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                alignSelf: "flex-start",
                marginTop: 2,
                padding: "9px 14px",
                borderRadius: 999,
                border: "none",
                background:
                  plan.billingStatus === "past_due" ? "#dc2626" : "#25d366",
                color: "#ffffff",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Pagar suscripción
            </a>
          ) : (
            <div
              style={{
                marginTop: 2,
                fontSize: 13,
                fontWeight: 600,
                color: "#991b1b",
              }}
            >
              Falta configurar VITE_BILLING_PHONE en el frontend.
            </div>
          )}
        </div>
      )}

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
        <InfoCard title="Owner">
          <Row label="Correo" value={user?.email ?? "—"} />
          <Row label="Nombre" value={user?.displayName ?? "No informado"} />
          <Row label="UID" value={user?.uid ?? "—"} />

          <div style={{ paddingTop: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              WhatsApp personal
            </div>

            {loadingProfile ? (
              <div style={{ fontSize: 14, color: "#64748b" }}>
                Cargando perfil...
              </div>
            ) : (
              <>
                {!isEditingPhone ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        minHeight: 44,
                        flex: 1,
                        minWidth: 260,
                        boxSizing: "border-box",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontSize: 14,
                        color: phoneSaved ? "#0f172a" : "#64748b",
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {phoneSaved || "No informado"}
                    </div>

                    <button
                      onClick={() => {
                        setIsEditingPhone(true);
                        setPhoneSuccess(null);
                        setProfileError(null);
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "none",
                        background: "#6d5efc",
                        color: "#ffffff",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      value={phoneInput}
                      onChange={(e) =>
                        setPhoneInput(sanitizePhoneInput(e.target.value))
                      }
                      placeholder="Ej: +56912345678"
                      inputMode="tel"
                      autoComplete="tel"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        border: "1px solid #cbd5e1",
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={handleSavePhone}
                        disabled={savingPhone}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "none",
                          background: "#6d5efc",
                          color: "#ffffff",
                          fontWeight: 700,
                          cursor: savingPhone ? "default" : "pointer",
                          opacity: savingPhone ? 0.7 : 1,
                        }}
                      >
                        {savingPhone ? "Guardando..." : "Guardar"}
                      </button>

                      <button
                        onClick={handleCancelEditPhone}
                        disabled={savingPhone}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#334155",
                          fontWeight: 700,
                          cursor: savingPhone ? "default" : "pointer",
                          opacity: savingPhone ? 0.7 : 1,
                        }}
                      >
                        Cancelar
                      </button>

                      {phoneSuccess && (
                        <span
                          style={{
                            fontSize: 13,
                            color: "#166534",
                            fontWeight: 600,
                          }}
                        >
                          {phoneSuccess}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {profileError && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: "#991b1b",
                      fontWeight: 600,
                    }}
                  >
                    {profileError}
                  </div>
                )}
              </>
            )}
          </div>
        </InfoCard>

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
              <Row label="Plan" value={getPlanLabel(plan.plan)} />
              <Row label="Monto" value={formatCLP(plan.planPrice)} />
              <Row
                label="Estado"
                value={<PlanBadge status={plan.billingStatus} />}
              />

              {plan.billingStatus === "trial" ? (
                <>
                  <Row
                    label="Fin del trial"
                    value={formatDate(plan.trialEndsAt)}
                  />
                  <Row
                    label="Días restantes"
                    value={plan.daysRemaining ?? "—"}
                  />
                </>
              ) : (
                <Row
                  label="Próximo pago"
                  value={formatDate(plan.nextPaymentDueAt)}
                />
              )}
            </>
          ) : (
            <div style={{ fontSize: 14, color: "#64748b" }}>
              No hay información del plan.
            </div>
          )}
        </InfoCard>

        <InfoCard title="Suscripción SaaS">
          {loadingPlan ? (
            <div style={{ fontSize: 14, color: "#64748b" }}>
              Cargando estado SaaS...
            </div>
          ) : planError ? (
            <div style={{ fontSize: 14, color: "#991b1b", fontWeight: 700 }}>
              {planError}
            </div>
          ) : plan ? (
            <>
              <Row
                label="Estado de pago"
                value={<PlanBadge status={plan.billingStatus} />}
              />
              <Row label="Cobro" value="Mensual" />
              <Row
                label="Fecha límite"
                value={
                  plan.billingStatus === "trial"
                    ? formatDate(plan.trialEndsAt)
                    : formatDate(plan.nextPaymentDueAt)
                }
              />
              <Row
                label="Mensaje"
                value={
                  <span style={{ maxWidth: 360, display: "inline-block" }}>
                    {statusMessage}
                  </span>
                }
              />
            </>
          ) : (
            <div style={{ fontSize: 14, color: "#64748b" }}>
              No hay información de la suscripción SaaS.
            </div>
          )}
        </InfoCard>

        <InfoCard title="Ayuda">
          <div
            style={{
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            Aquí puedes revisar tu plan, el estado del cobro SaaS y contactar al
            canal de pago de RentaControl cuando necesites regularizar tu
            suscripción.
          </div>
        </InfoCard>
      </div>
    </div>
  );
}