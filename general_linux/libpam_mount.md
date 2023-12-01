# Automatically Mount Windows Shares on Login

It is a common scenario in an enterprise environment to have network drives where users can share files. On Windows, users typically get these network drives mounted by default based on a group policy at login time. However, if you're supporting Linux workstations, there is no immediately obvious way to accomplish the same task.

Credit to [this YouTube video](https://www.youtube.com/watch?v=LxzPhmlaBFI) for the basis of these notes.

## Mount "Manually"

You could mount these network shares as a one-off or persistent mount - as I show in [these notes](./windows_share_mount.md) - but there are a few disadvantages of doing it like this.

In the one-off scenario,

1. Users must remember the details of the command
2. Users must manually run the mount command each time they need access
3. Mount does not persist after a reboot
4. Users must have `sudo` permissions to run the associated `mount` command
5. Users must be technically sound enough to understand what is happening

In the permanent mount scenario,

1. Credentials must be stored on the system itself on a plain text file
2. Access does not reflect the currently logged on user - all users can see and potentially interact with all mounts.
3. Access cannot be controlled via a group policy
4. Mounting via `/etc/fstab` may cause boot issues if the share is not accessible at boot time

For these reasons, this may not be an ideal situation for your use case. This method is better off left to servers and service accounts, where no "normal" users log in and the network is predictable.

## Mount With libpam-mount

A better solution for normal users is to take advantage of `libpam-mount`, a PAM module which alleviates many of the concerns from before. Some of the features include

1. Shares are automatically mounted at login time
2. Authenticated against the same username and password the user used to login to the system, with no requirement to retype these credentials
3. Credentials are not stored on the system in plain text file
4. Access can be controlled via group policy, and evaluated against an AD user who logs in
5. Shares are automatically unmounted at logout time.

## Setup libpam-mount

### Install Dependencies

The following dependencies are required

```bash
apt update
apt install cifs-utils libpam-mount
```

### Configure PAM

There are two files the must get edited to configure PAM. If you have never manually touched your PAM files before, it is very likely that installing `libpam-mount` above has already done the configuration for you. However, if you have manually modified these files before, the installation process will not overwrite your existing changes and we must make the following adjustments manually.

First, we should take a look at `/etc/pam.d/common-auth` and ensure the noted line is present.

```conf
...

auth    required                        pam_permit.so
# and here are more per-package modules (the "Additional" block)
######## ADD THIS LINE! ################################
auth    optional        pam_mount.so 
########################################################
auth    optional                        pam_cap.so

...
```

Next, we should look at `/etc/pam.d/common-session`. Again, ensure the noted line is present.

> **NOTE:** If you are also using the `pam_mkhomedir` module, its possible that `pam_mount` may interfere with the automatic home directory creation. In my case, I experience that the directory was created, but nothing was copied from `/etc/skel` when a new user logged in. Take note of the location of `pam_mkhomedir` in the following config to ensure they can work correctly together, and make sure it has been set to `required`.

```conf
...
# and here are more per-package modules (the "Additional" block)
session required        pam_unix.so
########################################################################
### IF USING pam_mkhomedir, ensure it at this location and required! ###
session required                        pam_mkhomedir.so
########################################################################
session optional                        pam_sss.so
######## ADD THIS LINE! ################################
session optional        pam_mount.so
########################################################
session optional        pam_systemd.soi
# end of pam-auth-update config           
```

### Configure pam_mount

Now that PAM has been configured to use `pam_mount`, we must now configure `pam_mount` itself so that the proper shares are mounted for the proper users/groups. The global configuration file exists at `/etc/security/pam_mount.conf.xml`, which will apply to any user logging in.

When first setting up, it can be helpful to enable debugging. This will print messages from `pam_mount` on login so that you can see exactly what it is doing and inspect any errors if you need to.

```xml
<!-- /etc/security/pam_mount.conf.xml -->

<!-- Search for this line, and set it to "1" -->
<debug enable="1" />
```

Our main configuration will live in the `<!-- Volume definitions -->` section. The following are examples of both how to write a rule for a particular user or particular group. Even for the particular user configuration, the rule will be evaluated (and simply not succeed) for any user who logs in.

```xml
<!-- Volume definitions -->

<!-- Apply rule to users. user="*" means 'apply this mount for all users'. specify user if needed -->
<volume options="nodev,nosuid" user="*" mountpoint="~/shares/share_name" path="share_name" server="share.example.com" fstype="cifs" />

<!-- Apply rule to group -->
<volume options="nodev,nosuid" sgrp="group_name" mountpoint="~/shares/share_name" path="share_name" server="share.example.com" fstype="cifs" />
```

Finally, we should ensure that these directories we mount to get created automatically if they do not exist. Ensure the following is set in `/etc/security/pam_mount.conf.xml`.

```xml
<mkmountpoint enable="1" remove="true" />
```

### User Specific Configuration

There is also a user specific configuration option. This configuration file lives in a user's home directory and its rules are only evaluated if that user is logging in. The location of this file is controlled via the global configuration at `/etc/security/pam_mount.conf.xml`

```xml
<!-- this line commented out by default, but we should uncomment if we wish to have user configs -->
<luserconf name=".pam_mount.conf.xml" />
```

The default value above would be user config should be placed in `~/.pam_mount.conf.xml`. A user defined config would could look something like:

```xml
<?xml version="1.0" encoding="utf-8" ?>

<pam_mount>

<!-- use similar rules as what exists in global config -->
<!-- you can also specify variables, such as the current user %(USER) -->
<volume options="nodev,nosuid" user="*" mountpoint="~/shares/share_name" path="%(USER)" server="share.example.com" fstype="cifs" />

</pam_mount>

```

## Test Configuration

To test our new network share automounts, simply login as a user on the system and confirm the appropriate shares get mounted. On logout, make sure they are unmounted.

Particularly if using the debug options, you can do this with

```bash
sudo login username
```
