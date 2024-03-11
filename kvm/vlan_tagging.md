# VLAN Tagging

TODO: see <https://libvirt.org/formatdomain.html#setting-vlan-tag-on-supported-network-types-only> for reference

Simply adding the VLAN tag to the bridge device configured in [bridged_networking.md](./bridged_networking.md) did not work, probably because this is considered a "standard linux bridge", which the documentation claims it does not support.
