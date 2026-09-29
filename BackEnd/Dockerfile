# Production image for the VYRO API — works on any container host
# (Railway, Render, Fly.io, VPS…). Runs pending migrations, then starts.
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
# prisma.config.ts (loaded by `prisma generate` on install) imports this helper.
COPY src/config/database-url.ts ./src/config/
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
USER node
EXPOSE 3000
# DATABASE_URL is derived from DB_* variables when not provided directly.
CMD ["sh", "-c", "export DATABASE_URL=\"$(node -p \"require('./dist/config/database-url').resolveDatabaseUrl() ?? ''\")\" && npx prisma migrate deploy --schema prisma/schema.prisma && node dist/main"]
