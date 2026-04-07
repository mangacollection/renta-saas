import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  rut?: string | null;
  properties?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
};

type LeadFilter =
  | "new"
  | "contacted"
  | "demo_scheduled"
  | "activated"
  | "rejected"
  | "all";

const BRAND = "#6d5efc";
const BRAND_SOFT = "#f3f0ff";
const BRAND_BORDER = "#dcd6ff";
const BRAND_SHADOW = "0 10px 24px rgba(109,94,252,0.14)";

const cardStyle: React.CSSProperties = {
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #e6e8ef",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1080,
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  fontSize: 13,
  color: "#475569",
  background: "#f8fafc",
  borderBottom: "1px solid #eef2f7",
};

const td: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #eef2f7",
  fontSize: 14,
  verticalAlign: "top",
  color: "#0f172a",
};

const buttonBase: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const modalButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

function MetricFilterCard({
  label,
  value,
  active,
  onClick,
  valueColor,
}: {
  label: string;
  value: string | number;
  active: boolean;
  onClick: () => void;
  valueColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...cardStyle,
        padding: 20,
        cursor: "pointer",
        textAlign: "left",
        background: active ? BRAND_SOFT : "#ffffff",
        border: active ? `1px solid ${BRAND_BORDER}` : "1px solid #e6e8ef",
        boxShadow: active ? BRAND_SHADOW : "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 28,
          lineHeight: 1.1,
          fontWeight: 800,
          color: active ? BRAND : valueColor ?? "#0f172a",
        }}
      >
        {value}
      </div>
    </button>
  );
}

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

function buildFallbackMessage(lead: Lead) {
  return `Hola ${lead.name}, soy del equipo de RentaControl 👋

Vimos que te registraste en la Beta.

¿Te muestro cómo puedes empezar a cobrar arriendos hoy mismo?`;
}

function LeadStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const stylesByStatus: Record<
    string,
    { background: string; color: string; label: string }
  > = {
    new: {
      background: "#e0f2fe",
      color: "#075985",
      label: "Nuevo",
    },
    contacted: {
      background: "#fef3c7",
      color: "#92400e",
      label: "Contactado",
    },
    demo_scheduled: {
      background: "#ede9fe",
      color: "#5b21b6",
      label: "Demo agendada",
    },
    activated: {
      background: "#dcfce7",
      color: "#166534",
      label: "Activado",
    },
    rejected: {
      background: "#fee2e2",
      color: "#991b1b",
      label: "Rechazado",
    },
  };

  const current = stylesByStatus[normalized] ?? {
    background: "#e5e7eb",
    color: "#374151",
    label: status,
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: current.background,
        color: current.color,
        whiteSpace: "nowrap",
      }}
    >
      {current.label}
    </span>
  );
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadFilter>("new");

  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [waText, setWaText] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  async function fetchLeads() {
    try {
      setLoading(true);
      const res = await api.get("/admin/leads");
      setLeads(res.data);
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setLoading(false);
    }
  }

  async function openContactModal(lead: Lead) {
    const cleanPhone = lead.phone.replace(/\D/g, "");
    const fallbackMessage = buildFallbackMessage(lead);

    setSelectedLead(lead);
    setWaPhone(cleanPhone);
    setWaText(fallbackMessage);
    setCopyMsg(null);
    setShowModal(true);

    try {
      setGeneratingMessage(true);

      const res = await api.post("/admin/leads/generate-whatsapp-message", {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        rut: lead.rut,
        properties: lead.properties,
        message: lead.message,
        status: lead.status,
      });

      const aiMessage =
        typeof res.data?.message === "string" && res.data.message.trim().length > 0
          ? res.data.message.trim()
          : null;

      setWaText(aiMessage ?? fallbackMessage);
    } catch (error) {
      console.error("Error generating WhatsApp message", error);
      setWaText(fallbackMessage);
    } finally {
      setGeneratingMessage(false);
    }
  }

  async function copyWhatsAppText() {
    try {
      await navigator.clipboard.writeText(waText);
      setCopyMsg("Mensaje copiado ✅");
    } catch {
      setCopyMsg("No se pudo copiar ❌");
    }
  }

  async function copyLeadEmail() {
    if (!selectedLead?.email) {
      setCopyMsg("No hay email para copiar ❌");
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedLead.email);
      setCopyMsg("Email copiado ✅");
    } catch {
      setCopyMsg("No se pudo copiar email ❌");
    }
  }

  function openWhatsAppChat() {
    if (!waPhone) {
      alert("No hay teléfono cargado");
      return;
    }

    const encodedText = encodeURIComponent(waText);
    window.open(`https://wa.me/${waPhone}?text=${encodedText}`, "_blank");
  }

  useEffect(() => {
    void fetchLeads();
  }, []);

  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((lead) => lead.status === "new").length;
    const contactedCount = leads.filter((lead) => lead.status === "contacted").length;
    const demoCount = leads.filter((lead) => lead.status === "demo_scheduled").length;
    const activatedCount = leads.filter((lead) => lead.status === "activated").length;
    const rejectedCount = leads.filter((lead) => lead.status === "rejected").length;

    return {
      total,
      newCount,
      contactedCount,
      demoCount,
      activatedCount,
      rejectedCount,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") {
      return leads;
    }

    return leads.filter((lead) => lead.status === statusFilter);
  }, [leads, statusFilter]);

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1240,
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
              Leads (Beta)
            </h1>
            <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
              Seguimiento comercial de leads captados desde la landing pública.
            </div>
          </div>

          <button
            onClick={() => {
              void fetchLeads();
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: `1px solid ${BRAND_BORDER}`,
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
              color: BRAND,
              boxShadow: "0 6px 18px rgba(109,94,252,0.08)",
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <MetricFilterCard
          label="Total leads"
          value={stats.total}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />

        <MetricFilterCard
          label="Nuevos"
          value={stats.newCount}
          active={statusFilter === "new"}
          onClick={() => setStatusFilter("new")}
        />

        <MetricFilterCard
          label="Contactados"
          value={stats.contactedCount}
          active={statusFilter === "contacted"}
          onClick={() => setStatusFilter("contacted")}
          valueColor="#92400e"
        />

        <MetricFilterCard
          label="Demo agendada"
          value={stats.demoCount}
          active={statusFilter === "demo_scheduled"}
          onClick={() => setStatusFilter("demo_scheduled")}
          valueColor="#166534"
        />

        <MetricFilterCard
          label="Activados"
          value={stats.activatedCount}
          active={statusFilter === "activated"}
          onClick={() => setStatusFilter("activated")}
          valueColor="#166534"
        />

        <MetricFilterCard
          label="Rechazados"
          value={stats.rejectedCount}
          active={statusFilter === "rejected"}
          onClick={() => setStatusFilter("rejected")}
          valueColor="#991b1b"
        />
      </div>

      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid #eef2f7" }}>
          <SectionTitle
            title="Listado de leads"
            subtitle="Visualiza el lead, cambia su estado comercial y abre contacto por WhatsApp."
          />
        </div>

        {loading ? (
          <div style={{ padding: 18, fontSize: 14, color: "#64748b" }}>
            Cargando leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ padding: 18, fontSize: 14, color: "#64748b" }}>
            No hay leads para este estado.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Nombre</th>
                  <th style={th}>Email</th>
                  <th style={th}>Teléfono</th>
                  <th style={th}>RUT</th>
                  <th style={th}>Propiedades</th>
                  <th style={th}>Mensaje</th>
                  <th style={th}>Estado</th>
                  <th style={th}>Fecha</th>
                  <th style={th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 700 }}>{lead.name}</div>
                    </td>
                    <td style={td}>{lead.email}</td>
                    <td style={td}>{lead.phone}</td>
                    <td style={td}>{lead.rut ?? "-"}</td>
                    <td style={td}>{lead.properties ?? "-"}</td>
                    <td style={td}>
                      <div
                        style={{
                          maxWidth: 220,
                          color: "#475569",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {lead.message?.trim() || "-"}
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <LeadStatusBadge status={lead.status} />

                        {editingLeadId === lead.id ? (
                          <select
                            value={lead.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;

                              try {
                                await api.patch(`/admin/leads/${lead.id}`, {
                                  status: newStatus,
                                });

                                setLeads((prev) =>
                                  prev.map((l) =>
                                    l.id === lead.id ? { ...l, status: newStatus } : l
                                  )
                                );
                                setEditingLeadId(null);
                              } catch (error) {
                                console.error("Error updating status", error);
                                alert("No se pudo actualizar el estado");
                              }
                            }}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 8,
                              border: "1px solid #d7dbe6",
                              fontSize: 13,
                              background: "#fff",
                            }}
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="demo_scheduled">demo_scheduled</option>
                            <option value="activated">activated</option>
                            <option value="rejected">rejected</option>
                          </select>
                        ) : (
                          <button
                            onClick={() => setEditingLeadId(lead.id)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: `1px solid ${BRAND_BORDER}`,
                              background: "#ffffff",
                              color: BRAND,
                              fontWeight: 700,
                              cursor: "pointer",
                              width: "fit-content",
                              boxShadow: "0 4px 12px rgba(109,94,252,0.06)",
                            }}
                          >
                            Cambiar
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={td}>
                      {new Date(lead.createdAt).toLocaleString("es-CL")}
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => void openContactModal(lead)}
                        style={{
                          ...buttonBase,
                          background: BRAND,
                          color: "#fff",
                          boxShadow: "0 10px 20px rgba(109,94,252,0.18)",
                        }}
                      >
                        Contactar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedLead && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 640,
              background: "#ffffff",
              borderRadius: 18,
              border: `1px solid ${BRAND_BORDER}`,
              boxShadow: "0 20px 50px rgba(109,94,252,0.16)",
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              Contactar lead
            </div>

            <div
              style={{
                display: "grid",
                gap: 6,
                marginBottom: 14,
                fontSize: 14,
                color: "#334155",
              }}
            >
              <div>
                <b>Nombre:</b> {selectedLead.name}
              </div>
              <div>
                <b>Teléfono:</b> {selectedLead.phone}
              </div>
              <div>
                <b>Email:</b> {selectedLead.email}
              </div>
              <div>
                <b>Propiedades:</b> {selectedLead.properties ?? "-"}
              </div>
              <div>
                <b>Estado:</b> <LeadStatusBadge status={selectedLead.status} />
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 10,
              }}
            >
              {generatingMessage
                ? "Generando mensaje con AI..."
                : "Puedes revisar o editar el mensaje antes de enviarlo."}
            </div>

            <textarea
              value={waText}
              onChange={(e) => setWaText(e.target.value)}
              style={{
                width: "100%",
                minHeight: 220,
                resize: "vertical",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #d7dbe6",
                outline: "none",
                fontSize: 14,
                lineHeight: 1.5,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            {copyMsg && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: copyMsg.includes("✅") ? "#16a34a" : "#b91c1c",
                  fontWeight: 600,
                }}
              >
                {copyMsg}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              <button
                onClick={copyWhatsAppText}
                style={{
                  ...modalButtonStyle,
                  background: BRAND_SOFT,
                  color: BRAND,
                  border: `1px solid ${BRAND_BORDER}`,
                  boxShadow: "0 6px 16px rgba(109,94,252,0.08)",
                }}
              >
                Copiar mensaje
              </button>

              <button
                onClick={copyLeadEmail}
                style={{
                  ...modalButtonStyle,
                  background: "#ffffff",
                  color: BRAND,
                  border: `1px solid ${BRAND_BORDER}`,
                  boxShadow: "0 6px 16px rgba(109,94,252,0.08)",
                }}
              >
                Copiar email
              </button>

              <button
                onClick={openWhatsAppChat}
                style={{
                  ...modalButtonStyle,
                  background: BRAND,
                  color: "#ffffff",
                  boxShadow: "0 10px 20px rgba(109,94,252,0.18)",
                }}
              >
                Abrir WhatsApp
              </button>

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedLead(null);
                  setWaText("");
                  setWaPhone("");
                  setCopyMsg(null);
                }}
                style={{
                  ...modalButtonStyle,
                  background: "#f8fafc",
                  color: "#111827",
                  border: "1px solid #e5e7eb",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}