# Update MinIO

## Systemd Managed Deployments

Reference [official docs](https://min.io/docs/minio/linux/operations/install-deploy-manage/upgrade-minio-deployment.html#update-systemctl-managed-minio-deployments) on the topic.

Document any Gotcha's here if needed.

## Non-Systemd Managed Deployments

To update these deployments, we should issue the `mc admin update ALIAS` command. An important "gotcha" for this method is that the `minio-user` must have write access to where the `minio` binary is stored. If this binary is in `/usr/local/bin`, it's very likely that this command will fail.
