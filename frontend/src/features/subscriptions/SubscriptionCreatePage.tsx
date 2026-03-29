import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  activateSubscription,
  addSubscriptionItem,
  createSubscription,
  deleteSubscriptionItem,
  getSubscriptions,
} from "./subscriptions.api";
import { ItemsEditor, type DraftItem } from "./components/ItemsEditor";

function normalizeError(err: any): string {
  const msg = err?.response?.data?.message ?? err?.message ?? "Error";
  return Array.isArray(msg) ? msg.join("\n") : String(msg);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("56")) {
    return `+${digits.slice(0, 11)}`;
  }

  if (digits.startsWith("9")) {
    return `+56${digits.slice(0, 9)}`;
  }

  return `+${digits.slice(0, 11)}`;
}

function isValidChileanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^569\d{8}$/.test(digits);
}

function normalizeRut(value: string) {
  const clean = value.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  if (!clean) return "";

  if (clean.length === 1) return clean;

  const body = clean.slice(0, -1).replace(/\D/g, "");
  const dv = clean.slice(-1);

  let formattedBody = "";
  let count = 0;

  for (let i = body.length - 1; i >= 0; i--) {
    formattedBody = body[i] + formattedBody;
    count++;

    if (count === 3 && i !== 0) {
      formattedBody = "." + formattedBody;
      count = 0;
    }
  }

  return `${formattedBody}-${dv}`;
}

function isValidRut(rut: string): boolean {
  if (!rut) return false;

  const clean = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expected = 11 - (sum % 11);

  let expectedDv = "";
  if (expected === 11) expectedDv = "0";
  else if (expected === 10) expectedDv = "K";
  else expectedDv = String(expected);

  return dv === expectedDv;
}

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #d7dbe6",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: 0.2,
};

function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
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
        boxShadow: props.disabled ? "none" : "0 8px 20px rgba(109,94,252,0.18)",
        transition: "all 0.15s ease",
        ...props.style,
      }}
    />
  );
}

function ButtonSoft(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: "1px solid #e6eaf2",
        background: "#ffffff",
        color: "#334155",
        fontWeight: 600,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        ...props.style,
      }}
    />
  );
}

