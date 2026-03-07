export function LoadingScreen({ label = "Cargando..." }: { label?: string }) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p>{label}</p>
    </div>
  );
}