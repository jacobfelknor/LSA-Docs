# Install

**NOTE**: I recommend following their [offical docs](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-red-hat/) for installation.

## Install/Uninstall

```bash
# install from repo specified above
sudo yum install mongodb-org
# remove mongo and everything else it installed from the system
sudo yum erase $(rpm -qa | grep mongodb-org)
```

---
**NOTE**
`(rpm -qa | grep mongodb-org` outputs something like the following:

![image](mongo-org-installs.png)

---

## Start/Enable the Service
<!-- using python highlighting here just because I don't want "enable" to be highlighted, as it does with bash -->
```python
# must start the service before use
sudo systemctl start mongod.service
# Optional: enable the service so it starts on boot
sudo systemctl enable mongod.service
```

> NOTE: If you get an error like `ERROR: child process failed, exited with 62`, this may mean you had a previous install of an older version and its data files persisted. Check and remove and files at `/var/lib/mongo` and `/var/log/mongod`. You may need to reinstall the newer version of mongo.

# External Connections

For external connections, we need to edit Mongos configuration at `/etc/mongod.conf`. Set the bindIp to the necessary value

```bash
# /etc/mongod.conf
...
...
# network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0  # Enter 0.0.0.0,:: to bind to all IPv4 and IPv6 addresses or, alternatively, use the net.bindIpAll setting.
...
...
```

We also need to open the firewall to the port mongo is binded to.

```bash
sudo firewall-cmd --zone=public --add-port=27017/tcp --permanent
sudo firewall-cmd --reload
```

# Authorization

By default, the MongoDB instance will have no authentication required for connections.
This is fine for local development (maybe...) but needs to be addressed for production/testing instances.

## Enable Access Control

Back in `/etc/mongod.conf`, look for a section labeled `security`, and ensure its enabled

```bash
# /etc/mongod.conf
...
...
# Auth
security:
  authorization: enabled
...
...
```

## Create User Accounts

See [MonogDB's documentation](https://docs.mongodb.com/manual/tutorial/configure-scram-client-authentication/) for more details, but here are the basic steps.

*After* enabling access control but *before* creating any user accounts, MongoDB has a `localhost` exception. Meaning, you can still connect to the instance via `localhost` on the machine where the instance is installed to create the first account.

Start a `mongosh` shell, and then follow along.

```terminal
user@hostname:~$ mongosh
> use admin;
switched to db admin
> db.createUser(
    {
      user: "username",
      pwd: passwordPrompt(), // instead of cleartext password
      roles: [
        { role: "userAdminAnyDatabase", db: "admin" },
        { role: "dbAdminAnyDatabase", db: "admin" },
        { role: "readWriteAnyDatabase", db: "admin" },
      ]
    }
  );
```

## Authenticating via Shell

Now, you can authenticate yourself to MongoDB using

```bash
> use admin;
switched to db admin
> db.auth("username", passwordPrompt());
Enter password
********{ ok: 1 }
```

To view users,

```bash
> db.getUsers();
{
  users: [
    {
      _id: 'admin.username',
      userId: UUID("dda017b7-2be4-4cdd-89aa-c750496b7fbc"),
      user: 'username',
      db: 'admin',
      roles: [
        { role: 'userAdminAnyDatabase', db: 'admin' },
        { role: 'readWriteAnyDatabase', db: 'admin' }
      ],
      mechanisms: [ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]
    },
  ],
  ok: 1
}
```

## Authenticating via Connection String

MongoDB also allows authenticating via a connection string for programmatic access.

```python
"mongodb://user:password@host:27017"
```

# Backup/Restore

We can use the `mongodump` and `mongorestore` to backup and restore databases.

## Backup

The following backs up a specific database. Note that we must pass the `--authenticationDatabase` option. It will dump to the current directory under `./dump`. This is what the restore tool expects.

```bash
mongodump --host=mongodb.example.com --port=27017 --db=db_name --username=user --password=pass --authenticationDatabase=admin
```

## Restore

By default, `mongorestore` looks for a directory called `./dump`. We can restore the data to the localhost instance with the following:

```bash
mongorestore --username=user --password=pass -authenticationDatabase=admin ./dump
```

> **NOTE:** if you need to restore to a different host, add the `--host` parameter.

# GUI

I've been using [MongoDB Compass](https://www.mongodb.com/products/compass) as my GUI tool for management

# Frequent Commands

```javaScript
// switch to another database named 'mydb'
use mydb;

// delete all records from a collection
db.collection.deleteMany({})

// drop database (requires root!)
db.dropDatabase();

// grant/revoke roles
db.grantRolesToUser("user", ['root', 'backup', 'restore']);
db.revokeRolesFromUser("user", ['root']);
```
