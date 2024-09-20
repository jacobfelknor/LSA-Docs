# Log Rotation for Chatty Log Files

If an application on your Linux server has very chatty logs, or if you'd otherwise like to split up and compress certain log files, we can use `logrotate` to accomplish this. On most Linux machines, the configuration for `logrotate` lives under `/etc/logrotate.d/`. Many packages you install come with `logrotate` configurations that get placed here during installation. For example, `nginx` comes with the default configuration of

```conf
/var/log/nginx/*log {
    create 0664 nginx root
    daily
    rotate 10
    missingok
    notifempty
    compress
    sharedscripts
    postrotate
        /bin/kill -USR1 `cat /run/nginx.pid 2>/dev/null` 2>/dev/null || true
    endscript
}
```

You may explore other default configurations for packages you've installed in order to gain some inspiration for how you want to write your own. For a full list of options, see the [logrotate man page](https://linux.die.net/man/8/logrotate)

## Case Study: NGINX

The situation which led me to discover `logrotate` and write these notes came up for a particularly chatty NGINX log file that grew to over 10 GB, filling my `/var/log` volume and crashing the `mongod` service (unrelated to the chatty NGINX log) which depended on this volume having free space.

I was perplexed that the log grew to such a size because I knew that NGINX logs in the past had gone through rotation, and were compressed and deleted in time. At the time I thought this was NGINX doing this itself, not some other process which NGINX configured, so was unsure why it wasn't happening in this case.

After discovering `logrotate` and inspecting the NGINX config for it, the answer became clear: I was not storing this chatty NGINX file in the location which the NGINX `logrotate` config expected me to. I was instead using subfolders within `/var/log/nginx`, so instead of a pattern like `/var/log/nginx/app_access.log`, I used `/var/log/nginx/app/access.log`, which no longer matched the wildcard. To fix, I added a block to `/etc/logrotate.d/nginx` including a new wildcard

```conf
# KEEP existing block so that default access and error logs are still rotated
/var/log/nginx/*log {
    create 0664 nginx root
    daily
    rotate 10
    missingok
    notifempty
    compress
    sharedscripts
    postrotate
        /bin/kill -USR1 `cat /run/nginx.pid 2>/dev/null` 2>/dev/null || true
    endscript
}

# ADD this block to catch my logs which were under subdirs
/var/log/nginx/**/*log {
    create 0664 nginx root
    daily
    rotate 10
    missingok
    notifempty
    compress
    sharedscripts
    postrotate
        /bin/kill -USR1 `cat /run/nginx.pid 2>/dev/null` 2>/dev/null || true
    endscript
}
```
