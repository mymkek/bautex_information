# frontend/Dockerfile (PROD)
# Для локальной разработки используй `npm run dev` без Docker.

# --- Сборка ---
FROM node:20-alpine AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем весь код и собираем
COPY . .
RUN npm run build

# --- Раздача статики ---
FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
