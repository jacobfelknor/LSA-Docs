# String Host Checking

When connecting to a new host via `ssh`, it is common to see a message confirming whether you trust the fingerprint of the machine. If, later, this fingerprint changes, `ssh` will protect you by printing huge warnings and notifying you that you may be a target of a man-in-the-middle attack.

```terminal
$ ssh user@examplehost

The authenticity of host 'examplehost (192.168.xxx.xxx)' can't be established.
AAAAAAA key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'examplehost' (AAAAAAA) to the list of known hosts.
```

## Automatically Accept New Connections

While this feature is very important, you may not be worried as much about it on the first connection. If you are confident you are getting to the correct host on the first connection, you may set the following settings in your `~/.ssh/config` to auto-accept new connections

```text
Host *
    StrictHostKeyChecking accept-new
```

Note that if the fingerprint changes after the first connection, `ssh` will still protect you in that case.

Of course, this potentially opens up an attack vector for new connections if you are not absolutely certain the host is the one you're attempting to reach or someone is meddling with things. I typically only use this feature during automated scripting where I cannot interactively accept the keys on new hosts.
