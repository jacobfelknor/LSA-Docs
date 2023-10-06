# User and Access Key Management

It is possible to handle all of the user management (including for LDAP users) from the command line using the `mc admin` client. I've detailed a few common scenarios here.

> **NOTE:** In cases where you are managing an LDAP user, you must provide the users full DN in place of the username order for the commands to complete successfully.

## Access Key Management

See [official docs](https://min.io/docs/minio/linux/reference/minio-mc-admin/mc-admin-user-svcacct.html) for more details.

Add access key to user

```bash
mc admin user svcacct add --name "name for key" ALIAS USERNAME/LDAP_DN
```

List access keys for user

```bash
mc admin user svcacct ls ALIAS USERNAME/LDAP_DN
```

Print information on an access key

```bash
# includes the parent user, status, expiration info, and what policy is applied. If policy scope is inherited from user, it will show 'implied'
mc admin user svcacct info ALIAS ACCESS_KEY
```

Remove an access key

```bash
mc admin user svcacct rm ALIAS ACCESS_KEY
```

## General User Accounts

```bash
mc admin user info ALIAS USERNAME/LDAP_DN
```

## TODO - Document More as need arises
