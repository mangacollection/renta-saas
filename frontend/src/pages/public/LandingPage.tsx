import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function LoginIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M10 17L15 12L10 7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M14 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M14.5 9.5C14.5 11.9853 12.4853 14 10 14C7.51472 14 5.5 11.9853 5.5 9.5C5.5 7.01472 7.51472 5 10 5C12.4853 5 14.5 7.01472 14.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M13 13L19 19"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M17 17L18.5 15.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M18.5 18.5L20 17"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 14,
          color: "#667085",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          color: "#111827",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Benefit({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#111827",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 15,
          color: "#667085",
          lineHeight: 1.7,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function MobileDock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        zIndex: 60,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        opacity: visible ? 1 : 0,
        transition: "transform 280ms ease, opacity 280ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: 8,
          borderRadius: 20,
          background: "rgba(255,255,255,0.86)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(230,232,239,0.95)",
          boxShadow: "0 14px 40px rgba(15,23,42,0.14)",
        }}
      >
        <Link
          to="/login"
          style={{
            flex: 1,
            minWidth: 0,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "13px 14px",
            borderRadius: 14,
            border: "1px solid #e6e8ef",
            background: "rgba(255,255,255,0.92)",
            color: "#344054",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <LoginIcon />
          Ingresar
        </Link>

        <Link
          to="/signup"
          style={{
            flex: 1.15,
            minWidth: 0,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "13px 14px",
            borderRadius: 14,
            background: "linear-gradient(90deg, #6d5efc, #8b7fff)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 10px 24px rgba(109,94,252,0.30)",
          }}
        >
          <KeyIcon />
          Solicitar acceso
        </Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 85% 0%, rgba(109, 94, 252, 0.18), transparent 34%), #ffffff",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: isMobile ? "24px 20px 120px" : "24px 20px 88px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.03em",
              color: "#111827",
            }}
          >
            RentaControl
          </div>

          {!isMobile && (
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
          )}
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
          Beta privada · cupos limitados
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 9vw, 4.2rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.055em",
            fontWeight: 700,
            margin: "22px 0 0",
            maxWidth: 680,
          }}
        >
          Administra tus arriendos{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #6d5efc, #8b7fff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            sin estrés
          </span>
        </h1>

        <p
          style={{
            marginTop: 22,
            marginBottom: 0,
            fontSize: 18,
            color: "#667085",
            lineHeight: 1.7,
            maxWidth: 560,
          }}
        >
          Contratos, pagos y recordatorios en un solo flujo simple. Diseñado para dueños que quieren ordenar su operación.
        </p>

        {!isMobile && (
          <>
            <div
              style={{
                marginTop: 30,
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link
                to="/signup"
                style={{
                  textDecoration: "none",
                  background: "#6d5efc",
                  color: "#ffffff",
                  padding: "16px 22px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 14px 34px rgba(109, 94, 252, 0.22)",
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
                  fontSize: 14,
                  opacity: 0.85,
                }}
              >
                Ya tengo cuenta
              </Link>
            </div>

            <p
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "#98a2b3",
                lineHeight: 1.6,
              }}
            >
              Ya estamos ayudando a owners a ordenar sus arriendos.
            </p>
          </>
        )}

        <div
          style={{
            marginTop: 34,
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid #e6e8ef",
            background: "#ffffff",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #eef2f7",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fcfcfe",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#f97066",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#fdb022",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#32d583",
                display: "inline-block",
              }}
            />
          </div>

          <div
            style={{
              padding: 18,
              display: "grid",
              gap: 16,
              background:
                "linear-gradient(180deg, rgba(109,94,252,0.03) 0%, rgba(255,255,255,1) 34%)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid #eef2f7",
                  borderRadius: 16,
                  padding: 14,
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#98a2b3",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Contratos activos
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "#111827",
                  }}
                >
                  12
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #eef2f7",
                  borderRadius: 16,
                  padding: 14,
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#98a2b3",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Cobro del mes
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "#111827",
                  }}
                >
                  $1.280.000
                </div>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #eef2f7",
                borderRadius: 18,
                padding: 16,
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    Contrato · Depto Centro 302
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: "#667085",
                    }}
                  >
                    Arrendatario: María González
                  </div>
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(109, 94, 252, 0.10)",
                    color: "#5648f3",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Activo
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                }}
              >
                <PreviewRow label="Arriendo" value="$650.000" />
                <PreviewRow label="Gastos comunes" value="$95.000" />
                <PreviewRow label="Próximo vencimiento" value="05 de mayo" />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 28,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#111827",
            }}
          >
            $6.990
            <span
              style={{
                fontSize: 16,
                color: "#667085",
                marginLeft: 8,
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
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            Plan Early Adopter para probar RentaControl antes del lanzamiento general.
          </p>
        </div>

        <div
          style={{
            marginTop: 34,
            display: "grid",
            gap: 16,
          }}
        >
          <Benefit
            title="Contratos simples"
            text="Centraliza la información y evita depender de planillas sueltas."
          />
          <Benefit
            title="Facturación automática"
            text="Ordena tus cobros mensuales en un flujo más claro."
          />
          <Benefit
            title="Recordatorios de pago"
            text="Haz seguimiento sin improvisar cada mes."
          />
        </div>
      </section>

      {isMobile && <MobileDock />}
    </main>
  );
}