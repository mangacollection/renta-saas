Arquitectura PRD — RentaControl

Doc version: v1.1
Última actualización: 2026-03-21
Estado: vigente con CI/CD activo

Resumen

RentaControl es un SaaS multi-tenant para gestión de arriendos.

Arquitectura actual PRD
Frontend
Cloudflare Pages
Dominio: app.rentacontrol.cl
Deploy automático desde GitHub
Auth
Firebase Auth
Proyecto: rentacontrol-prd
Backend
NestJS
Cloud Run
Dominio/API: api.rentacontrol.cl
Deploy automático vía GitHub Actions
Base de datos
PostgreSQL
Cloud SQL
Repositorio
GitHub
Monorepo con backend/ y frontend/
Package manager: pnpm
Servicios involucrados
Sistema	Uso
Cloudflare Pages	Hosting frontend
Firebase Auth	Autenticación
Cloud Run	Backend NestJS
Cloud SQL	PostgreSQL PRD
Artifact Registry	Imágenes Docker
GitHub	Repositorio + CI/CD
GitHub Actions	Deploy automático backend
Google Workspace	Casillas/alias operativos
Backend actual
Stack
NestJS
Prisma
PostgreSQL
Firebase Admin SDK
Core
multi-tenant por accountId
validación ID Token Firebase
roles: admin, owner
Módulos
auth
admin
subscriptions
invoices
payments
account
integrations
tenant-payments
tenant-payment-senders
Infraestructura de deploy
Backend
build Docker desde backend/
push a Artifact Registry (rentacontrol)
deploy automático a Cloud Run (rentacontrol-backend)
trigger: push a main

Archivo:

.github/workflows/deploy-backend.yml

Reglas de arquitectura
No romper AccountPayment.
No mezclar billing SaaS con Tenant Payments.
Todo recurso multi-tenant debe respetar accountId.
Todo cambio PRD debe quedar documentado en /docs.
Consideraciones actuales
Migraciones Prisma NO se ejecutan en runtime
Migraciones Prisma NO se ejecutan en Docker build
Migraciones deben ejecutarse de forma controlada externa
Deploy backend completamente automatizado (CI/CD)
Historial de cambios
v1.1 — 2026-03-21
Se agrega CI/CD backend con GitHub Actions
Se documenta deploy automático a Cloud Run
Se documenta separación de migraciones Prisma
v1.0 — 2026-03-12
Se documenta arquitectura PRD actual con Cloud Run + Cloud SQL + Cloudflare Pages.