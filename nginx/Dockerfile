FROM nginx:alpine

# Удаляем дефолтный конфиг
RUN rm -rf /etc/nginx/conf.d/*

# Копируем твой конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf
