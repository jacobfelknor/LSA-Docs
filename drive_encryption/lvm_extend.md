# Extend a LUKS Encrypted Logical Volume

We can add an additional disk to an existing luks encrypted logical volume. This process closely follows how you would normally extend a filesystem on LVM, except for one specific luks step.

First, we need to create a physical volume from the new disk we just added. For this example, I'm assuming the disk is at `/dev/sdX` but you should replace this with what the real path is.

```bash
pvcreate /dev/sdX
# ensure device appears
pvdisplay
```

Next, we need to extend our existing volume group to use our new physical volume. In this example, we're expanding the `rhel` VG.

```bash
vgextend rhel /dev/sdX
# ensure new space is reflected in VG
vgdisplay
```

Now we will extend the logical volume to consume all newly available free space in the volume group. In this example, we're expanding the `rhel-root` LV.

```bash
lvextend /dev/rhel/root -l +100%FREE
# ensure new space is reflected in the logical volume
lvdisplay
# can also view this information here
lsblk
```

Here is where the process diverges from standard expansion. The filesystem lives on the luks volume which lives on the logical volume we just expanded. In order to expand the filesystem, the luks volume must also be expanded to fill the remaining space in the logical volume. First, lets get luks path we need for the root filesystem by running

```terminal
~ # df -h /
Filesystem                                             Size  Used Avail Use% Mounted on
/dev/mapper/luks-635686e2-01e1-48da-b0a4-a9bc7b27bbaf   17G  6.2G   11G  37% /
```

Now that we know which volume under `/dev/mapper` we need to expand, we can do so with

```bash
cryptsetup resize luks-635686e2-01e1-48da-b0a4-a9bc7b27bbaf 
```

Finally, we can grow the filesystem

```bash
# for XFS
xfs_growfs /
# for EXT4
resize2fs /
```

Ensure the new space is made available

```bash
df -h /
```
