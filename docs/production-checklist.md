# Production Checklist — RentaControl

**Doc version:** v1.0  
**Última actualización:** 2026-03-12  
**Estado:** activo

Este documento define el proceso obligatorio antes de liberar cambios a producción.

---

# 1. Verificación de código

Antes de desplegar confirmar:

- `pnpm build` sin errores
- endpoints nuevos documentados
- migraciones Prisma revisadas
- variables de entorno identificadas

Comando:

pnpm build

---

# 2. Verificación de base de datos

Confirmar en PRD:

- migraciones aplicadas
- nuevas tablas existen
- índices correctos

Tablas críticas:

Tenant  
TenantPayment  
TenantPaymentSender  
GmailWebhookJob  
GmailProcessedMessage  
Invoice  
Subscription  

---

# 3. Variables de entorno backend

Verificar en Cloud Run:

DATABASE_URL  
FIREBASE_PROJECT_ID  
FIREBASE_CLIENT_EMAIL  
FIREBASE_PRIVATE_KEY  

Variables Gmail SaaS:

GMAIL_CLIENT_ID  
GMAIL_CLIENT_SECRET  
GMAIL_REFRESH_TOKEN  

Variables Gmail Tenant:

TENANT_GMAIL_CLIENT_ID  
TENANT_GMAIL_CLIENT_SECRET  
TENANT_GMAIL_REFRESH_TOKEN  
TENANT_GMAIL_TARGET_ALIAS  

---

# 4. Infraestructura

Confirmar estado de servicios:

Cloud Run → backend activo  
Cloud SQL → base operativa  
Cloudflare Pages → frontend publicado  
Firebase Auth → autenticación funcionando  

---

# 5. Validación de endpoints

Backend debe responder:

GET /subscriptions  
GET /invoices  
GET /tenant-payments  
POST /tenant-payments/from-bank-email  
POST /integrations/gmail/webhook  

---

# 6. Worker

Confirmar en logs de Cloud Run:

GmailWorker tick

Intervalo esperado:

30 segundos

---

# 7. Validación funcional

Probar flujo completo:

transferencia bancaria  
↓  
correo banco  
↓  
Gmail API  
↓  
worker procesa  
↓  
TenantPayment creado  
↓  
invoice conciliada  
↓  
UI refleja pago  

---

# 8. Escenarios a probar

Pago completo  
invoice → paid  

Pago parcial  
partial_applied  

Sobrepago  
overpayment  

Remitente no registrado  
correo ignorado  

---

# 9. Validación frontend

En app.rentacontrol.cl comprobar:

login  
vista de contratos  
vista de invoices  
vista de tenant payments  
interacciones API correctas  

---

# 10. Logs y monitoreo

Revisar en Cloud Run:

errores 500  
errores Gmail API  
fallos de worker  
latencia alta  

---

# 11. Rollback plan

Si ocurre fallo crítico:

1. revertir deploy
2. restaurar versión anterior
3. revisar logs
4. abrir incidente técnico

---

# 12. Historial de cambios

### v1.0 — 2026-03-12
- Documento inicial de checklist de producción.
