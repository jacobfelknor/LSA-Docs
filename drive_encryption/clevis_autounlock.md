# Automatic Unlocking of LUKS Volumes on Boot

## via Tang

**TODO!**

This is also be possible via a `tang` server. This has the added advantage of only unlocking automatically if the machine is on (assumed to be) a trusted, secure network. If the machine was "stolen" or otherwise removed from this trusted network, a password would again be required to unlock the machine.

See <https://github.com/latchset/tang>

## via TPM2

These notes based on [RedHat Documentation](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/security_hardening/configuring-automated-unlocking-of-encrypted-volumes-using-policy-based-decryption_security-hardening#configuring-manual-enrollment-of-volumes-using-tpm2_configuring-automated-unlocking-of-encrypted-volumes-using-policy-based-decryption), adapted to work for both RHEL and Ubuntu machines

I also found found the notes at <https://github.com/latchset/clevis?tab=readme-ov-file#binding-luks-volumes> were helpful

```bash
# RHEL (includes tpm tooling by default)
dnf install clevis-luks clevis-dracut
# Ubuntu (requires explicit tpm clevis package)
apt update
apt install clevis-luks clevis-tpm2 clevis-initramfs
```

Check that system has a TPM and it is version 2

```bash
# NOTE: you may need to change the tpm "number"
# in this example it is tmp0
cat /sys/class/tpm/tpm0/tpm_version_major
```

Check for LUKS device

```console
# lsblk
NAME                                          MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINT
sda                                             8:0    0    12G  0 disk
├─sda1                                          8:1    0     1G  0 part  /boot
└─sda2                                          8:2    0    11G  0 part
  └─sda2_crypt                                  253:0  0    11G  0 crypt
    ├─vgubuntu-root                             253:0  0   9.8G  0 lvm   /
    └─vgubuntu-swap          
```

Bind to TPM

```bash
clevis luks bind -d /dev/sda2 tpm2 '{"hash":"sha256","key":"rsa"}'
```

Check that it bound

```console
# clevis luks list -d /dev/sda2
1: tpm2 '{"hash":"sha256","key":"rsa"}'
```

Regenerate the initramfs

```bash
# RHEL
dracut -f -v
# Ubuntu
update-initramfs -u -k 'all'
```

Reboot to test your changes. You should briefly see the prompt to unlock the encrypted disks. However, in the background, `clevis` will be attempting to unlock the disks for you from the TPM. If successful, the boot should resume automatically. If it fails for some reason, the prompt will stick around and you'll need to input the passphrase manually.

## Adjust For New Hardware

If you move the disk to new hardware, or for any other reason the TPM changes or no longer holds the key, we can re-setup the new environment to regain auto-unlocking.

> **NOTE:** you can simulate a fresh TPM by clearing the existing one with `tpm_clear -v`

First, confirm the slot taken by the previous TPM configuration. In this example, it is keyslot 1

```console
# clevis luks list -d /dev/sda2
1: tpm2 '{"hash":"sha256","key":"rsa"}'
```

Clear this configuration, as it is no longer valid

```bash
# -s indicates the slot ('1' in this example, from the command above)
clevis luks unbind -d /dev/sda2 -s 1
```

At this point, we can follow the same procedure for the initial setup with the new hardware/TPM
