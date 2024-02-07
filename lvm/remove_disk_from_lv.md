# Remove Disk from Logical Volume

If you've created a volume group spanning multiple physical volumes (like I show in [combine_disks_into_lv](./combine_disks_into_lv.md)), but later decide you need to remove one of the physical volumes from the volume group, we can use the following procedure. Of course, this procedure assumes that there is enough free space on the remaining physical volumes to afford the lost of capacity of the disk you're removing.

> **NOTE:** If you followed my process in [combine_disks_into_lv](./combine_disks_into_lv.md) *exactly*, you probably do not have any free extents on the remaining physical volumes because we grew the XFS filesystem to consume all free space in the LV, even if the XFS filesystem itself is not full. Additionally, XFS filesystems cannot be shrunk, so we must resort to a backup/restore of the data in this LV. See the `xfsdump` and `xfsrestore` commands [in this RedHat article](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/storage_administration_guide/xfsbackuprestore)

These notes are based on [this page in RedHat's documentation](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/5/html/logical_volume_manager_administration/disk_remove_ex), but the procedure applies to any system using LVM.

## Move Extents to Existing Physical Volumes

First, lets take a look at our existing physical volumes with

```console
# pvs -o+pv_used
  PV         VG   Fmt  Attr PSize  PFree  Used
  /dev/sda1  myvg lvm2 a-   17.15G 12.15G  5.00G
  /dev/sdb1  myvg lvm2 a-   17.15G 12.15G  5.00G
  /dev/sdc1  myvg lvm2 a-   17.15G 12.15G  5.00G
  /dev/sdd1  myvg lvm2 a-   17.15G  2.15G 15.00G
```

I want to move the extents off of `/dev/sdb1` so that I can remove it from the volume group `myvg`. If there are enough free extents (`PFree`) on other physical volumes from within the VG, we can distribute the extents from `/dev/sdb1` to the other devices with

```console
# pvmove /dev/sdb1
  /dev/sdb1: Moved: 2.0%
 ...
  /dev/sdb1: Moved: 79.2%
 ...
  /dev/sdb1: Moved: 100.0%
```

After the `pvmove` completes, we can verify the extents are now moved by again using `pvs`. Note that the `Used` column for `/dev/sdb1` is now `0`.

```console
# pvs -o+pv_used
  PV         VG   Fmt  Attr PSize  PFree  Used
  /dev/sda1  myvg lvm2 a-   17.15G  7.15G 10.00G
  /dev/sdb1  myvg lvm2 a-   17.15G 17.15G     0
  /dev/sdc1  myvg lvm2 a-   17.15G 12.15G  5.00G
  /dev/sdd1  myvg lvm2 a-   17.15G  2.15G 15.00G
```

We can now use the `vgreduce` command to remove `/dev/sdb1` from the volume group

```console
# vgreduce myvg /dev/sdb1
  Removed "/dev/sdb1" from volume group "myvg"
```

Running `pvs` again shows that `/dev/sdb1` is no longer assigned to a VG.

```console
# pvs
  PV         VG   Fmt  Attr PSize  PFree
  /dev/sda1  myvg lvm2 a-   17.15G  7.15G
  /dev/sdb1       lvm2 --   17.15G 17.15G
  /dev/sdc1  myvg lvm2 a-   17.15G 12.15G
  /dev/sdd1  myvg lvm2 a-   17.15G  2.15G
```

The disk can now be removed or allocated elsewhere.

## Moving Extents to a New Disk

If, instead of moving extents to existing physical volumes, you'd like to move the extents to a new device, we can follow a similar procedure.

In this example, we have 3 devices in our VG and would like to swap `/dev/sdb1` with `/dev/sdd1`

```console
# pvs -o+pv_used
  PV         VG   Fmt  Attr PSize  PFree  Used
  /dev/sda1  myvg lvm2 a-   17.15G  7.15G 10.00G
  /dev/sdb1  myvg lvm2 a-   17.15G 15.15G  2.00G
  /dev/sdc1  myvg lvm2 a-   17.15G 15.15G  2.00G
````

Create a new PV on your new device, and add it to your VG

```console
# pvcreate /dev/sdd1
  Physical volume "/dev/sdd1" successfully created

# vgextend myvg /dev/sdd1
  Volume group "myvg" successfully extended
  
# pvs -o+pv_used
  PV         VG   Fmt  Attr PSize  PFree  Used
  /dev/sda1   myvg lvm2 a-   17.15G  7.15G 10.00G
  /dev/sdb1   myvg lvm2 a-   17.15G 15.15G  2.00G
  /dev/sdc1   myvg lvm2 a-   17.15G 15.15G  2.00G
  /dev/sdd1   myvg lvm2 a-   17.15G 17.15G     0
```

Move the extents from `/dev/sdb1` to `/dev/sdd1`

```console
# pvmove /dev/sdb1 /dev/sdd1
  /dev/sdb1: Moved: 10.0%
...
  /dev/sdb1: Moved: 79.7%
...
  /dev/sdb1: Moved: 100.0%

# pvs -o+pv_used
  PV          VG   Fmt  Attr PSize  PFree  Used
  /dev/sda1   myvg lvm2 a-   17.15G  7.15G 10.00G
  /dev/sdb1   myvg lvm2 a-   17.15G 17.15G     0
  /dev/sdc1   myvg lvm2 a-   17.15G 15.15G  2.00G
  /dev/sdd1   myvg lvm2 a-   17.15G 15.15G  2.00G
```

Remove `/dev/sdb1` from the VG

```console
# vgreduce myvg /dev/sdb1
  Removed "/dev/sdb1" from volume group "myvg"
```

The disk can now be removed or allocated elsewhere.
