# ---- build stage ----
FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable

WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ ./
RUN pnpm exec prisma generate
RUN pnpm build
RUN pnpm prisma:deploy

# ---- runtime stage ----
FROM node:20-slim AS runner
WORKDIR /app/backend
ENV NODE_ENV=production

COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
RUN npx prisma generate


EXPOSE 8080
CMD ["node", "dist/main.js"]
