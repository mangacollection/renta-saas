# Documentación Técnica — RentaControl

Esta carpeta contiene la documentación técnica oficial del sistema.

Toda persona o agente que trabaje en el proyecto debe seguir estas reglas.

---

# 1. Regla principal

Antes de comenzar cualquier desarrollo debes leer:

docs/architecture.md  
docs/infra-gmail.md  
docs/prd-deploy.md  
docs/technical-handoff.md  

Esto es obligatorio para evitar romper producción.

---

# 2. Regla de actualización

Cuando termines una tarea técnica debes:

1. Actualizar el documento técnico correspondiente
2. Actualizar `docs/technical-handoff.md`
3. Incrementar la versión del documento
4. Registrar el cambio en el historial

---

# 3. Versionado de documentación

Cada documento usa esta estructura:

Doc version: vX.Y  
Última actualización: YYYY-MM-DD  

Ejemplo:

Doc version: v1.1  
Última actualización: 2026-03-12  

---

# 4. Historial de cambios

Cada documento debe tener una sección:

## Historial de cambios

Ejemplo:

### v1.1 — 2026-03-12
- Se agregan variables TENANT_GMAIL_* en Cloud Run
- Se documenta alias pagos.arriendos@rentacontrol.cl

---

# 5. Documentos existentes

| Documento | Propósito |
|---|---|
| architecture.md | Arquitectura completa del sistema |
| infra-gmail.md | Integraciones Gmail y separación de dominios |
| prd-deploy.md | Despliegue y validación de producción |
| technical-handoff.md | Estado técnico actual y continuidad entre agentes |

---

# 6. Reglas de desarrollo

Nunca modificar producción sin:

- revisar arquitectura
- revisar infraestructura
- revisar deploy PRD
- actualizar documentación

---

# 7. Flujo obligatorio de trabajo

Antes de desarrollar:

cat docs/architecture.md  
cat docs/infra-gmail.md  
cat docs/prd-deploy.md  
cat docs/technical-handoff.md  

Después de desarrollar:

actualizar documentación  
actualizar technical-handoff  
incrementar versión  

Luego:

git add docs/  
git commit -m "docs: update after technical change"  
git push  

---

# 8. Objetivo

Esta documentación permite que cualquier agente o desarrollador:

- entienda la arquitectura real
- no rompa producción
- continúe el trabajo sin perder contexto
- mantenga trazabilidad técnica

---

# 9. Nota para agentes

Si eres un agente de desarrollo trabajando en este repositorio:

1. Lee todos los documentos antes de modificar código.
2. No asumas arquitectura.
3. Si cambias infraestructura o variables, documenta el cambio.
4. Siempre actualiza `technical-handoff.md`.

