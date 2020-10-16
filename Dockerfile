FROM ubuntu:20.04

# https://packages.ubuntu.com/focal/nginx
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nginx=1.17.10-0ubuntu1
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN sed -i 's/default_type application\/octet-stream/default_type text\/plain/' /etc/nginx/nginx.conf
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log
EXPOSE 80

STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
