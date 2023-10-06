# MinIO Production Environment

To set up a MinIO cluster in a production environment, refer to MinIO's [Multi-Node Multi-Drive deploy documentation](https://min.io/docs/minio/linux/operations/install-deploy-manage/deploy-minio-multi-node-multi-drive.html).

My specific implementation is detailed below, where I differ from the documentation or want to clarify further.

## Mount Points

This setup assumes 4 servers, each with 4 drives each. On each server, drives are sequentially mounted and unlocked on boot via `/etc/crypttab` and `/etc/fstab`.

```bash
# /etc/crypttab
# attached encrypted XFS disks for MinIO
minio1  UUID=DISK UUID GOES HERE       /path/to/keyfile
minio2  UUID=DISK UUID GOES HERE       /path/to/keyfile
minio3  UUID=DISK UUID GOES HERE       /path/to/keyfile
minio4  UUID=DISK UUID GOES HERE       /path/to/keyfile
```

In `/etc/fstab`, we've mounted with the `noatime` option so reads do not require writing (to update the access time). We've also specified the `pass` value of `2` to specify the filesystem should be checked at boot in that sequence.

```bash
# attached encrypted XFS drives for MinIO
# NOTE: MinIO recommends labeled filesystems for predictable mount positions
# don't worry, these mapper paths are deterministic and consistent by disk UUID in my /etc/crypttab
# <file system>         <mount point>  <type>   <options>           <dump><pass>
/dev/mapper/minio1      /mnt/minio1     xfs     defaults,noatime        0 2
/dev/mapper/minio2      /mnt/minio2     xfs     defaults,noatime        0 2
/dev/mapper/minio3      /mnt/minio3     xfs     defaults,noatime        0 2
/dev/mapper/minio4      /mnt/minio4     xfs     defaults,noatime        0 2
```

## Environment File

```ini
# Set the hosts and volumes MinIO uses at startup
# The command uses MinIO expansion notation {x...y} to denote a
# sequential series.
#
# The following example covers four MinIO hosts
# with 4 drives each at the specified hostname and drive locations.
# The command includes the port that each MinIO server listens on
# (default 9000)

MINIO_VOLUMES="https://minio{1...4}.example.com:9000/mnt/minio{1...4}/minio_data"

# Set all MinIO server options
#
# The following explicitly sets the MinIO Console listen address to
# port 9001 on all network interfaces. The default behavior is dynamic
# port selection.

MINIO_OPTS="--console-address :9091"

# Set the root username. This user has unrestricted permissions to
# perform S3 and administrative API operations on any resource in the
# deployment.
#
# Defer to your organizations requirements for superadmin user name.

MINIO_ROOT_USER=minioadmin

# Set the root password
#
# Use a long, random, unique string that meets your organizations
# requirements for passwords.

MINIO_ROOT_PASSWORD=minioadminpassword

# Set to the URL of the load balancer for the MinIO deployment
# This value *must* match across all MinIO servers. If you do
# not have a load balancer, set this value to to any *one* of the
# MinIO hosts in the deployment as a temporary measure.
MINIO_SERVER_URL="https://minio.example.com:443"

# Storage Classes
# Default values are EC:4 for standard and EC:2 for reduced redundancy
MINIO_STORAGE_CLASS_STANDARD="EC:4"
MINIO_STORAGE_CLASS_RRS="EC:2"

# LDAP Settings
MINIO_IDENTITY_LDAP_SERVER_ADDR="ldap.example.com:636"
MINIO_IDENTITY_LDAP_TLS_SKIP_VERIFY="on"
MINIO_IDENTITY_LDAP_LOOKUP_BIND_DN="CN=ldap lookup user,OU=example,OU=example,OU=example,DC=example,DC=example"
MINIO_IDENTITY_LDAP_USER_DN_SEARCH_BASE_DN="ou=example,ou=example,dc=example,dc=example"
MINIO_IDENTITY_LDAP_USER_DN_SEARCH_FILTER="(&(objectCategory=user)(sAMAccountName=%s))"
MINIO_IDENTITY_LDAP_LOOKUP_BIND_PASSWORD="super_secret_password"
MINIO_IDENTITY_LDAP_GROUP_SEARCH_FILTER="(&(objectClass=group)(member=%d))"
MINIO_IDENTITY_LDAP_GROUP_SEARCH_BASE_DN="ou=example,dc=example,dc=example"
```

