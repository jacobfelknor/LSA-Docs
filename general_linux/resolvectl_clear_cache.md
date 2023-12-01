# Clear DNS Cache with resolvectl

From Ubuntu 22.04 onward, use

```bash
sudo resolvectl flush-caches
```

Greater than or equal to 17.04 but less than 22.04

```bash
sudo systemd-resolve --flush-caches
```
