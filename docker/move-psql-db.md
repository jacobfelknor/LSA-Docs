# Move Docker PostgreSQL Database

These notes adapted from <https://support.boldbi.com/kb/article/522/how-to-move-a-postgresql-database-from-one-container-to-another-in-a-docker-environment>

It is a popular option to run your PostgreSQL database inside a docker container on your server. For many reasons, this can be advantageous over running the `psql` server bare-metal. However, it may complicate moving the database to another host, especially when using docker volumes.

You may expect that you are able to simply copy the contents of the docker volume to your new host, re-create the container, and be done. However, I haven't had much luck with this method. Instead, I've had more success with exporting the database using PostgreSQL's native tooling, recreating a brand new PostgreSQL container on the new host, and then restoring that database to the fresh container using its native tooling once again.

> **NOTE:** It's worth noting that the basic strategy here - using native `psql` tooling to export/import databases - is not specific to docker installs and can be used however PostgreSQL is installed. These notes simply included extra information on how to do so from within the container.

## Export Existing DB

First, we must `exec` into the running PSQL container.

```bash
# Find psql container ID
docker container ls
# OR
docker ps

# once you have the container ID, we can exec into it
docker exec -it <container id> /bin/bash

# use native pg_dump command to get an export file
pg_dump -U postgres -d <database name> -f <database name>.sql
```

## Copy Backup File

Now that we have the backup file, we must copy it from within the container to the host machine.

```bash
# copy backup out of container onto host
docker cp <container id>:/path/to/<database name>.sql /local/path/to/<database name>.sql

# work your magic here to get this backup file to the correct new spot.
# this will be a new machine (use scp, or similar) if you are moving hosts
# the current location is probably acceptable if you're just moving to a different container

# copy backup INTO new container
docker cp /local/path/to/<database name>.sql <container id>:/container/path/to/<database name>.sql
```

## Restore Backup

Finally, since we have a new container up and our backup file ready, we can restore it into the new database server.

```bash
# Find new psql container
docker container ls
# OR
docker ps

# exec into container as postgres user (or su afterwards)
docker exec -it -u postgres <container id> /bin/bash

# launch psql, create the db
psql
create database <database name>;
exit

# restore backup file to new db
psql <database name> < /path/to/<database name>.sql
```

Your database should now be available in the new container.
