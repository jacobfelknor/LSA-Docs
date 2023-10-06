# Deploy Python App gunincorn + nginx

If your python app is written in something like Flask or Django, a good option for a deployment is `gunicorn` + `nginx`.

## gunicorn

First, you should get a debug version of your app up and running with `gunicorn` binded to a IP socket and test that it is working correctly. The exact command will differ between Django/Flask, but it will look something like 

```bash
# Flask, wher server = app.server
gunicorn project_dir.main:server --bind 0.0.0.0:8000

# Django
gunicorn path.to.wsgi:application --bind 0.0.0.0:8000
```

At this point, you can confirm you can reach the application at the host on port 8000. If this works correctly, you can move on.

Next, we must create a `systemd` unit file so we can run our `gunicorn` process as a service. It should look something like this, adjusted for your use case:

```ini
[Unit]
Description=gunicorn daemon for your app
After=network.target

[Service]
User=user
Group=nginx # note nginx! make sure the socket created can be accessed by nginx group
WorkingDirectory=/path/to/app
ExecStart=/path/to/venv/bin/gunicorn path.to.wsgi:application \ # modify with correct version for your app
--workers 2 \ # optional
--bind unix:/path/to/application_name.sock \ # make sure this location is read/writeable by nginx!
--log-level info \ # optional if you want a specific log location
--error-logfile /path/to/logs/gunicorn_error.log, --log-file /path/to/logs/gunicorn.log \
--timeout 120

[Install]
WantedBy=multi-user.target
```

## nginx

Now that we have `gunicorn` configured correctly, we can set up the `nginx` config file. It should look something like

```conf
# Redirect all non-encrypted to encrypted, if you have SSL
#server {
#    server_name example.com;
#    listen example.com:80;
#    return 301 https://example.com$request_uri;
#}

server {
    server_name example.com;
    listen example.com:80; # change to 443 if using SSL (see below)

    # SSL configuration
    #ssl on;
    #ssl_certificate /etc/ssl/certs/example.com.crt;
    #ssl_certificate_key /etc/ssl/private/example.com.key;

    client_max_body_size 4G;

    #location = /favicon.ico { access_log off; log_not_found off; }
    #location /static/ {
    #    alias /srv/site/staticfiles/;
    #}
    #location /media/ {
    #    alias /srv/site/media/;
    #}
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Host $http_host;
        proxy_redirect off;

        if (!-f $request_filename) {
            proxy_pass http://unix://path/to/application_name.sock;
            break;
        }
    }
    gzip on;
    error_log /path/to/logs/nginx_error.log warn;
    access_log /path/to/logs/nginx_access.log;
}
```

Then, enable the site (see [NGINX include options notes](./include_folder_options.md)), ensure your `gunicorn` service is running, and restart `nginx`. Browse to your domain and your application should be there.
