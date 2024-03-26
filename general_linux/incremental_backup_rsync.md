# Incremental Backup via rsync

We can perform an incremental backup of a directory using the `rsync` command. This strategy relies on hard filesystem links to avoid copying redundant data. Navigating to any given "backup" directory will show the directory as it existed on that day. Any new or modified files since the previous backup will be copied to the backup location, but unmodified files will simply get a new hardlink (maintaining the appearance of the original file, but not taking any additional space!).

Original source: <https://linuxconfig.org/how-to-create-incremental-backups-using-rsync-on-linux>

```bash
#!/bin/bash

# A script to perform incremental backups using rsync

set -o errexit
set -o nounset
set -o pipefail

readonly SOURCE_DIR="${HOME}"
readonly BACKUP_DIR="/mnt/data/backups"
readonly DATETIME="$(date '+%Y-%m-%d_%H:%M:%S')"
readonly BACKUP_PATH="${BACKUP_DIR}/${DATETIME}"
readonly LATEST_LINK="${BACKUP_DIR}/latest"

mkdir -p "${BACKUP_DIR}"

rsync -av --delete \
  "${SOURCE_DIR}/" \
  --link-dest "${LATEST_LINK}" \
  --exclude=".cache" \
  "${BACKUP_PATH}"

rm -rf "${LATEST_LINK}"
ln -s "${BACKUP_PATH}" "${LATEST_LINK}"
```
