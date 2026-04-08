import { useState, useRef, useEffect } from "react";
import { createPublicLead } from "@/features/public/public.api";
import { env } from "@/config/env";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [properties, setProperties] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    function renderWidget() {
      if (!window.turnstile || !turnstileRef.current) return;
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: env.turnstileSiteKey,
        theme: "light",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
      });
    }

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = renderWidget;
    document.body.appendChild(script);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!turnstileToken) {
      setError("Verifica que eres humano.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await createPublicLead({
        name: "waitlist",
        email,
        phone,
        properties: properties ? Number(properties) : undefined,
        turnstileToken,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError("No pudimos procesar tu solicitud.");
      }
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(109, 94, 252, 0.12), transparent 30%), radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.08), transparent 34%), linear-gradient(180deg, #fcfcff 0%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            RentaControl
          </div>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Lista de espera
          </h1>

          <p
            style={{
              marginTop: 10,
              color: "#667085",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Te avisaremos cuando abramos nuevos cupos.
          </p>
        </div>

        {success ? (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#eefcf3",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontWeight: 600,
            }}
          >
            ✅ Te avisaremos pronto.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #e4e7ec",
                fontSize: 15,
              }}
            />

            {/* PHONE */}
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Teléfono
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #e4e7ec",
                fontSize: 15,
              }}
            />

            {/* PROPERTIES */}
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Cantidad de propiedades
            </label>
            <input
              value={properties}
              onChange={(e) => setProperties(e.target.value)}
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #e4e7ec",
                fontSize: 15,
              }}
            />

            {/* CAPTCHA */}
            <div ref={turnstileRef} style={{ marginBottom: 16 }} />

            {error && (
              <div
                style={{
                  marginBottom: 12,
                  color: "#b42318",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

                <button
                type="submit"
                disabled={loading}
                style={{
                    width: "100%",
                    padding: 14,
                    background: "linear-gradient(135deg, #6d5efc, #4f46e5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: "0 14px 28px rgba(109, 94, 252, 0.24)",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    if (loading) return;
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                    "0 18px 32px rgba(109, 94, 252, 0.35)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                    "0 14px 28px rgba(109, 94, 252, 0.24)";
                }}
                >
                {loading ? "Enviando..." : "Unirme a la lista"}
                </button>
          </form>
        )}
      </div>
    </main>
  );
}