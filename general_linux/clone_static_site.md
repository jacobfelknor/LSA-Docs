# Clone a Static Website

source: <https://superuser.com/a/999189>

Sometimes it can be helpful to make a copy of a public static website. You can use this copy as a mirror, serve it in an offline environment, or serve it to a network where the external version is blocked.
It is relatively simple to make the clone with the `wget` command.

```bash
wget --mirror --convert-links --adjust-extension --page-requisites --no-parent https://example.com
```

Explanation of the various flags:

```text
--mirror 
    – Makes (among other things) the download recursive.
--convert-links
    – Convert all the links (also to stuff like CSS stylesheets) to relative, so it will be suitable for offline viewing.
--adjust-extension
    – Adds suitable extensions to filenames (html or css) depending on their content-type.
--page-requisites
    – Download things like CSS style-sheets and images required to properly display the page offline.
--no-parent
    – When recursing do not ascend to the parent directory. It useful for restricting the download to only a portion of the site.
```

After cloning, you can serve your [static files via NGINX](../nginx/static_site.md)
