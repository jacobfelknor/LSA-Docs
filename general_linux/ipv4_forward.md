# IP Forwarding Linux

By default, a linux machine will drop all incoming packets received that were not intended for them. This can happen, for example, when a switch is building its routing table. At a high level, a switch attempting to reach a host it hasn't seen before will send the packet out all its ports and record which port it got the response from. This leads all other hosts connected to that switch to receive a packet which was not destined for it.

As mentioned, the default behavior is to simply drop these packets, which is the correct action for almost every case, EXCEPT when you intend for your linux machine to act as a router.

## Check if Forwarding is Enabled

We can check if our linux machine is forwarding packets and acting as a "router" by running

```bash
sysctl -a | grep net.ipv4.ip_forward
```

which returns something like

```bash
# we care about the first one!!
# 0 is off, 1 is on
#########################################
net.ipv4.ip_forward = 0
#########################################
net.ipv4.ip_forward_update_priority = 1
net.ipv4.ip_forward_use_pmtu = 0
```

Or we can check a proc file with `cat`

```bash
cat /proc/sys/net/ipv4/ip_forward
# prints 0 or 1
```

## Turn On or Off Forwarding

To turn on ip forwarding, we can do

```bash
# turn on through sysctl
sysctl -w net.ipv4.ip_forward=1
# turn on with proc file
echo 1 > /proc/sys/net/ipv4/ip_forward
```

To turn off, we can do

```bash
# turn off through sysctl
sysctl -w net.ipv4.ip_forward=0
# turn off with proc file
echo 0 > /proc/sys/net/ipv4/ip_forward
```
