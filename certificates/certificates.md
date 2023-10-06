# Certificates

Eventually, I should probably expand this with my knowledge about how to create self signed certs, etc.

## Inspect a Certificate

You can use the following command to view information about a certificate. It will show you much more useful information that looking at the encoded cert directly.

```bash
openssl x509 -text -noout -in certificate.crt
```

It will output to `stdout`

To get SAN names, you can run

```bash
openssl x509 -text -noout -in certificate.crt | grep DNS
```

## Trusted Certificates

Often in a companies internal infrastructure, "self signed" certificates exist on services you may rely on. Instead of setting options to ignore SSL errors, it is a better solution to obtain a copy of the root CA certificate used to self sign and store that as a trusted CA on your machine.

### Gotcha - pip

By default, `pip` will not use the system store for certificates. You still must use the `trusted-host` config option or specify a cert to `pip`.

See [`pip`'s certificate documentation](https://pip.pypa.io/en/latest/topics/https-certificates/) for more info and updates.

### RHEL

In RHEL, the consolidated system-wide trust store is located in the `/etc/pki/ca-trust/` and `/usr/share/pki/ca-trust-source/` directories. The trust settings in `/usr/share/pki/ca-trust-source/` are processed with lower priority than settings in `/etc/pki/ca-trust/`.

To add a certificate to the trusted store, simply copy the file into the `./source/anchors` sub-directory in one of those locations. For example.

```bash
sudo mv /path/to/root_ca.pem /etc/pki/ca-trust/source/anchors/
```

Then, issue `update-ca-trust` for your changes to take effect

```bash
sudo update-ca-trust
# try wget'ing your service to test if cert is now trusted
wget https://example.com
```

To remove the trusted cert, delete it from the `sources/anchors` directory and `update-ca-trust` once more.

### Ubuntu

TODO!
