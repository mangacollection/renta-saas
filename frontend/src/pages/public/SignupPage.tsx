import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { createPublicLead } from "@/features/public/public.api";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  rut: string;
  properties: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  rut: "",
  properties: "",
  message: "",
};

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
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

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

    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) return;

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
      });

      if (result.success) {
        setValues(initialValues);
        setErrors({});
        navigate("/gracias");
        return;
      }

      setSubmitError("No pudimos procesar tu solicitud. Intenta nuevamente.");
    } catch (error) {
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

        if (status === 400 && backendMessage) {
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
            marginBottom: 56,
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
            to="/"
            style={{
              textDecoration: "none",
              fontSize: 14,
              color: "#667085",
              fontWeight: 500,
            }}
          >
            Volver
          </Link>
        </header>

        <div
          style={{
            maxWidth: 620,
          }}
        >
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
            Solicitar acceso Beta
          </div>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 7vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontWeight: 600,
              margin: "20px 0 0",
              maxWidth: 560,
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
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            Te escribiremos por WhatsApp para mostrarte RentaControl y ayudarte a comenzar con la Beta.
          </p>
        </div>

        <div
          style={{
            marginTop: 40,
            maxWidth: 620,
            paddingTop: 28,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {successMessage ? (
            <div
              style={{
                marginBottom: 24,
                padding: "14px 16px",
                borderRadius: 12,
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
                marginBottom: 24,
                padding: "14px 16px",
                borderRadius: 12,
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
            <div
              style={{
                display: "grid",
                gap: 22,
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
                    fontWeight: 600,
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
                  style={{
                    width: "100%",
                    border: "1px solid #e4e7ec",
                    borderRadius: 10,
                    padding: "14px 14px",
                    fontSize: 15,
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  alignItems: "center",
                  paddingTop: 6,
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: "none",
                    background: "#6d5efc",
                    color: "#ffffff",
                    padding: "14px 18px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
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
                  Respuesta breve y contacto por WhatsApp.
                </div>
              </div>
            </div>
          </form>
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
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
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
        style={{
          width: "100%",
          border: `1px solid ${error ? "#f97066" : "#e4e7ec"}`,
          borderRadius: 10,
          padding: "14px 14px",
          fontSize: 15,
          color: "#111827",
          background: "#ffffff",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {error ? (
        <div
          style={{
            marginTop: 8,
            color: "#b42318",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}