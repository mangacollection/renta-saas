import { Fragment, useEffect, useMemo, useState } from "react";
import { getInvoices } from "./invoices.api";
import { getSubscriptions } from "@/features/subscriptions/subscriptions.api";
import type { Invoice } from "./invoices.types";
import type { Subscription } from "@/features/subscriptions/subscriptions.types";
import { EmptyState } from "@/components/EmptyState";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Invoice[]; warnings?: string[] };

type InvoiceView = "pending" | "all" | "paid" | "failed";

type EnrichedInvoice = Invoice & {
  tenantName: string;
  tenantEmail: string | null;
  tenantPhone: string | null;
  items?: Array<{
    id?: string;
    name?: string;
    type?: string;
    amount?: number | string;
  }>;
};

const ALL = "__ALL__";

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

function normalizeError(err: any): string {
  const msg =
    err?.response?.data?.message ?? err?.message ?? "No se pudo cargar facturas";
  return Array.isArray(msg) ? msg.join("\n") : String(msg);
}

function StatusBadge({
  status,
  dueDate,
}: {
  status: string;
  dueDate?: string;
}) {
  const s = status.toLowerCase();

  let bg = "#e5e7eb";
  let color = "#374151";
  let label = status;

  if (s === "paid") {
    bg = "#dcfce7";
    color = "#166534";
    label = "Pagado";
  } else if (s === "failed") {
    bg = "#fee2e2";
    color = "#991b1b";
    label = "Fallida";
  } else if (s === "pending") {
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);

      const diffMs = due.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        bg = "#fee2e2";
        color = "#991b1b";
        label = "Pago vencido";
      } else if (diffDays <= 5) {
        bg = "#fef9c3";
        color = "#854d0e";
        label = "Próximo a vencer";
      } else {
        bg = "#fef3c7";
        color = "#92400e";
        label = "Pendiente";
      }
    } else {
      bg = "#fef3c7";
      color = "#92400e";
      label = "Pendiente";
    }
  }

  return (
    <span
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
      }}
    >
      {label}
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

