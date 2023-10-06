# Recover From Incorrect UUID Settings

1. Boot into live USB and enter the recovery environment.
2. Select "1" to automatically scan for your disks.
    - You'll be prompted for the passwords to unlock disks if they're encrypted
    - After disks are mounted, run `chroot /mnt/sysroot` so we can work out of our true root filesystem.
3. Note the UUIDs you need for booting by running `lsblk -f`
    - UUID of `xfs` root filesystem under the `luks-....` volume under `rhel-root`. Corresponds with the `root=UUID=.....` option in GRUB. This can be set in `/etc/default/grub` via the `GRUB_DEVICE_UUID=` option
    - UUID of `rhel-root` logical volume. Corresponds to the `rd.luks.uuid` right before `rd.luks.lv=rhel/root`
    - UUID of `rhel-swap` logical volume. Corresponds to the `rd.luks.uuid` right before `rd.luks.lv=rhel/swap` AND the UUID present in the `resume=/dev/mapper/luks-.......` value.

4. `grub2-mkconfig --output /etc/grub2.cfg` to update GRUB

Here is an example `lsblk -f` output

```terminal
[root@localhost ~]# lsblk -f
NAME                  FSTYPE      LABEL UUID                                   MOUNTPOINT
vda                                                                            
├─vda1                xfs               4ae2a52d-3c24-4bb3-958a-8c38aaf63787   /boot
└─vda2                LVM2_member       jy0sw9-TWQK-JMih-nycp-TNrI-e471-PCM3i7 
  ├─rhel-root         crypto_LUKS       635686e2-01e1-48da-b0a4-a9bc7b27bbaf   
  │ └─luks-635686e2-01e1-48da-b0a4-a9bc7b27bbaf
  │                   xfs               14d8a4f5-5c18-461d-8490-88fbb24ac35c   /
  └─rhel-swap         crypto_LUKS       7a861d21-2448-4cd9-9483-58d3d4cc806a   
    └─luks-7a861d21-2448-4cd9-9483-58d3d4cc806a
                      swap              a2d962cb-29b7-498e-83fc-0bb5660d60cc   [SWAP]
```
