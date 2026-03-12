Infraestructura Gmail — RentaControl

Doc version: v1.1
Última actualización: 2026-03-12
Estado: activo

Objetivo

Documentar la separación entre:

integración Gmail del billing SaaS

integración Gmail de pagos de inquilinos

Estas integraciones no deben compartir credenciales.

1. Gmail — Billing SaaS (Owner → RentaControl)

Este flujo procesa pagos que los owners hacen al SaaS.

Flujo

correo banco
↓
endpoint admin
↓
AccountPayment
↓
Invoice SaaS
↓
Account activada

Endpoint backend

POST /admin/account-payments/from-email

Variables

GMAIL_CLIENT_ID
GMAIL_CLIENT_SECRET
GMAIL_REFRESH_TOKEN

Dominio funcional

Billing del SaaS

Gestión de pagos de la cuenta del owner hacia la plataforma

Notas importantes

Este flujo:

es histórico

existía antes del módulo Tenant

no debe modificarse sin validar impacto en:

AccountPayment
Admin panel
Billing del SaaS

2. Gmail — Pagos de Inquilinos (Owner → Tenant)

Este flujo procesa pagos de inquilinos hacia propietarios.

Este sistema fue agregado posteriormente para automatizar conciliación de arriendos.

Flujo

correo banco
↓
alias pagos.arriendos@rentacontrol.cl

↓
Inbox admin@rentacontrol.cl

↓
Gmail API
↓
Webhook backend
↓
GmailWorker
↓
TenantPayment
↓
Invoice conciliada

Endpoint backend

POST /integrations/gmail/webhook

Worker

Clase:

GmailWorker

Cron actual en código:

*/30 * * * * *

Intervalo:

30 segundos

Variables utilizadas

Estas variables deben configurarse en Cloud Run (backend PRD).

TENANT_GMAIL_CLIENT_ID
TENANT_GMAIL_CLIENT_SECRET
TENANT_GMAIL_REFRESH_TOKEN
TENANT_GMAIL_TARGET_ALIAS

Alias utilizado

pagos.arriendos@rentacontrol.cl

Este alias redirige al buzón:

admin@rentacontrol.cl

Infraestructura OAuth

Proyecto GCP dedicado:

rentacontrol-tenant-gmail-prd

Administrado desde:

rentacontrol.root@gmail.com

Generación del OAuth

OAuth creado usando:

Google Auth Platform

Tipo de aplicación:

Web application

Redirect URI autorizado:

https://developers.google.com/oauthplayground

Generación del refresh token

El refresh token se generó utilizando:

https://developers.google.com/oauthplayground

Configuración utilizada:

Use your own OAuth credentials

Scopes autorizados:

https://www.googleapis.com/auth/gmail.readonly

Cuenta autorizada:

admin@rentacontrol.cl

Estado actual del OAuth

Publishing status:

Testing

Usuarios autorizados como testers:

admin@rentacontrol.cl

rentacontrol.root@gmail.com

Mientras el OAuth esté en estado Testing, solo estos usuarios pueden autorizar nuevos tokens.

Esto no afecta el funcionamiento del refresh token en producción.

3. Reglas críticas

Nunca reutilizar credenciales entre:

Billing SaaS
Tenant Payments

Nunca sobrescribir variables:

GMAIL_*

al configurar:

TENANT_GMAIL_*

Siempre validar cambios de Gmail contra PRD antes de hacer merge a:

main

4. Backend relacionado
Módulos

src/integrations/gmail
src/tenant-payments
src/tenant-payment-senders

Tablas Prisma

TenantPayment
TenantPaymentSender
GmailWebhookJob
GmailProcessedMessage

5. Historial de cambios
v1.1 — 2026-03-12

Se crea proyecto GCP dedicado rentacontrol-tenant-gmail-prd

Se genera OAuth separado para Tenant Payments

Se documenta generación de refresh token vía OAuth Playground

Se documenta alias pagos.arriendos@rentacontrol.cl

Se documenta estado OAuth Testing y test users

v1.0 — 2026-03-12

Documento inicial de separación entre Gmail de billing SaaS y Gmail de tenant payments.