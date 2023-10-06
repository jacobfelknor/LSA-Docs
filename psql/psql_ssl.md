# PostgreSQL over SSL

> **WARNING:** this contains outdated information and should serve only as a starting point for future work.


Follow guide at https://www.postgresql.org/docs/11/ssl-tcp.html. We are only setting up server certificates, clients can still just connect with username/password

```bash
sudo su - postgresql
cd /var/lib/pgsql/11/data\

# Create a simple self-signed certificate for the server
openssl req -new -x509 -days 365 -nodes -text -out server.crt \
  -keyout server.key -subj "/CN=hostname.example.com"

chmod og-rwx server.key

# Create a certificate signing request (CSR) and a public/private key file
openssl req -new -nodes -text -out root.csr \
  -keyout root.key -subj "/CN=root.example.com"
chmod og-rwx root.key

# Sign the request with the key to create a root certificate authority
openssl x509 -req -in root.csr -text -days 3650 \
  -extensions v3_ca \
  -signkey root.key -out root.crt

# sign our server key with our CA
openssl req -new -nodes -text -out server.csr \
  -keyout server.key -subj "/CN=hostname.example.com"
chmod og-rwx server.key

# Create a server certificate signed by the new root certificate authority
openssl req -new -nodes -text -out server.csr \
  -keyout server.key -subj "/CN=hostname.example.com"
chmod og-rwx server.key

openssl x509 -req -in server.csr -text -days 365 \
  -CA root.crt -CAkey root.key -CAcreateserial \
  -out server.crt
```

Change PostgreSQL config files to enable SSL

```bash
# /var/lib/pgsql/11/data/postgresql.conf
...
ssl = on
...
```

```bash
# /var/lib/pgsql/11/data/pg_hba.conf
# IPv4 connections:
hostssl    all             all             0.0.0.0/0               md5
# IPv6 connections:
hostssl    all             all             ::/0                    md5
```

Restart the service

```bash
sudo systemctl restart postgresql-11.service
```

If wanting to connect with client in Verify-CA or Verify-Full SSL mode, place `root.crt` in `%APPDATA%\postgresql\root.crt` on Windows or `~/.postgresql/root.crt` on linux, and ensure the client is using TLS version 1.2.
