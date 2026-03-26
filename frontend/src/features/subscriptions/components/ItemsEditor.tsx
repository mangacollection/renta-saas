import { useEffect, useMemo, useState } from "react";

export type DraftItem = {
  clientId: string;
  id?: string;
  type: string;
  name: string;
  amount: string;
};

const ITEM_TYPES = [
  { value: "depto", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "estacionamiento", label: "Estacionamiento" },
  { value: "bodega", label: "Bodega" },
  { value: "gasto_comun", label: "Gasto común" },
  { value: "otro", label: "Otro" },
];

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

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
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

function SoftButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
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

function getTypeLabel(type: string) {
  return ITEM_TYPES.find((t) => t.value === type)?.label ?? type;
}

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ItemsEditor(props: {
  value: DraftItem[];
  onChange: (items: DraftItem[]) => void;
  disabled?: boolean;
  renderSaveActions?: React.ReactNode;
}) {
  const { value, onChange, disabled, renderSaveActions } = props;
  const isMobile = useIsMobile();

  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [expandedSavedIds, setExpandedSavedIds] = useState<string[]>([]);

  function createClientId() {
    try {
      if (
        typeof globalThis !== "undefined" &&
        globalThis.crypto &&
        typeof globalThis.crypto.randomUUID === "function"
      ) {
        return globalThis.crypto.randomUUID();
      }
    } catch {}

    return `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  const editingItems = useMemo(() => value.filter((item) => !item.id), [value]);
  const savedItems = useMemo(() => value.filter((item) => !!item.id), [value]);

  const hasIncompleteItem = useMemo(() => {
    return value.some((item) => {
      const hasConcept = item.name.trim().length > 0;
      const amount = parseInt(item.amount || "0", 10);
      const hasValidAmount = Number.isFinite(amount) && amount > 0;
      return !hasConcept || !hasValidAmount;
    });
  }, [value]);

  function addItem() {
    if (disabled || hasIncompleteItem) return;

    const clientId = createClientId();

    onChange([
      {
        clientId,
        type: "depto",
        name: "",
        amount: "",
      },
      ...value,
    ]);

    setHighlightedItemId(clientId);
  }

  function removeItem(clientId: string) {
    onChange(value.filter((i) => i.clientId !== clientId));
    if (highlightedItemId === clientId) {
      setHighlightedItemId(null);
    }
    setExpandedSavedIds((prev) => prev.filter((id) => id !== clientId));
  }

  function updateItem(clientId: string, patch: Partial<DraftItem>) {
    onChange(
      value.map((i) => (i.clientId === clientId ? { ...i, ...patch } : i))
    );
  }

  function toggleSavedItem(clientId: string) {
    setExpandedSavedIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  }

  useEffect(() => {
    if (!highlightedItemId) return;
    const exists = value.some((item) => item.clientId === highlightedItemId);
    if (!exists) {
      setHighlightedItemId(null);
    }
  }, [value, highlightedItemId]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {disabled && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          Contrato activo — no puedes editar los cargos.
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
        }}
      >
        <SoftButton
          type="button"
          onClick={addItem}
          disabled={disabled || hasIncompleteItem}
          title={
            hasIncompleteItem
              ? "Completa el cargo en edición antes de agregar otro."
              : "Agregar cargo"
          }
          style={{
            width: isMobile ? "100%" : "auto",
            padding: isMobile ? "12px 14px" : "10px 14px",
            fontWeight: 700,
            borderColor:
              disabled || hasIncompleteItem
                ? "#e6eaf2"
                : "rgba(109,94,252,0.18)",
            color:
              disabled || hasIncompleteItem ? "#334155" : "#5b4ee6",
            background:
              disabled || hasIncompleteItem
                ? "#ffffff"
                : "rgba(109,94,252,0.05)",
          }}
        >
          + Agregar cargo
        </SoftButton>
      </div>

      {hasIncompleteItem && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          Completa el cargo que estás editando antes de agregar otro.
        </div>
      )}

      {value.length === 0 ? (
        <div
          style={{
            padding: 18,
            border: "1px dashed #dbe3ee",
            borderRadius: 18,
            background: "#fafbff",
            color: "#64748b",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          Todavía no hay cargos. Agrega al menos uno para poder guardar el contrato.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {editingItems.map((item, index) => {
            const isHighlighted = item.clientId === highlightedItemId;
            const isLastEditing = index === editingItems.length - 1;

            return (
              <div
                key={item.clientId}
                style={{
                  padding: 14,
                  border: isHighlighted
                    ? "1px solid rgba(109,94,252,0.28)"
                    : "1px solid #eef2f7",
                  borderRadius: 20,
                  background: isHighlighted
                    ? "rgba(109,94,252,0.05)"
                    : "#ffffff",
                  boxShadow: isHighlighted
                    ? "0 10px 28px rgba(109,94,252,0.10)"
                    : "0 8px 24px rgba(15,23,42,0.04)",
                  display: "grid",
                  gap: 12,
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    {isHighlighted && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(109,94,252,0.12)",
                          color: "#5b4ee6",
                          border: "1px solid rgba(109,94,252,0.18)",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Nuevo
                      </span>
                    )}
                  </div>

                  <SoftButton
                    type="button"
                    onClick={() => removeItem(item.clientId)}
                    disabled={disabled}
                    style={{
                      color: "#991b1b",
                      borderColor: "#fee2e2",
                      background: "#ffffff",
                      padding: "8px 12px",
                      boxShadow: "none",
                    }}
                    title="Quitar cargo"
                  >
                    Quitar
                  </SoftButton>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "180px 1fr 180px",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={labelStyle}>Tipo</label>
                    <select
                      value={item.type}
                      onChange={(e) =>
                        updateItem(item.clientId, { type: e.target.value })
                      }
                      disabled={disabled}
                      style={fieldStyle}
                    >
                      {ITEM_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={labelStyle}>Concepto</label>
                    <input
                      value={item.name}
                      placeholder="Ej: Arriendo depto 1203"
                      onChange={(e) =>
                        updateItem(item.clientId, { name: e.target.value })
                      }
                      disabled={disabled}
                      style={fieldStyle}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={labelStyle}>Monto mensual</label>
                    <input
                      value={item.amount}
                      placeholder="Ej: 450000"
                      inputMode="numeric"
                      onChange={(e) =>
                        updateItem(item.clientId, {
                          amount: e.target.value.replace(/[^\d]/g, ""),
                        })
                      }
                      disabled={disabled}
                      style={fieldStyle}
                    />
                  </div>
                </div>

                {isLastEditing && renderSaveActions && (
                  <div style={{ marginTop: 2 }}>{renderSaveActions}</div>
                )}
              </div>
            );
          })}

          {savedItems.map((item) => {
            const isExpanded = expandedSavedIds.includes(item.clientId);
            const amount = parseInt(item.amount || "0", 10) || 0;

            return (
              <div
                key={item.clientId}
                style={{
                  padding: 14,
                  border: "1px solid #eef2f7",
                  borderRadius: 20,
                  background: "#ffffff",
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
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0f172a",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.name || "Sin concepto"}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        {getTypeLabel(item.type)}
                      </span>

                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCLP(amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSavedItem(item.clientId)}
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

                  <SoftButton
                    type="button"
                    onClick={() => removeItem(item.clientId)}
                    disabled={disabled}
                    style={{
                      color: "#991b1b",
                      borderColor: "#fee2e2",
                      background: "#ffffff",
                      padding: "8px 12px",
                      boxShadow: "none",
                    }}
                    title="Quitar cargo"
                  >
                    Quitar
                  </SoftButton>
                </div>

                {isExpanded && (
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
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={labelStyle}>Tipo</div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {getTypeLabel(item.type)}
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Concepto</div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#0f172a",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.name || "Sin concepto"}
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Monto mensual</div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {formatCLP(amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}