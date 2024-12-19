# Server NGINX to Container NGINX Setup

A common strategy I use when developing and deploying custom containerized applications is to have two layers of NGINX - one at the server level and one at the container level.

The first layer - at the server - handles SSL termination and proxying traffic to the appropriate container who is bound on a certain port on `localhost`. We can proxy to different containers based on the server name, URL path, etc. This layer of NGINX only knows to terminate SSL and forward traffic to a specific application and has no other responsibility.

The second layer - at the container - handles any application specific routing/proxying. This includes things such as which paths to serve static/media files from, whether there are any further proxies to other applications, setting application specific limits like `client_max_body_size`, etc.

## Why Two Layers?

The main advantage I've found of doing things this way is it makes it easier to host several applications on a single server with only a single IP address required. All of our domains can be set to the host server's IP in DNS, and the first layer of NGINX does the appropriate routing based on this name. It can also handle all SSL termination and certificate management, simplifying the container's responsibility. If we instead built certificates/SSL termination directly to the container and expected to bind to 443/80 on the host, it becomes much more difficult to host multiple applications on the same server.

## Why One Layer?

My two-layer strategy requires more knowledge by the person responsible for deploying and managing the application. If your goal is to provide a plug-and-play solution to someone, doing everything within your containerized application is probably better.

## Sample Server NGINX Config

The following is a sample server config that I've used before. Pay careful attention to the proxy headers, as this will allow us to pass the true client IP through both layers of proxy so that the application logs are accurate. For more information on this, see [Understanding X-Forwarded-For NGINX Settings](https://paigekim29.medium.com/understanding-x-forwarded-for-header-settings-in-nginx-4929f49d57dd)

```conf
# Redirect all non-encrypted to encrypted
server {
    server_name app.example.com;
    listen app.example.com:80;
    return 301 https://app.example.com$request_uri;
}

# SSL configuration
server {
    server_name app.example.com;
    listen app.example.com:443;

    ssl on;
    ssl_certificate /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;

    # source: https://ssl-config.mozilla.org/
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;

    client_max_body_size 1G;

    location / {

        # if it exists, we should show our maintenance page until deploy finishes
        if (-f /srv/path/to/static/enable_maintenance_mode){
            return 503;
        }

        # these headers are important for passing the clients true IP address
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Host $http_host;
        proxy_redirect off;

        # the port specified here must match the port you expose from your
        # NGINX container
        proxy_pass http://127.0.0.1:8765;
    }

    # serve our maintenance notification html when in maintenance mode
    error_page 503 /under_maintenance.html;
    location = /under_maintenance.html {
        root /srv/path/to/static;
    }

    gzip on;
    error_log /var/log/nginx/app/error.log warn;
    access_log /var/log/nginx/app/access.log;
}
```

## Sample Docker NGINX Config

And this is a sample config you can use for your NGINX container. Again, we must include the appropriate NGINX headers to pass the client IP correctly.

```conf
server {

    # server name must match the DNS name where this site is served in order to be
    # routed correctly
    server_name app.example.com;

    # Listen for connection on (internal to container) port 80
    # This NGINX config should only be used behind another one on
    # the server's host which configures SSL/domains/etc.
    listen 80;

    real_ip_header proxy_protocol;

    location / {

        proxy_set_header      Host              $http_host;
        proxy_set_header      X-Forwarded-By    $server_addr:$server_port;
        proxy_set_header      X-Forwarded-For   $http_x_forwarded_for;

        # if this header is set to https, django assumes this connection is secured by an upstream reverse proxy
        # I'm going to force the upstream to do this, in order to make sure they think about whether they really
        # are secured by SSL
        # If you're getting infinite redirects, its probably because this header is not set to 'https'
        # proxy_set_header      X-Forwarded-Proto https;

        proxy_set_header      X-Real-IP         $remote_addr;
        proxy_set_header      CLIENT_IP         $remote_addr;

        proxy_pass_request_headers on;

        proxy_redirect off;

        client_max_body_size 1G;

        proxy_buffering off;
        proxy_request_buffering off;

        # this should be the hostname of your application server container
        # and its port should match the port exposed in docker-compose.yml
        proxy_pass http://your-application-server:8000;
    }

    # Redirect any requests for static files
    location /static/ {
        alias /var/www/static/;
        autoindex on;

        # Caching settings
        expires 30d;
        add_header Pragma public;
        add_header Cache-Control "public";
    }

    # Redirect any requests for media files
    location /media/ {
        alias /var/www/media/;

        # TODO!
        # Media files require user authentication
        # auth_request /auth;

        # Content header to force download (omitted by default, but add if needed)
        # add_header Content-disposition "attachment";
    }

    # Use the 'user' API endpoint for auth
    # location /auth {
    #     internal;

    # need to ensure the URLs are set and configured appropriately, see inventree for example
    #     proxy_pass http://your-application-server:8000/auth/;

    #     proxy_pass_request_body off;
    #     proxy_set_header Content-Length "";
    #     # this header will allow you to redirect to the correct spot after authenticating
    #     proxy_set_header X-Original-URI $request_uri;
    # }

}
```
