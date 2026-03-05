FROM node:lts AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY examples/backend+confidential_client/package.json examples/backend+confidential_client/
COPY examples/frontend+public_client/package.json examples/frontend+public_client/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:lts-slim AS runner
WORKDIR /app
RUN groupadd -g 1001 burnt && useradd -u 1001 -g 1001 burnt -m
COPY --from=build /app /app
RUN chown -R burnt:burnt /app
USER burnt
CMD ["pnpm", "dev"]
