# XML VM Definition

The VM's configuration is stored in XML format on your hypervisor host. These files define which virtual hardware to use for that VM, such as common configurations such as network interfaces and virtual disks.

## Location

By default, these XML files are stored at `/etc/libvirt/qemu`

## Editing

These files are best edited through the `virt-manager` interface, or by using `virsh edit vm-name` and generally should not be edited manually on the filesystem. In addition, most changes won't take effect until the next reboot.
