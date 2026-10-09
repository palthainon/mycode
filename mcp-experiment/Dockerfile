FROM node:24-bookworm-slim AS build
WORKDIR /app/mcp-experiment
COPY mcp-experiment/package*.json ./
RUN npm ci --ignore-scripts
COPY mcp-experiment/tsconfig.json ./
COPY mcp-experiment/src ./src
RUN npm run build && npm prune --omit=dev --ignore-scripts
FROM node:24-bookworm-slim
ENV NODE_ENV=production PORT=8080
WORKDIR /app/mcp-experiment
COPY --from=build --chown=node:node /app/mcp-experiment/package*.json ./
COPY --from=build --chown=node:node /app/mcp-experiment/node_modules ./node_modules
COPY --from=build --chown=node:node /app/mcp-experiment/dist ./dist
COPY --chown=node:node system/logparser-core.js /app/system/logparser-core.js
COPY --chown=node:node nettools/subnet-core.js /app/nettools/subnet-core.js
USER node
EXPOSE 8080
CMD ["node", "dist/server.js"]
