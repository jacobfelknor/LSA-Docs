# LDAP Authentication and Authorization MinIO

First, install and configure `minio` as you normally would. When you're ready, we can start setting up LDAP for user management.

> **NOTE:** After enabling LDAP, it appears that console access will be denied to the root account user. You should instead attach the `consoleAdmin` to a LDAP user or group and do any further console management from that user. The root account will still be available via the `mc admin` command.

An example LDAP setup is shown below. Specify these settings in your `/etc/default/minio` environment file.

```ini
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

## Attach a Policy

Before a user could log in to the console or otherwise authenticate to MinIO, we must attach policies to the user DN or one of their group DN's.

For example, the following attaches the `consoleAdmin` policy to a specific user or group

```bash
# specific user
mc admin policy attach local consoleAdmin --user='CN=User Name,OU=example,OU=example,OU=example,DC=example,DC=example'
# specific group
mc admin policy attach local consoleAdmin --group='CN=Group Name,OU=example,OU=example,OU=example,DC=example,DC=example'
```

## Detach a Policy

To detach a policy, the process is similar except we will use `mc admin policy detach`

```bash
# specific user
mc admin policy detach local consoleAdmin --user='CN=User Name,OU=example,OU=example,OU=example,DC=example,DC=example'
# specific group
mc admin policy detach local consoleAdmin --group='CN=Group Name,OU=example,OU=example,OU=example,DC=example,DC=example'
```

## View Group to Policy Mapping

By using LDAP, we unfortunately lose the ability to manage our policies from the console. In order to print all policies and their group mappings, use the following command

```bash
mc admin policy entities local
```

## Access Keys for LDAP

Programmatic access to MinIO requires an access/secret access key pair, and your LDAP username and password do not act as such. In order to use your LDAP account programmatically, it is required you create a permanent access key for a user (using the console or `mc` client) or you ask for temporary session keys from the server.

### Assuming Roles

See [MinIO docs](https://min.io/docs/minio/linux/developers/security-token-service/AssumeRoleWithLDAPIdentity.html) for more information on `AssumeRoleWithLDAPIdentity`.

To request temporary credentials, you must send a `POST` request like the following:

```text
POST https://minio.example.net?Action=AssumeRoleWithLDAPIdentity
&LDAPUsername=USERNAME
&LDAPPassword=PASSWORD
&Version=2011-06-15
```

An example response is shown below

```xml
<?xml version="1.0" encoding="UTF-8"?>
<AssumeRoleWithLDAPIdentityResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/">
    <AssumeRoleWithLDAPIdentityResult>
        <Credentials>
            <AccessKeyId>ACCESS_KEY_ID</AccessKeyId>
            <SecretAccessKey>SECRET_ACCESS_KEY</SecretAccessKey>
            <SessionToken>SESSION TOKEN</SessionToken>
            <Expiration>ISO-8601 Date of expiration</Expiration>
        </Credentials>
    </AssumeRoleWithLDAPIdentityResult>
    <ResponseMetadata>
        <RequestId>REQUEST ID</RequestId>
    </ResponseMetadata>
</AssumeRoleWithLDAPIdentityResponse>
```

Provide these keys, along with the session token, also known as the `STS` token, to the client program attempting to connect to the MinIO server.
