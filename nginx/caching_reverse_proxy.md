# Caching Reverse Proxy

There is a [great guide](https://www.nginx.com/blog/nginx-caching-guide/) for this on NGINX's website.

An example caching reverse proxy configuration is shown here that caches up to 10 gigs of data for 1 day. It also captures redirects recursively.

```conf

proxy_cache_path /srv/nginx/cache
                 levels=1:2
                 keys_zone=your_cache_name:10m
                 max_size=10g
                 inactive=1d
                 use_temp_path=off;
proxy_cache_key "$scheme$request_method$host$request_uri";
#proxy_cache_valid 200 302 1d; # only required if you're ignoring cache headers


server {
  listen              443 ssl;
  server_name         example.com;

  ssl_certificate     /etc/ssl/certs/example.crt;
  ssl_certificate_key /etc/ssl/private/example.key;
  ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers         HIGH:!aNULL:!MD5;

  client_max_body_size 1G;

  location / {

    # Cache Settings
    proxy_cache your_cache_name;
    # By default, NGINX will respect headers which specify caching settings. Can disable this by ignoring these headers. Must also specify proxy_cache_valid above
    #proxy_buffering on;
    #proxy_ignore_headers Expires;
    #proxy_ignore_headers X-Accel-Expires;
    #proxy_ignore_headers Cache-Control;
    #proxy_cache_valid any 10s;
    #proxy_ignore_headers Set-Cookie;
    add_header X-Proxy-Cache $upstream_cache_status;

    # intercept and follow redirects internally
    proxy_intercept_errors on;
    recursive_error_pages on; # remove if you don't want recursive redirect follows
    error_page 301 302 307 = @handle_redirects;

    # existing PyPi config
    proxy_set_header  Host $host:$server_port;
    proxy_set_header  X-Forwarded-Proto $scheme;
    proxy_set_header  X-Real-IP $remote_addr;
    proxy_pass        http://localhost:8000;

  }

  location @handle_redirects {
    # handle recursive case, remove if unwanted
    proxy_intercept_errors on;
    error_page 301 302 307 = @handle_redirect;
    # follow redirect
    resolver x.x.x.x; # required! Specify ip of DNS server if proxy_pass contains a variable. Why, I don't know
    proxy_ssl_name $host; # may required if proxy to ssl
    proxy_ssl_server_name on; # may required if proxy to ssl
    # must first save value of variable, and then give to proxy_pass. Why, I don't know. Doesn't work without it
    set $saved_redirect_location '$upstream_http_location';
    proxy_pass $saved_redirect_location;
  }
}
```

## SELinux 

After creating your reverse proxy in NGINX, you need to modify the SELinux settings. In addition, you may need to modify SELinux permissions for the directory of your cache

```bash
sudo setsebool -P httpd_can_network_connect 1
```
