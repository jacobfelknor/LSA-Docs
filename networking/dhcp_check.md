# Check for DHCP Server on Interface

It can be helpful sometimes to check if there is a DHCP server for a given interface on your linux machine. This can be helpful to check before setting up a second one, since having two DHCP servers on a single network can lead to unexpected behavior.

To check for a DHCP server on an interface `ethX`,

```bash
nmap --script broadcast-dhcp-discover -e ethX
```

You should get a response like the following

```text
Starting Nmap 7.80 ( https://nmap.org ) at 2023-10-16 13:33 MDT
Pre-scan script results:
| broadcast-dhcp-discover: 
|   Response 1 of 1: 
|     IP Offered: 192.168.xxx.xxx
|     DHCP Message Type: DHCPOFFER
|     Subnet Mask: 255.255.255.0
|     Renewal Time Value: 0s
|     Rebinding Time Value: 0s
|     IP Address Lease Time: 1s
|     Server Identifier: 192.168.xxx.xxx
|     Router: 192.168.xxx.1
|     Domain Name Server: 192.168.xxx.xxx, 192.168.xxx.xxx
|_    Domain Name: example.com\x00
WARNING: No targets were specified, so 0 hosts scanned.
Nmap done: 0 IP addresses (0 hosts up) scanned in 0.29 seconds
```

Which will tell you information such as the IP address offered, the IP of the DHCP server, a default gateway (router), and more.
