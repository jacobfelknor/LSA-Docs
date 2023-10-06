# Use Key File to Unlock on Boot

Adapted from <https://www.golinuxcloud.com/mount-luks-encrypted-disk-partition-linux/>

It is possible to unlock a LUKS encrypted drive on boot with a key file. This should be used only for external attached storage that should be mounted on boot, and when the keyfile is also stored on some encrypted volume that gets unlocked on boot via a passphrase. This effectively allows the passphrase on root partition to act as the passphrase for the attached storage as well, since decrypting the root partition allows the keyfiles to be read decrypting the attached storage.

## Create a Key File

We will use `/dev/random` to create a keyfile for our encrypted drives.

```bash
dd if=/dev/random bs=32 count=1 of=/root/lukskey
```

## Add Key to LUKS Volume

Next, we will add our generated key file to our LUKS volume.

> **NOTE:** You can have multiple keys for a given volume, and it is advised that you always keep a passphrase that you'll always remember as one of the keys in case your keyfile becomes lost.

```bash
cryptsetup luksAddKey /dev/sdX /root/lukskey
```

Verify key got added

```bash
cryptsetup luksDump /dev/sdX
```

## Add Entry to crypttab and fstab

Get the UUID for your volume with

```bash
cryptsetup luksUUID /dev/sdX
```

```bash
# /etc/crypttab
luks_name  UUID=luks_UUID  /root/lukskey
```

```bash
# /etc/fstab
# Example for xfs filesystem mounted at /mnt/luks
/dev/mapper/luks_name /mnt/luks  xfs    defaults
```
