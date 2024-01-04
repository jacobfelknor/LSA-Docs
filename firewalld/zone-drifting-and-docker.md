# Zone Drifting and Docker Zones

I took some time to investigate `firewalld` Linux firewalls, Zone Drifting, and the `Docker Zone` so that I can make informed decisions for future usage. The main goals I set out to address were

1. Should I use Zone Drifting as a part of my firewall strategy
2. Which zones should I configure on linux servers
3. How the `Docker Zone` plays in to all of this

At this point, I have a pretty solid understanding of how these things are working. I'll start by explaining what an environment using Zone Drifting looks like and why things are working the way they are.

## Current Zoning

1. `Public Zone`
    - scoped by interface, (usually `eth0`)
    - Default target is `DROP`
        - packet is dropped when it doesn't match a rule
    - Any packets received over this interface may be subject to these rules, depending on evaluation of other zones (more on this later)
    - Should contain rules for services that must be "publicly" (to our internal network) available for users
        - examples: `http(s)`
2. `Admin Zone`
    - scoped by IP source
        - these IP sources could be a management VLAN, or certain specific IPs who should be allowed access to certain services that others shouldn't
    - Target is `DROP`
        - packet is dropped (or "drifts" to `Public Zone`) when it doesn't match a rule
    - Any packets received from these IP(s) are subject to these rules (but may "drift" back to `Public Zone` if received on `eth0` and have no matches here)
    - Should contain rules for services that must be accessed by admins or other servers
        - examples: `ssh`, `cockpit`, `zabbix`
3. `Docker Zone`
    - scoped by interface
        - this interface is the virtual bridge between the docker networks and the host network
    - Target is `ACCEPT`
        - any traffic between the Docker networks and Host network is allowed, unless a rule to drop is specified here

## Zone Drifting

Zone Drifting is an undocumented behavior which allows packets to "drift" from one zone to another in certain situations. From a [RedHat support article](https://access.redhat.com/articles/4855631) and the [firewalld documentation](https://firewalld.org/2020/01/allowzonedrifting),

```ini
AllowZoneDrifting
# Older versions of firewalld had undocumented behavior known as "zone
# drifting". This allowed packets to ingress multiple zones - this is a
# violation of zone based firewalls. However, some users rely on this behavior
# to have a "catch-all" zone, e.g. the default zone. You can enable this if you
# desire such behavior. It's disabled by default for security reasons

# Note: If "yes" packets will only drift from source based zones to interface
# based zones (including the default zone). Packets never drift from interface
# based zones to other interfaces based zones (including the default zone)
```

You may rely on this behavior to handle requests that come from the machines who fall in the `Admin Zone`'s scope,, but are not "admin" requests. For example, if machine like this attempts to reach the webserver on a host, but ports `80` and `443` are only specified in the `Public Zone` and not the `Admin Zone`, the packets drift to the `Public Zone` after not matching in the `Admin Zone` because they were received on `eth0`. In that zone, the packets match the `http(s)` rule are are `ACCEPTED`. With Zone Drifting disabled, the second those packets do not match a rule in the matched Zone, the request is evaluated against the zone target (in this case, `DROP`), and the packets are dropped.

## Future Work - Should we use Zone Drifting?

The short answer is no.

In RHEL 9, the `AllowZoneDrifting` option is ignored and is no longer a valid configuration, [according to this RedHat support article](https://access.redhat.com/articles/4855631). Any firewall rules relying on drifting should be updated so that all rules that should apply to a particular source are reflected in that single zone. This results in some repeated rules across zones, but adds the guarantee that packets are only evaluated against a single zone. In addition

## Docker Zone

The `Docker Zone` is a bit confusing at first, but at its core this zone handles all traffic between docker networks and the host. [According to their documentation](https://docs.docker.com/network/packet-filtering-firewalls/), **we should not modify these firewall rules**. On RHEL, Docker manages these iptables rules through `firewalld`.

```text
On Linux, Docker manipulates iptables rules to provide network isolation. While this is an implementation detail and you should not modify the rules Docker inserts into your iptables policies, it does have some implications on what you need to do if you want to have your own policies in addition to those managed by Docker.

If you're running Docker on a host that is exposed to the Internet, you will probably want to have iptables policies in place that prevent unauthorized access to containers or other services running on your host.
```

Without any intervention by us, this means that services running in Docker - if their ports have been bound - will be available to any machine with network access to the docker host. Obviously this is not ideal, and we have a few different methods to address this all with the same goal: only bind docker services to localhost , instead of all addresses and interfaces.

### Option 1: Change docker-compose.yml

Our first option is to change our docker-compose.yml so that we explicitly bind to ``127.0.0.1``. This is helpful in cases where you're on a development machine and would like docker services exposed by default, but want to control a subset of them. This would look something like

```yml
# use this
ports:
    - 127.0.0.1:8000:8000
# instead of
ports:
    - 8000:8000
```

### Option 2: Change default bind address

Our other option is to change the default bind address for any exposed ports on the system. This is helpful when in a server environment where you'd like to limit the exposure of your services by default. If necessary, you could always bind to all addresses explicitly by adding `0.0.0.0:port:port` to your docker compose file.

According to the [docker documentation](https://docs.docker.com/network/packet-filtering-firewalls/#setting-the-default-bind-address-for-containers), inside `/etc/docker/daemon.json`,

```json
{
  "ip": "127.0.0.1"
}
```

### Expose Service with Reverse Proxy

After binding your controlled docker services to localhost instead of all addresses, you should expose this service to the network you need to with a reverse proxy, where traffic is served over ports `80` and `443`.

## Proposed Future Zoning

My proposed future zoning is almost identical to where existing zoning, except that the Admin Zone also contains all rules from the Public Zone, and that the sources of the Admin Zone are more constrained. These zones assume no zone drifting is permitted.

1. Public Zone
    - scoped by interface, (usually eth0)
    - Default target is DROP
        - packet is dropped when it doesn't match a rule
    - Any packets received over this interface **who are not captured by a source zone** are subject to these rules
    - Should contain rules for services that must be "publicly" (to our internal network) available for users
        - examples: `http(s)`
2. Admin Zone
    - scoped by IP source
    - these IP sources could be a management VLAN, or certain specific IPs who should be allowed access to certain services that others shouldn't
    - Target is DROP
        - packet is dropped when it doesn't match a rule
    - Any packets received from these IP(s) are subject to these rules
    - Should contain rules for services that must be accessed by admins or other servers, **and additionally contain all services within the `Public Zone`**
        - examples: `ssh`, `cockpit`, `zabbix`
3. Docker Zone
    - scoped by interface
    - this interface is the virtual bridge between the docker networks and the host network
    - Target is `ACCEPT`
        - any traffic between the Docker networks and Host network is allowed, unless a rule to drop is specified here.
        - We will not have any such rules as we will control address binding through docker, not the firewall.
