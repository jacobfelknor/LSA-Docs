# Migrate VM from KVM to Hyper-V

Recently, I needed to migrate VMs from a KVM hypervisor to a Hyper-V server. In my case, my source format was `qcow2` and my target format was `vhdx`, but the general idea shown here could be applied to different formats.

## Prepare Source VM

Before starting, we need to do some housekeeping on our existing VM:

1. Merge all snapshots
2. Shutdown guest
3. Inspect disk to ensure no remaining snapshot metadata exists, and confirm the details look correct (e.g, `qemu-image info source.qcow`, `qemu-img check source.qcow2`)

## Convert Disk

Next, we will convert the source disk to our target format. We will use `qemu-img` to do so. In my case, it was

```bash
qemu-img convert source.img -O vhdx -o subformat=dynamic dest.vhdx
```

NOTE: I used the linux KVM host to do this conversion. However, `qemu-img` binaries are available at <https://qemu.weilnetz.de/w64/>. I personally did not have any luck generating a working file when using the windows binaries of `qemu`. I was getting a "disk may not be compressed or encrypted" error when trying to boot from converted disk. Attempt at your own risk.

## Copy to Target Hypervisor

Now that we have a converted disk, we can copy it to our target hypervisor. I opted for `scp`, running the following from the target:

```powershell
# change to target dir
cd path\to\target\dir
# scp from source to current dir on target
scp user@host.example:/path/to/converted/disk.vhdx .
```

Once the `vhdx` is copied to your target, you may want to check it with

```powershell
get-vhd .\dest.vhdx
```

## Create New VM

After we've successfully transferred our source disk to the target, we need to create the new VM. You should create it in a way that most closely matches its previous environment. Pay special attention to whether legacy BIOS was used or UEFI. In Hyper-V, you'll need to use "Generation 1" if you used legacy BIOS in your KVM setup. You should not create new storage for this VM. Instead, choose the `vhdx` we copied from our source.

### Attempt Boot

Once created, attempt a first boot. This may or may not work... I've had better luck with Ubuntu in these cases. My RHEL machines were refusing to boot using the default kernel after migration.

### Reinstall Kernel

If your VM shows the GRUB boot menu, and at at least begins but refuses to boot (hanging, erroring out, etc), we may need to reinstall the kernel. In this case, try choosing the rescue kernel from GRUB. If you can successfully boot from there, run the following:

```bash
# remove any previously installed versions of the kernel
dnf remove kernel kernel-core
# reinstall latest available kernel
dnf install kernel kernel-core
```

Then, we need to regenerate the `initramfs` for our new kernel.

```bash
# find kernel version with
ll /lib/modules
# make backup of existing initramfs
cp /boot/initramfs-<kernelVersion>.img /boot/initramfs-<kernelVersion>.img.bak
# then run against desired kernel
dracut -f /boot/initramfs-<kernelVersion>.img  <kernelVersion>
```

Finally, once this finishes, reboot again. You should be able to sucessfully boot with your new kernel and freshly generated `initramfs`.
