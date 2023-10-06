# Increase VM Disk

First, shut down the machine whose disk you wish to extend and ensure there are no snapshots. Expanding a disk with snapshots is not possible.

Once shutdown, we can resize the disk with `qemu-img`

```bash
sudo qemu-img resize image.qcow2 +SIZE
# for example, add 20GB
sudo qemu-img resize image.qcow2 +20G
```

After resizing disk, you must expand the filesystem. If you're using debian, the easiest way to do this is with GParted

- first, expand the partition, then expand the filesystem from within. Should be obvious with the GUI

If you're using Fedora based, it's likely that it's using LVM.

- If so, expand the volume first using GParted. Again it should be obvious, look for something like "lvm2 pv" mounted at "rhel" and taking up the expected amount of space
- then, run the following commands to extend the filesystem within

    ```bash
    sudo lvextend -l +100%FREE /dev/mapper/rhel-root
    sudo xfs_growfs /dev/mapper/rhel-root
    ```
