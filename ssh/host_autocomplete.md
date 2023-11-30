# SSH Host Autocomplete

You may notice that on some systems, bash provides autocompletion when "tabbing" on an `ssh` command for the host. For example, you could type

```bash
ssh user@hos
# TAB
# autocompletes to
ssh user@hostname.example.com
```

This pull entries from the `~/.ssh/known_hosts` file in order to provide the completion. However, some linux systems may be hashing the hostname inside of this file. Because of this, the autocomplete is not available.

## Turn Off Known Host Hashing

We can disable the hashing of hostnames with the following config placed in `~/.ssh/config`:

```text
Host *
    HashKnownHosts no
```

Now, any future entries will be stored in `~/.ssh/known_hosts` unhashed and we can take advantage of the autocomplete.

This **will not take effect for any existing entries**, but you may delete `~/.ssh/known_hosts` and then reconnect to your hosts to re-populate this file unhashed.

## Security Considerations

By some, this is considered a security risk because it provides a convenient cleartext list of all the servers you connect to. If your account on one machine is compromised, an attacker could iterate through this file and try the same credentials on these servers, furthering the attack.

However, it's not uncommon to see hashing disabled by default on some machines. My RHEL8 machine did not have hashing - enabling the autocomplete - where an Ubuntu machine did - disabling the autocomplete. I had gotten used to the autocomplete, which led me to discover this reason for it being disabled.

As for everything, take common sense precautions to protect your account and use this method at your own risk.
