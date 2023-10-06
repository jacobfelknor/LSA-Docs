# MSSQL Server Helpful Tips

While doing some database archeology on an old VB+MSSQL application, I came across a few commands that were helpful in mapping out the database.

## Design View

In the Access frontend, we can sometimes tell which queries are run by going into the design view (right click + design view). At this point, look for event triggers in right hand side, like "on click". This can point you to the section of code which runs on that event, which sometimes contains the query you're after.

## Get Table Info

We can use a MSSQL built in to find out more information on a table. More specifically, I was after which tables foreign keys pointed to, because it wasn't always obvious by the column names in my case. More information can be obtained by running

```sql
sp_help 'table_name';
```
