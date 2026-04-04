🚀 PRD Release Playbook — RentaControl (v2.0 REAL)

Estado: probado en producción
Última actualización: 2026-04-03
Owner: Agente Liberador PRD

🎯 OBJETIVO

Asegurar que cada release:

se despliegue correctamente
no rompa PRD
tenga DB consistente
mantenga jobs funcionando
sea validado con evidencia real
🧭 PRINCIPIO CLAVE

👉 Deploy ≠ Release

Un release está listo solo cuando:

código desplegado ✅
DB sincronizada ✅
jobs activos ✅
UI funcionando ✅
flujo real validado ✅
🔁 TIPOS DE RELEASE
Tipo A — Solo Frontend
UI
layout
cambios visuales
Tipo B — Backend sin Prisma
endpoints
lógica
Tipo C — Backend + Prisma
cambios en schema
nuevas tablas/campos
Tipo D — Backend + Jobs (CRÍTICO)
scheduler
automation
Gmail worker

👉 El último release fue Tipo D

🧱 FASE 1 — PREPARACIÓN
1.1 Validar estado del repo
git status
git branch
git log --oneline -3
Reglas
❌ NO cambios sin commit
❌ NO archivos basura
❌ NO branch incorrecta
1.2 Limpiar staging

Nunca subir:

.sfdx/
archivos locales
basura de IDE
git restore --staged .sfdx/
1.3 Build local obligatorio
Backend
cd backend
pnpm build
Frontend
cd ../frontend
pnpm build

👉 Ambos deben pasar sin errores

🧱 FASE 2 — COMMIT Y PUSH
2.1 Commit limpio
git add .
git commit -m "feat: <descripción clara>"
2.2 Push
git push origin <feature-branch>
🧱 FASE 3 — PULL REQUEST
3.1 Crear PR → main
Validar:
archivos correctos
migraciones incluidas si aplica
nada extraño en diff
3.2 Validación rápida

Checklist:

backend ✔
frontend ✔
prisma ✔ (si aplica)
jobs ✔ (si aplica)
3.3 Merge

👉 Esto dispara deploy automático

🧱 FASE 4 — DEPLOY BACKEND
Pipeline real

GitHub Actions:

build Docker
push Artifact Registry
deploy Cloud Run
Validar en GitHub Actions

Estados:

Workflow corriendo
Workflow exitoso
❌ Workflow falló
🧱 FASE 5 — VALIDACIÓN CLOUD RUN
Logs

Buscar:

Nest started ✅
Ready TRUE ✅
GmailWorker initialized ✅

No debe haber:

Prisma error
missing env
crash
🧱 FASE 6 — MIGRACIÓN DB (CRÍTICO)
🚨 Regla

SI hay cambio Prisma → SIEMPRE ejecutar esto

6.1 Levantar proxy
cloud-sql-proxy rentacontrol-prod:southamerica-west1:rentacontrol-db
6.2 Ejecutar migración
DATABASE_URL='postgresql://app_user:***@127.0.0.1:5432/rentacontrol' pnpm exec prisma migrate deploy
Errores comunes
❌ zsh error !

👉 usar comillas simples '

❌ P1001

👉 proxy no corriendo

❌ socket error

👉 usar 127.0.0.1, NO /cloudsql

🧱 FASE 7 — VALIDACIÓN DB
SELECT * FROM "AutomationRun" LIMIT 5;

Resultado esperado:

tabla existe ✅
🧱 FASE 8 — VALIDACIÓN JOBS
Gmail Worker
corre cada 30s
logs activos
Automation Job
corre 9 AM
inserta en AutomationRun
🧱 FASE 9 — SMOKE TEST FUNCIONAL
UI
login ✔
invoices ✔
navegación ✔
Validar
sin errores visibles
datos coherentes
🧱 FASE 10 — CIERRE DEL RELEASE
Reportar
A. Qué se pasó
backend
frontend
DB
B. Qué se validó
logs
DB
UI
C. Riesgos
warnings
deuda técnica
⚠️ RIESGOS REALES IDENTIFICADOS
1. Prisma fuera del pipeline

👉 siempre migrar manualmente

2. Gmail Worker depende de env
TARGET_ALIAS
DEFAULT_ACCOUNT_ID
3. Drift DB posible

👉 cambios manuales previos

4. OpenSSL warning

👉 no bloqueante pero revisar

5. Jobs son críticos

👉 si mueren, producto deja de funcionar

✅ DEFINITION OF DONE

Un release está listo cuando:

deploy exitoso ✔
DB sincronizada ✔
jobs funcionando ✔
UI funcional ✔
flujo real probado ✔
🧠 MEJORA FUTURA (IMPORTANTE)
Automatizar:
prisma migrate deploy en CI/CD
health check de jobs
alerta si GmailWorker muere
dashboard de AutomationRun