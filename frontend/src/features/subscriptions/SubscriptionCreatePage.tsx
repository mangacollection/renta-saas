import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  activateSubscription,
  addSubscriptionItem,
  createSubscription,
} from "./subscriptions.api";
import { ItemsEditor, type DraftItem } from "./components/ItemsEditor";

function normalizeError(err: any): string {
  const msg = err?.response?.data?.message ?? err?.message ?? "Error";
  return Array.isArray(msg) ? msg.join("\n") : String(msg);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d7dbe6",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #6d5efc",
        background: "#6d5efc",
        color: "#ffffff",
        fontWeight: 800,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
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
        borderRadius: 12,
        border: "1px solid #d7dbe6",
        background: "#ffffff",
        color: "#0f172a",
        fontWeight: 800,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
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
        border: "1px solid #e6e8ef",
        background: "#ffffff",
        borderRadius: 16,
        padding: 16,
        opacity: props.disabled ? 0.6 : 1,
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, color: "#0f172a" }}>{props.title}</div>
          {props.hint && (
            <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
              {props.hint}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>{props.children}</div>
    </section>
  );
}

export function SubscriptionCreatePage() {
  const navigate = useNavigate();

  const [tenantName, setTenantName] = useState("");
  const [tenantRut, setTenantRut] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [billingDay, setBillingDay] = useState("5");

  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const [items, setItems] = useState<DraftItem[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSavingItemsRef = useRef(false);

  const step1Done = !!subscriptionId;
  const step2Done = savedItemIds.length > 0;

  const itemsTotal = useMemo(() => {
    return items.reduce((sum, i) => sum + (parseInt(i.amount || "0", 10) || 0), 0);
  }, [items]);

  async function onCreate() {
    if (loading) return;

    setError(null);

    if (!tenantName.trim()) {
      setError("El nombre del arrendatario es obligatorio.");
      return;
    }

    const day = parseInt(billingDay || "5", 10);
    if (!Number.isFinite(day) || day < 1 || day > 28) {
      setError("El día de cobro debe estar entre 1 y 28.");
      return;
    }

    try {
      setLoading(true);
      const sub = await createSubscription({
        tenantName: tenantName.trim(),
        tenantRut: tenantRut.trim() || undefined,
        tenantEmail: tenantEmail.trim() || undefined,
        billingDay: day,
      });
      setSubscriptionId(sub.id);
    } catch (e: any) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSaveItems() {
    if (loading || isSavingItemsRef.current) return;

    setError(null);

    if (!subscriptionId) {
      setError("Primero crea el arriendo.");
      return;
    }

    if (!items.length) {
      setError("Agrega al menos un item.");
      return;
    }

    for (const it of items) {
      if (!it.name.trim()) {
        setError("Todos los items deben tener nombre.");
        return;
      }

      const amount = parseInt(it.amount || "0", 10);
      if (!Number.isFinite(amount) || amount <= 0) {
        setError("Todos los items deben tener monto > 0.");
        return;
      }
    }

    try {
      isSavingItemsRef.current = true;
      setLoading(true);

      const createdIds: string[] = [];

      for (const it of items) {
        const created = await addSubscriptionItem({
          subscriptionId,
          type: it.type,
          name: it.name.trim(),
          amount: parseInt(it.amount || "0", 10),
        });
        createdIds.push(created.id);
      }

      setSavedItemIds(createdIds);
    } catch (e: any) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
      isSavingItemsRef.current = false;
    }
  }

  async function onActivate() {
    if (loading) return;

    setError(null);

    if (!subscriptionId) {
      setError("Primero crea el arriendo.");
      return;
    }

    if (!step2Done) {
      setError("Primero guarda al menos un item.");
      return;
    }

    try {
      setLoading(true);
      await activateSubscription({ subscriptionId });
      navigate("/invoices");
    } catch (e: any) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 980, margin: "0 auto" }}>
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
          <h2 style={{ margin: 0, color: "#0f172a" }}>Nuevo arriendo</h2>
          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            Datos → Propiedades → Activar
          </div>
        </div>

        <Link
          to="/"
          style={{
            color: "#0f172a",
            fontWeight: 800,
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #d7dbe6",
            background: "#ffffff",
          }}
        >
          ← Volver
        </Link>
      </header>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
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
          title={`1) Datos${step1Done ? " ✅" : ""}`}
          hint="Arrendatario y día de cobro."
          disabled={false}
        >
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

            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>RUT (opcional)</label>
              <input
                value={tenantRut}
                onChange={(e) => setTenantRut(e.target.value)}
                disabled={loading || step1Done}
                placeholder="Ej: 12.345.678-9"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Email (opcional)</label>
              <input
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                disabled={loading || step1Done}
                placeholder="Ej: juan@email.com"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Teléfono (opcional)</label>
              <input
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                disabled={loading || step1Done}
                placeholder="Ej: +56912345678"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6, maxWidth: 220 }}>
              <label style={labelStyle}>Día de cobro (1–28)</label>
              <input
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value.replace(/[^\d]/g, ""))}
                disabled={loading || step1Done}
                style={inputStyle}
                inputMode="numeric"
              />
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <ButtonPrimary onClick={onCreate} disabled={loading || step1Done}>
                {step1Done ? "Arriendo creado" : loading ? "Creando..." : "Crear arriendo"}
              </ButtonPrimary>

              {subscriptionId && (
                <span style={{ color: "#64748b", fontSize: 13 }}>
                  ID: <code>{subscriptionId}</code>
                </span>
              )}
            </div>
          </div>
        </Section>

        <Section
          title={`2) Propiedades${step2Done ? " ✅" : ""}`}
          hint="Agrega cargos del arriendo y guárdalos."
          disabled={!subscriptionId}
        >
          <ItemsEditor value={items} onChange={setItems} disabled={loading || !subscriptionId} />

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 800, color: "#0f172a" }}>
              Total estimado: {itemsTotal.toLocaleString("es-CL")} CLP
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <ButtonSoft onClick={() => setItems([])} disabled={loading || !subscriptionId}>
                Limpiar
              </ButtonSoft>

              <ButtonPrimary
                onClick={onSaveItems}
                disabled={loading || !subscriptionId || items.length === 0 || step2Done}
              >
                {step2Done ? "Items guardados" : loading ? "Guardando..." : "Guardar items"}
              </ButtonPrimary>
            </div>
          </div>
        </Section>

        <Section
          title="3) Activar"
          hint="Deja el arriendo listo y luego revisa cobros."
          disabled={!subscriptionId || !step2Done}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ButtonPrimary onClick={onActivate} disabled={loading || !subscriptionId || !step2Done}>
              {loading ? "Activando..." : "Activar arriendo"}
            </ButtonPrimary>

            <ButtonSoft onClick={() => navigate("/invoices")} disabled={loading}>
              Ver cobros/facturas
            </ButtonSoft>
          </div>
        </Section>
      </div>
    </div>
  );
}