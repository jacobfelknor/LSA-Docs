# Unattended Upgrades

adapted from <https://www.digitalocean.com/community/tutorials/how-to-keep-ubuntu-20-04-servers-updated>

## Enable

Unattended upgrades automatically retrieves and installs security patches and other essential upgrades for your server. To set up for the first time,

```bash
sudo apt update
sudo apt install unattended-upgrades

# check that service is running
sudo systemctl status unattended-upgrades.service
```

We can configure some common options at `/etc/apt/apt.conf.d/50unattended-upgrades`. This includes whether to automatically reboot, which repositories to pull from, etc. When you're done configuring, we must reload the service with

```bash
sudo systemctl reload unattended-upgrades.service
```

## Re-enable or Disable Unattended Upgrades

If, later, you change your mind about whether you'd like unattended upgrades to be enables, you may always reconfigure the packaged with

```bash
sudo dpkg-reconfigure unattended-upgrades
```

Then, choose "Yes" or "No" when you get prompted.
