import { Link } from "react-router-dom";

export default function HomeInvitePage() {
  return (
    <main
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "#000",
        color: "#fff",
      }}
    >
      {/* 🎬 VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.65,
        }}
      >
        <source src="/video/rentacontrol-hero.mp4" type="video/mp4" />
      </video>

      {/* 🌑 OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 100%)",
          zIndex: 1,
        }}
      />

      {/* 🧠 CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
        }}
      >
        {/* Logo / Nombre */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 20,
            opacity: 0.9,
          }}
        >
          RentaControl
        </div>

        {/* Título */}
        <h1
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            margin: 0,
            maxWidth: 780,
          }}
        >
          Administra múltiples propiedades{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #6d5efc, #8b7fff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            sin perder el control
          </span>
        </h1>

        {/* Subtexto */}
        <p
          style={{
            marginTop: 20,
            fontSize: 18,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          Acceso actualmente por invitación.  
          Estamos incorporando nuevos usuarios de forma gradual.
        </p>

        {/* CTA */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            alignItems: "center",
          }}
        >
          <Link
            to="/waitlist"
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #6d5efc, #4f46e5)",
              color: "#fff",
              padding: "16px 26px",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 18px 40px rgba(109,94,252,0.35)",
            }}
          >
            Unirme a la lista de espera
          </Link>

            <Link
              to="/login"
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Ya tengo acceso →
            </Link>
        </div>
      </div>
    </main>
  );
}