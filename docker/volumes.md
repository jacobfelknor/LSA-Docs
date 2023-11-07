# Move Docker Volume to Another Host

These notes adapted from <https://docs.docker.com/storage/volumes/>

## Motivation

After a container stops, all of its contents is lost as it is ephemeral. However, we can use Docker volumes for persistent storage that sticks around, even after the container that was using it stops. We then can mount this volume to a new container we start at a later time.

This pattern helps us avoid storing data in the container itself, which keeps us aligned with the idea that containers can be thrown away at any time, and are "cattle", not "pets". It also allows us to make changes to the container we use, whether thats an updated version or a completely different container, and not lose the data we we previously storing.

## Create Container with Volume

> **NOTE:** Throughout these notes, I use the `-v` flag in favor of the `--mount` option because of its simplicity. The `--mount` flag has more options and is more verbose, giving you finer control. See the official docker docs (linked at the top) for more details.

First, we will start a container with a volume. If the specified volume does not exist yet, docker will create it for us.

```bash
docker run -it --rm --name volume-test -v myvol:/myvol ubuntu /bin/bash
```

Inside the container, we can navigate to `/myvol`, and put anything we'd like inside of it.

```bash
cd /myvol
echo "hello world" > test
```

Now, we can stop our container. Ordinarily, our previous filesystem changes would be lost with the container. However, since we used a volume, they stick around. At a later time, we can start a new container, mount the volume, and see that our test file is present.

```bash
docker run -it --rm --name another-volume-test -v myvol:/myvol ubuntu /bin/bash

cat /myvol/test
# prints "hello world" to console
```

## Backup, Restore, or Migrate a Volume

Now that we now how simple local volumes work, we can learn how to create backups of these volumes and restore them into new volumes. We can use this process to transfer the data from one docker host to another.

First, we need to choose which volumes we want to backup. Is this volume currently mounted to a running container? Does this container need to be stopped before a valid backup can be taken? Is it just a volume we want, and no associated container is using it currently? These are all generally good questions to ask yourself before proceeding. Once you have a good idea on the answers, we can start the process.

### Backup

To begin, we must launch a new container which mounts our targeted volume so we can preform the backup. We will also mount a local directory to this intermediate container so it makes the transfer to the host easier (you may also use `docker cp` if you prefer).

```bash
# launch a new container to preform backup, mounting our target volume and also a local directory
docker run -it --rm --name backup-container -v myvol:/myvol -v $(pwd):/backup ubuntu /bin/bash

# or, if you'd like to mount volumes from an existing container "existingcontainer",
docker run -it --rm --name backup-container --volumes-from existingcontainer -v $(pwd):/backup ubuntu /bin/bash
```

Once we're inside the container, we can `tar` the directory associated with the volume and write it to the mounted local directory.

```bash
tar cvf /backup/backup.tar /myvol
```

A resulting backup file `backup.tar` is written to the hosts working directory.

We can turn the above into a one-liner, if you'd prefer

```bash
docker run -it --rm --name backup-container -v myvol:/myvol -v $(pwd):/backup ubuntu /usr/bin/tar cvf /backup/backup.tar /myvol
```

### Restore

Before starting our restore, we need to get the backup file from before copied to our new host. This comes for free if the host is the same, but something like `scp` should be used if you are moving to a different host.

Once we have the backup file in the right spot, to restore our volume, we must again create an intermediate container on the target host. This container should mount both our new volume and our local directory again so we can make the transfer.

```bash
docker run -it --rm --name restore-container -v myrestorevol:/myrestorevol -v $(pwd):/backup ubuntu /bin/bash
```

Once we're in the container, extract the tarball into the new mounted volume.

```bash
cd /myrestorevol
# use "strip" to remove the leading directory, in this case, it was /myvol
# if you were tar'ing a subdir of a volume, you need to adjust the strip number
# to adjust for your needs
tar xvf /backup/backup.tar --strip 1
```

We can make this a one-liner with

```bash
docker run -it --rm --name restore-container -v myrestorevol:/myrestorevol -v $(pwd):/backup ubuntu /bin/bash -c "cd /myrestorevol && tar xvf /backup/backup.tar --strip 1"
```

At this point, the contents of our original volume `myvol` have been restored to our new volume `myrestorevol`.
