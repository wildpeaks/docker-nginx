FROM ubuntu:20.04

RUN DEBIAN_FRONTEND=noninteractive apt-get update \
 && apt-get install -y --no-install-recommends \
      nginx=1.18.0-0ubuntu1 \
      openssl=1.1.1f-1ubuntu2.4 \
      ca-certificates=20210119~20.04.1 \
 && apt-get clean \
 && rm /etc/nginx/sites-enabled/default \
 && rm /etc/nginx/sites-available/default \
 && ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
