# Scheduled Simple Backup

This bash script provides a template to run scheduled backups of directories, databases, or other simple backup scenarios. You can specify the retention period, a backup location, and a command to perform.

```bash
#!/bin/bash

backup_date=$(date +%Y-%m-%d)
backup_dir="/path/to/dir"
number_of_days=84 # 12 weeks


# backup command
backup_cmd > "${backup_dir}/backup-${backup_date}"


# Delete backups older than specified number of days
find "${backup_dir}" -type f -prune -mtime +"${number_of_days}" -exec rm -f {} \;
```

## Examples

### Raspberry Pi Backup

> **WARNING:** It is generally not a good idea to perform full disk backups using a program like `dd` using this method, because the disk contents can change while the backup is running. That being said, I've had some success doing so on a raspberry pi. Use at your own risk

```bash
#!/bin/bash

backup_date=$(date +%Y-%m-%d)
backup_dir="/mnt/drive/pibackups"
number_of_days=84 # 12 weeks

# full version
# dd if=/dev/mmcblk0 of="${backup_dir}/rp_bak-${backup_date}.img" bs=4096

# compressed version
dd if=/dev/mmcblk0 bs=4096 | gzip -c > "${backup_dir}/rp_bak-${backup_date}.img.gz"

# to restore, use the following
# gunzip -c /path/to/your-backup.img.gz | dd of=/dev/sdX

# Delete backups older than specified number of days
find "${backup_dir}" -type f -prune -mtime +"${number_of_days}" -exec rm -f {} \;
```

### PostgreSQL Backup

```bash
#!/bin/bash

backup_date=$(date +%Y-%m-%d)
backup_dir="/path/to/dir"
number_of_days=84 # 12 weeks


# backup command
pg_dump database_name > "${backup_dir}/db_name_backup-${backup_date}"

# restore command
# psql database_name < db_name_backup-date.sql

# Delete backups older than specified number of days
find "${backup_dir}" -type f -prune -mtime +"${number_of_days}" -exec rm -f {} \;
```
