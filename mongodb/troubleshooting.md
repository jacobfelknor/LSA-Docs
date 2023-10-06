# MongoDB Troubleshooting


## Service Stops Immediately After Start

I ran into an issue where the MongoDB service would stop immediately after starting. In the logs (`/var/log/mongodb/mongod.log`), I found something like the following:

```json
...
{"t":{"$date":"2023-04-03T10:20:05.322-06:00"},"s":"I",  "c":"NETWORK",  "id":23016,   "ctx":"listener","msg":"Waiting for connections","attr":{"port":27017,"ssl":"off"}}
{"t":{"$date":"2023-04-03T10:20:05.335-06:00"},"s":"I",  "c":"CONTROL",  "id":23377,   "ctx":"SignalHandler","msg":"Received signal","attr":{"signal":15,"error":"Terminated"}}
{"t":{"$date":"2023-04-03T10:20:05.335-06:00"},"s":"I",  "c":"CONTROL",  "id":23378,   "ctx":"SignalHandler","msg":"Signal was sent by kill(2)","attr":{"pid":1,"uid":0}}
{"t":{"$date":"2023-04-03T10:20:05.335-06:00"},"s":"I",  "c":"CONTROL",  "id":23381,   "ctx":"SignalHandler","msg":"will terminate after current cmd ends"}
...
```

The important bit is that a kill signal was sent to MongoDB immediately after it started. While I didn't find the root cause for why the kill signal was sent, I did find a workaround. It appears that if you remove the `fork` setting from the config file, it starts working again.

In `/etc/mongod.conf`, removing (or commenting out) the following lines fixed my issue.

```yaml
# how the process runs
processManagement:
  fork: true  # fork and run in background
  pidFilePath: /var/run/mongodb/mongod.pid  # location of pidfile
  timeZoneInfo: /usr/share/zoneinfo
```

Since I was running `mongod` as a `systemd` service, I didn't care whether it forked to the background or not. This got me back up and running.