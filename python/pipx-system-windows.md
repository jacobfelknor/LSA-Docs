# pipx Global Installs

`pipx` is python utility designed to install and run Python applications in isolated environments. You can read more in its [documentation](https://pypa.github.io/pipx/).

Typically, `pipx` is used on a per-user basis to expose python application entrypoints in that specific user's shell sessions. However, it can sometimes be useful to do a "global" `pipx` install to make these entrypoints available to any user on the system.

## Prerequisites

These notes assume a pre-existing system level Python install. For the sake of this guide, we assume this is installed at `C:\Program Files\Python311`. There must also be a system level `pip` available. This is most likely bundled with your system Python install, and should exist at `C:\Program Files\Python311\Scripts\pip`.

Finally, `C:\Program Files\Python311\Scripts` must be on the system PATH in order for us to access `pip` and the system level `pipx` installed binaries.

## Administrator Setup

First, we need to install `pipx` at the system level. Run powershell as an administrator so the global `site-packages` location (`C:\Program Files\Python311\Lib\site-packages`) is writeable.

```powershell
pip install pipx
```

Make sure `pipx` got installed globally. You can check with

```powershell
(Get-Command pipx).path
# Should return system path
# C:\Program Files\Python311\Scripts\pipx.exe
```

There is a few more things to set up before we get to installing apps. In Windows, even if you've opened PowerShell as an Administrator, your identity remains the same. In other words, if you run `whoami`, you'll still get your username. This may be unintuitive if you're used to Linux. Because of this, by default `pipx` will install its virtual environments and binaries to `C:\Users\<username>\.local\pipx`, even when running an admin console. We need to change this behavior if we'd like the binaries to be available globally.

The `PIPX_HOME` and `PIPX_BIN_DIR` environment variables can be [used to override the default locations](https://pypa.github.io/pipx/docs/). You should only set these temporarily when installing a new system app, because they will interfere with user installs if they stick around.

```powershell
# these will only persist throughout the current session
$env:PIPX_HOME = 'C:\Program Files\Python311'
$env:PIPX_BIN_DIR = 'C:\Program Files\Python311\Scripts'
```

Now, finally, we are ready to start installing system-level binaries. Make sure to use the same shell session as before so that your environment variables are present.

```powershell
# make sure system PATH is set correctly
pipx ensurepath
# you should see "C:\Program Files\Python311\Scripts is already in PATH."
pipx install pkg
# check install location
(Get-Command pkg_entrypoint).path
# C:\Program Files\Python311\Scripts\pkg_entrypoint.exe
```

## Normal Usage

Now that the admin has set things up for us, a normal user without local admin can start using the `pipx` apps. Check that a certain app is available by running

```powershell
(Get-Command pkg_entrypoint).path
# this should return the system path!!
# C:\Program Files\Python311\Scripts\pkg_entrypoint.exe

# use command
pkg_entrypoint ...
```

> **NOTE:** Running `pipx list` as the user will *not show you these applications!* This is because `pipx list` only shows `pipx` apps that you installed as yourself

## User Installs

It is possible for a non-admin user to install their own copy of a `pipx` application. In the case where this package does not conflict with any of the system `pipx` apps, everything works as you would expect.

```powershell
# as a normal user
pipx install pkg2
# check install
(Get-Command pkg2_entrypoint).path
# this returns the user path!!
# C:\Users\<username>\.local\bin\pkg2_entrypoint.exe
```

However, in the case where the user installs a `pipx` app that was already installed at the system level, the system install takes precedence.

```powershell
# as a normal user
pipx install pkg # same as a previous system install!
# check install
(Get-Command pkg_entrypoint).path
# this still returns the system path!!
# C:\Program Files\Python311\Scripts\pkg_entrypoint.exe
```

If you want to use the user install, you must specify its path explicitly. This will be at `C:\Users\<username>\.local\bin`.

```powershell
cd C:\Users\<username>\.local\bin
# run the local version
./pkg_entrypoint
```