function InvoiceDetail({ invoice }: { invoice: EnrichedInvoice }) {
  const items = invoice.items ?? [];

  if (!items.length) return null;

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
      {items.map((item, index) => (
        <div
          key={item.id ?? `${item.name ?? "item"}-${index}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            paddingBottom: index === items.length - 1 ? 0 : 10,
            borderBottom:
              index === items.length - 1 ? "none" : "1px solid #eef2f7",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0f172a",
                wordBreak: "break-word",
              }}
            >
              {item.name ?? "Item"}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              {item.type ?? "—"}
            </div>
          </div>

          <div
            style={{
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

function InvoiceCard({
  invoice,
  expanded,
  onToggle,
}: {
  invoice: EnrichedInvoice;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasItems = (invoice.items ?? []).length > 0;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        background: "#ffffff",
        border: "1px solid #eef2f7",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        display: "grid",
        gap: 12,
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
              fontSize: 16,
              letterSpacing: "-0.02em",
            }}
          >
            {invoice.tenantName}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#64748b",
              wordBreak: "break-word",
            }}
          >
            {invoice.tenantEmail ?? "Sin email"}
          </div>
        </div>

        <StatusBadge status={invoice.status} dueDate={invoice.dueDate} />
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
            padding: 12,
            borderRadius: 16,
            background: "#fafbff",
            border: "1px solid #eef2f7",
          }}
        >
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
            Período
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {formatPeriod(invoice.period)}
          </div>
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 16,
            background: "#fafbff",
            border: "1px solid #eef2f7",
          }}
        >
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
            Total
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {formatCLP(invoice.total)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Generado {formatDateTime(invoice.createdAt)}
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Vence {formatDate(invoice.dueDate)}
        </div>
      </div>

      {hasItems && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid #eef2f7",
            background: "#ffffff",
            fontWeight: 700,
            cursor: "pointer",
            color: "#5b4ee6",
          }}
        >
          {expanded ? "Ocultar detalle ↑" : "Ver detalle ↓"}
        </button>
      )}

      {expanded && <InvoiceDetail invoice={invoice} />}
    </div>
  );
}

export default function InvoicesPage() {
  const isMobile = useIsMobile();

  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string>(ALL);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<InvoiceView>("pending");
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

      if (
        currentSelected !== ALL &&
        !subscriptions.some((s) => s.id === currentSelected)
      ) {
        setSelectedSubId(ALL);
        currentSelected = ALL;
      }

      if (currentSelected === ALL) {
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
      invoices.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setUi({ status: "success", data: invoices });
    } catch (err: any) {
      setUi({ status: "error", message: normalizeError(err) });
    }
  }

  useEffect(() => {
    setExpandedId(null);
  }, [selectedSubId, currentView, searchTerm]);

  useEffect(() => {
    void load(selectedSubId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubId]);

  const stats = useMemo(() => {
    if (ui.status !== "success") return null;

    const total = ui.data.length;
    const paid = ui.data.filter((i) => i.status === "paid").length;
    const pending = ui.data.filter((i) => i.status === "pending").length;
    const failed = ui.data.filter((i) => i.status === "failed").length;

    return { total, paid, pending, failed };
  }, [ui]);

  const enrichedInvoices = useMemo<EnrichedInvoice[]>(() => {
    if (ui.status !== "success") return [];

    return ui.data.map((inv: any) => {
      const subFromList = subById.get(inv.subscriptionId);
      const subFromInvoice = inv?.subscription;

      return {
        ...inv,
        tenantName:
          subFromInvoice?.tenantName ??
          subFromList?.tenantName ??
          "—",
        tenantEmail:
          subFromInvoice?.tenantEmail ??
          subFromList?.tenantEmail ??
          null,
        tenantPhone:
          subFromInvoice?.tenantPhone ??
          (subFromList as any)?.tenantPhone ??
          null,
        items: inv?.items ?? subFromInvoice?.items ?? [],
      };
    });
  }, [ui, subById]);

  const filteredInvoices = useMemo(() => {
    let result = enrichedInvoices;

    if (currentView === "pending") {
      result = result.filter((i) => i.status === "pending");
    } else if (currentView === "paid") {
      result = result.filter((i) => i.status === "paid");
    } else if (currentView === "failed") {
      result = result.filter((i) => i.status === "failed");
    }

    if (selectedSubId !== ALL) {
      result = result.filter((i) => i.subscriptionId === selectedSubId);
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter((i) => {
        const name = i.tenantName?.toLowerCase() ?? "";
        const email = i.tenantEmail?.toLowerCase() ?? "";
        return name.includes(q) || email.includes(q);
      });
    }

    return result;
  }, [enrichedInvoices, currentView, selectedSubId, searchTerm]);

  const currentViewLabel = useMemo(() => {
    if (currentView === "all") return "Todas";
    if (currentView === "paid") return "Pagadas";
    if (currentView === "failed") return "Fallidas";
    return "Pendientes";
  }, [currentView]);

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
            {selectedSubId === ALL
              ? "Revisa tus facturas y encuentra rápido las pendientes."
              : `Mostrando facturas de ${selectedSub?.tenantName ?? "este contrato"}.`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "flex-start" : "flex-end",
            width: isMobile ? "100%" : "auto",
          }}
        >
          {/* espacio reservado para futuras acciones */}
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
            label="Pendientes"
            value={stats.pending}
            active={currentView === "pending"}
            onClick={() => setCurrentView("pending")}
          />
          <StatCard
            label="Pagadas"
            value={stats.paid}
            active={currentView === "paid"}
            onClick={() => setCurrentView("paid")}
          />
          <StatCard
            label="Fallidas"
            value={stats.failed}
            active={currentView === "failed"}
            onClick={() => setCurrentView("failed")}
          />
          <StatCard
            label="Total"
            value={stats.total}
            active={currentView === "all"}
            onClick={() => setCurrentView("all")}
          />
        </div>
      )}

      {stats && (
        <div
          style={{
            marginTop: 14,
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

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
          gap: 12,
        }}
      >
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar arrendatario o correo"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid #e6eaf2",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <select
          value={selectedSubId}
          onChange={(e) => setSelectedSubId(e.target.value)}
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid #e6eaf2",
            background: "#ffffff",
            color: "#334155",
            fontWeight: 600,
            fontSize: 14,
            width: "100%",
          }}
        >
          <option value={ALL}>Todos los contratos</option>
          {subs?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.tenantName || "Sin nombre"}
            </option>
          ))}
        </select>
      </div>

      {ui.status === "success" && ui.warnings?.length ? (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            border: "1px solid #fed7aa",
            background: "#fff7ed",
            borderRadius: 16,
            color: "#9a3412",
            fontWeight: 600,
          }}
        >
          Algunas facturas no pudieron cargarse.
          <details style={{ marginTop: 8 }}>
            <summary>Ver detalles</summary>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
              {ui.warnings.join("\n\n")}
            </pre>
          </details>
        </div>
      ) : null}

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
          Cargando facturas...
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
          title="Aún no hay facturas"
          description="Cuando actives contratos, aquí aparecerán automáticamente las facturas mensuales."
        />
      )}

      {ui.status === "success" && ui.data.length > 0 && filteredInvoices.length === 0 && (
        <EmptyState
          title="No encontramos resultados"
          description="Prueba con otro nombre, correo o cambia el filtro actual."
        />
      )}

      {ui.status === "success" && filteredInvoices.length > 0 && (
        <>
          {isMobile ? (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredInvoices.map((inv) => (
                <InvoiceCard
                  key={inv.id}
                  invoice={inv}
                  expanded={expandedId === inv.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === inv.id ? null : inv.id))
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
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#ffffff",
                  color: "#111827",
                }}
              >
                <thead>
                  <tr>
                    <th style={th}>Arrendatario</th>
                    <th style={th}>Período</th>
                    <th style={th}>Total</th>
                    <th style={th}>Estado</th>
                    <th style={th}>Generado</th>
                    <th style={th}>Vence</th>
                    <th style={th}>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const isExpanded = expandedId === inv.id;
                    const hasItems = (inv.items ?? []).length > 0;

                    return (
                      <Fragment key={inv.id}>
                        <tr>
                          <td style={td}>
                            <div style={{ fontWeight: 700 }}>{inv.tenantName}</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              {inv.tenantEmail ?? "—"}
                              {inv.tenantPhone ? ` • 📞 ${inv.tenantPhone}` : ""}
                            </div>
                          </td>

                          <td style={td}>{formatPeriod(inv.period)}</td>

                          <td style={{ ...td, fontWeight: 700 }}>
                            {formatCLP(inv.total)}
                          </td>

                          <td style={td}>
                            <StatusBadge status={inv.status} dueDate={inv.dueDate} />
                          </td>

                          <td style={td}>{formatDateTime(inv.createdAt)}</td>

                          <td style={td}>{formatDate(inv.dueDate)}</td>

                          <td style={td}>
                            {hasItems ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId((prev) =>
                                    prev === inv.id ? null : inv.id
                                  )
                                }
                                style={{
                                  padding: 0,
                                  border: "none",
                                  background: "transparent",
                                  color: "#5b4ee6",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {isExpanded ? "Ocultar detalle ↑" : "Ver detalle ↓"}
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                            )}
                          </td>
                        </tr>

                        {hasItems && isExpanded && (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                ...td,
                                background: "#ffffff",
                              }}
                            >
                              <InvoiceDetail invoice={inv} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
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