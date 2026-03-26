export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 28,
        borderRadius: 22,
        border: "1px dashed #dbe3ee",
        background: "#ffffff",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>

      {description && (
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          {description}
        </div>
      )}

      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}