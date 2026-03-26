import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: 12,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar en menú"
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
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid #eef2f7",
        background: "#ffffff",
        borderRadius: 20,
        padding: 16,
        display: "grid",
        gap: 8,
        textAlign: "left",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: "rgba(109,94,252,0.10)",
          color: "#6d5efc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>

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

      {subtitle && (
        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </div>
      )}
    </button>
  );
}

function MenuRow({
  title,
  subtitle,
  icon,
  onClick,
  danger,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        border: "1px solid #eef2f7",
        background: "#ffffff",
        borderRadius: 18,
        padding: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: danger ? "#fff1f2" : "#f8fafc",
            color: danger ? "#991b1b" : "#6d5efc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: danger ? "#991b1b" : "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                color: "#64748b",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: 20,
          color: "#94a3b8",
          flexShrink: 0,
        }}
      >
        ›
      </div>
    </button>
  );
}

type MenuEntry = {
  title: string;
  subtitle?: string;
  icon: string;
  onClick: () => void;
  section: "quick" | "config" | "session";
  danger?: boolean;
  kind: "action" | "row";
};

export default function MenuPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [search, setSearch] = useState("");

  const entries = useMemo<MenuEntry[]>(
    () => [
      {
        title: "Nuevo contrato",
        subtitle: "Crear un arriendo",
        icon: "＋",
        onClick: () => navigate("/subscriptions/new"),
        section: "quick",
        kind: "action",
      },
      {
        title: "Mi cuenta",
        subtitle: "Plan y datos",
        icon: "👤",
        onClick: () => navigate("/account"),
        section: "quick",
        kind: "action",
      },
      {
        title: "Remitentes bancarios",
        subtitle: "Correos asociados a contratistas",
        icon: "💳",
        onClick: () => navigate("/tenant-payment-senders"),
        section: "config",
        kind: "row",
      },
      {
        title: "Notificaciones",
        subtitle: "Avisos y preferencias",
        icon: "🔔",
        onClick: () => navigate("/notifications"),
        section: "config",
        kind: "row",
      },
      {
        title: "Ayuda",
        subtitle: "Centro de ayuda y soporte",
        icon: "❓",
        onClick: () => navigate("/help"),
        section: "config",
        kind: "row",
      },
      {
        title: "Cerrar sesión",
        subtitle: "Salir de tu cuenta actual",
        icon: "↪",
        onClick: () => {
          void logout();
        },
        section: "session",
        kind: "row",
        danger: true,
      },
    ],
    [navigate, logout]
  );

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;

    return entries.filter((entry) => {
      const title = entry.title.toLowerCase();
      const subtitle = entry.subtitle?.toLowerCase() ?? "";
      return title.includes(q) || subtitle.includes(q);
    });
  }, [entries, search]);

  const quickEntries = filteredEntries.filter((e) => e.section === "quick");
  const configEntries = filteredEntries.filter((e) => e.section === "config");
  const sessionEntries = filteredEntries.filter((e) => e.section === "session");

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
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          Accesos rápidos, configuración y opciones de la cuenta.
        </div>

        <SearchInput value={search} onChange={setSearch} />
      </section>

      {quickEntries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SectionTitle>Accesos rápidos</SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {quickEntries.map((entry) => (
              <ActionCard
                key={entry.title}
                title={entry.title}
                subtitle={entry.subtitle}
                icon={entry.icon}
                onClick={entry.onClick}
              />
            ))}
          </div>
        </div>
      )}

      {configEntries.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SectionTitle>Configuración</SectionTitle>

          <div style={{ display: "grid", gap: 10 }}>
            {configEntries.map((entry) => (
              <MenuRow
                key={entry.title}
                title={entry.title}
                subtitle={entry.subtitle}
                icon={entry.icon}
                onClick={entry.onClick}
                danger={entry.danger}
              />
            ))}
          </div>
        </div>
      )}

      {sessionEntries.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SectionTitle>Sesión</SectionTitle>

          <div style={{ display: "grid", gap: 10 }}>
            {sessionEntries.map((entry) => (
              <MenuRow
                key={entry.title}
                title={entry.title}
                subtitle={entry.subtitle}
                icon={entry.icon}
                onClick={entry.onClick}
                danger={entry.danger}
              />
            ))}
          </div>
        </div>
      )}

      {filteredEntries.length === 0 && (
        <div
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 20,
            background: "#ffffff",
            border: "1px dashed #dbe3ee",
            color: "#64748b",
            boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
          }}
        >
          No encontramos opciones con esa búsqueda.
        </div>
      )}
    </div>
  );
}