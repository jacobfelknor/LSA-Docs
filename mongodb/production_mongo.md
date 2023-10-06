# MongoDB In Production

## Install

You can generally follow the MongoDB install script documented in [mongo.md](./mongo.md). Production specific things to consider are documented here.

> NOTE: All of my documentation assumes a standalone MongoDB server designed for relatively small deployments. For clustering, sharding, highly available, or otherwise more advanced setup, you shouldn't follow this guide.

## SELinux

In order to ensure MongoDB runs smoothly, we should apply their offical SELinux policy as following

```bash
# dependencies
sudo dnf install git make checkpolicy policycoreutils selinux-policy-devel
# get source for policy
git clone https://github.com/mongodb/mongodb-selinux
# make and apply policy
cd mongodb-selinux
make
sudo make install
```

If using LDAP, you must also allow the `mongod` network access to this service

```bash
sudo setsebool -P mongod_can_connect_ldap 1
```

## Active Directory

It is possible to set up MongoDB to authenticate against a central Active Directory server. First, before enabling any authentication/authorization on the server, create a local admin account with permissions to administer any database and also read/write to any database. Keep this password safe! This will allow us to recover from any problems in the future with bad LDAP settings. Enter a `mongosh` shell on the machine where the server is installed.

```js
use admin;
db.createUser(
    {
      user: "admin",
      pwd: passwordPrompt(), // instead of cleartext password
      roles: [
        { role: "userAdminAnyDatabase", db: "admin" },
        { role: "readWriteAnyDatabase", db: "admin" }
      ]
    }
  );
```

