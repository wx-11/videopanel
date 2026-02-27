# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --fund=false

COPY . .

ARG VITE_AUTH_ENABLED=false
ARG VITE_AUTH_USERNAME=internal
ENV VITE_AUTH_ENABLED=$VITE_AUTH_ENABLED
ENV VITE_AUTH_USERNAME=$VITE_AUTH_USERNAME

RUN npm run build

FROM nginx:1.25-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
