import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ThanksPage() {
  const navigate = useNavigate();
  const totalMs = 5000;
  const tickMs = 50;
  const [remainingMs, setRemainingMs] = useState(totalMs);

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      navigate("/", { replace: true });
    }, totalMs);

    const progressTimer = window.setInterval(() => {
      setRemainingMs((current) => Math.max(0, current - tickMs));
    }, tickMs);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(progressTimer);
    };
  }, [navigate]);

  const progress = useMemo(() => {
    return Math.max(0, Math.min(100, ((totalMs - remainingMs) / totalMs) * 100));
  }, [remainingMs]);

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
          padding: "40px 20px 80px",
        }}
      >
        <div
          style={{
            maxWidth: 620,
            margin: "56px auto 0",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #d1fadf",
              borderRadius: 999,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              color: "#027a48",
              background: "#ecfdf3",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#12b76a",
                display: "inline-block",
              }}
            />
            Solicitud recibida
          </div>

          <div
            style={{
              marginTop: 28,
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "rgba(109, 94, 252, 0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6d5efc",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 7vw, 3.5rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.045em",
              fontWeight: 600,
              margin: "22px 0 0",
              maxWidth: 560,
            }}
          >
            Tu solicitud fue recibida.
          </h1>

          <p
            style={{
              marginTop: 18,
              marginBottom: 0,
              fontSize: 18,
              color: "#667085",
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            Estamos revisando tu solicitud. Te contactaremos por WhatsApp para mostrarte RentaControl y ayudarte a comenzar.
          </p>

          <div
            style={{
              marginTop: 28,
              maxWidth: 420,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 999,
                background: "#eef2ff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #6d5efc, #8b7fff)",
                  transition: "width 50ms linear",
                }}
              />
            </div>

            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                fontSize: 14,
                color: "#98a2b3",
                lineHeight: 1.6,
              }}
            >
              Serás redirigido al inicio en unos segundos.
            </p>
          </div>

          <div
            style={{
              marginTop: 30,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/"
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
              Volver al inicio
            </Link>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              style={{
                border: "1px solid #e4e7ec",
                background: "#ffffff",
                color: "#344054",
                padding: "14px 18px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Ir ahora
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}