# PRD Deploy — RentaControl

**Doc version:** v1.1  
**Última actualización:** 2026-03-19  
**Estado:** operativo (Gmail flow validado end-to-end)

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

⚠️ IMPORTANTE (nuevo)
- Las migraciones Prisma NO se están ejecutando automáticamente en PRD
- Cambios de esquema deben aplicarse manualmente en Cloud SQL o vía pipeline CI/CD (pendiente)

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

✅ NUEVO (validado en PRD)
- Webhook Gmail recibe eventos correctamente (HTTP 201)
- Worker procesa eventos desde Pub/Sub
- Gmail history API responde correctamente con cursor persistente
- Parsing de correos funcionando
- Flujo completo ejecutado

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
- `GmailCursor` ← NUEVO
- `Invoice`
- `Subscription`

⚠️ IMPORTANTE (nuevo)
- Las tablas `GmailProcessedMessage` y `GmailCursor` fueron creadas manualmente en PRD
- No fueron aplicadas mediante `prisma migrate`
- Esto genera riesgo de desalineación con el schema del repo

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

✅ VALIDADO END-TO-END EN PRD

---

## 5. Riesgos actuales conocidos

- El worker usa `@Cron('*/30 * * * * *')`
- En Cloud Run debe validarse si corre de manera confiable o si se mueve a Cloud Scheduler

- Existe observación sobre posible `accountId` hardcodeado en worker

- ⚠️ NUEVO: dependencia crítica de sincronización entre:
  - Gmail watch
  - GmailCursor en DB

- ⚠️ NUEVO: falta pipeline formal de migraciones Prisma

---

## 6. Historial de cambios

### v1.1 — 2026-03-19
- Se implementa GmailCursor persistente en DB
- Se elimina uso de `job.historyId` como cursor
- Se elimina filtro `historyTypes` en Gmail API
- Se corrige problema de `entries=0`
- Se valida flujo Gmail completo en PRD
- Se documenta problema de migraciones no aplicadas

### v1.0 — 2026-03-12
- Documento inicial de despliegue PRD

---

## 7. Errores encontrados en PRD y resolución

### ❌ Error 1 — PERMISSION_DENIED PubSub

**Error**
User not authorized to perform this action

**Causa**
- Cuenta incorrecta ejecutando OAuth (mezcla entre `rentacontrol.root` y `admin@rentacontrol.cl`)

**Solución**
- Usar siempre `admin@rentacontrol.cl` para Gmail API
- Mantener consistencia entre:
  - proyecto GCP
  - cuenta Gmail
  - OAuth

---

### ❌ Error 2 — UNAUTHENTICATED (OAuth)

**Error**
Invalid Credentials

**Causa**
- Access token expirado

**Solución**
- Refresh token en OAuth Playground
- Regenerar access token antes de ejecutar watch

---

### ❌ Error 3 — entries=0 messages=0

**Causa**
- Uso incorrecto de `historyId`
- Cursor dependía de `job.historyId`
- Desalineación entre watch y procesamiento

**Solución**
- Crear tabla `GmailCursor`
- Persistir cursor en DB
- Inicializar cursor desde watch real
- Actualizar cursor después de procesar

---

### ❌ Error 4 — historyTypes filter

**Causa**
- Uso de:
  historyTypes: ['messageAdded']

- Gmail no siempre clasifica eventos como messageAdded

**Solución**
- Eliminar `historyTypes`
- Usar todos los eventos

---

### ❌ Error 5 — Tabla no existe (Prisma)

**Error**
GmailProcessedMessage does not exist

**Causa**
- Migraciones Prisma no aplicadas en PRD
- Intento de ejecutar Prisma desde local contra Cloud SQL falló

**Solución**
- Crear tablas manualmente en Cloud SQL
- Confirmar funcionamiento
- Dejar pendiente pipeline formal

---

### ❌ Error 6 — Conexión a DB desde local

**Error**
P1001: Can't reach database server

**Causa**
- Cloud SQL no accesible directamente desde local
- Uso incorrecto de socket `/cloudsql/...`

**Solución**
- No usar Prisma local contra PRD
- Ejecutar cambios vía:
  - Cloud SQL UI
  - o pipeline futuro

---

## 8. Notas adicionales

- El sistema actualmente funciona en PRD pero con deuda técnica en:
  - migraciones
  - CI/CD
  - control de versiones de infraestructura

- Próximo paso recomendado:
  - formalizar pipeline GitHub → PRD
  - integrar Prisma migrate en deploy
