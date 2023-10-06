# NGINX Dynamic DNS Resolution

> Inspired by <https://medium.com/driven-by-code/dynamic-dns-resolution-in-nginx-22133c22e3ab>

Commonly, we set up a `proxy_pass` inside NGINX in order to forward traffic to the end webserver handling requests. This `proxy_pass` is also usually specified using a domain name, like this

```conf
server {
    listen 80;
    server_name proxy.example.com;
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # pass to other server
        proxy_pass https://webserver.example.com;
    }
}
```

However, by default the name `webserver.example.com` is resolved **only once when NGINX is started.** If the IP address associated with that domain changes, NGINX will continue sending traffic to the IP that was resolved at startup, resulting in failures.

We can address this with a couple modifications to our NGINX config. We will first add a [resolver directive](http://nginx.org/en/docs/http/ngx_http_core_module.html#resolver). This is important because NGINX implements a non-blocking resolver that can quickly respond to all NGINX connections. If you omit this directive, NGINX will using the [blocking system resolver](https://stackoverflow.com/a/40331256) and each connection must wait on the previous to complete. Once we add the resolver directive, we're free to make the change triggering the name to be resolved on each request. We do this by setting a variable to the domain name, because NGINX evaluates the value of the variable per-request. This forces the `proxy_pass` location to be re-evaluated every request, in turn being resolved before forwarding the traffic.

The modified configuration would look something like

```conf
server {
    listen 80;
    server_name proxy.example.com;
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # new lines here!
        resolver 192.168.0.1;
        set $webserver webserver.example.com;
        # original proxy pass
        proxy_pass https://$webserver;
    }
}
```
