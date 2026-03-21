PRD Deploy — RentaControl

Doc version: v1.2
Última actualización: 2026-03-21
Estado: operativo productivo con CI/CD activo

Objetivo

Documentar el proceso de despliegue y validación de producción.

1. Backend PRD
Plataforma
Cloud Run
Requisitos previos
build backend sin errores
variables PRD configuradas
migraciones Prisma disponibles
imagen Docker publicada en Artifact Registry
secrets configurados en GitHub Actions
Service Account GCP activa
Variables backend mínimas
DATABASE_URL
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
Variables tenant Gmail
TENANT_GMAIL_CLIENT_ID
TENANT_GMAIL_CLIENT_SECRET
TENANT_GMAIL_REFRESH_TOKEN
TENANT_GMAIL_TARGET_ALIAS
Validaciones backend
GET /tenant-payments
POST /tenant-payments/from-bank-email
POST /integrations/gmail/webhook
2. Frontend PRD
Plataforma
Cloudflare Pages
Variables frontend
VITE_API_BASE_URL
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_AUTH_DOMAIN
Validaciones frontend
login
vista de pagos
invoices visibles
llamadas correctas a api.rentacontrol.cl
3. Base de datos
PRD
Cloud SQL PostgreSQL
Tablas clave
Tenant
TenantPayment
PaymentSender
GmailWebhookJob
GmailProcessedMessage
GmailCursor
Invoice
Subscription
4. Flujo objetivo PRD

transferencia bancaria
↓
correo banco
↓
alias tenant
↓
gmail webhook
↓
worker procesa
↓
TenantPayment creado
↓
invoice conciliada
↓
UI refleja pago

5. Riesgos actuales conocidos
Worker usa cron en Cloud Run (no garantizado)
Evaluar migración a Cloud Scheduler
accountId temporalmente hardcodeado en worker
Dependencia de Gmail API latencia
6. Cambios recientes PRD
CI/CD Backend

Problema:

despliegue manual
riesgo de errores

Solución:

GitHub Actions implementado
deploy automático en push a main
Corrección Prisma

Problema:

prisma migrate deploy se ejecutaba en Docker build
fallas en CI/CD

Solución:

eliminado de Dockerfile
eliminado de runtime (main.ts)
migraciones pasan a ejecución externa
GmailCursor Fix

Problema:

expiration no existía en PRD
Prisma schema ≠ DB real

Solución:

Se ejecutó ALTER TABLE manual en PRD
se eliminó migración runtime en main.ts
ALTER TABLE "GmailCursor" ADD COLUMN "expiration" TEXT;