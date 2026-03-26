import { useEffect, useMemo, useState } from "react";
import { getTenantPayments } from "./tenant-payments.api";
import { EmptyState } from "@/components/EmptyState";

/* ===============================
   🔹 TYPES
================================ */
type PaymentView = "all" | "recent";

/* ===============================
   🔹 HELPERS
================================ */
function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-CL");
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("es-CL");
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return isMobile;
}

/* ===============================
   🔹 UI COMPONENTS
================================ */
function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 16,
        borderRadius: 22,
        background: active
          ? "linear-gradient(180deg, rgba(109,94,252,0.12), rgba(109,94,252,0.08))"
          : "#fff",
        border: active
          ? "1px solid rgba(109,94,252,0.25)"
          : "1px solid #eef2f7",
        boxShadow: active
          ? "0 14px 30px rgba(109,94,252,0.10)"
          : "0 8px 24px rgba(15,23,42,0.04)",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
        {label}
      </div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800 }}>
        {value}
      </div>
    </button>
  );
}

function PaymentDetail({ payment }: any) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "#fafbff",
        border: "1px solid #eef2f7",
        display: "grid",
        gap: 8,
      }}
    >
      <div><b>Arrendatario:</b> {payment.tenantName}</div>
      <div><b>Email:</b> {payment.tenantEmail ?? "—"}</div>
      <div><b>Referencia:</b> {payment.reference ?? "—"}</div>
      <div><b>Fecha:</b> {formatDateTime(payment.createdAt)}</div>
    </div>
  );
}

function PaymentCard({ payment }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        background: "#fff",
        border: "1px solid #eef2f7",
        boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{payment.tenantName}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {payment.tenantEmail ?? "Sin email"}
          </div>
        </div>

        <div style={{ fontWeight: 800 }}>
          {formatCLP(payment.amount)}
        </div>
      </div>

      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          border: "none",
          background: "transparent",
          color: "#5b4ee6",
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
        }}
      >
        {expanded ? "Ocultar detalle ↑" : "Ver detalle ↓"}
      </button>

      {expanded && <PaymentDetail payment={payment} />}
    </div>
  );
}

/* ===============================
   🔹 MAIN PAGE
================================ */
export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<PaymentView>("all");

  const isMobile = useIsMobile();

  useEffect(() => {
    getTenantPayments().then(setPayments);
  }, []);

  /* ===============================
     🔹 STATS
  ================================= */
  const stats = useMemo(() => {
    return {
      total: payments.length,
      recent: payments.filter((p) => {
        const d = new Date(p.createdAt);
        const now = new Date();
        return now.getTime() - d.getTime() < 1000 * 60 * 60 * 24 * 7;
      }).length,
    };
  }, [payments]);

  /* ===============================
     🔹 FILTER
  ================================= */
  const filtered = useMemo(() => {
    let data = payments;

    if (view === "recent") {
      data = data.filter((p) => {
        const d = new Date(p.createdAt);
        return Date.now() - d.getTime() < 7 * 86400000;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.tenantName?.toLowerCase().includes(q) ||
          p.tenantEmail?.toLowerCase().includes(q)
      );
    }

    return data;
  }, [payments, search, view]);

  /* ===============================
     🔹 EMPTY STATE
  ================================= */
  if (!payments.length) {
    return (
      <EmptyState
        title="No hay pagos registrados"
        description="Los pagos aparecerán automáticamente cuando se procesen transferencias."
      />
    );
  }

  /* ===============================
     🔹 UI
  ================================= */
  return (
    <div style={{ padding: 8, maxWidth: 1180, margin: "0 auto" }}>
      {/* HEADER */}
      <section
        style={{
          padding: 20,
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #eef2f7",
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <div style={{ color: "#64748b" }}>
          Revisa los pagos recibidos de tus arrendatarios.
        </div>
      </section>

      {/* STATS */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2,1fr)",
          gap: 12,
        }}
      >
        <StatCard
          label="Todos"
          value={stats.total}
          active={view === "all"}
          onClick={() => setView("all")}
        />
        <StatCard
          label="Últimos 7 días"
          value={stats.recent}
          active={view === "recent"}
          onClick={() => setView("recent")}
        />
      </div>

      {/* VIEW */}
      <div style={{ marginTop: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
          Vista actual
        </span>{" "}
        <span style={{ color: "#5b4ee6", fontWeight: 700 }}>
          {view === "all" ? "Todos" : "Últimos 7 días"}
        </span>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar arrendatario o correo"
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          borderRadius: 16,
          border: "1px solid #e6eaf2",
        }}
      />

      <div style={{ marginTop: 16 }} />

      {/* EMPTY FILTER */}
      {filtered.length === 0 && (
        <EmptyState
          title="No hay resultados"
          description="Prueba otro filtro o búsqueda."
        />
      )}

      {/* MOBILE */}
      {isMobile ? (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((p) => (
            <PaymentCard key={p.id} payment={p} />
          ))}
        </div>
      ) : (
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Arrendatario</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Detalle</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const isExpanded = expandedId === p.id;

              return (
                <>
                  <tr key={p.id}>
                    <td>
                      <b>{p.tenantName}</b>
                      <div style={{ fontSize: 12 }}>{p.tenantEmail}</div>
                    </td>
                    <td>{formatCLP(p.amount)}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      <button
                        onClick={() =>
                          setExpandedId((prev) =>
                            prev === p.id ? null : p.id
                          )
                        }
                      >
                        {isExpanded ? "↑" : "↓"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={4}>
                        <PaymentDetail payment={p} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}