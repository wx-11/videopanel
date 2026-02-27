# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --fund=false

COPY . .

RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=18130

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/server/ ./server/

EXPOSE 18130
CMD ["node", "server/index.js"]
