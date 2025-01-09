# Exclude Package From Repo

Sometimes you setup multiple repositories on the same machine whose packages may conflict with one another. This can cause problems during package updates and dependency resolution if both sources do not agree with one another. IT can be helpful in these scenarios to ignore certain packages from a particular repo, letting the other handle all upgrades for the conflicted package. In my experience, this usually happens when you've enabled EPEL and also an application specific repo who provides the same packages.

We can ignore the problematic package by adding the `exclude=pkg*` line as shown below. In this case, I wanted to ignore a particular php package.

```ini
[epel]
name=Extra Packages for Enterprise Linux 9 - $basearch
# It is much more secure to use the metalink, but if you wish to use a local mirror
# place its address here.
#baseurl=https://download.example/pub/epel/9/Everything/$basearch/
metalink=https://mirrors.fedoraproject.org/metalink?repo=epel-9&arch=$basearch&infra=$infra&content=$contentdir
enabled=1
gpgcheck=1
countme=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-9
# Here we can ignore certain packages!
exclude=php-pecl-mongodb*
```