## Enable TLS

To enable TLS, we must place a valid certificate and private key in the `${HOME}/.minio/certs` directory. This home directory corresponds to the user that runs MinIO, configured in the `systemd` service file and most likely `minio-user` if you followed their documentation exactly. In this case,

```bash
# .crt and .key files go here
/home/minio-user/.minio/certs
# Trusted CA (if using self-signed) goes here
/home/minio-user/.minio/certs/CAs
```

The certificates must have the exact names `public.crt` and `private.key`, or else the server will refuse to start with TLS enabled. If you're using Let's Encrypt, be sure to use `fullchain.pem` as your `public.crt` to ensure clients trust the certificate and can tell it's coming from the Let's Encrypt CA.

Once you have the certificates in the correct location, TLS should be enabled automatically after a restart. Regardless if you're using a symlink or an actual file for the certificate, the `minio-user` must have permissions to read the location they're pointing to.

## Load Balancer Front

We can front with NGINX to act as a load balancer for our MinIO deployment. This example uses a separate subdomain for API vs console access.

```conf
# log formatting, enabling us to see which upstream the load balanced requests will be sent to
log_format upstreamlog '[$time_local] $remote_addr - $remote_user - $server_name $host to: $upstream_addr: $request $status upstream_response_time $upstream_response_time msec $msec request_time $request_time';

upstream minio {
   least_conn;
   server minio1.example.com:9000;
   server minio2.example.com:9000;
   server minio3.example.com:9000;
   server minio4.example.com:9000;
}

upstream minio_console {
   least_conn;
   server minio1.example.com:9091;
   server minio2.example.com:9091;
   server minio3.example.com:9091;
   server minio4.example.com:9091;
}

server {
    listen minio.example.com:80;
    server_name minio.example.com;

    return 301 https://$server_name$request_uri;
}

server {
   listen       minio.example.com:443;
   # listen  [::]:443;
   server_name  minio.example.com;

   # logging
   access_log /var/log/nginx/minio_access.log upstreamlog;
   error_log /var/log/nginx/minio_error.log;

   # SSL Configuration
   ssl on;
   ssl_certificate /etc/letsencrypt/live/minio.example.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/minio.example.com/privkey.pem;

   # Allow special characters in headers
   ignore_invalid_headers off;
   # Allow any size file to be uploaded.
   # Set to a value such as 1000m; to restrict file size to a specific value
   client_max_body_size 0;
   # Disable buffering
   proxy_buffering off;
   proxy_request_buffering off;

   location / {
      proxy_set_header Host $http_host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_connect_timeout 300;
      # Default is HTTP/1, keepalive is only enabled in HTTP/1.1
      proxy_http_version 1.1;
      proxy_set_header Connection "";
      chunked_transfer_encoding off;

      proxy_pass https://minio; # This uses the upstream directive definition to load balance
   }
}

server {
    listen console.minio.example.com:80;
    server_name console.minio.example.com;

    return 301 https://$server_name$request_uri;
}

server {

   listen       console.minio.example.com:443;
   # listen  [::]:443;
   server_name  console.minio.example.com;

   # logging
   access_log /var/log/nginx/minio_access.log upstreamlog;
   error_log /var/log/nginx/minio_error.log;

   # SSL Configuration
   ssl on;
   ssl_certificate /etc/letsencrypt/live/minio.example.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/minio.example.com/privkey.pem;

   # Allow special characters in headers
   ignore_invalid_headers off;
   # Allow any size file to be uploaded.
   # Set to a value such as 1000m; to restrict file size to a specific value
   client_max_body_size 0;
   # Disable buffering
   proxy_buffering off;
   proxy_request_buffering off;

   location / {
      proxy_set_header Host $http_host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-NginX-Proxy true;

      # This is necessary to pass the correct IP to be hashed
      real_ip_header X-Real-IP;

      proxy_connect_timeout 300;

      # To support websocket
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";

      chunked_transfer_encoding off;

      proxy_pass https://minio_console; # This uses the upstream directive definition to load balance and assumes a static Console port of 9091
   }
}
```
