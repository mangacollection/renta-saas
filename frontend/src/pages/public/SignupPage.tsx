import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { createPublicLead } from "@/features/public/public.api";
import { env } from "@/config/env";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  rut: string;
  properties: string;
  message: string;
  company: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  rut: "",
  properties: "",
  message: "",
  company: "",
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          appearance?: "always" | "execute" | "interaction-only";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

function formatChileanPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  let normalized = digits;

  if (normalized.startsWith("56")) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }

  normalized = normalized.slice(0, 9);

  if (!normalized) return "";

  let result = "+56";

  if (normalized.length > 0) {
    result += ` ${normalized.slice(0, 1)}`;
  }
  if (normalized.length > 1) {
    result += ` ${normalized.slice(1, 5)}`;
  }
  if (normalized.length > 5) {
    result += ` ${normalized.slice(5, 9)}`;
  }

  return result;
}

function phoneToBackend(value: string) {
  const digits = value.replace(/\D/g, "");

  let normalized = digits;

  if (normalized.startsWith("56")) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }

  normalized = normalized.slice(0, 9);

  if (!normalized) return "";

  return `+56${normalized}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidChileanPhone(phone: string) {
  const normalized = phoneToBackend(phone);
  return /^\+569\d{8}$/.test(normalized);
}

function cleanRut(rut: string) {
  return rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
}

function formatRut(value: string) {
  const cleaned = cleanRut(value).replace(/[^0-9K]/gi, "");
  if (!cleaned) return "";

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let formattedBody = "";
  let count = 0;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    formattedBody = body[i] + formattedBody;
    count += 1;

    if (count === 3 && i !== 0) {
      formattedBody = "." + formattedBody;
      count = 0;
    }
  }

  return body ? `${formattedBody}-${dv}` : dv;
}

function isValidRut(rut: string) {
  const cleaned = cleanRut(rut);
  if (!/^\d+[0-9K]$/.test(cleaned)) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected =
    remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);

  return dv === expected;
}

export default function SignupPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const totalFields = 5; // name, email, phone, rut, properties

  const completedFields = [
    values.name,
    values.email,
    values.phone,
    values.rut,
    values.properties,
  ].filter((v) => v && v.trim() !== "").length;

const progress = (completedFields / totalFields) * 100;

  useEffect(() => {
    function renderWidget() {
      if (!window.turnstile || !turnstileContainerRef.current) return;
      if (turnstileWidgetIdRef.current) return;

      turnstileWidgetIdRef.current = window.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: env.turnstileSiteKey,
          theme: "light",
          callback: (token: string) => {
            setTurnstileToken(token);
            setSubmitError("");
          },
          "expired-callback": () => {
            setTurnstileToken(null);
          },
          "error-callback": () => {
            setTurnstileToken(null);
          },
        },
      );
    }

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", renderWidget);
      return () => {
        existingScript.removeEventListener("load", renderWidget);
      };
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", renderWidget);
    };
  }, []);

  function resetTurnstile() {
    if (window.turnstile && turnstileWidgetIdRef.current) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
    setTurnstileToken(null);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phone") {
      nextValue = formatChileanPhone(value);
    }

    if (name === "rut") {
      nextValue = formatRut(value);
    }

    if (name === "properties") {
      nextValue = value.replace(/[^\d]/g, "");
    }

    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitError("");
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Ingresa tu nombre.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Ingresa tu email.";
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = "Ingresa un email válido.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Ingresa tu teléfono.";
    } else if (!isValidChileanPhone(values.phone)) {
      nextErrors.phone = "Ingresa un teléfono chileno válido.";
    }

    if (values.rut.trim() && !isValidRut(values.rut)) {
      nextErrors.rut = "Ingresa un RUT válido.";
    }

    if (values.properties.trim()) {
      const parsed = Number(values.properties);
      if (!Number.isInteger(parsed) || parsed < 0) {
        nextErrors.properties = "Ingresa un número de propiedades válido.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (values.company && values.company.trim() !== "") {
      return;
    }

    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) return;

    if (!turnstileToken) {
      setSubmitError("Verifica que eres humano antes de enviar tu solicitud.");
      return;
    }

    setLoading(true);

    try {
      const result = await createPublicLead({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: phoneToBackend(values.phone),
        rut: values.rut.trim() ? formatRut(values.rut) : undefined,
        properties:
          values.properties.trim() === "" ? undefined : Number(values.properties),
        message: values.message.trim() || undefined,
        company: values.company,
        turnstileToken,
      });

      if (result.success) {
        setValues(initialValues);
        setErrors({});
        resetTurnstile();
        navigate("/gracias");
        return;
      }

      setSubmitError("No pudimos procesar tu solicitud. Intenta nuevamente.");
      resetTurnstile();
    } catch (error) {
      resetTurnstile();

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const backendMessage =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "";

        if (status === 409) {
          setSuccessMessage(
            "Ya teníamos registrada una solicitud con este correo. Te contactaremos pronto.",
          );
          return;
        }

        if ((status === 400 || status === 429) && backendMessage) {
          setSubmitError(backendMessage);
          return;
        }
      }

      setSubmitError(
        "No pudimos enviar tu solicitud. Intenta nuevamente en unos minutos.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(109, 94, 252, 0.14), transparent 30%), radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.08), transparent 34%), linear-gradient(180deg, #fcfcff 0%, #ffffff 100%)",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "24px 20px 72px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "linear-gradient(135deg, #6d5efc, #4f46e5)",
                boxShadow: "0 0 0 6px rgba(109, 94, 252, 0.12)",
              }}
            />

            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
                color: "#111827",
              }}
            >
              RentaControl
            </div>
          </div>

          <Link
            to="/"
            style={{
              textDecoration: "none",
              fontSize: 14,
              color: "#475467",
              fontWeight: 600,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #eaecf0",
              background: "rgba(255,255,255,0.9)",
            }}
          >
            Volver
          </Link>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 26,
          }}
        >
          <div
            style={{
              maxWidth: 640,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid rgba(109, 94, 252, 0.16)",
                borderRadius: 999,
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 700,
                color: "#5648f3",
                background: "rgba(255,255,255,0.85)",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
              }}
            >
              Solicitar acceso Beta
            </div>

            <h1
              style={{
                fontSize: "clamp(2.25rem, 7vw, 3.7rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
                fontWeight: 800,
                margin: "20px 0 0",
                maxWidth: 620,
              }}
            >
              Déjanos tus datos y te contactamos.
            </h1>

            <p
              style={{
                marginTop: 18,
                marginBottom: 0,
                fontSize: 18,
                color: "#667085",
                lineHeight: 1.75,
                maxWidth: 600,
              }}
            >
              Te escribiremos por WhatsApp para mostrarte RentaControl,
              entender tu operación y ayudarte a comenzar con la Beta de forma
              simple y acompañada.
            </p>
          </div>

          <div
            style={{
              maxWidth: 680,
              background: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              borderRadius: 28,
              padding: "24px 20px",
              boxShadow: "0 24px 64px rgba(15, 23, 42, 0.10)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div
              style={{
                marginBottom: 22,
              }}
            >
              <div
              style={{
                height: 4,
                width: "100%",
                background: "rgba(109, 94, 252, 0.08)",
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #6d5efc, #4f46e5)",
                  borderRadius: 999,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#111827",
                }}
              >
                Solicita tu acceso
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  color: "#667085",
                  lineHeight: 1.7,
                }}
              >
                Respuesta breve, contacto humano y acompañamiento inicial.
              </div>
            </div>

            {successMessage ? (
              <div
                style={{
                  marginBottom: 20,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: "#eefcf3",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  fontWeight: 600,
                  lineHeight: 1.6,
                  fontSize: 14,
                }}
              >
                {successMessage}
              </div>
            ) : null}

            {submitError ? (
              <div
                style={{
                  marginBottom: 20,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontWeight: 600,
                  lineHeight: 1.6,
                  fontSize: 14,
                }}
              >
                {submitError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                name="company"
                value={values.company}
                onChange={handleChange}
                style={{ display: "none" }}
                autoComplete="off"
                tabIndex={-1}
              />

              <div
                style={{
                  display: "grid",
                  gap: 18,
                }}
              >
                <Field
                  label="Nombre completo"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  error={errors.name}
                  disabled={loading}
                />

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={loading}
                  
                />

                <Field
                  label="WhatsApp / teléfono"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  disabled={loading}
                  
                />

                <Field
                  label="RUT"
                  name="rut"
                  value={values.rut}
                  onChange={handleChange}
                  error={errors.rut}
                  disabled={loading}
                 
                />

                <Field
                  label="Número de propiedades"
                  name="properties"
                  type="text"
                  value={values.properties}
                  onChange={handleChange}
                  error={errors.properties}
                  disabled={loading}
                  inputMode="numeric"
                  
                />

                <div>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#111827",
                    }}
                  >
                    Mensaje
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    disabled={loading}
                    rows={4}
                    placeholder="¿Algo que desees comentar?."
                    style={{
                      width: "100%",
                      border: "1px solid #e4e7ec",
                      borderRadius: 16,
                      padding: "14px 14px",
                      fontSize: 15,
                      color: "#111827",
                      background: "#ffffff",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 14,
                    padding: 16,
                    borderRadius: 20,
                    background:
                      "linear-gradient(180deg, rgba(248,250,252,0.9), rgba(255,255,255,0.95))",
                    border: "1px solid rgba(109, 94, 252, 0.10)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#475467",
                    }}
                  >
                    Verificación de seguridad
                  </div>

                  <div ref={turnstileContainerRef} style={{ minHeight: 65 }} />

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: "none",
                    background: "linear-gradient(135deg, #6d5efc, #4f46e5)",
                    color: "#ffffff",
                    padding: "15px 18px",
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: "0 14px 28px rgba(109, 94, 252, 0.24)",
                    width: "100%",
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
                  {loading ? "Enviando..." : "Solicitar acceso"}
                </button>

                  <div
                    style={{
                      color: "#667085",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    Te contactaremos por WhatsApp para mostrarte el producto y
                    ayudarte a partir rápido.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  type = "text",
  inputMode,
  placeholder,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 700,
          fontSize: 14,
          color: "#111827",
        }}
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputMode={inputMode}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: `1px solid ${error ? "#f97066" : "#e4e7ec"}`,
          borderRadius: 14,
          padding: "14px 14px",
          fontSize: 15,
          color: "#111827",
          background: "#ffffff",
          outline: "none",
          boxSizing: "border-box",
          transition: "all 0.2s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = "1px solid #6d5efc";
          e.currentTarget.style.boxShadow =
            "0 0 0 4px rgba(109, 94, 252, 0.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = error
            ? "1px solid #f97066"
            : "1px solid #e4e7ec";
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      {error ? (
        <div
          style={{
            marginTop: 8,
            color: "#b42318",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}