# Static IP for KVM Guest

## Internal NAT Network DHCP Reservation

If you're using the internal NAT network, we can set up a DHCP reservation for the guest. I've used this method in the past, as it is really simple, requires no client configuration, and easy to reverse if you ever want to go back to standard DHCP leases.

Before starting, you'll need three pieces of information about your guest:

- VM name
- MAC address of the interface to get the reservation
- IP address you'd like to reserve.

Once you have these, run

```bash
virsh net-edit default
```

This will open a file that looks something like

```xml
<network>
  <name>default</name>
  <uuid>178dcb76-0876-4b05-9266-0a3b4d114a05</uuid>
  <forward mode='nat'/>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:9b:57:39'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
      <!-- HERE'S AN EXAMPLE OF A DHCP RESERVATION!!!! -->
      <host mac='52:54:00:11:77:81' name='myvmname' ip='192.168.112.93'/>
      <!-- END -->
    </dhcp>
  </ip>
</network>
```

The section of this file that we're interested in is the `<dhcp>` tag. We can configure our DHCP pools here, as well as the example called out where we create a DHCP reservation.

Once this is configured, we need to restart our network.

```bash
# 'destroy' sound scarier than it is. It just brings the network down
# it doesn't delete any configuration
virsh net-destroy default

# bring network back up!
virsh net-start default
```

I'd also consider rebooting your guests to make sure their networks come back up as expected.
