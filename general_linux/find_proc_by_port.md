# Find a Process by Port it's Using

It can be incredibly annoying sometimes when you try to start a service but the port is already in use. If you want to see which process is using the port, try the following command, replacing `8000` with whatever port you're looking for:

```bash
sudo ss -lptn 'sport = :8000'
```

Example output:

```console
State            Recv-Q           Send-Q                       Local Address:Port                       Peer Address:Port           Process           
LISTEN           0                10                               127.0.0.1:8000                            0.0.0.0:*               users:(("python",pid=109520,fd=7))
```

At this point, you can stop the offending process with a 

```bash
kill -9 pid
# in the example above,
kill -9 109520
```