# firewalld Configuration via XML

Typically, you interact with your RHEL machine's firewall through `firewall-cmd` commands. Examples of this usage [can be found in firewall-cmd.md](./firewall-cmd.md). However, it sometimes can be useful to directly configure the firewall via configuration files, especially if you are to apply the same rules across many servers with a tool like Ansible. In this case, you can simply distribute the configuration across the machines and reload.

## Configuration XML

All `firewalld` configuration files live in `/etc/firewalld/`. The following are a subset of the full capabilities, but are the ones I've used in the past.

### Custom Services

You may define custom services inside `/etc/firewalld/services`. For example,

```xml
<!-- /etc/firewalld/services/gitlab-container-registry.xml -->
<?xml version="1.0" encoding="utf-8"?>
<service>
  <port port="5050" protocol="tcp"/>
</service>
```

defines a service called `gitlab-container-registry` which can then be used later in different rules.

### Zones

Zone configurations live in `/etc/firewalld/zones`. Each XML file here defines a different zone. The default `public.xml` zone may look something like:

```xml
<!-- /etc/firewalld/zones/public.xml -->
<?xml version="1.0" encoding="utf-8"?>
<zone>
  <short>Public</short>
  <description>For use in public areas. You do not trust the other computers on networks to not harm your computer. Only selected incoming connections are accepted.</description>
  <service name="http"/>
  <service name="https"/>
  <!-- NOTE that we use our previously defined custom service! -->
  <service name="gitlab-container-registry"/>
</zone>
```

A different custom zone, say for specific administrative tasks, may look something like

```xml
<!-- /etc/firewalld/zones/admin-zone.xml -->
<?xml version="1.0" encoding="utf-8"?>
<zone target="DROP">
  <!-- rules from the public zone -->
  <service name="http"/>
  <service name="https"/>
  <service name="gitlab-container-registry"/>
  
  <!-- extra rules for admin tasks -->
  <service name="ssh"/>
  <service name="cockpit"/>
  <service name="rdp"/>
  <port port="1234" protocol="tcp"/>
  <source address="192.168.x.x"/>
  <source address="192.168.x.0/24"/>
</zone>
```

Note that we included all rules from the public zone so that admins may still access public resources, which allows us to turn off `AllowZoneDrifting`. See [these notes](./zone-drifting-and-docker.md) on zone drifting for more context.

You may also configure the target inside the zone definition. In this case, I explicitly set it to `DROP` (which is the default), meaning packets who do not match a particular rule are dropped. If instead I used `ACCEPT`, this behavior would be reversed. Packets matching a rule would be dropped, while others are accepted.
