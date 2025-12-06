# --- Build React ---
FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json .
COPY vite.config.js .
COPY src ./src

RUN bun install
RUN bun run build   # hasil masuk dalam /app/dist

# --- Runtime Server ---
FROM oven/bun:latest
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.js .
COPY package.json .

# create folder data
RUN mkdir -p /data

ENV DATA_DIR=/data
EXPOSE 3000

CMD ["bun", "run", "server.js"]
