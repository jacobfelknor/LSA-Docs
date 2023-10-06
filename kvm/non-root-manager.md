# Add Non-Root User as Manager

By default, only users with root access can manage VMs using `virt-manager`. You can grant a non-root user access by adding them to the `libvirt` group.

```bash
sudo usermod -a -G libvirt $(whoami)
```
