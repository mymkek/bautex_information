FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# SQLite база будет в volume
VOLUME ["/app/data"]

EXPOSE 4000

CMD ["node", "server.js"]
