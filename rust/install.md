# Install Rust

This document serves as a reminder to myself rather than documentation. To install `rust`, follow the instructions at

<https://doc.rust-lang.org/cargo/getting-started/installation.html>

```bash
curl https://sh.rustup.rs -sSf | sh
```

I needed it to compile something from source. If I end up using `rust` more, I'll document it here.

This will install only for a single user.

## System Install

To install for all users of the linux system, we need to use the standalone installers, found at <https://forge.rust-lang.org/infra/other-installation-methods.html#standalone-installers>

For example, to install on a `x86_64` system, I did

```bash
wget https://static.rust-lang.org/dist/rust-1.74.1-x86_64-unknown-linux-gnu.tar.gz
tar xvf rust-1.74.1-x86_64-unknown-linux-gnu.tar.gz
cd rust-1.74.1-x86_64-unknown-linux-gnu
sudo ./install.sh
```
