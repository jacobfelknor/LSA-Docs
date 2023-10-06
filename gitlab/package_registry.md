# Use GitLab Package Registry

GitLab can be used as PyPi compatible server using its Package Registry.

## Authentication

If you want to enforce authentication, even for installs, the project where the registry is hosted should be private or internal and you'll need to include token and passwords for all requests.

If you want to omit authentication for installing from the registry, you must create a public project. You can then omit the tokens for installs.

## Upload a Package

### Via `twine`

```bash
TWINE_PASSWORD=<token> TWINE_USERNAME=<token_name> python3 -m twine upload --repository-url https://gitlab.example.com/api/v4/projects/<id>/packages/pypi dist/*
```

### Via the API (appears broken for installs)

```bash
curl --request POST \
     --form 'content=@path/to/package' \
     --form 'name=pkg_name' \
     --form 'version=1.0.0' \
     --user <deploy_token_name>:<deploy_token> \
     "https://gitlab.example.com/api/v4/projects/<id>/packages/pypi"
```

> **IMPORTANT:** it appears publishing packages via the API does not work on pip install. Get 404 errors on the following url scheme. Uploading via `twine` still works.

```bash
https://gitlab.example.com/api/v4/projects/<id>/packages/pypi/files/package-py2.py3-none-any.whl#sha256=
```

## Group Deploy Token

Go to Settings -> Repository -> Repository Settings.

Create a deploy token with `read_package_registry`

## Packages to Remove

If you have any copies of official packages in your self hosted registry, you may need to remove these packages from the GitLab registry unless this is the behavior that you intend. GitLab will not forward requests to PyPi if it finds *any* versions in its registry that match what's being asked for. So, unless you want to host every version you'll need, it's better to remove these. For example, in my case, I removed these.

- numpy
- scipy

## NGINX reverse proxy

Nginx config so that you can serve gitlab's registry at the URL of your choice. Note that this will only work in case where authentication is not required for installs. The index returned by gitlab contains absolute urls, so your authentication will not be passed when `pip` goes to the absolute url instead of going through the proxy.

This config works for http, but has not been tested for https.

```conf
server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  _;
        # root         /usr/share/nginx/html;
        
        # this could also work, with the side effect that it doesn't appear to be coming from the proxy anymore
        # since it literally redirects
        # return 302 https://username:password@gitlab.example.com/api/v4/projects/<id>/packages/pypi/simple$request_uri;

        location / {
            proxy_redirect off;
            proxy_set_header Host $proxy_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass https://gitlab.example.com/api/v4/projects/<id>/packages/pypi/simple/; # trailing slash important!

            # can pass credentials, if needed. encode the 'username:password' string
            # proxy_set_header Authorization "Basic <base64_encoded_credentials>";
       }
}
```

## `pipenv` config

```ini
[[source]]
url = "https://username:password@gitlab.example.com/api/v4/projects/<id>/packages/pypi/simple"
verify_ssl = false
name = "gitlab"
```

## `pip` config

```ini
[global]
index-url = https://username:password@gitlab.example.com/api/v4/projects/<id>/packages/pypi/simple
trusted-host = example.com
```
