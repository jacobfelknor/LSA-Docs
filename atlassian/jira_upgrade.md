# Upgrade JIRA

Upgrade instructions based on <https://confluence.atlassian.com/adminjiraserver/upgrading-jira-installer-938846937.html>

## Take VM Snapshot

If applicable, take a VM snapshot before starting the upgrade.

## Backup Important Files

The following configuration files should be backed up for later use, where we compare to the new versions created by the upgrade.

- `/opt/atlassian/jira/conf/server.xml`
- `/opt/atlassian/jira/conf/web.xml`
- `/opt/atlassian/jira/bin/setenv.sh`
- `/var/atlassian/application-data/jira/dbconfig.xml`

## Note on systemd

I had a service file at `/usr/lib/systemd/system/jira.service` because I wanted to manage Jira's service with `systemd`. In my case, it's required to manually stop the service via `systemd` instead of with installer, which would use scripts at `/opt/atlassian/jira/bin/<start/stop>-jira.sh` operating outside the scope of`systemd`.

see [confluence upgrade](./confluence_upgrade.md) for a similar situation.

## Download and Install New Version

Download the binary for the version you wish to install. For example, for version `9.12.2`,

```bash
wget https://www.atlassian.com/software/jira/downloads/binary/atlassian-jira-software-9.12.2-x64.bin
```

Run the installer. Ensure that the Jira service was stopped via `systemd` if you use that method.

```bash
chmod +x atlassian-jira-software-9.12.2-x64.bin
sudo ./atlassian-jira-software-9.12.2-x64.bin
```

For an upgrade, we'll want to choose the option representing "upgrade existing installation." For me, this was option 3.

## Compare Configs

For me personally, I had not made any changes that required me to migrate, the way I needed to for [confluence](./confluence_upgrade.md). However, it is a good idea to check anyway for each upgrade to ensure that stays the case for any new updates. There sometimes _are_ changes - just not those that overwrite your custom config - and it can be beneficial to be aware of those.

## Start Confluence

After checking the config, restart the jira service and ensure it comes up after a few minutes

```bash
sudo systemctl restart jira.service
```
