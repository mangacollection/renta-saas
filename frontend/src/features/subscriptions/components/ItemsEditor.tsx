export type DraftItem = {
  clientId: string;
  type: string;
  name: string;
  amount: string; // string por el input; luego lo convertimos a number
};

const ITEM_TYPES = [
  { value: "depto", label: "Departamento" },
  { value: "estacionamiento", label: "Estacionamiento" },
  { value: "bodega", label: "Bodega" },
  { value: "gasto_comun", label: "Gasto común" },
  { value: "otro", label: "Otro" },
];

export function ItemsEditor(props: {
  value: DraftItem[];
  onChange: (items: DraftItem[]) => void;
  disabled?: boolean;
}) {
  const { value, onChange, disabled } = props;

  function addItem() {
    onChange([
      ...value,
      {
        clientId: crypto.randomUUID(),
        type: "depto",
        name: "",
        amount: "",
      },
    ]);
  }

  function removeItem(clientId: string) {
    onChange(value.filter((i) => i.clientId !== clientId));
  }

  function updateItem(clientId: string, patch: Partial<DraftItem>) {
    onChange(value.map((i) => (i.clientId === clientId ? { ...i, ...patch } : i)));
  }

  const total = value.reduce((sum, i) => sum + (parseInt(i.amount || "0", 10) || 0), 0);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Items</h3>
       <button
  type="button"
  onClick={addItem}
  disabled={disabled}
  style={{
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  }}
>
  + Agregar item
</button>
      </div>

      {value.length === 0 ? (
        <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 8 }}>
          Sin items todavía. Agrega al menos 1.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {value.map((item) => (
            <div
              key={item.clientId}
              style={{
                padding: 12,
                border: "1px solid #e5e5e5",
                borderRadius: 10,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 140px 44px", gap: 8 }}>
                <select
                  value={item.type}
                  onChange={(e) => updateItem(item.clientId, { type: e.target.value })}
                  disabled={disabled}
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <input
                  value={item.name}
                  placeholder="Nombre (ej: Arriendo Depto 1203)"
                  onChange={(e) => updateItem(item.clientId, { name: e.target.value })}
                  disabled={disabled}
                />

                <input
                  value={item.amount}
                  placeholder="Monto (CLP)"
                  inputMode="numeric"
                  onChange={(e) =>
                    updateItem(item.clientId, {
                      amount: e.target.value.replace(/[^\d]/g, ""),
                    })
                  }
                  disabled={disabled}
                />

                <button
                  type="button"
                  onClick={() => removeItem(item.clientId)}
                  disabled={disabled}
                  title="Eliminar"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <strong>Total items: {total.toLocaleString("es-CL")} CLP</strong>
      </div>
    </div>
  );
}
