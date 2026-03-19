# Gmail PRD Validation Checklist — RentaControl

**Doc version:** v1.0  
**Última actualización:** 2026-03-13  
**Estado:** activo

---

## Objetivo

Checklist técnico de validación para el flujo:

banco → correo → webhook → worker → TenantPayment → invoice → UI

---

Checklist técnico oculto — Gmail → Webhook → Worker → TenantPayment

Úsalo para revisar, en este orden:

1. Deploy real de backend

Confirmar que el backend PRD fue actualizado con:

docker build -f backend/Dockerfile -t southamerica-west1-docker.pkg.dev/rentacontrol-prod/rentacontrol/backend:prod .
docker push southamerica-west1-docker.pkg.dev/rentacontrol-prod/rentacontrol/backend:prod


y luego:

Cloud Run → new revision


No asumir que “Deploy new revision” recompila código.

2. Imagen correcta en Cloud Run

Confirmar que rentacontrol-backend usa:

southamerica-west1-docker.pkg.dev/rentacontrol-prod/rentacontrol/backend:prod


y que la imagen fue actualizada el mismo día de la prueba.

3. Configuración obligatoria para cron en Cloud Run

Validar en rentacontrol-backend:

Billing = Instance-based
Min instances = 1


Sin eso, @Cron puede no correr.

4. Variables TENANT_GMAIL_* cargadas

Confirmar en Cloud Run:

TENANT_GMAIL_CLIENT_ID
TENANT_GMAIL_CLIENT_SECRET
TENANT_GMAIL_REFRESH_TOKEN
TENANT_GMAIL_TARGET_ALIAS


Sin tocar ni romper:

GMAIL_CLIENT_ID
GMAIL_CLIENT_SECRET
GMAIL_REFRESH_TOKEN


del flujo SaaS billing.

5. Worker realmente instanciado

Ver logs en Cloud Run y confirmar:

GmailWorker initialized
GmailWorker tick


Si no aparecen, el problema no es el banco ni el webhook: es el worker.

6. Webhook realmente insertando jobs

Cuando llegue un correo o evento, validar en base de datos que se cree registro en:

GmailWebhookJob


Estados esperados:

pending
processing
done

7. Matching de remitente

Confirmar que exista TenantPaymentSender para el email del banco/remitente esperado.
Si no existe, el worker puede leer el correo pero lo ignorará.

8. Validación end-to-end

Comprobar que después del correo ocurra:

GmailWebhookJob creado
↓
worker procesa
↓
TenantPayment creado
↓
invoice actualizada
↓
UI refleja pago


Y además probar estos 4 escenarios:

Pago completo
Pago parcial
Sobrepago
Remitente no registrado

