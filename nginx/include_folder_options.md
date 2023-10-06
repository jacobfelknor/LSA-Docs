# Options for Including Virtual Hosts

There are two main competing conventions for how we include multiple sites in a single NGINX configuration, and how best to manage whether a site is enabled or disabled in that config. It happens that each strategy comes by default on Ubuntu vs RHEL flavored versions of Linux.

## Using Sites Available/Enabled

This is the default when installing on Ubuntu flavored linux. This pattern for NGINX has `/etc/nginx/sites-available` and `/etc/nginx/sites-enabled` directories to control which sites are currently active vs what are available. Typically in this case, you store all the possible sites you may want enabled in the `sites-available` directory, then symlink the ones you want to enable to the `sites-enabled` directory.

> **NOTE:** When symlinking, create soft links and be careful about absolute vs relative paths! See [my docs on filesystem links](../general_linux/filesystem_link.md) for more info.

This style is typically already configured on Ubuntu flavored linux, but you can always set it up for yourself if you're on a different flavor.

```bash
# create the directories if they DNE
sudo mkdir -p /etc/nginx/sites-enabled
sudo mkdir -p /ets/ngins/sites-available
```

Then, add the following line to the `http` section of `/etc/nginx/nginx.conf`

```conf
http {
    ...
    include     /etc/nginx/sites-enabled/*;
    ...
}
```

## Using conf.d

This is the default when installing RHEL flavored linux. This pattern uses the `/etc/nginx/conf.d/*.conf` pattern for storing site configs. Instead of using different directories and symlinks, we instead control which sites are enabled/disabled by the extension inside the `/etc/nginx/conf.d` directory. If the file has extension `.conf`, the site is enabled. Anything else, (like `mysite.conf.disabled`, for example) and the site is not pulled into NGINX and is effectively disabled.

You can configure this style on other flavors as follows

```bash
# create the conf.d directory if it DNE
mkdir -p /etc/nginx/conf.d
```

Then, add the following line to the `http` section of `/etc/nginx/nginx.conf`

```conf
http {
    ...
    include     /etc/nginx/conf.d/*.conf;
    ...
}
```
