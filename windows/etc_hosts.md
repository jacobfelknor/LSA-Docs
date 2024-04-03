# Windows /etc/hosts

On Linux, there is a file at `/etc/hosts` that allows you to create specific local "DNS entries" for resolving certain domain names. This can be helpful in a development environment when you want to use domain names that may not exist yet, or just override a domain to point somewhere else (e.g., `localhost`).

This idea was borrowed from Linux and added to Windows. The file you're looking for is at

```text
C:\Windows\System32\drivers\etc\hosts
```

**NOTE:** editing this file requires Admin rights. You can edit it by opening Notepad (or another text editor) as Administrator.

It follows the same syntax as the Linux version. For example,

```ini
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#   127.0.0.1       localhost
#   ::1             localhost

127.0.0.1 example.com
```
