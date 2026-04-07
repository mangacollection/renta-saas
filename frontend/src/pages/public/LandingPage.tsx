import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(109, 94, 252, 0.10), transparent 28%), #ffffff",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "24px 20px 80px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 72,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: "-0.02em",
              color: "#111827",
            }}
          >
            RentaControl
          </div>

          <Link
            to="/login"
            style={{
              textDecoration: "none",
              fontSize: 14,
              color: "#667085",
              fontWeight: 500,
            }}
          >
            Ingresar
          </Link>
        </header>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid #e9eaf3",
            borderRadius: 999,
            padding: "8px 12px",
            fontSize: 13,
            fontWeight: 600,
            color: "#5648f3",
            background: "#ffffff",
          }}
        >
          Beta privada
        </div>

        <h1
          style={{
            fontSize: "clamp(2.4rem, 8vw, 4rem)",
            lineHeight: 1.03,
            letterSpacing: "-0.045em",
            fontWeight: 600,
            margin: "20px 0 0",
            maxWidth: 680,
          }}
        >
          Administra arriendos{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #6d5efc, #8b7cff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            sin estrés
          </span>
        </h1>

        <p
          style={{
            marginTop: 20,
            marginBottom: 0,
            fontSize: 18,
            color: "#667085",
            lineHeight: 1.7,
            maxWidth: 560,
          }}
        >
          Contratos, pagos y recordatorios en un flujo simple para dueños de activos inmobiliarios que
          buscan ordenar su operación.
        </p>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/signup"
            style={{
              textDecoration: "none",
              background: "#6d5efc",
              color: "#ffffff",
              padding: "14px 18px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Solicitar acceso
          </Link>

          <Link
            to="/login"
            style={{
              textDecoration: "none",
              color: "#667085",
              fontWeight: 500,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
            }}
          >
            Ya tengo cuenta
          </Link>
        </div>

        <div
          style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#111827",
            }}
          >
            $6.990
            <span
              style={{
                fontSize: 16,
                color: "#667085",
                marginLeft: 6,
                fontWeight: 500,
              }}
            >
              / mes
            </span>
          </div>

          <p
            style={{
              marginTop: 10,
              color: "#667085",
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            Plan Early Adopter para probar RentaControl antes del lanzamiento
            general.
          </p>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "grid",
            gap: 18,
          }}
        >
          {[
            "Contratos simples",
            "Facturación automática",
            "Recordatorios de pago",
            "Cobranza asistida",
          ].map((item) => (
            <div
              key={item}
              style={{
                fontSize: 16,
                color: "#111827",
                fontWeight: 500,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: "1px solid #f1f5f9",
            color: "#98a2b3",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Te contactaremos por WhatsApp para mostrarte el producto y ayudarte a
          comenzar.
        </div>
      </section>
    </main>
  );
}