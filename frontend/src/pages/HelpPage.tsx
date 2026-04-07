import { useNavigate } from "react-router-dom";

function HelpItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #eef2f7",
        background: "#ffffff",
        borderRadius: 20,
        padding: 16,
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: 8,
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <section
        style={{
          padding: 18,
          borderRadius: 24,
          background: "#ffffff",
          border: "1px solid #eef2f7",
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.03em",
          }}
        >
          Ayuda
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          Encuentra respuestas rápidas y soporte para usar la plataforma.
        </div>
      </section>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <HelpItem
          title="Crear un contrato"
          description="Ve a 'Nuevo contrato' y completa los datos básicos del arriendo."
        />

        <HelpItem
          title="Ver facturas"
          description="Puedes revisar todas las facturas desde la sección de facturación."
        />

        <HelpItem
          title="Pagos de inquilinos"
          description="Los pagos se registran automáticamente desde correos bancarios."
        />
      </div>

      <button
        type="button"
        onClick={() => navigate("app/menu")}
        style={{
          marginTop: 18,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          color: "#334155",
          borderRadius: 16,
          padding: "12px 14px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        }}
      >
        Volver al menú
      </button>
    </div>
  );
}
