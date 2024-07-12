# Proxy Pass + Static

This config may be used in a situation where you have some static files to serve, but additionally a backend to proxy pass too. For example, if you have a statically compiled frontend written in react mixed with a Django/FastAPI backend.

```conf
server {

    server_name example.com;
    listen 80;

    real_ip_header proxy_protocol;

    location / {
        # this should route to the frontend
        alias /var/www/mysite/;
        index index.html;
    }

    # trailing slash is important!
    location /api/ {

        # this should route to the backend

        proxy_set_header      Host              $http_host;
        proxy_set_header      X-Forwarded-By    $server_addr:$server_port;
        proxy_set_header      X-Forwarded-For   $remote_addr;

        # If you're getting infinite redirects, its probably because this header is not set to 'https'
        # proxy_set_header      X-Forwarded-Proto https;

        proxy_set_header      X-Real-IP         $remote_addr;
        proxy_set_header      CLIENT_IP         $remote_addr;

        proxy_pass_request_headers on;

        proxy_redirect off;

        client_max_body_size 100M;

        proxy_buffering off;
        proxy_request_buffering off;

        # NOTE: the trailing slash here removes the /api/ from location
        proxy_pass http://api-server:8080/;
    }

}
```
