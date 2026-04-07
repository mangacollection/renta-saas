import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { appRoute } from "@/lib/routes";

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
        }}
      >
        {title}
      </div>

      {subtitle && (
        <div style={{ fontSize: 13, color: "#64748b" }}>{subtitle}</div>
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
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontWeight: 700,
              color: danger ? "#991b1b" : "#0f172a",
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div style={{ color: "#94a3b8" }}>›</div>
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
        onClick: () => navigate(appRoute("subscriptions/new")),
        section: "quick",
        kind: "action",
      },
      {
        title: "Mi cuenta",
        subtitle: "Plan y datos",
        icon: "👤",
        onClick: () => navigate(appRoute("account")),
        section: "quick",
        kind: "action",
      },
      {
        title: "Remitentes bancarios",
        subtitle: "Correos asociados a contratistas",
        icon: "💳",
        onClick: () => navigate(appRoute("tenant-payment-senders")),
        section: "config",
        kind: "row",
      },
      {
        title: "Notificaciones",
        subtitle: "Avisos y preferencias",
        icon: "🔔",
        onClick: () => navigate(appRoute("notifications")),
        section: "config",
        kind: "row",
      },
      {
        title: "Ayuda",
        subtitle: "Centro de ayuda y soporte",
        icon: "❓",
        onClick: () => navigate(appRoute("help")),
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
    const q = search.toLowerCase();
    if (!q) return entries;

    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.subtitle?.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const quick = filteredEntries.filter((e) => e.section === "quick");
  const config = filteredEntries.filter((e) => e.section === "config");
  const session = filteredEntries.filter((e) => e.section === "session");

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 12 }}>
      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} />
      </div>

      {quick.length > 0 && (
        <>
          <SectionTitle>Accesos rápidos</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {quick.map((e) => (
              <ActionCard key={e.title} {...e} />
            ))}
          </div>
        </>
      )}

      {config.length > 0 && (
        <>
          <SectionTitle>Configuración</SectionTitle>
          <div style={{ display: "grid", gap: 10 }}>
            {config.map((e) => (
              <MenuRow key={e.title} {...e} />
            ))}
          </div>
        </>
      )}

      {session.length > 0 && (
        <>
          <SectionTitle>Sesión</SectionTitle>
          <div style={{ display: "grid", gap: 10 }}>
            {session.map((e) => (
              <MenuRow key={e.title} {...e} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}