# Copying Data Between Buckets

## Copy and Move

https://min.io/docs/minio/linux/reference/minio-mc/mc-cp.html

https://min.io/docs/minio/linux/reference/minio-mc/mc-mv.html

You can copy objects between buckets simply with the `mc cp` function. See MinIO's official documentation for all the associated options.

**VERY IMPORTANT**: Object versions and metadata are NOT preserved when copying objects. In addition, version id's are not preserved either, so every object will have a different version ID when copied.

## Mirror

https://min.io/docs/minio/linux/reference/minio-mc/mc-mirror.html

The `mc mirror` to `mc cp` commands are to MinIO what `rsync` to `cp` are to Linux. It synchronizes a local filesystem or other MinIO bucket to another MinIO bucket.

**VERY IMPORTANT**: Again, object versions, version IDs, and metadata are NOT preserved when mirroring.

## Replicate

https://min.io/docs/minio/linux/reference/minio-mc/mc-replicate.html

Replicating a bucket is most likely what you what if you're looking for a "backup/restore" style copy. All metadata, versions, and version IDs are preserved when replicating.
