import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";

type PricingConfig = {
  id: string;
  plan: string;
  pricingCode: string;
  pricingLabel: string;
  price: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #d7dbe6",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
  background: "#ffffff",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #e6e8ef",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>
        {title}
      </div>
      {subtitle ? (
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: active ? "#dcfce7" : "#eef2f7",
        color: active ? "#166534" : "#475569",
      }}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CL");
}

export default function AdminPricingPage() {
  const [pricings, setPricings] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState("early_adopter");
  const [pricingCode, setPricingCode] = useState("");
  const [pricingLabel, setPricingLabel] = useState("");
  const [price, setPrice] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  async function loadPricing() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<PricingConfig[]>("/admin/pricing");
      setPricings(res.data);
    } catch {
      setError("No se pudo cargar el pricing");
    } finally {
      setLoading(false);
    }
  }

  async function createPricing() {
    try {
      setSaving(true);
      setFormMsg(null);

      const parsedPrice = Number(price);

      if (!plan.trim()) {
        setFormMsg("El plan es obligatorio ❌");
        return;
      }

      if (!pricingCode.trim()) {
        setFormMsg("El código es obligatorio ❌");
        return;
      }

      if (!pricingLabel.trim()) {
        setFormMsg("La etiqueta es obligatoria ❌");
        return;
      }

      if (!parsedPrice || parsedPrice <= 0) {
        setFormMsg("El precio debe ser mayor a 0 ❌");
        return;
      }

      await api.post("/admin/pricing", {
        plan: plan.trim(),
        pricingCode: pricingCode.trim(),
        pricingLabel: pricingLabel.trim(),
        price: parsedPrice,
        isActive,
        startsAt: startsAt ? new Date(`${startsAt}T00:00:00`) : null,
        endsAt: endsAt ? new Date(`${endsAt}T23:59:59`) : null,
      });

      setFormMsg("Pricing guardado correctamente ✅");
      setPricingCode("");
      setPricingLabel("");
      setPrice("");
      setStartsAt("");
      setEndsAt("");
      setIsActive(true);

      await loadPricing();
    } catch (err: any) {
      const backendMsg =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : null;

      setFormMsg(backendMsg ? `${backendMsg} ❌` : "Error guardando pricing ❌");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadPricing();
  }, []);

  const activePricing = useMemo(() => {
    return pricings.find((item) => item.isActive) ?? null;
  }, [pricings]);

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gap: 18,
      }}
    >
      <div style={{ ...cardStyle, padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.1,
                color: "#0f172a",
                letterSpacing: "-0.03em",
              }}
            >
              Pricing
            </h1>
            <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
              Gestión de precios SaaS, cohortes y pricing activo.
            </div>
          </div>

          <button
            onClick={() => void loadPricing()}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #d7dbe6",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 18 }}>
        <SectionTitle
          title="Pricing activo"
          subtitle="Este pricing será usado por las nuevas cuentas."
        />

        {loading ? (
          <div style={{ fontSize: 14, color: "#64748b" }}>Cargando pricing...</div>
        ) : error ? (
          <div style={{ fontSize: 14, color: "#b91c1c" }}>{error}</div>
        ) : activePricing ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                background: "#f8fafc",
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                PLAN
              </div>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800 }}>
                {activePricing.plan}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                background: "#f8fafc",
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                CÓDIGO
              </div>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800 }}>
                {activePricing.pricingCode}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                background: "#f8fafc",
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                ETIQUETA
              </div>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800 }}>
                {activePricing.pricingLabel}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                background: "#f8fafc",
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                PRECIO
              </div>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800 }}>
                {formatCurrency(activePricing.price)}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: "#64748b" }}>
            No hay pricing activo configurado.
          </div>
        )}
      </div>

      <div style={{ ...cardStyle, padding: 18 }}>
        <SectionTitle
          title="Crear pricing"
          subtitle="Puedes crear una nueva cohorte y dejarla activa si corresponde."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Plan
            </div>
            <input
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              style={inputStyle}
              placeholder="early_adopter"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Código pricing
            </div>
            <input
              value={pricingCode}
              onChange={(e) => setPricingCode(e.target.value)}
              style={inputStyle}
              placeholder="2608"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Etiqueta
            </div>
            <input
              value={pricingLabel}
              onChange={(e) => setPricingLabel(e.target.value)}
              style={inputStyle}
              placeholder="Invierno 2026"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Precio
            </div>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
              style={inputStyle}
              placeholder="8990"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Fecha inicio
            </div>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Fecha fin
            </div>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 14,
            fontSize: 14,
            color: "#334155",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Dejar este pricing como activo
        </label>

        <div style={{ marginTop: 14 }}>
          <button
            onClick={createPricing}
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "#6d5efc",
              color: "#fff",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              fontWeight: 700,
            }}
          >
            {saving ? "Guardando..." : "Guardar pricing"}
          </button>
        </div>

        {formMsg && (
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: formMsg.includes("✅") ? "#16a34a" : "#b91c1c",
              fontWeight: 600,
            }}
          >
            {formMsg}
          </div>
        )}
      </div>

      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid #eef2f7" }}>
          <SectionTitle
            title="Historial de pricing"
            subtitle="Cohortes creadas y estado actual."
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 18, color: "#64748b" }}>Cargando...</div>
          ) : error ? (
            <div style={{ padding: 18, color: "#b91c1c" }}>{error}</div>
          ) : pricings.length === 0 ? (
            <div style={{ padding: 18, color: "#64748b" }}>
              No hay pricing registrados aún.
            </div>
          ) : (
            <table
              style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}
            >
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Plan
                  </th>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Código
                  </th>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Etiqueta
                  </th>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Precio
                  </th>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Inicio
                  </th>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Fin
                  </th>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Estado
                  </th>
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13 }}>
                    Creado
                  </th>
                </tr>
              </thead>

              <tbody>
                {pricings.map((pricing) => (
                  <tr key={pricing.id} style={{ borderTop: "1px solid #eef2f7" }}>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      {pricing.plan}
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      {pricing.pricingCode}
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      {pricing.pricingLabel}
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      {formatCurrency(pricing.price)}
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      {formatDate(pricing.startsAt)}
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      {formatDate(pricing.endsAt)}
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      <StatusBadge active={pricing.isActive} />
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 14 }}>
                      {new Date(pricing.createdAt).toLocaleDateString("es-CL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}