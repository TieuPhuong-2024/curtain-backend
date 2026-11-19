# syntax=docker/dockerfile:1
# Digest-pinned for reproducible rebuilds. To bump, run
# `docker buildx imagetools inspect node:22-alpine` and update the digest.
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a

ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

# Dependency layer (cache-friendly). Requires the committed lockfile.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT:-5000}/" || exit 1

CMD ["node", "src/index.js"]