# Manual External Snapshots

These instructions assume a "simple" VM configuration where your disk types are all 'file'. You can check which types of disks your VM has with `sudo dumpxml vm_name | grep '<disk' -A10`. They are based on this [blog post](https://fabianlee.org/2021/01/10/kvm-creating-and-reverting-libvirt-external-snapshots/) by Fabian Lee.

## Internal Snapshots

The default snapshot type for KVM is called an internal snapshot. This snapshot type is hidden inside the same `.qcow2` file and is easy to manage with the `virt-manager` GUI. They also only support `qcow2` disks. Internal snapshots of VMs using secure boot and UEFI are **not supported**.

## External Snapshots

In contrast, external snapshots work with any type of disk, VMs using secure UEFI boot, can be taken with not guest downtime, and are more stable and reliable (source, [RedHat Documentation](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-troubleshooting-workaround_for_creating_external_snapshots_with_libvirt#:~:text=Internal%20snapshots%20are%20not%20being,on%20KVM%20guest%20virtual%20machines.)). In addition, external snapshots cannot be managed directly with `virt-manager` and must be managed manually.

The thing I appreciate the most about external snapshots is being able to easily see the size of the snapshot and how much has changed since the previous snapshot (or the base) simply by looking at the filesize of the snapshot.

## Create External Snapshot

We can create an external snapshot using the `virsh` command

```bash
# take external snapshot
sudo virsh snapshot-create-as vm-name --name snapshot-name --disk-only

# list snapshots
sudo virsh snapshot-list vm-name

# confirm we're pointing to latest snapshot
sudo virsh domblklist vm-name
```

This creates a new file named `vm-name.snapshot-name` and updates the XML under the `<disk>` tag to point to the new snapshot file, with the original disk as a `<backingStore>`. All new writes will go to the snapshot file.

## Merging External Snapshots

Inspired by [this libvirt guide](https://libvirt.org/kbase/merging_disk_image_chains.html)

If we want to consolidate one or many external snapshots together back into the base image, we can do so with the `virsh blockcommit` command.

### Merge Entire Chain

Most commonly, you'll want to merge all snapshots back into the base and then, optionally, create a new snapshot to start from. Imagine the following chain:

```text
base.qcow2 <-- a.qcow2 <-- b.qcow2 <-- c.qcow2 (live QEMU)
```

We can verify the current active disk and display this chain with

```bash
# display active disk
sudo virsh domblklist vm-name
# display chain
sudo qemu-img info --force-share --backing-chain path/to/c.qcow2
```

We want all changes from `a.qcow2`, `b.qcow2`, and `c.qcow2` merged into `base.qcow2`. To perform this merge, run

```bash
# target-disk refers to the portion of the VM's XML that looks like 
# <target dev="vda" bus="virtio"/>
# In that example, target-disk is vda
sudo virsh blockcommit vm-name target-disk --verbose --pivot --active
```

At this point, you can safely delete `a.qcow2`, `b.qcow2`, and `c.qcow2` as they are no longer valid. We should also delete their metadata so they do not appear in snapshot lists

```bash
# delete snapshot metadata
sudo virsh snapshot-delete --metadata vm-name snapshot-name
```

### Merge Intermediate Snapshots in Chain

If instead, you'd like to merge only specified intermediate snapshots, we can also accomplish that. Lets assume the same initial chain as before.

```text
base.qcow2 <-- a.qcow2 <-- b.qcow2 <-- c.qcow2 (live QEMU)
```

Again, we can check the current active disk and display the chain the same was as before.

```bash
# display active disk
sudo virsh domblklist vm-name
# display chain
sudo qemu-img info --force-share --backing-chain path/to/c.qcow2
```

We can merge specific intermediate snapshots using the `virsh blockcommit` command. This command takes a "base" and "top" image. The "base" image is the "first" of the chain you want to merge, and the "top" image is the "last" of the chain. For example, if we wanted to merge `a.qcow2` and `b.qcow2` into `base.qcow2`, but leave `c.qcow2`, the "base" image is `base.qcow2` and the "top" is `b.qcow2`. If instead, we wanted to merge `c.qcow2` and `b.qcow2` into `a.qcow2`, "base" would be `a.qcow2` and "top" would be `c.qcow2`.

For this example, we'll show the second case. Perform the merge with the following

```bash
# NOTE: must give absolute paths!
sudo virsh blockcommit vm-name target-disk --base=/path/to/a.qcow2 --top=/path/to/c.qcow2 --verbose --pivot --active
```

Ensure active disk is correctly `a.qcow2`

```bash
sudo virsh domblklist vm-name
```

At this point, `b.qcow2` and `c.qcow2` are left invalid and can be safely deleted. We should also delete their metadata so they do not appear in snapshot lists

```bash
# delete snapshot metadata
sudo virsh snapshot-delete --metadata vm-name snapshot-name
```

## Reverting External Snapshot

1. Shutdown guest. We cannot revert the snapshot while the VM is running.
2. Locate the directory where original disk and snapshots are

    ```bash
    sudo virsh domblklist vm-name
    ```

3. In the directory where the disk/snapshots are stored, you should see both the base and the snapshot file. Confirm they are linked with

    ```text
    # sudo qemu-img info vm-name.snapshot-name

    image: disk-name.snapshot-name
    file format: qcow2
    virtual size: 128 GiB (137438953472 bytes)
    disk size: 258 MiB
    cluster_size: 65536
    backing file: /path/to/disk-name.qcow2
    backing file format: qcow2
    Format specific information:
        compat: 1.1
        compression type: zlib
        lazy refcounts: false
        refcount bits: 16
        corrupt: false
        extended l2: false

    image: /path/to/disk-name.qcow2
    file format: qcow2
    virtual size: 128 GiB (137438953472 bytes)
    disk size: 128 GiB
    cluster_size: 65536
    Format specific information:
        compat: 1.1
        compression type: zlib
        lazy refcounts: false
        refcount bits: 16
        corrupt: false
        extended l2: false`
    ```

4. Edit XML to point back to original disk file and remove snapshot metadata. First, obtain the name of the target

    ```bash
    # look for something like '<target dev="sda" bus="sata"/>'
    # in that case, the target is 'sda' 
    sudo virsh dumpxml vm-name  | grep '<disk' -A10
    ```

    ```bash
    # edit target path back to original qcow2 disk
    # you can also just edit the XML directly from virt-manager, if you prefer
    # ensure the backingStore tag looks correct
    virt-xml vm-name --edit target=target --disk path=/path/to/backing/file --update
    
    # confirm we're pointed back to correct spot
    sudo virsh domblklist vm-name
    
    # delete snapshot metadata
    sudo virsh snapshot-delete --metadata vm-name snapshot-name
    ```

    Additionally, you may need to manually remove the `<backingStore>` tag associated with this snapshot, if the current disk and backing store are the same file. Otherwise, we'll get permission denied messages because it attempts to open the file twice. For example, it may look like this

    ```xml
    <!-- remove this if backingStore is pointing to the same file as the source disk -->
    <backingStore type="file">
        <format type="qcow2"/>
        <source file="path/to/original-disk.qcow2"/>
    </backingStore>
    ```

5. Restart guest
