# Bridged Networking

This guide was adapted from the following [techotopia article](https://www.techotopia.com/index.php/Creating_a_RHEL_KVM_Networked_Bridge_Interface)

## Get Current Network Settings

We can show current network connections on the host by running 

```bash
$ sudo nmcli con show

NAME             UUID                                  TYPE      DEVICE
enp5s0f0         486f7e45-d5f5-4d0d-8d04-72553ebd1e41  ethernet  enp5s0f0
docker0          2011da17-793e-48b1-81fa-4b93678b7ae7  bridge    docker0
br-39430d938524  3da5e3bf-5855-4f8c-bc9f-48d6283e9ada  bridge    br-39430d938524
virbr0           9b09d727-10e8-42b5-85f0-f6451b72d224  bridge    virbr0
eno1             e2d107f8-0978-47d6-8e9f-c33b8bae9edf  ethernet  --
enp3s0           a2ad6fe5-2e43-4221-a563-04cb1a5882e3  ethernet  --
enp5s0f1         262498fd-3b04-406a-b5b5-2b2ab09a0cfa  ethernet  --
```

We can also show the virtual networks defined on the host with

```bash
$ sudo virsh net-list --all
Name      State    Autostart   Persistent
--------------------------------------------
 default   active   yes         yes
```

We can see that before we make our changes, the only virtual network available is the default one who will be NAT'd behind the host.

## Creating a Network Bridge from the Command Line

The first step is to add a new connection to the network configurations.

```bash
# add an interface named "br0" and also name the connection "br0"
sudo nmcli con add ifname br0 type bridge con-name br0
```

> NOTE: At this step, if you get an error like `Error: Failed to add 'br0' connection: ipv6.addr-gen-mode: property is invalid`, try restarting the `NetworkManager` service with `sudo systemctl restart NetworkManager`

Once you've created the connection, a bridge slave interface needs to be established between the physical device (the slave) and the bridge connection `br0` (the master):

```bash
# Note: replace 'enp5s0f0' with the name of your network interface
sudo nmcli con add type bridge-slave ifname enp5s0f0 master br0
```

Now, `NetworkManager`'s connection list should show your new bridge

```bash
$ sudo nmcli con show
NAME                   UUID                                  TYPE      DEVICE
br0                    447f6c80-0180-4bc1-b78e-e4c4b7b3905a  bridge    br0
enp5s0f0               486f7e45-d5f5-4d0d-8d04-72553ebd1e41  ethernet  enp5s0f0
docker0                2011da17-793e-48b1-81fa-4b93678b7ae7  bridge    docker0
br-39430d938524        3da5e3bf-5855-4f8c-bc9f-48d6283e9ada  bridge    br-39430d938524
virbr0                 9b09d727-10e8-42b5-85f0-f6451b72d224  bridge    virbr0
bridge-slave-enp5s0f0  204217cc-d655-49cf-9cd5-a7f2ab26fced  ethernet  --
eno1                   e2d107f8-0978-47d6-8e9f-c33b8bae9edf  ethernet  --
enp3s0                 a2ad6fe5-2e43-4221-a563-04cb1a5882e3  ethernet  --
enp5s0f1               262498fd-3b04-406a-b5b5-2b2ab09a0cfa  ethernet  --
```

We can now start the bridge interface. If you are currently connected over the network (like SSH or RDP), you'll need to place these commands into a shell script so we can execute them all at once. We'll need to bring down the existing interface which will close your current session with the server. Create the following script:

```bash
#!/bin/bash
nmcli con down enp5s0f0 # replace me with the correct name!
nmcli con up br0
```

Then, `chmod u+x` your script and execute it. You'll be kicked out of your existing connection but should be able to reconnect momentarily.

Once you reconnect, the connection list should now include both the bridge and the bridge-slave connections. Also note that the original network interface is no longer active. You can filter the active connections like so 

```bash
$ sudo nmcli con show --active
NAME                   UUID                                  TYPE      DEVICE
br0                    447f6c80-0180-4bc1-b78e-e4c4b7b3905a  bridge    br0
docker0                2011da17-793e-48b1-81fa-4b93678b7ae7  bridge    docker0
br-39430d938524        3da5e3bf-5855-4f8c-bc9f-48d6283e9ada  bridge    br-39430d938524
virbr0                 9b09d727-10e8-42b5-85f0-f6451b72d224  bridge    virbr0
bridge-slave-enp5s0f0  204217cc-d655-49cf-9cd5-a7f2ab26fced  ethernet  enp5s0f0
```

## Adding the Bridged Network to KVM

We've added our bridged interface to our system, but have not told the KVM environment about it.

```bash
$ sudo virsh net-list --all
Name      State    Autostart   Persistent
--------------------------------------------
 default   active   yes         yes
```

We need to create an xml file describing the bridged network for KVM.

```xml
<!-- bridge.xml -->
<network>
  <name>br0</name>
  <forward mode="bridge"/>
  <bridge name="br0" />
</network>
```

Then, use `virsh` to define the new network

```bash
sudo virsh net-define bridge.xml
```

We should now start the network and configure it to autostart after the host reboots.

```bash
sudo virsh net-start br0
sudo virsh net-autostart br0
```

Finally, verify that the bridge shows up to KVM

```bash
$ sudo virsh net-list --all
 Name      State    Autostart   Persistent
--------------------------------------------
 br0       active   yes         yes
 default   active   yes         yes
```

You may now use the bridged interface when setting up your VMs.

## Verify VM is on Bridge

You can verify that your VM is using the same bridged network as the host by using the `brctl` command. You may need to install the `bridge-utils` package before you're able to use it. Note the `vnet3` interface, which represents one of the VMs.

```bash
$ sudo brctl show
bridge name     bridge id               STP enabled     interfaces
br0             8000.b49691d62798       yes             enp5s0f0
                                                        vnet3
docker0         8000.02421d6fb3d9       no
virbr0          8000.5254009b5739       yes
```

## Destroy Virtual Network

Much of these directions can be followed in reverse order. Ensure that no VMs are using the network you want to destroy.

The first step is to dissociate the bridge with KVM

```bash
sudo virsh net-destroy br0
sudo virsh net-undefine br0
# ensure interface has been removed 
sudo virsh net-list --all
```

Then, bring down `br0` and back up your original interface. For example,

```bash
#!/bin/bash
nmcli con down br0
nmcli con up enp5s0f0
```

Finally, we can delete the network interfaces using `nmcli`

```bash
sudo nmcli con delete br0
sudo nmcli con delete bridge-slave-enp5s0f0
```

Verify your changes have been applied by running `nmcli con show` and inspecting the output.
