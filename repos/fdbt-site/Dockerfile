FROM node:20-alpine AS build
RUN apk add --no-cache git
ENV NODE_ENV production
RUN npm install -g npm
WORKDIR /tmp
COPY . .
RUN npm install --ignore-scripts --include=dev
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV production
RUN npm install -g npm
WORKDIR /home/node/app
COPY ./start_clamav.sh ./
COPY ./supervisord.conf /etc/supervisor/
RUN apk update && \
    apk upgrade && \
    apk add --no-cache -t .clamv-run-deps openrc clamav clamav-daemon clamav-libunrar supervisor && \
    mkdir /run/clamav && \
    chown clamav:clamav /run/clamav && \
    chmod 750 /run/clamav && \
    mkdir -p /var/lib/clamav/ && \
    chown -R clamav:clamav /var/lib/clamav/ && \
    mkdir -p  /var/log/supervisor && \
    chmod -R 0777 /var/log/supervisor && \
    chmod +x /home/node/app/start_clamav.sh && \
    sed -i 's/^#Foreground yes/Foreground yes/g' /etc/clamav/clamd.conf && \
    sed -i 's/^#Foreground yes/Foreground yes/g' /etc/clamav/freshclam.conf && \
    freshclam --stdout
COPY ./package*.json ./next.config.js ./
RUN npm ci --ignore-scripts
COPY --from=build /tmp/.next ./.next
COPY --from=build /tmp/dist ./dist
CMD ["supervisord",  "-c",  "/etc/supervisor/supervisord.conf", "-n"]
EXPOSE 80
