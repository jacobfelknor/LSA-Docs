# Log Denies

It can be very helpful while debugging firewall configurations if you can see the packets being rejected.

## firewalld

These notes adapted from <https://www.cyberciti.biz/faq/enable-firewalld-logging-for-denied-packets-on-linux/>

To turn on logging of all denied packets, run

```bash
sudo firewall-cmd --set-log-denied=all
```

To turn it back off, run

```bash
sudo firewall-cmd --set-log-denied=off
```

We can also use the `LogDenied` option in the config file. To check its value, run

```bash
grep '^LogDenied' /etc/firewalld/firewalld.conf
```

To view the logs,

```bash
dmesg | grep -i REJECT

# if you're hunting for a particular IP, add another grep.
# for example,
dmesg | grep -i REJECT | grep 192.168.86.21
```
