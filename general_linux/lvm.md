# LVM

## Creating a Logical Volume From Blank Disks

This documents how to create a single large logical volume from multiple physical disks. LVM is capable of so much more, but that is not documented here for now.

First, create a primary partition on physical drive using `fdisk`.

```bash
sudo fdisk /dev/sdX

# delete any existing partitions
d
# create new partition that spans disk (use all defaults)
n
# write 
w
```

Create the physical volumes.

```bash
sudo pvcreate /dev/sdX1
# repeat for any additional disks
```

Create a new volume group with our physical volume

```bash
sudo vgcreate <vg_name> /dev/sdX1 /dev/sdY1 ...
```

Create logical volume, filling all space

```bash
sudo lvcreate -n <lv_name> -l +100%FREE <vg_name>
```

Make filesystem

```bash
sudo mkfs.xfs /dev/<vg_name>/<lv_name>
```

Mount to system. Use `/etc/fstab` if wanted

## Extend an Existing Logical Volume with New Disk

If you already have a logical volume that you'd like to extend with a new disk, we can do the following.

First, wipe any existing partitions on the new disk and create a primary partition filling all available space.

```bash
sudo fdisk /dev/sdX

# delete any existing partitions
d
# create new partition that spans disk (use all defaults)
n
# write 
w
```

Create a new physical volume

```bash
sudo pvcreate /dev/sdX1
```

Add the new physical volume to your existing volume group

```bash
sudo vgextend <vg_name> /dev/sdX1
```

Extend the logical volume to use new allocated space

```bash
sudo lvextend -l +100%FREE /dev/<vg_name>/<lv_name>
# grow filesystem, if necessary
sudo xfs_growfs /mount/point
```

## Remove Logical Volume

```bash
sudo lvremove /dev/<vg_name>/<lv_name>
```