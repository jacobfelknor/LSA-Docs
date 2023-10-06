# Test Hardware Failures

It is good practice to simulate drive failures. Here is a collection of things I've learned during experimentation.
See the [official minio docs](https://min.io/docs/minio/linux/operations/data-recovery.html) for more information.

## Testing Drive Failures by Unmounting

First, in any environment, you can simulate a disk failure by simply unmounting the drive. The process below has been tested to work.

1. Create labeled `xfs` filesystems on the `N` disks, and mount via `/etc/fstab` by label to maintain ordering. When creating mount points, have `root` own the underlying mount point, and `minio-user` own the mounted volumes. This is important so that the `minio-user` does not attempt to initialize the underlying directory when disk in unmounted.
2. Unmount disk to test failure
3. Remount disk to a different location and wipe it.
4. Unmount from temp location and remount to original location
5. Watch the log with `journalctl -f -u minio`, then remount with `mount -a`. You should eventually see something like

    ```log
    Nov 01 09:31:01 minio-test minio[7417]: Healing drive '/mnt/disk4' complete (healed: 11, failed: 0).
    Nov 01 09:31:03 minio-test minio[7417]: Healing drive '/mnt/disk3' complete (healed: 11, failed: 0).
    ```

    You may need to run a `mc admin heal -r ALIAS` to get here, although the healing process should be automatic.
6. Check the output of `mc admin heal ALIAS/ --verbose` to see current status.

## Testing in Virtualized Environment

### Drive Failures

If you're testing configurations in virtualized environments (probably the best idea), you can simulate the drive failure by removing the virtual disk from the VM through the hypervisor.

> **IMPORTANT**: if you attempt to simulate the failure by deleting via `rm` the virtual disk file outside the scope of your hypervisor, this will not actually work because the VM process has opened the file and maintains a link to it. See [this RedHat article](https://access.redhat.com/solutions/2316) for more information.

Successful SNMD drive failure testing procedure via this method:

1. Create a VM host and `N` additional virtual disks (don't use the root filesystem disk!) for an instance.
2. Create labeled `xfs` filesystems on the `N` disks, and mount via `/etc/fstab` by label to maintain ordering. When creating mount points, have `root` own the underlying mount point, and `minio-user` own the mounted volumes. This is important so that the `minio-user` does not attempt to initialize the underlying directory when disk in unmounted.
3. Configure and start `minio` instance, and upload some test data.
4. Remove a virtual disk via the hypervisor. Verify you can still read/write to instance. Repeat as necessary, depending on the level of parity you want to test. View the server's status as you remove the, via the console or `mc admin info ALIAS`.
5. Delete the existing virtual disk on your hypervisor (don't want to reattach a disk with existing data).
6. Create a fresh virtual disk with the same capacity as previous. Reattach this to your VM.
7. Repeat step 2, modifying `/etc/fstab` if necessary (but you shouldn't have to if labeled the same).
8. Watch the log with `journalctl -f -u minio`, then remount with `mount -a`. You should eventually see something like

    ```log
    Nov 01 09:31:01 minio-test minio[7417]: Healing drive '/mnt/disk4' complete (healed: 11, failed: 0).
    Nov 01 09:31:03 minio-test minio[7417]: Healing drive '/mnt/disk3' complete (healed: 11, failed: 0).
    ```

    You may need to run a `mc admin heal -r ALIAS` to get here, although the healing process should be automatic.

### Node Failures

If you have a node failure and have configured to be tolerant of this (i.e >=4 nodes), the process of replacement is similar. **Importantly, do not try to migrate data from the old node's disk to the new node. They should be reformatted and blank.**


## Testing Baremetal

I have not got a chance to try this yet as I do not have access to the right hardware, but I imagine the process is similar. I'd test a drive failure by unexpectedly removing a drive. I'd test healing process by wiping the old drive elsewhere, then physically reattaching it and making labeled filesystem and remounting