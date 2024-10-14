# Credential Helper

The setting for `git`'s credential helper that I most often use on Linux is

```toml
# timeout after 1 day
[credential]
    helper = cache --timeout=86400
```

Predictably, this keeps your credentials cached in memory for a period of 1 day, or on reboot.

## Clear Cache

If you need to log in with different credentials or otherwise want to clear the cache without rebooting your machine, you can clear the credential manager with

```bash
git credential-cache exit
```

Upon your next request, you will be prompted again for your credentials and they will again be cached according to your config.
