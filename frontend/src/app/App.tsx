import { RouterProvider } from "react-router-dom";
import { router } from "./router";


export default function App() {
  return (
    <div style={{ minHeight: "100vh" }}>
     <header
  style={{
    background: "#ffffff",
    borderBottom: "1px solid #e6e8ef",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  }}
>
  <div
    style={{
      maxWidth: 1100, // mismo ancho que SubscriptionsPage
      margin: "0 auto",
      padding: "22px 24px",
    }}
  >
    <div style={{ display: "grid", lineHeight: 1.1 }}>
      <span
        style={{
          color: "#0f172a",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: "-0.02em",
        }}
      >
        Renta Control
      </span>
      <span style={{ color: "#64748b", fontSize: 13 }}>
        Gestión simple de arriendos
      </span>
    </div>
  </div>
</header>

      <RouterProvider router={router} />
    </div>
  );
}