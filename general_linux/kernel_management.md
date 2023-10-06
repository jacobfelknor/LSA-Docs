# Kernel Management

Sometimes, you'd like to remove certain versions of the kernel. Example scenarios include clearing old versions to free disk space, or removing problematic updates to the kernel to ensure you use the older one.

> **NOTE**: These instructions are for Ubuntu

## View Kernel Versions

To list installed kernel versions, run

```bash
dpkg --list 'linux-image-*'
```

## Remove Kernel Versions

Ensure you don't remove the kernel version you're currently running. Before removing kernel versions, boot into your desired kernel first. You can check which kernel you're currently running with `uname -r`

Once you've selected the kernel versions you'd like to remove, you can run the following

```bash
sudo apt purge linux-image-x.x.x.x-generic
# NOTE: you can use bash brace expansion, for example
sudo apt purge linux-image-5.19.0-{42,43,45}-generic
sudo apt purge linux-image-5.19.0-{41-43}-generic
```

At this point, run `sudo apt autoremove` to remove any dangling packages no longer needed and reboot your system to ensure it comes back up in your desired kernel.
