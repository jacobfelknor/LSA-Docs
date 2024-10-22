# Mount S3 Bucket to Linux

## Warning

Before even getting started, **_this is usually the wrong approach, and directly interfacing with S3 in your application with its SDKs is almost always better_**. However, there are some cases where this is not possible, such as when you're trying to bake this in to a 3rd party application you don't control which only considers local filesystem paths.

This can be acceptable in applications which are usually good fits for object storage, like if the local folder is used to store user uploaded content, such as photos or videos, where the primary load is relatively infrequent reads and writes.

It is **not a good fit** to run something like a database on top of, where there are frequent, small, and random read/writes.

## Install

Install `s3fs-fuse` using your package manager. For example, on RHEL,

```bash
sudo dnf install s3fs-fuse
```

## Configure Credentials

For all credential  options, please see <https://github.com/s3fs-fuse/s3fs-fuse?tab=readme-ov-file#examples>

For your credentials, `s3fs` considers the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, or your configuration in `~/.aws`. It may also consider a configuration file in the forms:

```bash
# for all buckets to mount
access_key:secret_key
# or for specific credentials per bucket
bucket_name:access_key:secret_key
```

If you use a configuration file, there are a few places (`/etc/passwd-s3fs` or `~/.passwd-s3fs`) it will search for, but only if no environment variables or `~/.aws` config already exists. When using a credential file, it is always best to specify which one with the `-o passwd_file=/path/to/passwd-s3fs` option.

## Perform Mount

For all configuration options, please see <https://github.com/s3fs-fuse/s3fs-fuse/wiki/Fuse-Over-Amazon>

These examples are relatively general and work in most cases

### Important Options

These were the options I took special note of

- `passwd_file`: the path to the credential file to use
- `allow_other`: allow users other than the one who mounted it to access the bucket. The permissions bound by the access keys
- `ensure_diskfree`: By default, `s3fs` requires 10% of your available disk to be free in order to mount. This is because any writes are first written to local disk, then uploaded to S3. This allows things like random writes, but requires some local scratch space. I found 10% to be too demanding for my case, so specified a number in MB here to get around this.
- `url`: the URL to use. Helpful in cases you are not using the public AWS S3
- `use_path_request_style`: Required in my case using MinIO

### Ad-Hoc Mount

For temporary/testing mounts, we can do this through the command line with

```bash
sudo s3fs bucket-name /path/to/mountpoint -o passwd_file=/path/to/passwd-s3fs -o allow_other -o url=https://minio.example.com/ -o use_path_request_style -o ensure_diskfree=4096

# NOTE: -f -d options print helpful debug messages, but mount will not "go to background"
sudo s3fs -f -d bucket-name /path/to/mountpoint -o passwd_file=/path/to/passwd-s3fs -o allow_other -o url=https://minio.example.com/ -o use_path_request_style -o ensure_diskfree=4096
```

### Persistent Mount via /etc/fstab

It is also possible to set up persistent `/etc/fstab` mounts for `s3fs`. Add a line like the following

```text
bucket-name /path/to/mountpoint fuse.s3fs _netdev,passwd_file=/path/to/passwd-s3fs,allow_other,use_path_request_style,ensure_diskfree=4096,url=https://minio.example.com/ 0 0
```

It's especially important in this case to specify the `passwd_file` option for predictable behavior.
