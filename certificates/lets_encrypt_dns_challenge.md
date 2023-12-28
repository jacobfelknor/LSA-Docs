# Generic DNS Challenge for Let's Encrypt

## Installation and Setup

```bash
# install certbot
sudo snap install certbot --classic

# get cert
sudo certbot certonly [--dry-run] --manual --preferred-challenges dns-01 \
-d example.com -d www.example.com [...]
# add specified DNS entries
# Should be good! For ex,
# Certificate is saved at: /etc/letsencrypt/live/jacobfelknor.com/fullchain.pem
# Key is saved at:         /etc/letsencrypt/live/jacobfelknor.com/privkey.pem

# Renew
Without a manual auth hook, certs must be renewed manually by running the same command we did to obtain the cert
```

