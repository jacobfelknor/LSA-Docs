# Backup/Restore an XFS Filesystem Using Remote Object Storage

I had an idea while writing [remove disk from lvm](./remove_disk_from_lv.md) when thinking about how to handle the case where you grow the XFS filesystem to fill the whole LV, the XFS filesystem has enough "free" space to theoretically remove one of the disks, but you cannot follow the procedure exactly because the LV is "full" because of the XFS filesystem spanning it.

We can use the `xfs_dump` command to backup an XFS filesystem to a file. If there is not enough locally attached storage to the machine to do so, we could stream the output of this command to remote object storage. Then, later when restoring using `xfs_restore`, you could again stream the backup from object storage to your local disk.

See <https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/storage_administration_guide/xfsbackuprestore> for notes on the `xfs_dump` and `xfs_restore` commands.
