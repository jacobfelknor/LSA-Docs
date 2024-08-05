# TLS Version and Cipher Testing

After setting up your webserver, you may want to test its security by enumerating the TLS versions and encryption ciphers it is configured to support. This can serve as proof during audits, or just give you peace of mind for personal sites. If your server is public facing, I recommend using <https://www.ssllabs.com/ssltest/> as it is very detailed and free to use.

However, this will not work for internally facing sites. Instead, we must use something locally which can reach these internal sites.

<https://github.com/rbsec/sslscan> is an option in these cases.

## Clone and Build

First, clone the repo and then run `make docker` to build their docker image. Then, we can start running commands

```bash
# clone repo
git clone https://github.com/rbsec/sslscan.git

# build docker image
cd sslscan
make docker
# alternatively, 
docker build -t sslscan:sslscan .

# show available options
docker run --rm -ti sslscan:sslscan --help

# do a scan
docker run --rm -ti sslscan:sslscan hello.example.com
```
