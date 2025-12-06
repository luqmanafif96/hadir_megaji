# Bun base image
FROM oven/bun:latest

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy all source
COPY . .

# ---- BUILD FRONTEND ----
# Pastikan ada script "build": "vite build"
RUN bun run build

# Expose server port
EXPOSE 4000

# Start Bun server (server.js)
CMD ["bun", "run", "server.js"]
