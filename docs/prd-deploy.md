# PRD Deploy — RentaControl

**Doc version:** v1.0  
**Última actualización:** 2026-03-12  
**Estado:** operativo parcial

## Objetivo
Documentar el proceso de despliegue y validación de producción.

---

## 1. Backend PRD

### Plataforma
- Cloud Run

### Requisitos previos
- build backend sin errores
- variables PRD configuradas
- migraciones Prisma listas
- imagen Docker publicada en Artifact Registry

### Variables backend mínimas
- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Variables tenant Gmail
- `TENANT_GMAIL_CLIENT_ID`
- `TENANT_GMAIL_CLIENT_SECRET`
- `TENANT_GMAIL_REFRESH_TOKEN`
- `TENANT_GMAIL_TARGET_ALIAS`

### Validaciones backend
- `GET /tenant-payments`
- `POST /tenant-payments/from-bank-email`
- `POST /integrations/gmail/webhook`

---

## 2. Frontend PRD

### Plataforma
- Cloudflare Pages

### Variables frontend
- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_AUTH_DOMAIN`

### Validaciones frontend
- login
- vista de pagos
- invoices visibles
- llamadas correctas a `api.rentacontrol.cl`

---

## 3. Base de datos

### PRD
- Cloud SQL PostgreSQL

### Tablas clave
- `Tenant`
- `TenantPayment`
- `TenantPaymentSender`
- `GmailWebhookJob`
- `GmailProcessedMessage`
- `Invoice`
- `Subscription`

---

## 4. Flujo objetivo PRD

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

---

## 5. Riesgos actuales conocidos

- El worker usa `@Cron('*/30 * * * * *')`.
- En Cloud Run debe validarse si corre de manera confiable o si se mueve a Cloud Scheduler.
- Existe observación sobre posible `accountId` hardcodeado en worker, revisar antes de cierre definitivo de PRD.

---

## 6. Historial de cambios

### v1.0 — 2026-03-12
- Documento inicial de despliegue PRD.
