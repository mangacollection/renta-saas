import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>404</h2>
      <p>Página no encontrada</p>
      <Link to="/">Volver</Link>
    </div>
  );
}