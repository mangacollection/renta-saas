# Technical Handoff — RentaControl

**Doc version:** v1.0  
**Última actualización:** 2026-03-12  
**Estado:** activo

## Cómo usar este documento

Antes de desarrollar:
1. Leer `docs/architecture.md`
2. Leer `docs/infra-gmail.md`
3. Leer `docs/prd-deploy.md`
4. Leer este handoff

Después de desarrollar:
1. Actualizar este documento
2. Actualizar el doc técnico impactado
3. Agregar entrada al historial de cambios
4. Commit junto con el cambio técnico

---

## Estado actual resumido

### Confirmado
- backend compila
- endpoints tenant existen
- webhook Gmail tenant existe
- schema Prisma tiene modelos tenant/gmail
- worker Gmail existe y usa cron cada 30s
- arquitectura PRD real usa Cloud Run, no Render

### Pendiente PRD
- crear/configurar OAuth tenant en proyecto GCP correcto
- cargar `TENANT_GMAIL_*` en Cloud Run
- validar logs reales en PRD
- validar flujo real banco → Gmail → TenantPayment → UI

---

## Reglas de trabajo para agentes

- Trabajar por micro-tareas
- No asumir nada sin revisar código/infra real
- No romper billing SaaS existente
- Siempre documentar cambios en `/docs`
- Si cambia arquitectura o variables, actualizar docs en el mismo commit

---

## Plantilla de actualización por agente

### Fecha
YYYY-MM-DD

### Agente / Sprint
Nombre del sprint o tarea

### Qué revisó
- ...

### Qué cambió
- ...

### Riesgos detectados
- ...

### Próximo paso sugerido
- ...

---

## Historial de cambios

### v1.0 — 2026-03-12
- Documento base de handoff creado.
