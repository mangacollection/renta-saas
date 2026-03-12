# Arquitectura PRD — RentaControl

**Doc version:** v1.0  
**Última actualización:** 2026-03-12  
**Estado:** vigente

## Resumen
RentaControl es un SaaS multi-tenant para gestión de arriendos.

## Arquitectura actual PRD

### Frontend
- Cloudflare Pages
- Dominio: `app.rentacontrol.cl`

### Auth
- Firebase Auth
- Proyecto: `rentacontrol-prd`

### Backend
- NestJS
- Cloud Run
- Dominio/API: `api.rentacontrol.cl`

### Base de datos
- PostgreSQL
- Cloud SQL

### Repositorio
- GitHub
- Monorepo con `backend/` y `frontend/`
- Package manager: `pnpm`

---

## Servicios involucrados

| Sistema | Uso |
|---|---|
| Cloudflare Pages | Hosting frontend |
| Firebase Auth | Autenticación |
| Cloud Run | Backend NestJS |
| Cloud SQL | PostgreSQL PRD |
| Artifact Registry | Imágenes Docker |
| GitHub | Repositorio |
| Google Workspace | Casillas/alias operativos |

---

## Backend actual

### Stack
- NestJS
- Prisma
- PostgreSQL
- Firebase Admin SDK

### Core
- multi-tenant por `accountId`
- validación ID Token Firebase
- roles: `admin`, `owner`

### Módulos
- `auth`
- `admin`
- `subscriptions`
- `invoices`
- `payments`
- `account`
- `integrations`
- `tenant-payments`
- `tenant-payment-senders`

---

## Reglas de arquitectura

- No romper `AccountPayment`.
- No mezclar billing SaaS con Tenant Payments.
- Todo recurso multi-tenant debe respetar `accountId`.
- Todo cambio PRD debe quedar documentado en `/docs`.

---

## Historial de cambios

### v1.0 — 2026-03-12
- Se documenta arquitectura PRD actual con Cloud Run + Cloud SQL + Cloudflare Pages.
