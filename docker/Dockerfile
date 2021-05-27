FROM ubuntu:20.04

COPY dependencies.json /tmp/dependencies.json

RUN DEBIAN_FRONTEND=noninteractive apt-get update \
 && apt-get install -y --no-install-recommends jq \
 && jq -r 'to_entries | .[] | .key + "=" + .value' /tmp/dependencies.json | xargs apt-get install -y --no-install-recommends \
 && rm /tmp/dependencies.json \
 && apt-get clean \
 && rm /etc/nginx/sites-enabled/default \
 && rm /etc/nginx/sites-available/default \
 && ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
