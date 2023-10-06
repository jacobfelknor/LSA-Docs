# `pypiserver`

## Install

Omitted for now, see [official docs](https://pypi.org/project/pypiserver/)

## Location

Packages and environment are stored under `/srv/pypi` and are owned by the `pypi` user.

## Caching with `pypiserver`

If you want to take advantage of NGINX reverse proxy caching with `pypiserver`, you must specify in the `systemd` service file a `--cache-control` argument in seconds. For example, see this valid service file which will enable NGINX to cache:

```ini
[Unit]
Description=A minimal PyPI server for use with pip/easy_install.
After=network.target

[Service]
Type=simple
User=pypi
Group=pypi

ExecStart=/srv/pypi/envs/pypi_server/bin/pypi-server -p 8000 -P /srv/pypi/pypi_server/htpasswd.txt -v --log-file /srv/pypi/logs/pypiserver.log --cache-control 3600 /srv/pypi/pypi_server/packages/
ExecStop=/bin/kill -TERM $MAINPID
ExecReload=/bin/kill -HUP $MAINPID

Restart=always

WorkingDirectory=/srv/pypi/pypi_server

[Install]
WantedBy=multi-user.target
```

Then, you can enable caching through NGINX. For example, to allow nginx to cache up to 10 gigabytes of data for up to 1 hour:

```conf
proxy_cache_path /data/nginx/cache
                 levels=1:2
                 keys_zone=<name>_cache:10m
                 max_size=10g
                 inactive=60m
                 use_temp_path=off;

server {
    # ...
    location / {
        # any proxy_set_headers here...
        # ... 
        proxy_cache <name>_cache;
        # your existing proxy pass below...
        proxy_pass ...;
    }
}
```
