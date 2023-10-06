# Firewall on RHEL

On RHEL, we manage the firewall through a program called `firewall-cmd`. Here are some common tasks

## Open by Port

These assume that your default zone is `public`, which can be checked with `firewall-cmd --get-default-zone`. Generally speaking, its better to use zones (see next section) but these are sufficient for development and testing machines.

Add a port with

```bash
sudo firewall-cmd --zone=public --add-port=<port>/tcp --permanent
sudo firewall-cmd --reload
```

Remove a port with

```bash
sudo firewall-cmd --zone=public --remove-port=<port>/tcp --permanent
sudo firewall-cmd --reload
```

## Firewall Zones

There is really good documentation by RedHat [here](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_and_managing_networking/using-and-configuring-firewalld_configuring-and-managing-networking#working-with-firewalld-zones_using-and-configuring-firewalld) that this is based on

### Create a Zone

```bash
firewall-cmd --permanent --new-zone=zone-name
# check if we can see our new zone
firewall-cmd --get-zones
# make zone persistent
firewall-cmd --runtime-to-permanent
```

See [RedHat Docs](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_and_managing_networking/using-and-configuring-firewalld_configuring-and-managing-networking#creating-a-new-zone_working-with-firewalld-zones) for info on Zone config files. We can also manage our zones through these, especially in cases where we want to copy and existing zone but modify it slightly.

### List Zones

```bash
sudo firewall-cmd --get-zones
```

### List Sources for Zone

```bash
sudo firewall-cmd --zone=zone-name --list-sources
```

### Add Source to Zone

It is possible to manage much of the firewall configuration through the Cockpit web console. One area I noticed was missing was changing the allowed addresses for a particular firewall zone. We can do this through the command line.

```bash
sudo firewall-cmd --zone=zone-name --add-source=source
# for example, if your source IP is 192.168.0.10
# and your zone name is 'admin'
sudo firewall-cmd --zone=admin --add-source=192.168.0.10
# Remember to make settings persistent and reload!
```

For the source, you may also specify and IP range, like `192.168.0.0/24`.

### Remove Source from Zone

```bash
sudo firewall-cmd --zone=zone-name --remove-source=source 
# Remember to make settings persistent and reload!
```

### Make Runtime Settings Persistent and Reload

When we're comfortable with our new settings, we can make them persistent with

```bash
# set the current runtime settings as our permanent settings
sudo firewall-cmd --runtime-to-permanent
# reload to take effect
sudo firewall-cmd --reload
```
