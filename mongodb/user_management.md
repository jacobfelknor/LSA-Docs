# User Management

Common user management tasks are listed here.

## Common Tasks

Login

```js
db.auth("username", passwordPrompt());
```

List users

```js
db.getUsers()
```

Create local user

```js
db.createUser(
    {
        user: "username",
        pwd: passwordPrompt(), // instead of cleartext password
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" }
        ]
    }
);
```

List roles

```js
// omit showBuiltinRoles or showPrivileges, if wanted
db.getRoles({showBuiltinRoles: true, showPrivileges: true});
```

Create a LDAP Role, mapping an LDAP user DN to MongoDB role.

```js
// NOTE: this appears to be broken right now. I can't get the roles to map to one another :(
db.createRole(
   {
     role: "CN=example,OU=example,OU=example,DC=example,DC=example",
     privileges: ["specific privileges here"],
     roles: [ "inherit from other roles here" ]
   }
)
```

Drop a MongoDB Role

```js
db.dropRole("roleName")
```

Grant a Role to a User

```js
db.grantRolesToUser("username", ["roleToGrant"]);
```

Grant a Role to a Role

```js
db.grantRolesToRole("roleName", ["roleToGrant"]);
```

## Common Roles

### List All Databases

This lets user see all DB's that exist, regardless of if they have permission to preform any action on them

```js
db.createRole({
    role: "listDatabases",
    privileges: [
        { resource: { db: "", collection: "" }, actions: [ "listDatabases" ] }
    ],
    roles: []
})
```

### "Full" Common Access to DB

Add the permissions necessary to do pretty much anything on a given DB (but not delete it or create others)

```js
db.createRole({
    role: "readWriteUpdateDeleteDB",
    privileges: [
        { resource: { db: "DB", collection: "" }, actions: ["listCollections", "createCollection", "dropCollection", "renameCollectionSameDB", "find", "insert", "update", "remove" ]},
    ],
    roles: []
})
```

### Read, Write, and Update, but no Delete for a collection

Let a user see given collections for a DB, query, insert, update documents in those collections, but prevent any deletion.

```js
db.createRole({
    role: "readWriteUpdateDB",
    privileges: [
        { resource: { db: "DB", collection: "" }, actions: ["listCollections"]},
        { resource: { db: "DB", collection: "collectionName" }, actions: [ "find", "insert", "update" ] }
    ],
    roles: []
})
```

### WORM for a collection

A write once, read many structure can be accomplished by removing the role's ability to update.

```js
db.createRole({
    role: "readWriteDB",
    privileges: [
        { resource: { db: "DB", collection: "" }, actions: ["listCollections"]},
        { resource: { db: "DB", collection: "collectionName" }, actions: [ "find", "insert" ] }
    ],
    roles: []
})
```

### Read, Write, Update, and Delete for a collection

For all access permissions on a given DB, but importantly not the ability to drop or create collections, we can use the following.

```js
db.createRole({
    role: "readWriteUpdateDeleteDB",
    privileges: [
        { resource: { db: "DB", collection: "" }, actions: ["listCollections"]},
        { resource: { db: "DB", collection: "collectionName" }, actions: [ "find", "insert", "update", "remove" ] }
    ],
    roles: []
})
```
