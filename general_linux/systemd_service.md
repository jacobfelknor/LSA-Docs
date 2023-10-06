# systemd Service Template

For processes that need to start automatically on boot or in the background continuously, using a `systemd` service is a great option. The template below will handle a majority of simple cases. It specifies a working directory, the process to run, and user/group information.

```ini
[Unit]
Description=description goes here

[Service]
# optionally add environment variables
Environment="VAR1=value"
Environment="VAr2=value"
# REQUIRED, specify what program to run and where
ExecStart=/absolute/path/to/executable
WorkingDirectory=/absolute/path/to/working/directory
# some options are no, always, and on-failure
Restart=on-failure
# optional, but nice to specify when you can
User=username
Group=groupname

[Install]
WantedBy=multi-user.target
```
