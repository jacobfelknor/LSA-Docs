# User Management

Common user management tasks are listed here.

## Common Tasks

List roles

```js
// omit showBuiltinRoles or showPrivileges, if wanted
db.getRoles({showBuiltinRoles: true, showPrivileges: true});
```

Create a LDAP Role, mapping an LDAP user DN to MongoDB role.

```js
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

### Read, Write, and Update, but no Delete

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

### WORM

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

### Read, Write, Update, and Delete

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
