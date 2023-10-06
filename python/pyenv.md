# pyenv

`pyenv` is relatively straightforward. These are the necessary dependencies for all features to work.

See their [suggested build environment](https://github.com/pyenv/pyenv/wiki#suggested-build-environment) for more info

## RHEL Dependencies

```bash
sudo dnf -y install epel-release
sudo dnf -y groupinstall "Development Tools"
sudo subscription-manager repos --enable codeready-builder-for-rhel-8-x86_64-rpms
sudo dnf install make gcc zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel tk-devel libffi-devel xz-devel libuuid-devel gdbm-devel libnsl2-devel
```

## Ubuntu Dependencies

```bash
sudo apt update; sudo apt install build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev curl llvm \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
```

## Install

First, clone the repo

```bash
git clone https://github.com/pyenv/pyenv.git ~/.pyenv

# Optionally, try to compile a dynamic Bash extension to speed up Pyenv. Don't worry if it fails; Pyenv will still work normally
cd ~/.pyenv && src/configure && make -C src
```

Then, place the following in your `~/.bashrc`

```bash
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

## Install a Version of Python

Finally, to install a version of python run

```bash
pyenv install 3.11
```

## "System" pyenv Install

If, instead of a user by user basis, you'd like to install a shared copy of `pyenv` that all users on the system may access, we can do so. It's important to note that the system copy of `pyenv` will have read/execute permissions for normal users. This means they may use the python versions/packages already installed, but may not modify them or add their own. This works just fine with `pip`, however, since it will default to a user installation when the default write location is not writable. This mimics the same behavior that a user experiences when using the root system version of python.

### Install pyenv as root

First, we need to login as `root` on the machine we need to set up. Then, let's pick  a shared spot for `PYENV_HOME`. I typically do this at `/pyenv`. This is where we should do our clone.

```bash
git clone https://github.com/pyenv/pyenv.git /pyenv
```

Now, we must modify the default `.bashrc` configuration to match our install location. Configure this first for the `root` user so we can configure the versions available to our users.

```bash
export PYENV_ROOT="/pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

Now, install whatever versions of python you'd like to make available to all users, and set a default. You can also install any packages you'd like to make available by default

```bash
# install versions
pyenv install 3.11
pyenv install 3.7
# set default
pyenv global 
# install any global packages
pip install pipenv pipx
```

Finally, modify `/etc/skel/.bashrc` so that any new users get the `pyenv` configuration. Any existing users' `.bashrc`'s must be updated as well. Note the `--no-rehash` option specified here, which will suppress a warning about the `pyenv` location not being writable on login.

```bash
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init - --no-rehash)"
```
