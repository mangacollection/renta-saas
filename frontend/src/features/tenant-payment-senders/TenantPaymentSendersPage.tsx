import { useEffect, useMemo, useState } from "react";
import { getSubscriptions } from "@/features/subscriptions/subscriptions.api";
import type { Subscription } from "@/features/subscriptions/subscriptions.types";
import {
  createTenantPaymentSender,
  getTenantPaymentSenders,
  updateTenantPaymentSender,
  deleteTenantPaymentSender,
  type TenantPaymentSender,
} from "./tenantPaymentSenders.api";

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

function normalizeError(err: any): string {
  const msg =
    err?.response?.data?.message ??
    err?.message ??
    "No se pudo guardar el remitente bancario";
  return Array.isArray(msg) ? msg.join("\n") : String(msg);
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("es-CL");
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d7dbe6",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: 0.2,
};

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

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        background: "#ffffff",
        border: "1px solid #eef2f7",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
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
    </div>
  );
}

function SenderCard({
  sender,
  tenantName,
  editingId,
  editingEmail,
  editingBank,
  setEditingEmail,
  setEditingBank,
  startEdit,
  saveEdit,
  setEditingId,
  onDelete,
  saving,
  deletingId,
}: {
  sender: TenantPaymentSender;
  tenantName: string;
  editingId: string | null;
  editingEmail: string;
  editingBank: string;
  setEditingEmail: (value: string) => void;
  setEditingBank: (value: string) => void;
  startEdit: (sender: TenantPaymentSender) => void;
  saveEdit: (id: string) => Promise<void>;
  setEditingId: (id: string | null) => void;
  onDelete: (sender: TenantPaymentSender) => Promise<void>;
  saving: boolean;
  deletingId: string | null;
}) {
  const isEditing = editingId === sender.id;

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
            {tenantName}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            Creado {formatDate(sender.createdAt)}
          </div>
        </div>
      </div>

      {isEditing ? (
        <>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Correo banco</label>
            <input
              value={editingEmail}
              onChange={(e) => setEditingEmail(e.target.value)}
              style={inputStyle}
              disabled={saving}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Banco</label>
            <input
              value={editingBank}
              onChange={(e) => setEditingBank(e.target.value)}
              style={inputStyle}
              disabled={saving}
              placeholder="Banco"
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PrimaryButton
              type="button"
              onClick={() => void saveEdit(sender.id)}
              disabled={saving}
            >
              Guardar
            </PrimaryButton>

            <ButtonSoft
              type="button"
              onClick={() => setEditingId(null)}
              disabled={saving}
            >
              Cancelar
            </ButtonSoft>
          </div>
        </>
      ) : (
        <>
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
                Correo banco
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                  wordBreak: "break-word",
                }}
              >
                {sender.email}
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
                Banco
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {sender.bank || "—"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ButtonSoft type="button" onClick={() => startEdit(sender)}>
              Editar
            </ButtonSoft>

            <ButtonSoft
              type="button"
              onClick={() => void onDelete(sender)}
              disabled={deletingId === sender.id}
              style={{
                color: "#991b1b",
                borderColor: "#fecaca",
                background: "#fff1f2",
              }}
            >
              {deletingId === sender.id ? "Eliminando..." : "Eliminar"}
            </ButtonSoft>
          </div>
        </>
      )}
    </div>
  );
}

