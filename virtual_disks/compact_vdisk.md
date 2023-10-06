# Compacting a Virtual Disk

Dynamically expanding virtual hard disks can be really nice in that they appear to the Guest OS to be the full size specified but will only take as much space as is being used on the Host OS. In other words, no empty space on the Guest will consume space on the Host.

However, a dynamically expanding VHDX will only grow as needed - not shrink. Lets say your VHDX starts at 10GB and you decide to install a huge piece of software that requires 50GB of space. Your VHDX will now be around 60GB on the Host. After installing, you decided that you no longer need this huge software and delete it. 50GB is freed from the Guest, but importantly, the VHDX on the host *remains at 60GB.* To free up this unused space, we can compact the disk.

## Compact VHDX on Windows

Ensure that any VMs using the virtual disks are shut down. Then, we can use `diskpart` to compact the virtual disk.

```powershell
diskpart
# launch above in an admin prompt

DISKPART> select vdisk file="C:\path\to\vdisk"

DiskPart successfully selected the virtual disk file. 

# command to compact disk
DISKPART> compact vdisk

    100 percent complete

DiskPart successfully compacted the virtual disk file
```

## Compact a qcow2 on Linux

Based on [this guide](https://rwmj.wordpress.com/2010/10/19/tip-making-a-disk-image-sparse/)

To ensure that we can compact our disk to the maximum extent, lets first write zeros to any free space left on the device. An easy way to do that is to use the `dd` command, writing from `/dev/zero` to a file continuously until we "run out" of space. After the command finishes, we can then delete the zero'd out file to "recover" the space. After the command completes, we need to sync our disks to clear any cache. Finally, we can delete our `zerofile`.

```bash
dd if=/dev/zero of=zerofile bs=1M
sync
rm zerofile
```

At this point, we need to shut down our guest. In the host OS, we can now perform a "noop" conversion using `qemu-img`. This "conversion" will copy the data from old disk to a new disk image but, importantly, will NOT copy zeros. The result is the compacted disk we desire.

```bash
sudo qemu-img convert -O qcow2 disk.qcow2 shrunk-disk.qcow2
```

> **NOTE:** This requires enough disk space to hold *both* the old and new qcow2 files. In other words, it **does not compact in-place**

## In-Place Compact of qcow2 on Linux

It is also possible to compact the disk in-place using the `virt-sparsify` command. First, ensure there are no snapshots present for the VM and it is shut down. Then, run the following to preform the compaction:

```bash
sudo yum install libguestfs-tools-c
sudo virt-sparsify --in-place disk.img
```
