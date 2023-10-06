# Kroki Diagrams

## Documentation

See [official docs](https://kroki.io/) for more detailed instructions.

## Pull and run the container

If all you need is the standard kroki server with no companion servers, you can simply run the following

```bash
sudo docker run -d --name kroki -p8000:8000 yuzutech/kroki
```

If, however, you need to add additional companion servers, using `docker compose` is the simplest method. The following is an example configuration

```yml
version: "3"
services:
  kroki:
    image: yuzutech/kroki
    restart: always
    depends_on:
      - blockdiag
      - mermaid
      - bpmn
      - excalidraw
    environment:
      - KROKI_BLOCKDIAG_HOST=blockdiag
      - KROKI_MERMAID_HOST=mermaid
      - KROKI_BPMN_HOST=bpmn
      - KROKI_EXCALIDRAW_HOST=excalidraw
    ports:
      - "8000:8000"
  blockdiag:
    image: yuzutech/kroki-blockdiag
    restart: always
    expose:
      - "8001"
  mermaid:
    image: yuzutech/kroki-mermaid
    restart: always
    expose:
      - "8002"
  bpmn:
    image: yuzutech/kroki-bpmn
    restart: always
    expose:
      - "8003"
  excalidraw:
    image: yuzutech/kroki-excalidraw
    restart: always
    expose:
      - "8004"
```

## Open the firewall port

```bash
sudo firewall-cmd --zone=public --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

## Browse to service

```bash
http://hostname:8000
```

## Enable Insecure Content for Chrome

By default, chrome disallows insecure content on secured sites. Use this workaround, allow insecure content

chrome://settings/content/siteDetails?site=https%3A%2F%2Fgitlab.example.com%2F

## Enabling SSL

See [the docs](https://docs.kroki.io/kroki/setup/configuration/#_enabling_ssl_on_the_server) for more info, if  needed

Use Nginx with following config

```bash
# Redirect all non-encrypted to encrypted
server {
    server_name kroki.example.com;
    listen kroki.example.com:80;
    return 301 https://kroki.example.com$request_uri;
}

# SSL configuration
server {
    server_name kroki.example.com;
    listen kroki.example.com:443;

    ssl on;
    ssl_certificate /etc/pki/tls/certs/kroki.example.com.crt;
    ssl_certificate_key /etc/pki/tls/private/kroki.example.com.key;

    client_max_body_size 4G;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Nginx SELinux

If getting permission denied messages, run this

```bash
# try this first...
setsebool -P httpd_can_network_relay 1
# if it doesn't work run this
setsebool -P httpd_can_network_connect 1

# also need this for the wavedrom editor
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/var/www(/.*)?"
sudo restorecon -Rv /var/www
```

## Wavedrom Editor

Clone repo, then open `editor.html`
```
git clone https://github.com/wavedrom/wavedrom.github.io.git
```
