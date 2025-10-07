# frontend/Dockerfile (DEV)
FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Открываем стандартный порт Vite
EXPOSE 5173

# Запускаем Vite Dev Server (с доступом извне)
CMD ["npm", "run", "dev", "--", "--host"]
