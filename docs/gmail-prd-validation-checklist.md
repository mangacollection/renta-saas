Gmail PRD Validation Checklist — RentaControl

Doc version: v1.1
Última actualización: 2026-03-21
Estado: activo

Objetivo

Checklist técnico de validación para el flujo:

banco → correo → webhook → worker → TenantPayment → invoice → UI

Checklist técnico oculto — Gmail → Webhook → Worker → TenantPayment

Úsalo para revisar, en este orden:

Deploy real de backend

Confirmar que el backend PRD fue actualizado mediante:

push a main
↓
GitHub Actions
↓
build Docker
↓
push Artifact Registry
↓
deploy Cloud Run (new revision)

No asumir que Cloud Run recompila código manualmente.

Imagen correcta en Cloud Run

Confirmar que rentacontrol-backend usa imagen reciente de:

southamerica-west1-docker.pkg.dev/rentacontrol-prod/rentacontrol/backend:<commit-sha>

y que corresponde al último deploy ejecutado desde GitHub Actions.

Configuración obligatoria para cron en Cloud Run

Validar en rentacontrol-backend:

Billing = Instance-based
Min instances = 1

Sin esto, @Cron puede no ejecutarse correctamente.

Variables TENANT_GMAIL_* cargadas

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

Worker realmente instanciado

Ver logs en Cloud Run y confirmar:

GmailWorker initialized
GmailWorker tick

Si no aparecen, el problema no es el banco ni el webhook: es el worker.

Webhook realmente insertando jobs

Cuando llegue un correo o evento, validar en base de datos que se cree registro en:

GmailWebhookJob

Estados esperados:

pending
processing
done

Matching de remitente

Confirmar que exista TenantPaymentSender para el email del banco/remitente esperado.

Si no existe, el worker puede leer el correo pero lo ignorará.

Validación end-to-end

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

Notas importantes PRD
El deploy backend ahora es automático (CI/CD)
No existe deploy manual con Docker local
Las migraciones Prisma no se ejecutan en runtime
Las migraciones Prisma no se ejecutan en build
Validar siempre que el código desplegado corresponda al último commit en main
Riesgos específicos del flujo Gmail
Dependencia de latencia Gmail API
Dependencia de alias correctamente configurado
Worker depende de instancia activa en Cloud Run
Cron no es garantizado sin configuración adecuada
Errores de parsing pueden impedir matching automático
Historial
v1.1 — 2026-03-21
Se actualiza proceso de deploy a CI/CD automático
Se elimina referencia a build manual Docker
Se agrega validación de commit SHA en imagen
Se documentan riesgos actuales del worker
v1.0 — 2026-03-13
Creación checklist validación flujo Gmail PRD