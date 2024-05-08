# Add Swap Space via Swap Files

Swap space provides extra breathing room on top of physically installed RAM. When you're running many applications, or memory-intensive applications, you may require more memory than is physically installed. Instead of giving up and crashing, the OS instead uses "swap memory" to keep everything running. In this case, contents of RAM is moved into your "swap space" in order to free up physical memory for higher priority tasks (like, the currently running application instead of a less recently used one).

Sometimes it can be necessary to increase the available swap space beyond what was originally configured. There are two main ways of doing so.

## Swap Space on a Partition

In most cases, by default there is a dedicated swap partition on the hard drive which is used as the swap space. This can be advantageous because you are guaranteed to be writing swap contents in a contiguous place on disk. This advantage is less prominent if your swap is on an SSD.

A big disadvantage of this method, however, is its flexibility. It may not always be possible to expand/shrink this swap partition to adapt for the current needs.

## Swap Space via Swap File

The approach I generally like to take, especially if I anticipate swap needs changing over time, is to use a swap file which exists in the filesystem on the same partition as the filesystem itself. At any time, given you have enough space, you can increase/decrease the size of this swap file to accommodate your needs.

All of the below commands must be ran as `root`. First, create a new empty file of the desired swap space:

```bash
# the following creates a 16GiB swap file. Modify as needed
dd if=/dev/zero of=/swap_file.img bs=1024 count=16M
```

Set the permissions to read/write only by `root`. We should never allow other users to read or modify this file

```bash
chmod 0600 /swap_file.img
```

Make a "swap filesystem" inside your new swap file

```bash
mkswap /swap_file.img
```

Activate your new swap

```bash
swapon /swap_file.img
```

At this point, you should ensure the new swap is available to your system. I usually use the `htop` command for this.

Once we've confirmed the new swap is available, add an entry to `/etc/fstab` so that our new swap will be available on the next boot.

```conf
# extra filesystem swap
/swap_file.img         swap    swap    sw      0       0
```

## Remove Swap File

To free up disk space, you can undo your swap file if you no longer need it

```bash
swapoff /swap_file.img
rm /swap_file.img
```

Make sure to also remove the entry from `/etc/fstab`, so there are no boot errors.
