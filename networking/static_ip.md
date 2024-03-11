# Set Static IP Linux

It is often helpful to set a static IP address on a linux machine, particularly if it is a server and you don't want its IP changing for any reason and don't want to rely on DHCP reservations. I've taken some notes on how to do so in several different situations.

## Ubuntu

Ubuntu machines use a utility called [`netplan`](https://netplan.io/) to, for lack of a better term, "plan" the network configuration of its interfaces. It can be thought of a "translator" between a common YAML config file to the "renderer" of your choice. It reads configuration files at `/etc/netplan/*.yaml`, then depending on the renderer, generates the necessary configuration and gives it to the particular networking daemon. `netplan` currently supports `NetworkManager` and `networkd` (a `systemd` networking daemon) as its renderers. In my usage, I've used `networkd` when the machine I'm configuring is a server and `NetworkManager` when the machine is a workstation.

### NetworkManager

The simplest (as far as `netplan` goes) configuration is to let `NetworkManager` handle all devices in its default way, which is to bring all things up via DHCP. The `netplan` configuration for this would be

```yaml
# /etc/netplan/01-network-manager-all.yaml
network:
  version: 2
  renderer: NetworkManager
```

This sort of configuration is ideal for workstations/laptops, whose IPs are not critical and we'd like as many things to "just work" for the user as possible.

However, we can be more specific if we need to, or if we choose to use `NetworkManager` in a server setting.

```yaml
# /etc/netplan/99-your-static-ip.yaml
network:
  ethernets:
    eth0:
      addresses:
      - 192.168.x.x/24
      nameservers:
        addresses:
        - 192.168.x.x
        - 192.168.x.x
        search:
        - example.local
      routes:
      - to: default
        via: 192.168.x.x
  version: 2
  renderer: NetworkManager
```

### Systemd-networkd

Alternatively, we may use the `networkd` backend when setting our static IP. The `netplan` YAML is _almost_ the same, except that we switch the renderer.

```yaml
# /etc/netplan/99-your-static-ip.yaml
network:
  ethernets:
    eth0:
      addresses:
      - 192.168.x.x/24
      nameservers:
        addresses:
        - 192.168.x.x
        - 192.168.x.x
        search:
        - example.local
      routes:
      - to: default
        via: 192.168.x.x
  version: 2
  renderer: networkd
```

## RHEL

> **NOTE:** RHEL networking used to be configured by what is now called "legacy network scripts" which was independent of `NetworkManager`. Its configuration existed as shown below. `NetworkManager` maintains compatibility with these files (known as the `ifcfg` format), but we can also use the new "keyfile" format native to `NetworkManager`. For more information, see [RedHat's documentation of keyfiles](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_and_managing_networking/assembly_networkmanager-connection-profiles-in-keyfile-format_configuring-and-managing-networking#doc-wrapper)

In RHEL, we manage our network interfaces through the files at `/etc/sysconfig/network-scrips/`. In this directory, there will be a file for each interface to configure with the prefix `ifcfg-`. For example, if your interface is named `eth0`, the configuration file you should target is `ifcfg-eth0`. If your system is using `NetworkManager`, its possible that this configuration file may alternatively be named something like `ifcfg-Wired_connection_1`.

A typical DHCP configuration may look something like

```ini
# lots of other key/values, but these are the ones we're targeting
BOOTPROTO=dhcp
DEVICE=eth0
```

For a static IP, we need to change the `BOOTPROTO` to `none` and set some key values ourselves. For example,

```ini
# lots of other key/values, but these are the ones we're targeting
BOOTPROTO=none
DEVICE=eth0
IPADDR=192.168.x.x
PREFIX=24
GATEWAY=192.168.x.x
DNS1=192.168.x.x
DNS2=192.168.x.x
# otherwise known as "search"
DOMAIN=EXAMPLE.LOCAL
# additional IPs can be added by incrementing numbers on end of key
IPADDR1=192.168.x.x
PREFIX1=24
```

On a `NetworkManager` enabled system, we can apply our changes by restarting the `NetworkManager` service.

```bash
systemctl restart NetworkManager
```
