# Let's Encrypt + AWS Route53

Getting a certificate from Let's Encrypt using the AWS cli is very straightforward. This method also includes automatic notification and renewal of expiring certificates. It requires that you are managing your domain through AWS Route 53.

## Install

Install dependencies. Assuming a RHEL system

```bash
# enable EPEL for RHEL 8/9
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
# install snap + certbot, if not already installed
sudo dnf install snapd
sudo systemctl enable --now snapd.socket
sudo ln -s /var/lib/snapd/snap /snap
# ensure we're running latest version of snap
sudo snap install core
sudo snap refresh core
# remove any existing certbot packages
sudo dnf remove certbot

# create symlink for classic snaps
ln -s /var/lib/snapd/snap /snap

# install certbot snap
sudo snap install --classic certbot
# ensure certbot is available on path
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# install route53 plugin
# RHEL 8
sudo dnf install python3-certbot-dns-route53
# RHEL 9 
sudo snap install certbot-dns-route53

# we need the aws cli to set up our credentials
sudo dnf install awscli
```

## Configure AWS

We need to provide the AWS cli with our credentials for `certbot` to use. Enter your `AWS_ACCESS_KEY` and `AWS_SECRET_ACCESS_KEY` when prompted.

```bash
# NOTE: use sudo, so that it configures under root user. sudo needed for certbot
sudo aws configure
```

## Request Certificate

We are now ready to request our certificate from Let's Encrypt. The email address specified will be notified on expiration.

```bash
sudo certbot -v certonly --dns-route53 -m email@example.com -d example.com
# add any additional DNS names by specifying additional "-d domain.example.com" options
# For example,
sudo certbot -v certonly --dns-route53 -m email@example.com -d subdomain1.example.com -d subdomain2.example.com -d subdomain3.example.com .....
```

## Test Renewal

During the above process, a scheduled job (via `systemd` timers, show with `systemctl list-timers --all`) should have been created for automatic renewals. We can test to make sure this renewal process will work as expected by performing a dry run.

```bash
sudo certbot renew --dry-run
```

## Manual Renewal

If you'd like to manually renew an expiring certificate, run

```bash
# renew a certificate that is near expiration
certbot renew 

# force a renewal that is not near expiration date
certbot renew --force-renewal

# specify domains
certbot renew -d domain.example.com
```

## Removal

If you need to remove the certificate and stop automatic renewal, you can do so.

```bash
certbot delete --cert-name example.com
```

## Permissions

By default, the directory `/etc/letsencrypt/archive` has permissions `700` and owned by `root`. Directory `/etc/letsencrypt/live` contains symlinks to the archive folder, so these symlinks effectively have `700` permissions as well. This means that any non-root process that attempts to use these certificates will not have the permission to do so.

One option is to make the `/etc/letsencrypt` folder more permissive so that it is world readable. For example,

```bash
chmod 755 -R /etc/letsencrypt
```

While this will allow you to use these certificates by any non-root process, you should understand and accept the risks of doing so. Any process on your machine may now obtain copies of both the `fullchain.pem`, and most importantly, the `privkey.pem`. As a result, your domain and trusted certificate may now be served by anyone who got the copy imitating your site and your domain. Knowing this, you should only do this on a trusted system in a trusted environment where the implications of such a possibility are low-impact.

A better solution would be to create a `ssl` (or similarly named) group, `chown`'ing the `/etc/letsencrypt` directory to have that group, and adding whatever non-root user needed for your application to that group. Then, make the files group readable with `chmod 750 -R /etc/letsencrypt`.
Upon renewal, you should not have to mess with permissions because the directory is the entity protecting these files, not the permissions on individual certs.
