# Find Process By Device it's Using

Sometimes you need to unmount a drive but another process is using the device. In this case, you'll get an error like `umount: /mnt/drive: target is busy.`. 
In order to safely `umount` the drive, we must first kill all processes using it. We can find which processes using the device by using the following

```bash
# NOTE: must use /dev/ path to device. Find out which device file by using lsblk
sudo lsof /dev/sdXn
kill -9 <PID>
```

After killing all processes, you should now be able to successfully `umount` the drive.
