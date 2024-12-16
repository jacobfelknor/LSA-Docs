# nmcli Scratch Notes

These are scratch notes which are not intended to be more sophisticated. If you want more permanent and preferred ways of dealing with interface settings and static IPs, please see [my static IP notes](./static_ip.md).

I am unsure if the changes made by these commands are written to the same config files as "normal" or elsewhere as I have not investigated. They are just the "one-off" way of doing this sort of thing, usually by an engineer developing hardware at the workstation where changes are frequent, and they may prove helpful in future tinkering situations.

<hr>

To show connections

```bash
nmcli con show
```

To bring up/down a connection

```bash
nmcli con up "connection name"
nmcli con down "connection name"
```

To add a static IP to an interface

```bash
# set a static IP
nmcli con modify "connection name" +ipv4.addresses "10.99.99.100/24" ipv4.method "manual"

# disable ipv6 if wanted
nmcli con modify "connection name" ipv6.method "disabled"

# bring connection up
nmcli con up "connection name"

# bring con up at boot
nmcli con mod "connection name" connection.autoconnect yes
```

To revert a static IP configured interface to DHCP

```bash
nmcli con down "connection name"
nmcli con modify "connection name" ipv4.addresses "" ipv4.method "auto"
nmcli con modify "connection name" ipv6.method "enabled"
nmcli con up "connection name"
```

To list connection settings

```bash
nmcli con show "connection name"
```
