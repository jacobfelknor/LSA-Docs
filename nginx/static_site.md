# Simple Static Site Config

For the simple static sites you'd like to serve with NGINX, we can use the following config

```conf
server {
    listen example.com:80;
    server_name example.com;
    root /www/mysite;

    location / {
        # use autoindex if you'd like to see a file explorer
        # when navigating to a directory
        autoindex on;
        # change to whatever file should be index
        index index.html;
    }
}
```

Note that all locations must be relative to the root in the above example and match the filesystem. If instead you'd like to have different URL paths that the literal file structure on disk, we can use the `alias` directive instead of `root`. For example,

```conf
server {
    listen example.com:80;
    server_name example.com;

    location /the/url/path {
        alias /www/mysite/the/filesystem/path/;
        index index.html
    }

    location / {
        alias /www/mysite/;
        index index.html;
    }
}
```
