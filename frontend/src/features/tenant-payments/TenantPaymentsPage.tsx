import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getTenantPayments,
  type TenantPayment,
} from "./tenant-payments.api";

type UiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: TenantPayment[] };

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
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

function normalizeError(err: any): string {
  const msg =
    err?.response?.data?.message ??
    err?.message ??
    "No se pudo cargar pagos de inquilinos";
  return Array.isArray(msg) ? msg.join("\n") : String(msg);
}

function StatusBadge({ status }: { status: string }) {
  const s = String(status).toLowerCase();

  let bg = "#e5e7eb";
  let color = "#374151";
  let label = status;

  if (s === "received") {
    bg = "#e5e7eb";
    color = "#374151";
    label = "Recibido";
  }

  if (s === "partial_applied") {
    bg = "#f59e0b";
    color = "#ffffff";
    label = "Parcial";
  }

  if (s === "applied") {
    bg = "#16a34a";
    color = "#ffffff";
    label = "Aplicado";
  }

  if (s === "overpayment") {
    bg = "#7c3aed";
    color = "#ffffff";
    label = "Sobrepago";
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
        minWidth: 110,
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

export default function TenantPaymentsPage() {
  const [ui, setUi] = useState<UiState>({ status: "loading" });

  async function load() {
    try {
      setUi({ status: "loading" });
      const payments = await getTenantPayments();
      setUi({ status: "success", data: payments });
    } catch (err: any) {
      setUi({ status: "error", message: normalizeError(err) });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    if (ui.status !== "success") return null;

    const total = ui.data.length;
    const applied = ui.data.filter((p) => p.status === "applied").length;
    const partial = ui.data.filter((p) => p.status === "partial_applied").length;
    const received = ui.data.filter((p) => p.status === "received").length;
    const overpayment = ui.data.filter((p) => p.status === "overpayment").length;

    return { total, applied, partial, received, overpayment };
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
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Pagos de Inquilinos</h2>

          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            Historial de pagos registrados desde correo bancario o carga manual.
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
              <span>Total: <b>{stats.total}</b></span>
              <span>Aplicados: <b>{stats.applied}</b></span>
              <span>Parciales: <b>{stats.partial}</b></span>
              <span>Recibidos: <b>{stats.received}</b></span>
              <span>Sobrepagos: <b>{stats.overpayment}</b></span>
            </div>
          )}
        </div>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid #d7dbe6",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 600,
            textDecoration: "none",
            minHeight: 40,
            boxSizing: "border-box",
          }}
        >
          Volver
        </Link>
      </header>

      {ui.status === "loading" && (
        <div
          style={{
            padding: 24,
            borderRadius: 18,
            background: "#ffffff",
            border: "1px solid #e6e8ef",
          }}
        >
          Cargando pagos...
        </div>
      )}

      {ui.status === "error" && (
        <div
          style={{
            padding: 24,
            borderRadius: 18,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
          }}
        >
          {ui.message}
        </div>
      )}

      {ui.status === "success" && ui.data.length === 0 && (
        <div
          style={{
            padding: 24,
            borderRadius: 18,
            background: "#ffffff",
            border: "1px solid #e6e8ef",
            color: "#64748b",
          }}
        >
          No hay pagos de inquilinos registrados todavía.
        </div>
      )}

      {ui.status === "success" && ui.data.length > 0 && (
        <div
          style={{
            borderRadius: 18,
            background: "#ffffff",
            border: "1px solid #e6e8ef",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={th}>Fecha</th>
                  <th style={th}>Inquilino</th>
                  <th style={th}>Contrato</th>
                  <th style={th}>Factura</th>
                  <th style={th}>Pagado</th>
                  <th style={th}>Estado</th>
                  <th style={th}>Canal</th>
                  <th style={th}>Referencia</th>
                </tr>
              </thead>

              <tbody>
                {ui.data.map((payment) => {
                  const hasInvoice = !!payment.invoice;
                  const total = payment.invoice?.total ?? 0;
                  const paid = hasInvoice ? Math.min(payment.amount, total) : payment.amount;
                  const pending = hasInvoice ? Math.max(total - paid, 0) : 0;
                  const percent = hasInvoice && total > 0 ? Math.round((paid / total) * 100) : null;

                  const progressColor =
                    payment.status === "applied"
                      ? "#16a34a"
                      : payment.status === "partial_applied"
                      ? "#f59e0b"
                      : payment.status === "overpayment"
                      ? "#7c3aed"
                      : "#9ca3af";

                  return (
                    <tr key={payment.id}>
                      <td style={td}>
                        {formatDateTime(payment.paidAt ?? payment.createdAt)}
                      </td>

                      <td style={td}>
                        <div style={{ fontWeight: 700 }}>
                          {payment.tenant?.name ?? "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                          {payment.tenant?.email ?? "Sin email"}
                        </div>
                      </td>

                      <td style={td}>
                        {payment.subscription?.tenantName ?? "—"}
                      </td>

                      <td style={td}>
                        {hasInvoice ? (
                          <div style={{ minWidth: 170 }}>
                            <div style={{ fontWeight: 700 }}>
                              {formatCLP(total)}
                            </div>

                            <div
                              style={{
                                marginTop: 6,
                                height: 6,
                                borderRadius: 999,
                                background: "#e5e7eb",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${percent ?? 0}%`,
                                  height: "100%",
                                  background: progressColor,
                                }}
                              />
                            </div>

                           <div
                          style={{
                            fontSize: 12,
                            color: payment.status === "overpayment" ? "#7c3aed" : "#64748b",
                            marginTop: 6,
                            fontWeight: payment.status === "overpayment" ? 700 : 500,
                          }}
                        >
                          {payment.status === "overpayment"
                            ? `Sobregiro ${formatCLP(payment.amount - total)}`
                            : `Pendiente: ${formatCLP(pending)}`}
                        </div>
                          </div>
                        ) : (
                          "Sin invoice"
                        )}
                      </td>

                      <td style={td}>
                        {hasInvoice && percent != null ? (
                          <div style={{ fontWeight: 700 }}>
                            {formatCLP(payment.amount)} ({percent}%)
                          </div>
                        ) : (
                          <div style={{ fontWeight: 700 }}>
                            {formatCLP(payment.amount)}
                          </div>
                        )}
                      </td>

                      <td style={td}>
                        <StatusBadge status={payment.status} />
                      </td>

                      <td style={td}>{payment.channel || "—"}</td>

                      <td style={td}>{payment.reference || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}