export default function TenantPaymentSendersPage() {
  const isMobile = useIsMobile();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [senders, setSenders] = useState<TenantPaymentSender[]>([]);

  const [tenantId, setTenantId] = useState("");
  const [email, setEmail] = useState("");
  const [bank, setBank] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [editingBank, setEditingBank] = useState("");

  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingSenders, setLoadingSenders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadSubscriptions() {
    try {
      setLoadingSubs(true);
      const data = await getSubscriptions();
      setSubscriptions(data.filter((s) => s.status !== "cancelled"));
    } catch (err: any) {
      setError(normalizeError(err));
    } finally {
      setLoadingSubs(false);
    }
  }

  async function loadSenders() {
    try {
      setLoadingSenders(true);
      const data = await getTenantPaymentSenders();
      setSenders(data);
    } catch (err: any) {
      setError(normalizeError(err));
    } finally {
      setLoadingSenders(false);
    }
  }

  useEffect(() => {
    void loadSubscriptions();
    void loadSenders();
  }, []);

  const tenantOptions = useMemo(() => {
    return subscriptions
      .map((s: any) => ({
        subscriptionId: s.id,
        tenantId: s?.tenant?.id ?? "",
        tenantName: s.tenantName ?? "—",
        tenantEmail: s.tenantEmail ?? "",
        hasTenant: !!s?.tenant?.id,
      }))
      .filter((x) => x.hasTenant);
  }, [subscriptions]);

  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    tenantOptions.forEach((t) => {
      map.set(t.tenantId, t.tenantName);
    });
    return map;
  }, [tenantOptions]);

  const stats = useMemo(() => {
    return {
      total: senders.length,
      contracts: tenantOptions.length,
    };
  }, [senders.length, tenantOptions.length]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!tenantId) {
      setError("Debes seleccionar un contratista.");
      return;
    }

    if (!email.trim()) {
      setError("El email del banco es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      await createTenantPaymentSender({
        tenantId,
        email: email.trim(),
        bank: bank.trim() || undefined,
      });

      setSuccess("Remitente bancario guardado correctamente.");
      setTenantId("");
      setEmail("");
      setBank("");

      await loadSenders();
    } catch (err: any) {
      setError(normalizeError(err));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(sender: TenantPaymentSender) {
    setEditingId(sender.id);
    setEditingEmail(sender.email);
    setEditingBank(sender.bank || "");
    setError(null);
    setSuccess(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    setSuccess(null);

    if (!editingEmail.trim()) {
      setError("El email no puede quedar vacío.");
      return;
    }

    try {
      setSaving(true);

      await updateTenantPaymentSender(id, {
        email: editingEmail.trim(),
        bank: editingBank.trim() || undefined,
      });

      const email = editingEmail.trim();

      if (!email.includes("@")) {
        setError("Ingresa un correo válido.");
        return;
      }
      setEditingId(null);
      setSuccess("Remitente actualizado correctamente.");
      await loadSenders();
    } catch (err: any) {
      setError(normalizeError(err));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(sender: TenantPaymentSender) {
    const ok = window.confirm(`¿Eliminar el remitente ${sender.email}?`);
    if (!ok) return;

    try {
      setDeletingId(sender.id);
      setError(null);
      setSuccess(null);

      await deleteTenantPaymentSender(sender.id);
      setSuccess("Remitente eliminado correctamente.");
      await loadSenders();
    } catch (err: any) {
      setError(normalizeError(err));
    } finally {
      setDeletingId(null);
    }
  }

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
            Configura correos bancarios para asociarlos automáticamente a cada contratista.
          </div>
        </div>
      </section>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="Remitentes" value={stats.total} />
        <StatCard label="Contratistas disponibles" value={stats.contracts} />
      </div>

      {success && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 16,
            border: "1px solid #bbf7d0",
            background: "#f0fdf4",
            color: "#166534",
            fontWeight: 700,
          }}
        >
          {success}
        </div>
      )}

      <section
        style={{
          marginTop: 16,
          border: "1px solid #eef2f7",
          background: "#ffffff",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        }}
      >
        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 17 }}>
          Registrar remitente
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
          Ejemplo: notificaciones@banco.cl → contratista correcto
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Contratista</label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                disabled={loadingSubs || saving}
                style={inputStyle}
              >
                <option value="">
                  {loadingSubs
                    ? "Cargando contratos..."
                    : tenantOptions.length === 0
                    ? "No hay contratistas disponibles"
                    : "Selecciona un contratista"}
                </option>

                {tenantOptions.map((t) => (
                  <option key={t.tenantId} value={t.tenantId}>
                    {t.tenantName}
                    {t.tenantEmail ? ` — ${t.tenantEmail}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Correo banco</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
                placeholder="Ej: notificaciones@banco.cl"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Banco</label>
              <input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                disabled={saving}
                placeholder="Ej: Banco de Chile"
                style={inputStyle}
              />
            </div>

            <div>
              <PrimaryButton
                type="submit"
                disabled={saving || loadingSubs || tenantOptions.length === 0}
                style={{ width: isMobile ? "100%" : "auto" }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </section>

      <div style={{ height: 18 }} />

      {loadingSenders ? (
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: "#ffffff",
            border: "1px solid #eef2f7",
            color: "#64748b",
          }}
        >
          Cargando remitentes...
        </div>
      ) : senders.length === 0 ? (
        <div
          style={{
            padding: 22,
            borderRadius: 20,
            border: "1px dashed #dbe3ee",
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 8,
              color: "#0f172a",
              fontSize: 22,
              letterSpacing: "-0.03em",
            }}
          >
            No tienes remitentes registrados
          </h3>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
            Agrega remitentes bancarios para que la conciliación automática funcione mejor.
          </p>
        </div>
      ) : isMobile ? (
        <div style={{ display: "grid", gap: 12 }}>
          {senders.map((sender) => (
            <SenderCard
              key={sender.id}
              sender={sender}
              tenantName={tenantNameById.get(sender.tenantId) ?? "Contratista"}
              editingId={editingId}
              editingEmail={editingEmail}
              editingBank={editingBank}
              setEditingEmail={setEditingEmail}
              setEditingBank={setEditingBank}
              startEdit={startEdit}
              saveEdit={saveEdit}
              setEditingId={setEditingId}
              onDelete={onDelete}
              saving={saving}
              deletingId={deletingId}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: 20,
            background: "#ffffff",
            border: "1px solid #eef2f7",
            boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Contratista</th>
                <th style={th}>Correo banco</th>
                <th style={th}>Banco</th>
                <th style={th}>Creado</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {senders.map((sender) => (
                <tr key={sender.id}>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>
                      {tenantNameById.get(sender.tenantId) ?? "Contratista"}
                    </div>
                  </td>

                            <td style={td}>
                {editingId === sender.id ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <input
                      value={editingEmail}
                      onChange={(e) => setEditingEmail(e.target.value)}
                      style={inputStyle}
                      disabled={saving}
                    />

                    {error && (
                      <div
                        style={{
                          marginTop: 6,
                          color: "#dc2626",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  sender.email
                )}
              </td>

                  <td style={td}>
                    {editingId === sender.id ? (
                      <input
                        value={editingBank}
                        onChange={(e) => setEditingBank(e.target.value)}
                        style={inputStyle}
                        disabled={saving}
                        placeholder="Banco"
                      />
                    ) : (
                      sender.bank || "—"
                    )}
                  </td>

                  <td style={td}>{formatDate(sender.createdAt)}</td>

                  <td style={td}>
                    {editingId === sender.id ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <PrimaryButton
                          type="button"
                          onClick={() => void saveEdit(sender.id)}
                          disabled={saving}
                          style={{ padding: "8px 12px" }}
                        >
                          Guardar
                        </PrimaryButton>

                        <ButtonSoft
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                          style={{ padding: "8px 12px" }}
                        >
                          Cancelar
                        </ButtonSoft>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <ButtonSoft
                          type="button"
                          onClick={() => startEdit(sender)}
                          style={{ padding: "8px 12px" }}
                        >
                          Editar
                        </ButtonSoft>

                        <ButtonSoft
                          type="button"
                          onClick={() => void onDelete(sender)}
                          disabled={deletingId === sender.id}
                          style={{
                            padding: "8px 12px",
                            color: "#991b1b",
                            borderColor: "#fecaca",
                            background: "#fff1f2",
                          }}
                        >
                          {deletingId === sender.id ? "Eliminando..." : "Eliminar"}
                        </ButtonSoft>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}