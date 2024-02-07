# Convert OpenSSH Key to RSA

SSH keys can exist in many formats, two of which are the OpenSSH and RSA formats. OpenSSH is newer, and is probably the default when using `ssh-keygen` unless you're on an older machine. That being said, sometimes you are required to use the older RSA format. Luckily, we can convert our existing OpenSSH private key to the RSA format, allowing us to continue using the same public key associated with it without needing to regenerate an existing key.

Convert your existing OpenSSH key to RSA using the following:

```bash
# WARNING! The conversion command below will change the file in place
# make a backup of your existing key if you need it
ssh-keygen -p -N "" -m pem -f /path/to/private.key
```

If your key requires a passphrase, instead use:

```bash
ssh-keygen -p -P "old passphrase" -N "new passphrase" -m pem -f /path/to/private.key
```

If you get an error like `Key has comment ''. Saving key failed: Permission denied.`, remove the comment with

```bash
ssh-keygen -c -C "" -f /path/to/private.key
```

and try the conversion again.
