import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type EmailLog = {
  id: string;
  accountId?: string | null;
  email: string;
  type: string;
  status: string;
  error?: string | null;
  createdAt: string;
};

function normalizeLogs(payload: unknown): EmailLog[] {
  if (Array.isArray(payload)) {
    return payload as EmailLog[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: EmailLog[] }).data;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: EmailLog[] }).items;
  }

  return [];
}

function StatusBadge({ status }: { status: string }) {
  const isSent = status === "sent";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: isSent ? "#dcfce7" : "#fee2e2",
        color: isSent ? "#166534" : "#991b1b",
      }}
    >
      {status}
    </span>
  );
}

export default function AdminObservabilityPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/admin/email-logs?take=50");
      const normalized = normalizeLogs(res.data);

      setLogs(normalized);
    } catch (err) {
      console.error("Error loading email logs", err);
      setLogs([]);
      setError("No se pudieron cargar los logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  const counters = useMemo(() => {
    const sent = logs.filter((log) => log.status === "sent").length;
    const failed = logs.filter((log) => log.status === "failed").length;

    return {
      total: logs.length,
      sent,
      failed,
    };
  }, [logs]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
         <h2 style={{ margin: 0 }}>Monitor de Emails</h2>
          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            Seguimiento de envíos, fallos y estado de cobranza SaaS
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadLogs()}
          style={{
            border: "1px solid #dbe4f0",
            background: "#fff",
            borderRadius: 12,
            padding: "10px 14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #eef2f7",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, color: "#64748b" }}>Total logs</div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>
            {counters.total}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #eef2f7",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, color: "#64748b" }}>Enviados</div>
          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              fontWeight: 700,
              color: "#166534",
            }}
          >
            {counters.sent}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #eef2f7",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, color: "#64748b" }}>Fallidos</div>
          <div
            style={{
              marginTop: 8,
              fontSize: 24,
              fontWeight: 700,
              color: "#991b1b",
            }}
          >
            {counters.failed}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          border: "1px solid #eef2f7",
          overflowX: "auto",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Historial de envíos</h3>

        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div style={{ color: "#b91c1c" }}>{error}</div>
        ) : logs.length === 0 ? (
          <div style={{ color: "#64748b" }}>No hay logs</div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              minWidth: 760,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eef2f7" }}>
                <th style={{ padding: "10px 8px" }}>Email</th>
                <th style={{ padding: "10px 8px" }}>Tipo</th>
                <th style={{ padding: "10px 8px" }}>Estado</th>
                <th style={{ padding: "10px 8px" }}>Fecha</th>
                <th style={{ padding: "10px 8px" }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 8px" }}>{log.email}</td>
                  <td style={{ padding: "12px 8px" }}>{log.type}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <StatusBadge status={log.status} />
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {new Date(log.createdAt).toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: "12px 8px", color: "#b91c1c" }}>
                    {log.error || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}