function Section(props: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <section
      style={{
        border: "1px solid #eef2f7",
        background: "#ffffff",
        borderRadius: 20,
        padding: 18,
        opacity: props.disabled ? 0.65 : 1,
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: 17,
            letterSpacing: "-0.02em",
          }}
        >
          {props.title}
        </div>
        {props.hint && (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {props.hint}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>{props.children}</div>
    </section>
  );
}

function SuccessNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 14,
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        color: "#166534",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function InfoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 14,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1d4ed8",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function WarningNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 14,
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        color: "#9a3412",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function ContractStatusBadge({
  status,
}: {
  status: "draft" | "ready" | "active";
}) {
  const config =
    status === "active"
      ? {
          label: "Activo",
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "#bfdbfe",
        }
      : status === "ready"
      ? {
          label: "Listo",
          background: "#f0fdf4",
          color: "#166534",
          border: "#bbf7d0",
        }
      : {
          label: "Borrador",
          background: "#fef3c7",
          color: "#92400e",
          border: "#fde68a",
        };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "7px 12px",
        borderRadius: 999,
        background: config.background,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {config.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  active = false,
}: {
  label: string;
  value: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        background: active
          ? "linear-gradient(180deg, rgba(109,94,252,0.12) 0%, rgba(109,94,252,0.08) 100%)"
          : "#ffffff",
        border: active ? "1px solid rgba(109,94,252,0.24)" : "1px solid #eef2f7",
        boxShadow: active
          ? "0 14px 30px rgba(109,94,252,0.10)"
          : "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ fontSize: 12, color: active ? "#5b4ee6" : "#64748b", fontWeight: 700 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontWeight: 800,
          color: "#0f172a",
          fontSize: 18,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailToggle({
  expanded,
  onClick,
  label,
}: {
  expanded: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        border: "none",
        background: "transparent",
        color: "#5b4ee6",
        fontWeight: 700,
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span>{expanded ? "Ocultar detalle ↑" : `${label} ↓`}</span>
    </button>
  );
}

export function SubscriptionCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionIdFromQuery = searchParams.get("subscriptionId");
  const isMobile = useIsMobile();

  const [tenantName, setTenantName] = useState("");
  const [tenantRut, setTenantRut] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [billingDay, setBillingDay] = useState("5");

  const [tenantRutError, setTenantRutError] = useState<string | null>(null);
  const [tenantEmailError, setTenantEmailError] = useState<string | null>(null);
  const [tenantPhoneError, setTenantPhoneError] = useState<string | null>(null);

  const [subscriptionId, setSubscriptionId] = useState<string | null>(
    subscriptionIdFromQuery
  );

  const [items, setItems] = useState<DraftItem[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [itemsSuccess, setItemsSuccess] = useState<string | null>(null);
  const [itemsInfo, setItemsInfo] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [tenantExpanded, setTenantExpanded] = useState(!subscriptionIdFromQuery);

  const isSavingItemsRef = useRef(false);

  const step1Done = !!subscriptionId;
  const step2Done = savedItemIds.length > 0;

  const itemsTotal = useMemo(() => {
    return items.reduce(
      (sum, i) => sum + (parseInt(i.amount || "0", 10) || 0),
      0
    );
  }, [items]);

  useEffect(() => {
    async function loadDraft() {
      if (!subscriptionIdFromQuery) return;

      try {
        setLoading(true);
        setError(null);
        setItemsSuccess(null);
        setItemsInfo(null);
        setItemsError(null);
        setCreateSuccess(null);

        const subs = await getSubscriptions();
        const current = subs.find((s) => s.id === subscriptionIdFromQuery);

        if (!current) {
          setError("No se encontró el borrador.");
          return;
        }

        setTenantName(current.tenantName ?? "");
        setTenantRut(current.tenantRut ?? "");
        setTenantEmail(current.tenantEmail ?? "");
        setTenantPhone(current.tenantPhone ?? "");
        setBillingDay(String(current.billingDay ?? 5));
        setSubscriptionId(current.id);
        setTenantExpanded(false);

        const existingItems: DraftItem[] = (current.items ?? []).map((it) => ({
          clientId: it.id,
          id: it.id,
          type: it.type,
          name: it.name,
          amount: String(it.amount),
        }));

        setItems(existingItems);
        setSavedItemIds((current.items ?? []).map((it) => it.id));
      } catch (e: any) {
        setError(normalizeError(e));
      } finally {
        setLoading(false);
      }
    }

    void loadDraft();
  }, [subscriptionIdFromQuery]);

  useEffect(() => {
    if (step1Done) {
      setTenantExpanded(false);
    }
  }, [step1Done]);

  async function onCreate() {
    if (loading) return;

    setError(null);
    setCreateSuccess(null);
    setTenantRutError(null);
    setTenantEmailError(null);
    setTenantPhoneError(null);

    if (!tenantName.trim()) {
      setError("El nombre del arrendatario es obligatorio.");
      return;
    }

    const day = parseInt(billingDay || "5", 10);
    if (!Number.isFinite(day) || day < 1 || day > 28) {
      setError("El día de cobro debe estar entre 1 y 28.");
      return;
    }

    const normalizedEmail = normalizeEmail(tenantEmail);
    const normalizedPhone = normalizePhone(tenantPhone);
    const normalizedRut = normalizeRut(tenantRut);

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setTenantEmailError("Ingresa un correo válido.");
      return;
    }

    if (normalizedPhone && !isValidChileanPhone(normalizedPhone)) {
      setTenantPhoneError("Ingresa un teléfono válido. Ej: +56912345678");
      return;
    }

    if (normalizedRut && !isValidRut(normalizedRut)) {
      setTenantRutError("Ingresa un RUT válido.");
      return;
    }

    try {
      setLoading(true);
      const sub = await createSubscription({
        tenantName: tenantName.trim(),
        tenantRut: normalizedRut || undefined,
        tenantEmail: normalizedEmail || undefined,
        tenantPhone: normalizedPhone || undefined,
        billingDay: day,
      });
      setSubscriptionId(sub.id);
      setTenantRut(normalizedRut);
      setTenantEmail(normalizedEmail);
      setTenantPhone(normalizedPhone);
      setCreateSuccess("Datos guardados. Ahora agrega los cargos.");
      setTenantExpanded(false);
    } catch (e: any) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleItemsChange(nextItems: DraftItem[]) {
    if (!subscriptionId) {
      setItems(nextItems);
      return;
    }

    const removedSavedItems = items.filter(
      (current) =>
        current.id &&
        !nextItems.some((next) => next.clientId === current.clientId)
    );

    if (removedSavedItems.length === 0) {
      setItems(nextItems);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setItemsSuccess(null);
      setItemsInfo(null);
      setItemsError(null);

      for (const item of removedSavedItems) {
        if (item.id) {
          await deleteSubscriptionItem(item.id);
        }
      }

      setSavedItemIds((prev) =>
        prev.filter((id) => !removedSavedItems.some((item) => item.id === id))
      );
      setItems(nextItems);
      setItemsSuccess("Cargo eliminado correctamente.");
    } catch (e: any) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSaveItems() {
    if (loading || isSavingItemsRef.current) return;

    setError(null);
    setItemsSuccess(null);
    setItemsInfo(null);
    setItemsError(null);

    if (!subscriptionId) {
      setError("Primero guarda los datos del arrendatario.");
      return;
    }

    if (!items.length) {
      setItemsError("Agrega al menos un cargo antes de guardar.");
      return;
    }

    for (const it of items) {
      if (!it.name.trim()) {
        setItemsError("Todos los cargos deben tener un concepto.");
        return;
      }

      const amount = parseInt(it.amount || "0", 10);
      if (!Number.isFinite(amount) || amount <= 0) {
        setItemsError("Hay cargos con monto inválido. Ingresa valores mayores a 0.");
        return;
      }
    }

    try {
      isSavingItemsRef.current = true;
      setLoading(true);
      setItemsInfo("Guardando cargos...");

      const createdIds: string[] = [];

      for (const it of items) {
        if (it.id) continue;

        const created = await addSubscriptionItem({
          subscriptionId,
          type: it.type,
          name: it.name.trim(),
          amount: parseInt(it.amount || "0", 10),
        });
        createdIds.push(created.id);
      }

      setSavedItemIds((prev) => [...prev, ...createdIds]);

      if (createdIds.length > 0) {
        setItems((prev) => {
          const next = [...prev];
          let createdIndex = 0;

          for (let i = 0; i < next.length; i++) {
            if (!next[i].id && createdIndex < createdIds.length) {
              next[i] = {
                ...next[i],
                id: createdIds[createdIndex],
              };
              createdIndex += 1;
            }
          }

          return next;
        });
      }

      setItemsSuccess(
        createdIds.length > 0
          ? "Cargos guardados correctamente."
          : "No había cargos nuevos para guardar."
      );
    } catch (e: any) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
      setItemsInfo(null);
      isSavingItemsRef.current = false;
    }
  }

  async function onActivate() {
    if (loading) return;

    setError(null);

    if (!subscriptionId) {
      setError("Primero guarda los datos del arrendatario.");
      return;
    }

    if (!step2Done) {
      setError("Primero guarda al menos un cargo.");
      return;
    }

    try {
      setLoading(true);
      await activateSubscription({ subscriptionId });
      navigate("/");
    } catch (e: any) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  const isEditingDraft = !!subscriptionIdFromQuery;
  const contractStatus: "draft" | "ready" = step2Done ? "ready" : "draft";

  return (
    <div
      style={{
        padding: 8,
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          padding: isMobile ? 16 : 18,
          borderRadius: 24,
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
              maxWidth: 560,
            }}
          >
            {isEditingDraft
              ? "Completa el borrador, agrega los cargos y déjalo listo para activar."
              : "Crea el contrato, agrega los cargos mensuales y actívalo cuando esté listo."}
          </div>

          {createSuccess && <SuccessNotice>{createSuccess}</SuccessNotice>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <ContractStatusBadge status={contractStatus} />
        </div>
      </section>

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
        <StatCard label="Estado" value={contractStatus === "ready" ? "Listo" : "Borrador"} active />
        <StatCard
          label="Cargos"
          value={`${items.length} ${items.length === 1 ? "item" : "items"}`}
        />
        <StatCard
          label="Total estimado"
          value={`${itemsTotal.toLocaleString("es-CL")} CLP`}
        />
        <StatCard label="Cobro" value={`Día ${billingDay || "5"}`} />
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 14,
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#991b1b",
            fontWeight: 700,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <Section
          title="Arrendatario"
          hint="Define quién arrienda y el día de cobro mensual."
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: tenantExpanded ? 14 : 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>
                {tenantName || "Nuevo arrendatario"}
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
                {tenantEmail || "Sin email"} • Día {billingDay || "5"}
              </div>
            </div>

            <DetailToggle
              expanded={tenantExpanded}
              onClick={() => setTenantExpanded((prev) => !prev)}
              label="Ver detalle"
            />
          </div>

          {tenantExpanded && (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={labelStyle}>Nombre arrendatario</label>
                <input
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  disabled={loading || step1Done}
                  placeholder="Ej: Juan Pérez"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={labelStyle}>RUT (opcional)</label>
                  <input
                    value={tenantRut}
                    onChange={(e) => {
                      setTenantRut(normalizeRut(e.target.value));
                      if (tenantRutError) setTenantRutError(null);
                      if (error) setError(null);
                    }}
                    disabled={loading || step1Done}
                    placeholder="Ej: 12.345.678-5"
                    style={inputStyle}
                  />
                  {tenantRutError && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {tenantRutError}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={labelStyle}>Email (opcional)</label>
                  <input
                    value={tenantEmail}
                    onChange={(e) => {
                      setTenantEmail(normalizeEmail(e.target.value));
                      if (tenantEmailError) setTenantEmailError(null);
                      if (error) setError(null);
                    }}
                    disabled={loading || step1Done}
                    placeholder="Ej: juan@email.com"
                    style={inputStyle}
                  />
                  {tenantEmailError && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {tenantEmailError}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 220px",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={labelStyle}>Teléfono (opcional)</label>
                  <input
                    value={tenantPhone}
                    onChange={(e) => {
                      setTenantPhone(normalizePhone(e.target.value));
                      if (tenantPhoneError) setTenantPhoneError(null);
                      if (error) setError(null);
                    }}
                    disabled={loading || step1Done}
                    placeholder="Ej: +56912345678"
                    style={inputStyle}
                  />
                  {tenantPhoneError && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {tenantPhoneError}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={labelStyle}>Día de cobro (1–28)</label>
                  <input
                    value={billingDay}
                    onChange={(e) =>
                      setBillingDay(e.target.value.replace(/[^\d]/g, ""))
                    }
                    disabled={loading || step1Done}
                    style={inputStyle}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <ButtonPrimary onClick={onCreate} disabled={loading || step1Done}>
                  {step1Done
                    ? "Datos guardados"
                    : loading
                    ? "Guardando..."
                    : "Guardar datos"}
                </ButtonPrimary>

                {subscriptionId && (
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>
                    ID: <code>{subscriptionId}</code>
                  </span>
                )}
              </div>
            </div>
          )}
        </Section>

        <Section
          title="Cargos"
          hint="Agrega los conceptos que se cobrarán cada mes."
        >
          <ItemsEditor
            value={items}
            onChange={handleItemsChange}
            disabled={loading}
          />

          {!subscriptionId && (
            <InfoNotice>
              Puedes preparar los cargos desde ya. Para guardarlos, primero guarda los datos del arrendatario.
            </InfoNotice>
          )}

          {itemsInfo && <InfoNotice>{itemsInfo}</InfoNotice>}
          {itemsSuccess && !loading && <SuccessNotice>{itemsSuccess}</SuccessNotice>}
          {itemsError && <WarningNotice>{itemsError}</WarningNotice>}

          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                Total estimado del contrato
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontWeight: 800,
                  color: "#0f172a",
                  fontSize: 18,
                }}
              >
                {itemsTotal.toLocaleString("es-CL")} CLP
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ButtonSoft disabled title="Próximamente">
                Limpiar
              </ButtonSoft>

              <ButtonPrimary
                onClick={onSaveItems}
                disabled={loading || !subscriptionId || items.length === 0}
              >
                {loading ? "Guardando..." : "Guardar cargos"}
              </ButtonPrimary>
            </div>
          </div>
        </Section>

        <Section
          title="Activación"
          hint="Activa el contrato cuando ya tenga datos y cargos guardados."
          disabled={!subscriptionId || !step2Done}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#334155",
                lineHeight: 1.5,
              }}
            >
              {step2Done ? (
                <>Todo listo. Puedes activar el contrato y comenzar a cobrar automáticamente.</>
              ) : (
                <>Agrega y guarda al menos un cargo antes de activar el contrato.</>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ButtonPrimary
                onClick={onActivate}
                disabled={loading || !subscriptionId || !step2Done}
              >
                {loading ? "Activando..." : "Activar contrato"}
              </ButtonPrimary>

              <ButtonSoft onClick={() => navigate("/")} disabled={loading}>
                Volver a contratos
              </ButtonSoft>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}