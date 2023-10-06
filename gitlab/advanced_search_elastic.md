# Elasticsearch Install

In my case, I was using Elasticsearch to configure Advanced Search in GitLab. Therefore, my Elasticsearch configuration was bare bones and did not feature any customization. I will document here any future more advanced set up if I find the need for it.

Follow instructions at <https://www.elastic.co/guide/en/elasticsearch/reference/current/rpm.html>

Specifically, take note of this output upon installation for your root `elastic` user's password and other helpful information:

```text
--------------------------- Security autoconfiguration information ------------------------------

Authentication and authorization are enabled.
TLS for the transport and HTTP layers is enabled and configured.

The generated password for the elastic built-in superuser is : xxxxxxxxxxxxxxxx

If this node should join an existing cluster, you can reconfigure this with
'/usr/share/elasticsearch/bin/elasticsearch-reconfigure-node --enrollment-token <token-here>'
after creating an enrollment token on your existing cluster.

You can complete the following actions at any time:

Reset the password of the elastic built-in superuser with
'/usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic'.

Generate an enrollment token for Kibana instances with
 '/usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana'.

Generate an enrollment token for Elasticsearch nodes with
'/usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s node'.

-------------------------------------------------------------------------------------------------
### NOT starting on installation, please execute the following statements to configure elasticsearch service to start automatically using systemd
 sudo systemctl daemon-reload
 sudo systemctl enable elasticsearch.service
### You can start elasticsearch service by executing
 sudo systemctl start elasticsearch.service
```

## SSL

On install by default, Elasticsearch configures itself with a self signed certificate for connections. Any client attempting to connect must trust the root CA used to sign the certificate.

One option is to distribute the root CA at `/etc/elasticsearch/certs/http_ca.crt` to your clients. For example, in my case I was configuring Elasticsearch with GitLab and placed the root ca in `/etc/gitlab/trusted-certs`.

It is also possible to [manually configure](https://www.elastic.co/guide/en/elasticsearch/reference/master/security-basic-setup-https.html) the security yourself. Reference the docs linked for more information.

## Create The Index

Though GitLab claims they will create an index for you, I haven't had any luck until I manually did so with the following

```bash
sudo gitlab-rake gitlab:elastic:create_empty_index
```

## Heap Memory Usage

By default, Elasticsearch will hog an absurd amount of memory on start (usually around 50% of the total available memory). We can tune this setting by editing `/etc/elasticsearch/jvm.options.d/heap.options`

```ini
# /etc/elasticsearch/jvm.options.d/heap.options
-Xms10g
-Xmx10g
```

## Previous Installation Errors

You may get an error on start if you're installing on a machine which had a previous installation that was removed. In my case, it reported itself as this in `/var/log/elasticsearch/elasticsearch.log`

```text
invalid configuration for xpack.security.transport.ssl - [xpack.security.transport.ssl.enabled] is not set, but the following settings have been configured in elasticsearch.yml : [xpack.security.transport.ssl.keystore.secure_password,xpack.security.transport.ssl.truststore.secure_password]
```

The fix ended up being removing the old keystore and generating a new one

```bash
rm /etc/elasticsearch/elasticsearch.keystore
/usr/share/elasticsearch/bin/elasticsearch-keystore create
```
