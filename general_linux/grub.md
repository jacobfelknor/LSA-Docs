# GRUB Bootloader

These docs are only to record certain experiences I've had with `grub`, and are not indended to be a full guide on its usage.

> **NOTE:** The `update-grub` command is not available on RHEL

## Show GRUB at Boot

If the `grub` menu is not showing at boot and you'd like it to, we can turn this on by editing `/etc/default/grub`.

```ini
# /etc/default/grub
...
GRUB_TIMEOUT_STYLE=menu
GRUB_TIMEOUT=10
...
```

For your changes to take effect, run `sudo update-grub` and reboot.

## LVM Discovery

 is an experience I had while triple-booting my workstation at home and using `grub` to manage the booting. 

I set the drive containing Ubuntu to be the primary boot drive in my BIOS settings, letting `grub` discover and display the other operating system options for me to boot to. These included Ubuntu, Windows 10, and RHEL 8. All 3 OSes lived on their own NVME drive installed in my machine. 

The problem was, `grub` was failing to detect the RHEL8 installation. It found itself (sanity check) and also Windows, but RHEL was inexplicably (to me) missing at first. You can see what OSes `grub` will see by using the `sudo os-prober` command. 

The problem ended up being that RHEL uses LVM by default to manage its partitions, and Ubuntu does not. In fact, LVM wasn't even installed on my Ubuntu machine. Therefore, `os-prober` and `grub` could not even read the drive RHEL was installed on and ignored it based on this fact. The solution was simply to install LVM on Ubuntu

```bash
sudo apt update
sudo apt install lvm2
```

Then, running `os-prober` returned the expected results, and a `sudo update-grub` successfully detected the RHEL installation and all was good in the world.


TODO: actually document what you can do with `grub`, instead of reducing my "documentation" of it to a random anecdote.
 
