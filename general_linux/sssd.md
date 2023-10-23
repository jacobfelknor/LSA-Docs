# SSSD

`sssd` allows us to use an LDAP authentication server to manage logins on our linux machine. I won't go into any more detail here on setup, but will document specific cases of things I've run into while using it.

See [this document](../kvm/join_to_domian.md) for some of my other notes on joining a machine to a domain and using `sssd` for authentication.

## SSSD Cache

SSSD maintains a local database cache of user information, such as credentials and group membership. This cache is used in the event the machine is offline, but an LDAP user is attempting to log in. The user will be able to access the machine given they enter the password that has been cached.

From [the sssd man page](https://linux.die.net/man/5/sssd.conf), the `entry_cache_timeout` setting in `/etc/sssd/sssd.conf` controls caching timeouts. It defaults to 5400 seconds, or 90 minutes.

Sometimes, you may want to manually invalidate the cache immediately to ensure the latest changes are immediately available. You can do that with

```bash
# clear everything
sss_cache -E

# clear for a particular domain
sss_cache -Ed DOMAIN

# clear for a particular user
sss_cache -u username
```
