# Scoop Package Manager

`scoop` is a windows command line package manager inspired by `homebrew` on MacOS. It can be used to install command line utilities and other programs on Windows.

## Installation

See [the official GitHub page](https://github.com/ScoopInstaller/Scoop#installation) for the most up to date instructions and more information. At the time of writing,

```powershell
# allow remote script to execute
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# install scoop
iwr -useb get.scoop.sh | iex
```

## Usage

Now, you can use `scoop` similarly to other package managers you may be used to. For example, to install `neofetch`, you can do

```powershell
scoop install neofetch
```
