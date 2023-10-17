# Default Local Groups

It can be useful to dynamically assign certain groups to current and future users automatically. This removes the requirement that a user exists prior to group assignment, and also can help simulate "nested groups" in linux which are not directly supported.

A common case is iff our linux machine is joined to Active Directory, we can specify that a certain AD group should be members of certain local groups. For example, if all domain users should be members of the built in `dialout` group, we can achieve this.

These notes adapted from <https://help.ubuntu.com/community/LDAPClientAuthentication#Assign_local_groups_to_users>

## Assign Local Groups to Users

To set local groups for a user, we use the `/etc/security/group.conf` file. This file is empty by default, but contains a detailed explanation of how to use it along with concrete examples. There are lots of options to configure times, ttys, and which shells qualify for the automatic group assignment, though it usually is correct to just allow any of the above.

The following covers most cases. It adds a user the the `dialout` and `wireshark` local groups for any LDAP `domain users`.

```text
*;*;%domain users;Al0000-2400;dialout,wireshark
```

Note the `"%"` preceding `domain users`, which indicates the entity is another group. This simulates the "nested" behavior you may want, because its as if the `dialout` and `wireshark` groups are "members" of the `domain users` group.

You may also use a specific user here instead, like

```text
*;*;username;Al0000-2400;dialout,wireshark
```

This would only add the specified user to these local groups.

## Configure PAM

We must also configure PAM to use the group assignments we specified above in `/etc/security/group`. Otherwise, our changes will not have any effect.

To activate, use

```bash
sudo bash -c "cat > /usr/share/pam-configs/auto_local_groups" <<EOF
    Name: activate /etc/security/group.conf
    Default: yes
    Priority: 900
    Auth-Type: Primary
    Auth:
            required                        pam_group.so use_first_pass
    EOF
```

Then enable with

```bash
sudo pam-auth-update
```

If you need to modify the PAM files by hand, you should add the following line to the beginning of `/etc/pam.d/common-auth`

```text
auth    required     pam_group.so use_first_pass
```

## A Note on su

These groups are only applied when the user is authenticating directly, whether that is through the GUI or SSH. These groups will NOT be automatically applied if you `su` to the user.
