# Network Interface Names

At some point, I'd like to include here a history and summary of how Linux assigns its interface names (i.e, the names outputted by `ip a`)

For now, I'll just include a helpful command that can show you what the interface name was before and after it was renamed by the kernel on boot.

```bash
# search dmesg for eth, or eno, or whatever you expect the interface would have been
sudo dmesg | grep -i eth
```
