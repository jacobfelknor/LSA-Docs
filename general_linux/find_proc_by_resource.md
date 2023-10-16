# Finding Processes Based On Resource

It is helpful to know which processes are using a port, or which ports are used by a process, or other similar situations. the following are a collection of these sorts of commands.

## Find a Process by Port it's Using

It can be incredibly annoying when you try to start a service but the port is already in use. If you want to see which process is using the port, try the following command, replacing `8000` with whatever port you're looking for:

```bash
sudo ss -lptn 'sport = :8000'
```

Example output:

```console
State            Recv-Q           Send-Q                       Local Address:Port                       Peer Address:Port           Process           
LISTEN           0                10                               127.0.0.1:8000                            0.0.0.0:*               users:(("python",pid=109520,fd=7))
```

At this point, you can force stop the offending process with

```bash
kill -9 pid
# in the example above,
kill -9 109520
```

## Find which Ports a Process is Using

Similarly, we can find which ports a certain process is using.

```bash
sudo ss -tulpn | grep LISTEN | grep <pid or name>

# e.g. Find ports that dnsmasq are listening on
sudo ss -tulpn | grep LISTEN | grep dnsmasq

# e.g. Find ports that process with pid 251468 are listening on
sudo ss -tulpn | grep LISTEN | grep 251468
```

You can similar force stop a certain process if you need using the information outputted by this command.

## Find Process By Device it's Using

Sometimes you need to unmount a drive but another process is using the device. In this case, you'll get an error like 

```text
umount: /mnt/drive: target is busy.
```

In order to safely `umount` the drive, we must first kill all processes using it. We can find which processes using the device by using the following

```bash
# NOTE: must use /dev/ path to device. Find out which device file by using lsblk
sudo lsof /dev/sdXn
kill -9 <PID>
```

After killing all processes, you should now be able to successfully `umount` the drive.
