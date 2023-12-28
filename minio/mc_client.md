# mc Client

The `mc` client allows you to manage your minio instance from the command line. See the [reference docs](https://min.io/docs/minio/linux/reference/minio-mc.html) for a complete list of available commands.

## Install

```bash
wget https://dl.min.io/client/mc/release/linux-amd64/mc

chmod +x mc
sudo mv mc /usr/bin

mc --help
```

## Set Alias

Setting an alias is required, since we may want to manage multiple instances using this client.

```bash
mc alias set ALIAS https://minioserver.example.net ACCESS_KEY SECRET KEY
```

## Test Connection

```bash
mc admin info ALIAS
```

## Frequent Commands

```bash
# get general info
mc admin info ALIAS

# recursively heal an instance
mc admin heal ALIAS
# use verbose to view all disks 
mc admin heal local --verbose

# delete all objects and versions, recursively
mc rm --recursive --versions --force ALIAS/PATH

# delete a bucket
mc rb ALIAS/BUCKET

# delete a bucket and ALL OF ITS CONTENTS
mc rb --force ALIAS/BUCKET

# gather logs on a certain bucket
mc admin trace -a -v --path bucket/prefix/* ALIAS
```
