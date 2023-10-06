# NGINX Under Maintenance Page

When pushing updates to your site, it can be confusing for users if the update requires downtime. From the user's perspective, it may just look like the site is being slow or not responding. This can be frustrating, especially in the case where they don't have any idea an update is being pushed.

Downtime is inevitable, so it is a better plan to have some sort of "site under maintenance" page returned to a user when upgrades happen. We can do this automatically through our deploy script and NGINX configuration.

## NGINX

In your NGINX config for the site you're targeting, add a conditional checking for the existence of a file.

```nginx
location / {

    # check for the existence of our maintenance page
    # return 503 if so
    # https://www.rfc-editor.org/rfc/rfc9110.html#name-503-service-unavailable
    if (-f /path/to/enable_maintenance_mode) {
        return 503;
    }

    # typical reverse proxy settings
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Host $http_host;
    proxy_redirect off;

    proxy_pass https://webserver.example.com;
}
```

Now, when our `enable_maintenance_mode` file exists, our webserver will return a `503` code for every request. By itself, this is not enough to fully satisfy our desired behavior. Users won't be left with their browser spinning wondering what's happening, but it also won't be clear to them why the error page was returned. A non-technical user won't know that a 503 error typically represents a site under maintenance.

To return our custom maintenance page, let's override the HTML returned on a 503. In NGINX's default configuration, you'll see something like the below:

```nginx
error_page 404 /404.html;
    location = /40x.html {
}
error_page 500 502 503 504 /50x.html;
    location = /50x.html {
}
```

We should remove the `503` from the default error list and add our own.

```nginx
error_page 404 /404.html;
    location = /40x.html {
}

error_page 500 502 504 /50x.html;
    location = /50x.html {
}

error_page 503 /under_maintenance.html;

location = /under_maintenance.html {
    # path to the directory containing under_maintenance.html
    root /path/to/dir;
}
```

## Automatically Enable Maintenance via Pipeline

Now, in your automated deploy pipeline, you should included a step placing the file you check for in NGINX in the appropriate location so that the maintenance mode is automatically enabled without any manual intervention upon deploy. At the end of the pipeline, once the new version of the application has been started, you should remove this file trigger to return NGINX to its normal functionality.

```bash
# enable our maintenance page
touch /path/to/enable_maintenance_mode
# do rest of deploy
...
# return site to normal operation
rm /path/to/enable_maintenance_mode
```
