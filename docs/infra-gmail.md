# Infraestructura Gmail — RentaControl

**Doc version:** v1.0  
**Última actualización:** 2026-03-12  
**Estado:** draft-controlado

## Objetivo
Documentar la separación entre la integración Gmail de billing SaaS y la integración Gmail de pagos de inquilinos.

---

## 1. Gmail — Billing SaaS (Owner → RentaControl)

Este flujo procesa pagos que los owners hacen al SaaS.

### Flujo
correo banco  
↓  
endpoint admin  
↓  
AccountPayment  
↓  
Invoice SaaS  
↓  
Account activada

### Endpoint backend
`POST /admin/account-payments/from-email`

### Variables
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

### Dominio funcional
- Billing del SaaS
- No mezclar con Tenant Payments

### Notas
- Este flujo es histórico y ya existía antes del módulo Tenant.
- No modificar sin validar impacto en `AccountPayment` y admin panel.

---

## 2. Gmail — Pagos de Inquilinos (Owner → Tenant)

Este flujo procesa pagos de inquilinos a propietarios.

### Flujo
correo banco  
↓  
alias `pagos.arriendos@rentacontrol.cl`  
↓  
Gmail API  
↓  
Webhook  
↓  
Worker  
↓  
TenantPayment  
↓  
Invoice conciliada

### Endpoint backend
`POST /integrations/gmail/webhook`

### Worker
- `GmailWorker`
- Cron actual en código: `*/30 * * * * *`

### Variables
- `TENANT_GMAIL_CLIENT_ID`
- `TENANT_GMAIL_CLIENT_SECRET`
- `TENANT_GMAIL_REFRESH_TOKEN`
- `TENANT_GMAIL_TARGET_ALIAS`

### Alias utilizado
- `pagos.arriendos@rentacontrol.cl`

### Buzón real
- `admin@rentacontrol.cl`

### Infraestructura objetivo
- Proyecto GCP PRD administrado desde `rentacontrol.root@gmail.com`

---

## 3. Reglas importantes

- Nunca reutilizar credenciales entre Billing SaaS y Tenant Payments.
- Nunca sobreescribir variables `GMAIL_*` al configurar `TENANT_GMAIL_*`.
- Cualquier cambio en Gmail debe validarse contra PRD antes de merge a main.

---

## 4. Backend relacionado

### Módulos
- `src/integrations/gmail`
- `src/tenant-payments`
- `src/tenant-payment-senders`

### Tablas Prisma
- `TenantPayment`
- `TenantPaymentSender`
- `GmailWebhookJob`
- `GmailProcessedMessage`

---

## 5. Historial de cambios

### v1.0 — 2026-03-12
- Se documenta separación entre Gmail de billing SaaS y Gmail de tenant payments.
- Se define alias `pagos.arriendos@rentacontrol.cl`.
- Se define que tenant OAuth debe vivir en proyecto PRD.
