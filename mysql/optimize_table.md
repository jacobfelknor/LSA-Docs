# Optimize MySQL Table

In one of the applications I managed professionally, I started seeing weird errors in its log about a "corrupted index" that was degrading performance of the application. These errors looked something like

```text
2306:20240804:034755.514 [Z3005] query failed: [1034] Index for table 'table_name' is corrupt; try to repair it [delete from table_name where itemid=<>, and clock<1722764815]
```

In order to resolve these errors, I used the `OPTIMIZE TABLE` function of MySQL. See [the documentation](https://dev.mysql.com/doc/refman/8.4/en/optimize-table.html) for more info on this command.

In short (and in my understanding), this rebuilds the table from scratch (therefore, also rebuilding its indexes). After doing this, I no longer saw the index errors in the application's logs.

```text
USE db_name;
SHOW INDEX FROM table_name;
OPTIMIZE TABLE table_name;
SHOW INDEX FROM table_name;
```
