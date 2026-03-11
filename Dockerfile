FROM node:20-slim AS builder

WORKDIR /app

# Build frontend
COPY frontend/package.json frontend/
RUN cd frontend && npm install
COPY frontend/ frontend/
RUN cd frontend && npm run build
# Built output goes to backend/public (per vite.config.js)

FROM node:20-slim AS runner

WORKDIR /app

COPY backend/package.json ./
RUN npm install --production

COPY backend/src ./src

# Copy built frontend from builder stage
COPY --from=builder /app/backend/public ./public

# Serve static files from Express
RUN echo "import express from 'express';" > /dev/null

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