Once we have our local admin user, we can enable authorization on the server and specify our LDAP settings as shown. Additionally, we ensure that the [localhost exception](https://www.mongodb.com/docs/manual/core/localhost-exception/) is turned off.

```yaml
# Auth
security:
  authorization: enabled
  # LDAP Settings
  ldap:
    transportSecurity: 'tls'
    servers: "ldap.example.com:636"
    authz:
      queryTemplate: "ou=EXAMPLE,dc=EXAMPLE,dc=EXAMPLE??sub?(&(objectClass=group)(member:1.2.840.113556.1.4.1941:={USER}))"
    userToDNMapping: '[{ match : "(.+)", ldapQuery: "ou=EXAMPLE,ou=EXAMPLE,dc=EXAMPLE,dc=EXAMPLE??sub?(sAMAccountName={0})"}]'
    bind:
      queryUser: "ldap_user@example.com"
      queryPassword: "supersecretpassword"

setParameter:
  authenticationMechanisms: 'PLAIN,SCRAM-SHA-1'
  enableLocalhostAuthBypass: 0
```

### Test Setup 

We can test that our LDAP configuration is correct with the `mongoldap` utility. Beware that it requires typing a plaintext password as an argument which will appear in your bash history, so use a shared or test user that this is acceptable for.

```bash
mongoldap --config /etc/mongod.conf --user username --password password
```

If this is successful, you should see something like this

```text
Running MongoDB LDAP authorization validation checks...
Version: 6.0.5

Checking that an server has been specified...
[OK] LDAP server(s) provided in configuration

Checking that the DNS names of the LDAP servers resolve...
        * LDAP Host: ldap.example.com was successfully resolved to address: ldap.example.com
[OK] All DNS entries resolved


Parsing MongoDB to LDAP DN mappings...
[OK] MongoDB to LDAP DN mappings appear to be valid

Attempting to authenticate against the LDAP server...
[OK] Successful authentication performed

Checking if LDAP authorization has been enabled by configuration...
[OK] LDAP authorization enabled

Parsing LDAP query template...
[OK] LDAP query configuration template appears valid

Executing query against LDAP server...
[OK] Successfully acquired the following roles on the 'admin' database:
        * CN=example,OU=example,OU=example,DC=example,DC=example

        ***and so on for each additional group***
```

### Authenticate with Real User

Now that we've verified our LDAP configuration is correct, we can try logging in as a real AD user. Be sure to specify the authentication database and mechanism.

```bash
mongosh -u "username" --authenticationDatabase '$external' --authenticationMechanism 'PLAIN' --host mongodb.example.com --port 443 --tls
```

You should be able to log in successfully, but will have no permissions. This is expected, since we haven't created any roles yet for the authenticated user. To do so, log in with our local admin user and run the following. Ensure the role name matches the AD group you wish to match these permissions with.

```js
use admin;
db.createRole(
   {
     role: "CN=example,OU=example,OU=example,DC=example,DC=example",
     privileges: [],
     roles: [ "your role here!" ]
   }
)
```

## Direct SSL

It is possible to enable SSL access to MongoDB. Obtaining a certificate is outside the scope of this documentation. Once you have your certificate and private key, you are ready to start configuring MongoDB.

First, it is likely that you got your cert and private key as separate files. MongoDB expects these to be in a single file, so we must append the content of the private key to the pem file like this:

```bash
cat privkey.pem >> mongodb.example.com.crt
```

Once we have this combined certificate, we will modify `/etc/mongod.conf` and add TLS settings to the `net:` section.

```yaml
net:
  port: ....
  bindIp: ....
  tls:
    mode: requireTLS
    certificateKeyFile: /path/to/mongodb.example.com.crt
```

## Proxied SSL

It is also possible to enable SSL access to MongoDB by proxying the connection through something like NGINX. Even though we will proxy with NGINX, a dedicated IP address is still required for this to work if you're sharing port 443 with other web HTTP resources on the same server. This is because Mongo communicates over raw TCP streams and doesn't use HTTP directly. We can share IPs on port 443 for HTTP because its request headers include which name they are attempting to reach (example.com vs example2.com).

However, this may be desireable because it centralizes and simplifies your certificate management. Instead of ensuring the Mongo daemon has the correct permissions to read certificates, we can just let NGINX handle this who is already configured to do so (because it runs as root). In addition, it also allows us to leave MongoDB binded only to `localhost`.

> **WARNING:** If proxying through NGINX, all requests will appear to be coming from `localhost` according to Mongo. Ensure the localhost exception is disabled!


All that being said, we can front MongoDB with NGINX with the following config, specified in `/etc/nginx/nginx.conf`.

> **NOTE:** placing this config in a file under `/etc/nginx/sites-available` will NOT work, because those files get included under the `http` directive!

```conf
# MongoDB specific traffic. Must listen on a dedicated IP address
# Must be in stream directive, not http, because Mongo communicates
# over raw TCP traffic
stream {
    server {
        listen mongodb.example.com:443 ssl;
        ssl_certificate /path/to/cert;
        ssl_certificate_key /path/to/cert_key;
        proxy_pass localhost:27017;
    }
}
```
## Backup and Restore Role

In the next section, we'll discuss how to backup and restore MongoDB instances. As a prerequisite, we'll need a user with minimal privileges necessary to preform backups. Create one with the following:

```js
db.createUser(
    {
        user: "mongodb_backup",
        pwd: passwordPrompt(), // instead of cleartext password
        roles: [
          { role: "backup", db: "admin" },
          { role: "restore", db: "admin" },
        ]
    }
);
```

Instead, if you'd like to add this role to an existing user:

```js
use admin;
db.grantRolesToUser('username', ['backup', 'restore']);
```

## 'Nice' Things

We can show currently logged in users and their authenticated roles with

```js
db.runCommand({connectionStatus : 1})
```

We can also show the currently authenticated user at the shell prompt by overriding the default function, placed in `.mongorc.js`. From [stackoverflow answer](https://stackoverflow.com/a/21417240) 

```js
prompt = function() {
    user = db.runCommand({connectionStatus : 1}).authInfo.authenticatedUsers[0]
    if (user) {
        return "user: " + user.user + ">"
    }
    return ">"
}   
```


## Backups

The easiest way to backup small MongoDB deployments is by using the `mongodump` command. This method will impact db performance while running, but this should be acceptable for smaller deployments and deployments with predictable usage patterns (like a company instance who's employees go home at night).

```bash
# Backup
mongodump \
   --host=mongodb.example.com \
   --port=27017 \
   --ssl \
   --username=user \
   --password="pass" \
   --authenticationDatabase=admin \
   --gzip \
   --archive > /path/to/archive.gz

# Restore
# NOTE: leave authorization off during restore to a fresh mongodb install
# User accounts will be restored. You can then enable authorization after the restore completes and login as users
# from backup. In this case, omit the authentication options included below
mongorestore \
   --host=mongodb.example.com \
   --port=27017 \
   --ssl \
   --username=user \
   --password="pass" \
   --authenticationDatabase=admin \
   --gzip \
   --archive=/path/to/archive.gz
```

## Automated Backups via Cron

We can set up a cron job to automate dumps on a schedule. These backups should be stored somewhere safe, like your local filesystem or MinIO.

Use the following as a guide for a backup script, adding any necessary modifications as you see fit.

```bash
#!/bin/bash
backup_date=$(date +%Y-%m-%d)
backup_dir="/path/to/dir"
number_of_days=84 # 12 weeks


# backup command
mongodump --host <host> --port 27017 --ssl --username <username> --password <password> --authenticationDatabase admin --gzip --archive > "${backup_dir}/mongodump-${backup_date}.gz"

# Delete backups older than specified number of days
find "${backup_dir}" -type f -prune -mtime +"${number_of_days}" -exec rm -f {} \;

```

For piping directly to object storage, like MinIO, we can use

```bash
#!/bin/bash

mongodump --host <host> --port 27017 --ssl --username <username> --password <password> --authenticationDatabase admin --gzip --archive | /path/to/mc pipe bucket/prefix/mongodump-$(date +\%Y-\%m-\%d).archive.gz
```
