FROM ubuntu:18.04

# https://packages.ubuntu.com/bionic/nginx
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nginx=1.14.0-0ubuntu1.7
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN sed -i 's/default_type application\/octet-stream/default_type text\/plain/' /etc/nginx/nginx.conf
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log
EXPOSE 80

STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
