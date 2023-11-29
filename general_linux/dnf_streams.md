# DNF Streams

These notes based on <https://access.redhat.com/discussions/6212191>

## View Streams

You can view stream options for a particular module. For example, you can view available streams for `nodejs` by running

```bash
dnf module list nodejs
```

The output will look something like

```text
Red Hat Enterprise Linux 8 for x86_64 - AppStream (RPMs)
Name                         Stream                       Profiles                                                   Summary                                
nodejs                       10 [d]                       common [d], development, minimal, s2i                      Javascript runtime                     
nodejs                       12                           common [d], development, minimal, s2i                      Javascript runtime                     
nodejs                       14                           common [d], development, minimal, s2i                      Javascript runtime                     
nodejs                       16                           common [d], development, minimal, s2i                      Javascript runtime                     
nodejs                       18                           common [d], development, minimal, s2i                      Javascript runtime                     
nodejs                       20                           common [d], development, minimal, s2i                      Javascript runtime                     

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```

## Switch Stream

To switch between streams - in this case, switch to stream 14 - execute the following commands:

```bash
dnf module remove nodejs
dnf module disable nodejs
dnf module reset nodejs
dnf module enable nodejs:14
dnf module install nodejs:14
```
