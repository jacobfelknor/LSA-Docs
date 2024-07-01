# Upgrade Confluence

Upgrade instruction notes based on <https://confluence.atlassian.com/doc/upgrading-confluence-4578.html>

## Take VM Snapshot

If applicable, take a VM snapshot before starting the upgrade.

## Backup Important Files

The following configuration files and MySQL connector should be backed up for later use:

- `/opt/atlassian/confluence/conf/server.xml`
- `/opt/atlassian/confluence/bin/setenv.sh`
- `/opt/atlassian/confluence/confluence/WEB-INF/lib/mysql-connector-java.jar`

I usually copy the files from the server using `scp`, placing them in my working location in VSCode to use its compare features.

```bash
mkdir -p ./confluence_upgrade/before
scp user@confluence:/opt/atlassian/confluence/conf/server.xml ./confluence_upgrade/before/server.xml
scp user@confluence:/opt/atlassian/confluence/bin/setenv.sh ./confluence_upgrade/before/setenv.xml
scp user@confluence:/opt/atlassian/confluence/confluence/WEB-INF/lib/mysql-connector-java.jar ./confluence_upgrade/before/mysql-connector-java.jar
```

We will compare these file versions to those which the installer created.

## Download and Install New Version

Download the binary for the version you wish to install. See <https://www.atlassian.com/software/confluence/download-archives>

For example, for version `8.5.4`,

```bash
wget https://www.atlassian.com/software/confluence/downloads/binary/atlassian-confluence-8.5.4-x64.bin
```

Run the installer

```bash
chmod +x atlassian-confluence-8.5.4-x64.bin
sudo ./atlassian-confluence-8.5.4-x64.bin
```

Couple things to note:

1. I choose "no" for making any backups, because I have a VM snapshot to revert to if necessary
2. Depending on how old your installation is the service associated with confluence
    - May be based on the older `init.d` system and not `systemd`. Keep an eye on this if `systemd` ever stops supporting it
    - Is not controlled via the installer. The questions asking if the installer should start or stop the service did so externally from the `init.d` service. This means that confluence may be running but the service reports it as dead (or vice versa). I typically opt to use the `init.d` service and not use the installer so it status consistent.

## Compare Configs

Copy files from the server to local again in order to compare.

```bash
mkdir -p ./confluence_upgrade/after
scp user@confluence:/opt/atlassian/confluence/conf/server.xml ./confluence_upgrade/after/server.xml
scp user@confluence:/opt/atlassian/confluence/bin/setenv.sh ./confluence_upgrade/after/setenv.xml
scp user@confluence:/opt/atlassian/confluence/confluence/WEB-INF/lib/mysql-connector-java.jar ./confluence_upgrade/after/mysql-connector-java.jar
```

Compare the configuration files you backed up in the first step with the new versions created by the upgrade.

For `/opt/atlassian/confluence/conf/server.xml`,

```diff
<Connector port="8090" connectionTimeout="20000" redirectPort="8443"
        maxThreads="48" maxPostSize="16777216" minSpareThreads="10"
        enableLookups="false" acceptCount="10" URIEncoding="UTF-8"
        protocol="org.apache.coyote.http11.Http11NioProtocol"
+        proxyName="confluence.example.com" proxyPort="443" scheme="https"/>
```

For `/opt/atlassian/confluence/bin/setenv.sh`, set your desired Java Heap Size with

```diff
# Set the Java heap size
- CATALINA_OPTS="-Xms1024m -Xmx1024m ${CATALINA_OPTS}"
+ CATALINA_OPTS="-Xms4096m -Xmx4096m ${CATALINA_OPTS}"
```

Finally, ensure the MySQL connector `/opt/atlassian/confluence/confluence/WEB-INF/lib/mysql-connector-java.jar` is present. If it is not, restore it from your earlier copy.

## Start Confluence

After making your config changes, restart the confluence service and ensure it comes up after a few minutes

```bash
sudo systemctl restart confluence.service
```
