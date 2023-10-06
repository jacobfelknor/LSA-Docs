# NGINX Caching Learning Experience

Recently, I tried to front a pypi server with a NGINX caching reverse proxy. While I didn't accomplish exactly what I set out for, I learned a lot and wanted to document some of that here. Originally, I needed to pass credentials using the proxy because the GitLab registry I was fronting required it but I did not want to require end users installing from `pip` to know the credentials. This avoided circulating a "magic url" which had the possibility of changing, requiring everyone to update it.

## First Attempt

My first attempt was to have the NGINX server simply redirect to a password protected gitlab registry. It did not contain any caching.

```conf
server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  _;

        return 302 https://username:password@gitlab.example.com/api/v4/projects/488/packages/pypi/simple$request_uri;
}
```

This did work initially, but I didn't like the fact that it literally just redirected and did not appear to be coming from the proxy server.

## Second Attempt

My second attempt was to actually use a `proxy_pass` so that the client stays connected to the proxy origin instead of redirecting to some external site. There was still no caching here. The following config worked for this, and I was able to pass base64 encoded credentials as a header:

```conf
server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  _;
        
        location / {
            proxy_redirect off;
            proxy_set_header Host $proxy_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass https://gitlab.example.com/api/v4/projects/488/packages/pypi/simple/; # trailing slash important!

            # can pass credentials, if needed. encode the 'username:password' string
            proxy_set_header Authorization "Basic <base64_encoded_credentials>";
       }
}
```

This appeared to work, but it breaks down once `pip` tries to install anything. The response from the pypi server returns a bunch of absolute urls of which `pip` opens a new HTTPS connection to directly, skipping the proxy containing the credentials.

## Third Attempt

At this point, I stopped trying to front a pypi index requiring authentication and moved to placing a cache in front so that large external packages from the internet could be cached.

Including caching is relatively simple. For example, to allow nginx to cache up to 10 gigabytes of data for up to 1 hour:

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

Great, now that I got my cache set up, lets try some `pip` installs. Wait... the cache doesn't contain what I expected it to. This was one of the cached responses:

```text
KEY: https://pypi.example.com/simple/django/
HTTP/1.0 302 Found
Date: Thu, 08 Dec 2022 01:06:16 GMT
Server: WSGIServer/0.2 CPython/3.6.8
Location: https://pypi.org/simple/django/
Content-Length: 0
Content-Type: text/html; charset=UTF-8
```

Caching will provide no benefit to you if the proxy returns redirects. A redirect response will be cached and sent back to client, who must then reach out to origin specified in the redirect. When the client makes a request to the specified origin in the redirect, it doesn't go through your proxy, defeating its purpose.

## Fourth Attempt

But what if you can follow redirects internally, and just send the final response back to client? Turns out, there are methods to do exactly that. Here's an example to follow a single redirect:

```conf

location / {
    # ...
    # intercept and follow redirects internally
    proxy_intercept_errors on;
    error_page 301 302 307 = @handle_redirects;
    # ...
}

location @handle_redirects {
    # follow redirect
    resolver x.x.x.x; # required! Specify ip of DNS server if proxy_pass contains a variable. Why, I don't know
    proxy_ssl_name $host; # may required if proxy to ssl
    proxy_ssl_server_name on; # may required if proxy to ssl
    # must first save value of variable, and then give to proxy_pass. Why, I don't know. Doesn't work without it
    set $saved_redirect_location '$upstream_http_location';
    proxy_pass $saved_redirect_location;
}

```

The above works, but what if the redirect redirects you? We can make the above recursive with some slight modification.

```conf

location / {
    # ...
    # intercept and follow redirects internally
    proxy_intercept_errors on;
    recursive_error_pages on;
    error_page 301 302 307 = @handle_redirects;
    # ...
}

location @handle_redirects {
    # handle recursive case
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
```

Finally!! Our caching proxy properly serves requests properly, both for internal packages and external packages. You can prove it works by visiting the simple index for a package you do not host, such as  `pypi.example.com/simple/numpy`, and one that you do. You'll see that you're not redirected, and it appears that you host both internal and external packages and the same index.

Plus, it looks like internal packages are being cached properly. But... external packages are NOT being cached. The reason circles back to something we discovered earlier. The index returns an *absolute* URL to the download location to `pip`. For internal packages, these URLs point to our internal server at `pypi.example.com`, so they go through the proxy. However, for external packages, these URLs point to `files.pythonhosted.org`. This results in `pip` skipping our proxy and making a new connection to that domain.

We can confirm this behavior by passing `-vv` to `pip` during an install. The following is contained in the output

```text
No cache entry available
  Starting new HTTPS connection (1): files.pythonhosted.org:443
  https://files.pythonhosted.org:443 "GET /packages/56/0f/806e1c23489efbce008be1d063dbbe1b5634da914c3cd94659d84794db96/django-dojo-0.0.1.tar.gz HTTP/1.1" 200 29708999
  Downloading django-dojo-0.0.1.tar.gz (29.7 MB)
     ━━━━━╸━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4.4/29.7 MB 22.6 MB/s eta 0:00:02
```

## Possible Future Work

Now that we know there is an external absolute URL we have to handle, can we place a caching proxy in front of that? This would require that we point internal DNS for `files.pythonhosted.org` to our proxy, but we could probably apply similar methods as above to cache this site.

It probably would work, but there may be a better solution out there. Using something like [devpi](https://www.devpi.net/) probably makes more sense.
