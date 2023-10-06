# XRDP Linux Remote Desktop

## Ubuntu

1. Install `xrdp`

```bash
sudo apt install xrdp
# after install, ensure it's running
sudo systemctl status xrdp
```

2. When `xrdp` is installed, an SSL certificate key is placed in `/etc/ssl/private/`. We need to add the `xrdp` user to the `ssl-cert` group so they can read it.

```bash
sudo adduser xrdp ssl-cert
```

3. Open the port on the firewall

```bash
sudo ufw allow 3389
# this is a very permissive rule... can also restrict to certain subnets
# for ex, sudo ufw allow from 192.168.xxx.xxx/xxx to any port 3389
sudo ufw reload
sudo ufw status
```

4. Try connecting via RDP. Likely, you will get a black screen after trying to log in. Here's a fix:

```bash
# /etc/xrdp/startwm.sh
...
unset DBUS_SESSION_BUS_ADDRESS
unset XDG_RUNTIME_DIR
# place the lines above right BEFORE the following statements at the end of the file
test -x /etc/X11/Xsession && exec /etc/X11/Xsession
exec /bin/sh /etc/X11/Xsession
```

5. Try connecting via RDP again. The black screen issue should be fixed, but now you'll likely be prompted for an administrator (i.e, `root`) password, claiming its "required to create a color managed device". We don't want this. To fix, we need to edit `Polkit`'s config. Create the following file

`/etc/polkit-1/localauthority/50-local.d/45-allow-colord.pkla`

```
[Allow Colord all Users]
Identity=unix-user:*
Action=org.freedesktop.color-manager.create-device;org.freedesktop.color-manager.create-profile;org.freedesktop.color-manager.delete-device;org.freedesktop.color-manager.delete-profile;org.freedesktop.color-manager.modify-device;org.freedesktop.color-manager.modify-profile
ResultAny=no
ResultInactive=no
ResultActive=yes
```

6. Show Desktop Icons/Dock (Optional)

By default, in the remote session you won't be able to see the dock or desktop icons. If you want to enable this, while in a remote session

```bash
sudo apt install gnome-tweak-tool
# if the above fails, try
sudo apt install gnome-tweaks
```

Open `gnome-tweaks`, under `Extensions`, enable desktop icons, ubuntu appindicatiors, and the Ubuntu dock. Under `Appearance`, select the `Yaru` theme.

## RHEL 8

1. Install `xrdp`, `xorgrdp`, and `xrdp-selinux` (which should come as a dependency of `xrdp`, but ensure that it is installed)

```bash
sudo dnf install xrdp xorgxrdp xrdp-selinux
```

2. To enable `xorg` connections, which work better than `xvnc` in my experience, uncomment its config. Search for the string `"Xorg"` to find these lines. You shouldn't have to modify them, just uncomment

```bash
# /etc/xrdp/xrdp.ini
...
[Xorg]
name=Xorg
lib=libxup.so
username=ask
password=ask
ip=127.0.0.1
port=-1
code=20
...
```

3. Finally, allow the port using `firewall-cmd`

```bash
sudo firewall-cmd --zone=public --add-port=3389/tcp --permanent
sudo firewall-cmd --reload
```

4. Try connecting via RDP!

5. Gotcha!'s
    - If you're logged in via the physical console, log in in via RDP will immediately kick you out. To ensure RDP works, log out of the physical console

6. Optional GNOME tweaks

```bash
sudo dnf install gnome-tweaks
```

Open `gnome-tweaks` via the cmd line or searching for `"Tweaks"` after hitting the super key (windows key).
I usually enable `Extensions -> Window list` to view opened windows in a panel on the bottom of the screen and `Windows -> Titelbar Buttons -> Maximize & Minimize` to add these options like they are in Ubuntu
