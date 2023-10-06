# SAMBA + s3fs

We can mount our buckets over the network to windows clients by "proxying" them through SAMBA. On the SAMBA host, we share a directory where we've mounted a bucket via `s3fs`.

```bash
sudo dnf install s3fs-fuse
echo ACCESS_KEY_ID:SECRET_ACCESS_KEY > ${HOME}/.passwd-s3fs
chmod 600 ${HOME}/.passwd-s3fs
cd /mnt
sudo mkdir samba-bucket
```

We also need to uncomment `user_allow_other` in `/etc/fuse.conf`. This will allow other users to see the new mounted bucket (i.e, those authenticating through SAMBA). While mounting, we also need to ensure we include the `-o allow_other` option in the command.

```bash
s3fs samba-bucket /mnt/samba-bucket/ -o passwd_file=${HOME}/.passwd-s3fs -o url=http://host.example.local:9000 -o use_path_request_style -o dbglevel=info -o allow_other
```

## Try this method next....

https://ubuntu.com/server/docs/samba-active-directory

## Or if you absolutely need SSSD and RHEL....

Try this, from [this reddit post](https://www.reddit.com/r/redhat/comments/brc7v6/comment/f0t16dw/?utm_source=share&utm_medium=web2x&context=3), or [this official solution from RedHat](https://access.redhat.com/solutions/3802321)

```bash
yum -y install sssd realmd oddjob oddjob-mkhomedir adcli samba-common-tools samba autofs samba-winbind samba-client

realm join DOMAIN.COM -U Administrator --client-software=sssd --membership-software=samba

systemctl stop sssd ; rm -f /var/lib/sss/db/* ; systemctl start sssd

yum remove sssd-libwbclient
yum install sssd-winbind-idmap
```

```ini
#/etc/samba/smb.conf
[global]
realm = DOMAIN.COM
workgroup = DOMAIN
security = ads
kerberos method = system keytab
idmap config * : backend = tdb
template homedir = /home/%U
idmap config * : range = 10000-199999
idmap config DOMAIN : backend = sss
idmap config DOMAIN : range = 200000-2147483647
passdb backend = tdbsam
load printers = no
```

```bash
systemctl enable smb ; systemctl enable winbind ; systemctl restart smb ; systemctl restart winbind
```

## A lot of unsuccessful (for AD at least) experimenting below

Based on
https://www.liquidweb.com/kb/how-to-install-samba-on-linux-windows/#:~:text=What%20is%20Samba%3F,of%20the%20SMB%2FCIFS%20protocol.

```bash
sudo dnf install samba samba-client samba-common
sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak
sudo vim /etc/samba/smb.conf
```

```ini
# See smb.conf.example for a more detailed config file or
# read the smb.conf manpage.
# Run 'testparm' to verify the config is correct after
# you modified it.

[global]
        # this only works if samba password is the same as your AD password
        workgroup = SAMBA
        security = user

        passdb backend = tdbsam

        # below doesn't work out of the box, unfortunately
        # unix password sync = yes

        printing = cups
        printcap name = cups
        load printers = yes
        cups options = raw

[samba-bucket]
        comment = test bucked proxied through samba
        path = /mnt/samba-bucket
        valid users = @linux_admins # this is a group name
        guest ok = no
        writable = yes
        browsable = yes
```

```bash
testparm

sudo firewall-cmd --permanent --zone=public --add-service=samba
sudo firewall-cmd --reload

sudo smbpasswd -a jfelknor
sudo systemctl start smb nmb
sudo systemctl enable smb nmb
```

SELinux will block if enforcing


FOR AD USERS, try
https://www.suse.com/support/kb/doc/?id=000020593

need to set domain sid? 

```bash
sudo net getdomainsid
sudo net setdomainsid
```

```ini
# See smb.conf.example for a more detailed config file or
# read the smb.conf manpage.
# Run 'testparm' to verify the config is correct after
# you modified it.

[global]
# DEFAULT
#       workgroup = SAMBA
#        security = user
#        passdb backend = tdbsam


# AD settings
        #workgroup = EXAMPLE
        #realm = EXAMPLE.COM
        #security = ADS
        #kerberos method = secrets and keytab
        idmap config EXAMPLE : backend = sss
        idmap config EXAMPLE : range = 200000-2000200000
        idmap config * : backend = tdb
        idmap config * : range = 10000-19999
        #passdb backend = tdbsam


        workgroup = EXAMPLE
        security = ads
        encrypt passwords = yes
        passdb backend = tdbsam
        realm = EXAMPLE.LOCAL
        # map to guest = Bad User
        kerberos method = secrets and keytab

        # Not interested in printers
        load printers = no
        cups options = raw

        # This stops an annoying message from appearing in logs
        printcap name = /dev/null

        # below doesn't work out of the box, unfortunately
        # unix password sync = yes

#       printing = cups
#       printcap name = cups
#       load printers = yes
#       cups options = raw

[samba-bucket]
        comment = test bucked proxied through samba
        path = /mnt/samba-bucket
        valid users = @group_name
        guest ok = no
        writable = yes
        browsable = yes
        public = no
```