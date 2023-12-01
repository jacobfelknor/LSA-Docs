# DNF Pinning

It can be helpful to pin particular package from a given repository. This way, it is not upgraded with the rest of the system during routine updates.

We can do this with a plugin for `dnf` called `versionlock`. It works very similarly to [`apt hold`](../apt/apt_hold.md).

## Install Plugin

We can install the plugin with

```bash
dnf install 'dnf-command(versionlock)'
```

## Locking or Unlocking Packages

`dnf versionlock`'s usage is very simple.

```bash
# lock a package to the currently installed version
dnf versionlock add pkg-name
# remove the lock from a package
dnf versionlock delete pkg-name
# list all versionlocks
dnf versionlock list
# clear all versionlocks
dnf versionlock clear
```

You can explore the options in more detail with `man dnf-versionlock`
