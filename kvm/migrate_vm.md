# Migrate a KVM VM to Another Server

This has been tested for VMs not using any kind of physical passthrough. Do not attempt these steps for VMs with passed hardware.

Dump the VM config file

```bash
sudo virsh dumpxml vm_name > vm_name.xml
```

Copy disk to new host. Find where disk is by running

```bash
sudo virsh domblklist vm_name
```

Copy both the VM disk and the VM config file to new host via `scp`. Make sure group `qemu` has read/write access to the location you copy them to.

Run following to register the VM

```bash
sudo virsh define vm_name.xml
```

Once imported with `virsh define`, VM config files are stored centrally at `/etc/libvirt/qemu/`. Confirm the VM definition file is present

```bash
sudo ls -la /etc/libvirt/qemu
```

Once you confirm it has been imported, you may delete the temporary copy you moved from the old server.

You will probably need to adjust some settings for the VM before booting will work, like which network interface the VM is attached to and where the disk is located.
