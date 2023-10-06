# LUKS Encryption of Attached Disks

This guide adapted from this [nixCraft article](https://www.cyberciti.biz/security/howto-linux-hard-disk-encryption-with-luks-cryptsetup-command/).

## Pre-requisites

This guide assumes you're encrypting a new blank disk that contains no important data. Any existing data will be erased during this process.

Before we can start, lets install dependencies

```bash
dnf install cryptsetup-luks
```

## Configure LUKS for Disk

Locate the device file for the disk you want to encrypt using `lsblk` or `fdisk -l`. For this guide, we will assume a path `/dev/sdX`. When you've located your disk, run the following

```bash
# -y, for verify passphrase
# -v, for verbose
# --type can be luks1 or luks2. Use luks2 unless you have a reason not to
cryptsetup -y -v --type luks2 luksFormat /dev/sdX
```

We can now create a mapping for our new encrypted device

```bash
# will appear under /dev/mapper/mapper_name
cryptsetup luksOpen /dev/sdX mapper_name
# check that mapping worked 
ls -l /dev/mapper/mapper_name
```

Check status with

```bash
cryptsetup -v status mapper_name
```

## Make Filesystem

If you're extra paranoid, you can write zeros to the whole disk prior to making a filesystem to "protect against usage patterns." If your disks are big, this process can take hours to days. This is an optional step.

```bash
# Optional, if your paranoid and worried about patterns
dd if=/dev/zero of=/dev/mapper/mapper_name status=progress
```

Next, make a filesystem the normal way on the mapped partition

```bash
mkfs.ext4 /dev/mapper/mapper_name
# or XFS
mkfs.xfs /dev/mapper/mapper_name
# or whatever filesystem you want
```

We can now mount this like any other filesystem

```bash
mkdir /mnt/luks_demo
mount /dev/mapper/mapper_name /mnt/luks_demo
```

## Unmounting and Securing

If you want to unmount, close, and secure the encrypted data we can do the following

```bash
umount /mnt/luks_demo
cryptsetup luksClose mapper_name
```

## Change Passphrase

To change the passphrase on encrypted data, we will first add another key (you can have multiple) and remove the old one.

```bash
# Add new
cryptsetup luksAddKey /dev/sdX
# Remove old (you must know the old one to remove it)
cryptsetup luksRemoveKey /dev/sdX
```
