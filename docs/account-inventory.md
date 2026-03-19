# Inventario de Cuentas — RentaControl

**Doc version:** v1.1  
**Última actualización:** 2026-03-13  
**Estado:** activo

---

# 1. Objetivo

Centralizar el inventario de **todas las cuentas, identidades y proyectos** utilizados por RentaControl.

Este documento evita:

- pérdida de acceso
- confusión entre cuentas
- mezcla de entornos
- errores de infraestructura

Toda cuenta utilizada por el sistema **debe quedar registrada aquí**.

---

# 2. Identidad principal del proyecto

Cuenta raíz operativa de infraestructura:

rentacontrol.root@gmail.com

Administra:

- Google Cloud
- Cloud Run
- Cloud SQL
- Artifact Registry
- Cloudflare
- Gmail OAuth (Tenant Payments)

Esta cuenta es el **owner de infraestructura PRD**.

---

# 3. Google Cloud Platform

Cuenta administradora:

rentacontrol.root@gmail.com

Proyecto PRD:

rentacontrol-prod

Servicios utilizados:

| Servicio | Uso |
|---|---|
| Cloud Run | Backend NestJS |
| Cloud SQL | PostgreSQL PRD |
| Artifact Registry | imágenes Docker |
| IAM | control de acceso |

Región principal:

southamerica-west1

Servicio backend:

rentacontrol-backend

---

# 4. Firebase (Autenticación)

Firebase **no está en la cuenta rentacontrol.root**.

Está bajo la cuenta:

mangacollection.cl@gmail.com

Firebase se utiliza para **autenticación de usuarios del SaaS**.

Los usuarios creados en Firebase son los que valida el **frontend de RentaControl**.

---

## Proyecto Firebase DEV

Proyecto:

renta-saas-mvp

Uso:

- ambiente de desarrollo
- pruebas locales
- validación frontend en desarrollo

---

## Proyecto Firebase PRD

Proyecto:

rentacontrol-prd

Uso:

- autenticación producción
- login de usuarios reales
- validación de tokens en backend PRD

El backend valida tokens mediante:

Firebase Admin SDK

Variable crítica:

FIREBASE_PROJECT_ID

---

# 5. Cloudflare

Cuenta administradora:

rentacontrol.root@gmail.com

Servicio:

Cloudflare Pages

Proyecto Pages:

renta-saas

Repositorio conectado:

mangacollection/renta-saas

Dominio producción:

app.rentacontrol.cl

Uso:

hosting del frontend.

Deploy automático:

GitHub → Cloudflare Pages

---

# 6. GitHub

Cuenta:

mangacollection

Repositorio principal:

renta-saas

Tipo:

monorepo

Estructura:

backend/  
frontend/  
docs/

Branch producción:

main

Deploy frontend:

GitHub → Cloudflare Pages

---

# 7. Gmail operativo

Casilla principal utilizada por el sistema:

admin@rentacontrol.cl

Uso:

- recepción de correos bancarios
- origen de integración Gmail API

Alias utilizado para pagos de arriendos:

pagos.arriendos@rentacontrol.cl

Este alias redirige a:

admin@rentacontrol.cl

---

# 8. OAuth Gmail Tenant Payments

Proyecto GCP dedicado:

rentacontrol-tenant-gmail-prd

Cuenta administradora:

rentacontrol.root@gmail.com

OAuth generado para:

admin@rentacontrol.cl

Scope utilizado:

https://www.googleapis.com/auth/gmail.readonly

Estado OAuth:

Testing

Usuarios autorizados:

admin@rentacontrol.cl  
rentacontrol.root@gmail.com

---

# 9. Usuarios SaaS PRD

Usuario administrador: admin@rentacontrol.cl

Usuario Owner: rentacontrol.root@gmail.com

Uso:

- pruebas funcionales
- validación del sistema

Los usuarios del SaaS se crean en:

Firebase Auth (proyecto rentacontrol-prd)

---

# 10. Cuentas históricas

Cuenta usada en desarrollo:

mangacollection.cl@gmail.com

Uso:

- Firebase
- desarrollo inicial
- repositorio GitHub

---

# 11. Reglas de gobernanza

1. Toda nueva cuenta usada por el sistema debe agregarse aquí.

2. No crear infraestructura con cuentas personales no documentadas.

3. OAuth y APIs externas deben registrarse en este documento.

4. Owner de infraestructura PRD:

rentacontrol.root@gmail.com

5. Firebase DEV y PRD deben mantenerse separados.

---

# 12. Historial

### v1.1 — 2026-03-13

Se documenta separación de proyectos Firebase:

DEV → renta-saas-mvp  
PRD → rentacontrol-prd

Se documenta que Firebase está bajo cuenta mangacollection.

---

### v1.0 — 2026-03-12

Creación del inventario centralizado de cuentas del proyecto.