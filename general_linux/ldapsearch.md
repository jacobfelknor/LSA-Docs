# LDAP Search Linux Tool

Get account attributes for a user

```bash
ldapsearch -x -b "dc=example,dc=local" -H ldap://server.example.local:389 -D ldap_user@example.com -W "(sAMAccountName=username)"
```

If just the DN is required, specify the magic value `1.1` in search:

```bash
ldapsearch -x -b "dc=example,dc=local" -H ldap://server.example.local:389 -D ldap_user@example.com -W "(sAMAccountName=username)" 1.1
```

I like to place an alias in my `.bashrc` that allows me to skip the boring repetitive parts above and focus on the search.

```bash
# ldapsearch
alias myldapsearch="ldapsearch -x -b 'dc=example,dc=local' -H ldap://server.example.local:389 -D ldap_user@example.com -w password"

# query with
myldapsearch "(sAMAccountName=username)"
```
