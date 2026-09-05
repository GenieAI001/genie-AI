# Builds a standalone, single-file bundle of the API server
# (artifacts/api-server/dist/index.mjs) using esbuild — see build.mjs.
# The whole workspace is needed at build time so pnpm can resolve
# workspace:* deps (@workspace/db, @workspace/api-zod), but the final
# runtime image only needs the bundled output + node_modules for anything
# esbuild externalized (e.g. pino-pretty, pg's optional native addon).

FROM node:24-slim AS base
RUN corepack enable
WORKDIR /app

# --- deps + build ---
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-server... run build

# --- runtime ---
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/artifacts/api-server/dist ./dist
COPY --from=build /app/artifacts/api-server/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 5000
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
