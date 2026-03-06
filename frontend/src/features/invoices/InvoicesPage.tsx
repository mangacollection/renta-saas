import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getInvoices } from "./invoices.api";
import { getSubscriptions } from "@/features/subscriptions/subscriptions.api";
import type { Invoice } from "./invoices.types";
import type { Subscription } from "@/features/subscriptions/subscriptions.types";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Invoice[]; warnings?: string[] };

const ALL = "__ALL__";

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("es-CL");
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("es-CL");
}

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPeriod(period: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return period;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  let bg = "#e5e7eb";
  let color = "#374151";
  let label = status;

  if (s === "paid") {
    bg = "#16a34a";
    color = "#ffffff";
    label = "Pagado";
  }

  if (s === "pending") {
    bg = "#f59e0b";
    color = "#ffffff";
    label = "Pendiente";
  }

  if (s === "failed") {
    bg = "#dc2626";
    color = "#ffffff";
    label = "Fallido";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
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
  fontWeight: 600,
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
};

function normalizeError(err: any): string {
  const msg =
    err?.response?.data?.message ?? err?.message ?? "No se pudo cargar invoices";
  return Array.isArray(msg) ? msg.join("\n") : String(msg);
}

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFromQuery = searchParams.get("subscriptionId");
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string>(
    initialFromQuery || ALL
  );
  const [ui, setUi] = useState<UiState>({ status: "loading" });

  const subById = useMemo(() => {
    const map = new Map<string, Subscription>();
    (subs ?? []).forEach((s) => map.set(s.id, s));
    return map;
  }, [subs]);

  const selectedSub = useMemo(() => {
    if (!subs || selectedSubId === ALL) return null;
    return subs.find((s) => s.id === selectedSubId) ?? null;
  }, [subs, selectedSubId]);

  async function load(currentSelected: string) {
    try {
      setUi({ status: "loading" });

      const subscriptions = await getSubscriptions();
      setSubs(subscriptions);

      if (!subscriptions || subscriptions.length === 0) {
        setUi({ status: "success", data: [] });
        return;
      }

      // Si viene un subscriptionId por query pero no existe en el listado, caemos a ALL
      if (
        currentSelected !== ALL &&
        !subscriptions.some((s) => s.id === currentSelected)
      ) {
        setSelectedSubId(ALL);
        setSearchParams({});
        currentSelected = ALL;
      }

      if (currentSelected === ALL) {
        // ✅ ROBUSTO: si una llamada falla, igual mostramos las otras
        const results = await Promise.allSettled(
          subscriptions.map(async (s) => {
            const invs = await getInvoices(s.id);
            return { subId: s.id, invs };
          })
        );

        const warnings: string[] = [];
        const merged: Invoice[] = [];

        for (const r of results) {
          if (r.status === "fulfilled") {
            merged.push(...r.value.invs);
          } else {
            warnings.push(normalizeError(r.reason));
          }
        }

        merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setUi({
          status: "success",
          data: merged,
          warnings: warnings.length ? warnings : undefined,
        });
        return;
      }

      const invoices = await getInvoices(currentSelected);
      console.log("INVOICES SAMPLE:", invoices?.[0]);
      invoices.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setUi({ status: "success", data: invoices });
    } catch (err: any) {
      setUi({ status: "error", message: normalizeError(err) });
    }
  }

  // Si cambia querystring manualmente, refleja en selector
  useEffect(() => {
    const q = searchParams.get("subscriptionId");
    if (q && q !== selectedSubId) setSelectedSubId(q);
    if (!q && selectedSubId !== ALL) setSelectedSubId(ALL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    void load(selectedSubId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubId]);

  function onChangeSelect(next: string) {
    setSelectedSubId(next);
    if (next === ALL) setSearchParams({});
    else setSearchParams({ subscriptionId: next });
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Facturas</h2>
          <small style={{ color: "#64748b" }}>
            {selectedSubId === ALL
              ? "Mostrando: Todos los arriendos"
              : `Mostrando: ${selectedSub?.tenantName ?? selectedSubId}`}
          </small>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            to="/"
            style={{
              color: "#ffffff",
              fontWeight: 800,
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(15, 23, 42, 0.25)",
              display: "inline-block",
            }}
          >
            ← Volver
          </Link>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#ffffff",
            }}
          >
            <span style={{ fontSize: 14 }}>Contrato</span>
            <select
              value={selectedSubId}
              onChange={(e) => onChangeSelect(e.target.value)}
              style={{ padding: "6px 10px" }}
            >
              <option value={ALL}>Todos</option>
              {subs?.map((s) => (
                <option key={s.id} value={s.id}>
                  {(s.tenantName ? `${s.tenantName} — ` : "") + s.status}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => load(selectedSubId)}
            style={{ padding: "6px 12px" }}
          >
            Refrescar
          </button>
        </div>
      </header>

      <hr style={{ margin: "20px 0", borderColor: "#334155" }} />

      {ui.status === "loading" && (
        <p style={{ color: "#ffffff" }}>Cargando invoices…</p>
      )}

      {ui.status === "error" && (
        <div
          style={{
            padding: 12,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            borderRadius: 8,
          }}
        >
          <strong>Error:</strong> {ui.message}
        </div>
      )}

      {ui.status === "success" && ui.warnings?.length ? (
        <div
          style={{
            padding: 12,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <strong>Advertencia:</strong> Algunas suscripciones no pudieron cargar
          invoices.
          <details style={{ marginTop: 8 }}>
            <summary>Ver detalles</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {ui.warnings.join("\n\n")}
            </pre>
          </details>
        </div>
      ) : null}

      {ui.status === "success" && ui.data.length === 0 && (
        <p style={{ color: "#ffffff" }}>
          No hay invoices{" "}
          {selectedSubId !== ALL ? "para este contrato" : ""}.
        </p>
      )}

      {ui.status === "success" && ui.data.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            borderRadius: 12,
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#ffffff",
              color: "#111827",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={th}>Arrendatario</th>
                <th style={th}>Período</th>
                <th style={th}>Total</th>
                <th style={th}>Estado</th>
                <th style={th}>Generado</th>
                <th style={th}>Vence</th>
              </tr>
            </thead>
            <tbody>
              {ui.data.map((inv: any) => {
                const subFromList = subById.get(inv.subscriptionId);
                const subFromInvoice = inv?.subscription;

                const tenantName =
                  subFromInvoice?.tenantName ??
                  subFromList?.tenantName ??
                  "—";
                const tenantEmail =
                  subFromInvoice?.tenantEmail ??
                  subFromList?.tenantEmail ??
                  null;
                const tenantPhone =
                  subFromInvoice?.tenantPhone ??
                  (subFromList as any)?.tenantPhone ??
                  null;

                return (
                  <tr key={inv.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 800 }}>{tenantName}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {tenantEmail ?? "—"}
                        {tenantPhone ? ` • 📞 ${tenantPhone}` : ""}
                      </div>
                    </td>

                    <td style={td}>{formatPeriod(inv.period)}</td>
                    <td style={{ ...td, fontWeight: 600 }}>
                      {formatCLP(inv.total)}
                    </td>
                    <td style={td}>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td style={td}>{formatDateTime(inv.createdAt)}</td>
                    <td style={td}>{formatDate(inv.dueDate)}</td>
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