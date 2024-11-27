# SELinux

These notes only focus on some inserting, listing, and removing applied SELinux modules from the current system. See [wikipedia for more detailed information] (<https://en.wikipedia.org/wiki/Security-Enhanced_Linux>)

## Enabling, Disabling, and Defaults

Use `getenforce` - or `sestatus` for more verbose output - to see if SELinux is currently being enforced

```console
~# getenforce
Enforcing
~# sestatus
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33
```

To temporarily switch between enforcing and permission modes, use `setenforce`. These settings will revert to default upon reboot (see next example)

```console
~# setenforce 0
~# getenforce
Permissive
~# setenforce 1
~# getenforce
Enforcing
```

The default mode for SELinux on boot is set in `/etc/selinux/config`. For example, for a system that will by default enforce SELinux:

```ini
# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=enforcing
# SELINUXTYPE= can take one of these three values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected.
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted
```

Edit the `SELINUX` setting here to make changes to this default upon boot.

## Listing, Inserting, and Removing SELinux Modules

To view which SELinux modules are currently active, use

```bash
semodule --list=full
# can grep for custom modules, ususally starting with my-*
semodule --list=full | grep "my"
```

If you're getting SELinux errors and want to apply a policy to permit the blocked action, typically you'll do the following

```bash
# generate the policy (I usually let Cockpit tell me this command)
ausearch -c 'service' --raw | audit2allow -M my-service
# apply policy. X is priority, higher numbers take priority over lower with same name
semodule -X 300 -i my-service.pp
```

If you need to remove a previously inserted module (say, to update and you don't want to use priorities), use

```bash
# replace with your priority, if needed. List command given above shows priorities if you don't know yours
semodule -X 300 -r <module name>
```

## Delete Custom Label

If you previously made a modification to a file label with something like

```bash
semanage fcontext -a -t httpd_sys_content_t /path/to/file
```

You can remove this modification with

```bash
semanage fcontext -d /path/to/file
```

Then, for it to take effect, run the relabel command shown below.

## Relabel

To relabel a specific directory or file to system defaults for that location, run

```bash
# -r for recursive, can omit if pointing to single file
restorecon -rv /path/to/file/or/dir
```

For example, this must be done if you've moved an executable from a user's home directory to `/usr/local/bin`, it will maintain its old home directory label until you run the above. This is required if this executable is to be used in a `systemd` service, for example.
