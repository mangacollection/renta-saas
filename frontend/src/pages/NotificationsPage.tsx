import { useNavigate } from "react-router-dom";
import { appRoute } from "@/lib/routes";

function InfoCard({
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

export default function NotificationsPage() {
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
          Notificaciones
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          Aquí podrás revisar avisos importantes y, más adelante, configurar tus
          preferencias de notificación.
        </div>
      </section>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <InfoCard
          title="Próximamente"
          description="Esta sección mostrará recordatorios, novedades del sistema y alertas relevantes para tu cuenta."
        />

        <InfoCard
          title="Estado actual"
          description="Todavía no hay configuraciones disponibles en esta pantalla, pero la navegación ya queda lista y funcional."
        />
      </div>

      <button
        type="button"
        onClick={() => navigate(appRoute("menu"))}
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
