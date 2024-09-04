# Kernel Management

Sometimes, you'd like to remove certain versions of the kernel. Example scenarios include clearing old versions to free disk space, or removing problematic updates to the kernel to ensure you use the older one.

Ensure you don't remove the kernel version you're currently running. Before removing kernel versions, boot into your desired kernel first. You can check which kernel you're currently running with `uname -r`

Once you've selected the kernel versions you'd like to remove, you can do the following

## Ubuntu

To list installed kernel versions, run

```bash
dpkg --list 'linux-image-*'
```

To remove kernel version (must not be the currently booted kernel!), run

```bash
sudo apt purge linux-image-x.x.x.x-generic
# NOTE: you can use bash brace expansion, for example
sudo apt purge linux-image-5.19.0-{42,43,45}-generic
sudo apt purge linux-image-5.19.0-{41-43}-generic
```

At this point, run `sudo apt autoremove` to remove any dangling packages no longer needed and reboot your system to ensure it comes back up in your desired kernel.

## RHEL

To list installed kernel versions, run

```bash
dnf list installed kernel-core
```

This will output something like

```text
Installed Packages
kernel-core.x86_64        4.18.0-553.5.1.el8_10
kernel-core.x86_64        4.18.0-553.8.1.el8_10
kernel-core.x86_64        4.18.0-553.16.1.el8_10
```

To remove kernel version (must not be the currently booted kernel!), run

```bash
dnf erase kernel-core-<version>

# for example, 
dnf erase kernel-core-4.18.0-553.16.1.el8_10
```

If you're reverting to an older kernel and want to refuse the future updates, you probably also want to place a version lock on the kernel

```bash
dnf versionlock add kernel kernel-core kernel-modules

# remove later with 
dnf versionlock delete kernel kernel-core kernel-modules
```
