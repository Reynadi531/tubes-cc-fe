FROM oven/bun:1.3.14-alpine AS deps
WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/env/package.json packages/env/package.json
COPY packages/infra/package.json packages/infra/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN bun install --frozen-lockfile

FROM deps AS build
WORKDIR /app

ARG VITE_SERVER_URL=
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

COPY . .

RUN bun run build

FROM oven/bun:1.3.14-alpine AS runtime
WORKDIR /app

RUN bun install -g serve

COPY --from=build /app/apps/web/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]
