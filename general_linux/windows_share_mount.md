# Mount Windows Share

We can mount a network windows share with `cifs` on linux. First, install the necessary package.

```bash
sudo apt install cifs-utils
# or
sudo dnf install cifs-utils
```

## One Off Mount

If you need temporary access to the share, we will just mount using command line.

```bash
# omit domain if not needed
sudo mount -t cifs //WIN_SHARE_IP/<share_name> /mnt/win_share -o username=user,domain=DOMAIN
```

## Persistent Mount

If, instead, you need a permanent mount that persists after reboot, we will add the following to `/etc/fstab`

```text
//WIN_SHARE_IP/<share_name>  /mnt/win_share cifs  uid=user,rw,suid,credentials=/root/secret.txt,file_mode=0440,dir_mode=0550 0 0
```

If you'd like to instead mount for a particular user on login, see [libpam-mount](./libpam_mount.md)
