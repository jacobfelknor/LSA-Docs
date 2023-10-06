# MinIO Single Node Single Drive Dev Server

This document outlines how to set up a simple MinIO server for evaluation and development purposes. It should not be used in production. These instructions are for RHEL8

## Download the Package

Newer versions may have been released, so see the [official documentation](https://min.io/docs/minio/linux/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html) for updated links.

For RHEL8,

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio-20221002192929.0.0.x86_64.rpm -O minio.rpm
sudo dnf install minio.rpm
```

For Ubuntu,

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio_20221002192929.0.0_amd64.deb -O minio.deb
sudo dpkg -i minio.deb
```

## Add the User

The official docs add a special user with no home directory, but I like using a normal user because it's easy and gives me a good place to store the data.

```bash
useradd minio-user
sudo su - minio-user
mkdir data # i.e at /home/minio-user/data
exit
```

## Add the Environment File

Environment settings are specified at `/etc/default/minio`. This file must be created.

```bash
# /etc/default/minio
# MINIO_ROOT_USER and MINIO_ROOT_PASSWORD sets the root account for the MinIO server.
# This user has unrestricted permissions to perform S3 and administrative API operations on any resource in the deployment.
# Omit to use the default values 'minioadmin:minioadmin'.
# MinIO recommends setting non-default values as a best practice, regardless of environment

MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=microwave

# MINIO_VOLUMES sets the storage volume or path to use for the MinIO server.

MINIO_VOLUMES="/home/minio-user/data"
MINIO_OPTS="--console-address :'9091'"

# MINIO_SERVER_URL sets the hostname of the local machine for use with the MinIO Server
# MinIO assumes your network control plane can correctly resolve this hostname to the local machine

# Uncomment the following line and replace the value with the correct hostname for the local machine.

#MINIO_SERVER_URL="http://minio.example.net"
```

## Firewall Rules

```bash
sudo firewall-cmd --zone=public --add-port=9000/tcp --permanent
sudo firewall-cmd --zone=public --add-port=9091/tcp --permanent
sudo firewall-cmd --reload
```

## Start/Enable Service

```bash
sudo systemctl start minio.service
sudo systemctl enable minio.service
# check status
sudo systemctl status minio.service
```

## Visit Console

Navigate to `127.0.0.1:9001` on the machine to view the console. Try logging in with the root username and password you set in the environment file.

# MinIO Single Node Multi Drive Expansion

> **IMPORTANT!** Do **NOT** start the new instance *before* setting up the pool. If you do, it will trash this process because the new instance will initialize as a standalone server, not part of the wider pool. You can not merge existing instances, only add new fresh ones to existing.

## Common Existing Config for SNMD

A common SNMD instance's environment file (`/etc/default/minio`) may look like this:

```ini
# MINIO_ROOT_USER and MINIO_ROOT_PASSWORD sets the root account for the MinIO server.
# This user has unrestricted permissions to perform S3 and administrative API operations on any resource in the deployment.
# Omit to use the default values 'minioadmin:minioadmin'.
# MinIO recommends setting non-default values as a best practice, regardless of environment.

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# MINIO_VOLUMES sets the storage volumes or paths to use for the MinIO server.
# The specified path uses MinIO expansion notation to denote a sequential series of drives between 1 and 4, inclusive.
# All drives or paths included in the expanded drive list must exist *and* be empty or freshly formatted for MinIO to start successfully.

MINIO_VOLUMES="http://192.168.115.74:9000/home/minio-user/data{1...4}"
MINIO_OPTS="--address '192.168.115.74:9000' --console-address :'9091'"

# MINIO_SERVER_URL sets the hostname of the local machine for use with the MinIO Server.
# MinIO assumes your network control plane can correctly resolve this hostname to the local machine.

# Uncomment the following line and replace the value with the correct hostname for the local machine.

#MINIO_SERVER_URL="http://minio.example.net"
```

## Modify Settings for Expansion

Modify the new environment file and the old environment file to look like the following:

> **IMPORTANT** : if the two "nodes" are actually on the same machine, two different IPs and network interfaces are required so that both nodes can use the same port, a *requirement* for a distributed MinIO setup. Set this IP/DNS entry as the `MINIO_OPTS="--address 'HOST HERE:9000'"` setting. You'll also need to use a different env file (i.e `/etc/default/minio2`) and a new `systemd` service file (i.e `/etc/systemd/system/minio2.service`) to point to the new env file.

### Node 1, the original

```ini
# MINIO_ROOT_USER and MINIO_ROOT_PASSWORD sets the root account for the MinIO server.
# This user has unrestricted permissions to perform S3 and administrative API operations on any resource in the deployment.
# Omit to use the default values 'minioadmin:minioadmin'.
# MinIO recommends setting non-default values as a best practice, regardless of environment.

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# MINIO_VOLUMES sets the storage volumes or paths to use for the MinIO server.
# The specified path uses MinIO expansion notation to denote a sequential series of drives between 1 and 4, inclusive.
# All drives or paths included in the expanded drive list must exist *and* be empty or freshly formatted for MinIO to start successfully.

MINIO_VOLUMES="http://192.168.115.74:9000/home/minio-user/data{1...4} http://192.168.115.70:9000/home/minio-user/data{1...4}"
#MINIO_VOLUMES="http://192.168.115.74:9000/home/minio-user/data{1...4}"
MINIO_OPTS="--address '192.168.115.74:9000' --console-address :'9091'"

# MINIO_SERVER_URL sets the hostname of the local machine for use with the MinIO Server.
# MinIO assumes your network control plane can correctly resolve this hostname to the local machine.

# Uncomment the following line and replace the value with the correct hostname for the local machine.

#MINIO_SERVER_URL="http://minio.example.net"
```

### Node 2, the expansion node

```ini
# MINIO_ROOT_USER and MINIO_ROOT_PASSWORD sets the root account for the MinIO server.
# This user has unrestricted permissions to perform S3 and administrative API operations on any resource in the deployment.
# Omit to use the default values 'minioadmin:minioadmin'.
# MinIO recommends setting non-default values as a best practice, regardless of environment.

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# MINIO_VOLUMES sets the storage volumes or paths to use for the MinIO server.
# The specified path uses MinIO expansion notation to denote a sequential series of drives between 1 and 4, inclusive.
# All drives or paths included in the expanded drive list must exist *and* be empty or freshly formatted for MinIO to start successfully.

#MINIO_VOLUMES="/home/minio-user/data{3...4}"
MINIO_VOLUMES="http://192.168.115.74:9000/home/minio-user/data{1...4} http://192.168.115.70:9000/home/minio-user/data{1...4}"
MINIO_OPTS="--address '192.168.115.70:9000' --console-address :'9091'"

# MINIO_SERVER_URL sets the hostname of the local machine for use with the MinIO Server.
# MinIO assumes your network control plane can correctly resolve this hostname to the local machine.

# Uncomment the following line and replace the value with the correct hostname for the local machine.

#MINIO_SERVER_URL="http://minio.example.net"
```

## Parity

The minimum parity value is 2. The maximum parity value is `N/2`, where `N` equals the total number of drives. `MINIO_STORAGE_CLASS_STANDARD` parity *must* be greater than or equal to `MINIO_STORAGE_CLASS_RRS`. If `MINIO_STORAGE_CLASS_RRS` is unset, `MINIO_STORAGE_CLASS_STANDARD` parity must be greater than 2.

The above configuration defaults to using `EC:4` parity since we didn't specify. The `4` means, "how many drives can I lose before I can no longer use my minio instance." For the 8 disk setup above (2 servers, 4 disks each), this means we can lose half our drives and continue to perform read operations. Since 4 is exactly half of 8, we actually need 5 drives online to perform writes (called "split-brain", see [docs](https://min.io/docs/minio/linux/operations/concepts/erasure-coding.html) for more info). You cannot loose all 4 drives on a single server above, however. This is equivalent to the server itself going down, and that cannot be tolerated until you have at least 4 servers.

Note that in my own testing, I could set `MINIO_STORAGE_CLASS_STANDARD` and `MINIO_STORAGE_CLASS_RSS` both to `EC:1` in a SNMD deployment with 4 disks. This would allow for a single disk failure with 75% storage efficiency. This in spite of the claimed min value of `EC:2`. May be unsupported....

### Parity Lesson Learned

> **LESSON LEARNED TLDR;** variables are named `MINIO_STORAGE_CLASS_STANDARD` and `MINIO_STORAGE_CLASS_RRS`, and their values must be in form `EC:N`, not just `N`. For example, `MINIO_STORAGE_CLASS_STANDARD="EC:2"`, not `MINIO_STORAGE_CLASS_STANDARD="2"`.

As I was configuring test instances of MinIO, I set env vars named `STANDARD` and `REDUCED_REDUNDANCY` both equal to `2`. This was their min value as I wanted to get more storage and less redundancy. It was failing.... the server started up without error, and allowed me to upload/download files. But, when testing a disk failure, it always resulted in a complete loss of data.

This was troubling to me because it all worked as expected with the default values (i.e, me not overriding them via env vars).

After literally hours spread over multiple days, I found the first issue after digging further into the rabbit hole. The variables weren't named `STANDARD` and `REDUCED_REDUNDANCY`, they were named `MINIO_STORAGE_CLASS_STANDARD` and `MINIO_STORAGE_CLASS_RRS`.

Okay, fine. I fixed that. Retried. Still not working, failing in the same way as before. Digging again deeper, I discovered the value you need to set the env var is not `2` or `4` or whatever other number you want. Its `EC:2` or `EC:4`. Retried again and it did work, FINALLY.
