# Kill All Processes For User

Don't ask, don't tell on this one... sometimes you can't figure out why something isn't working (`xrdp`, cough cough...), and rather than reboot the whole machine, we can just kill all processes associated with a given user. You really ought to figure out which process is the problem, but when you don't have time for that, you could go with this.

```bash
# find UID
id username
# kill procs with that uid
sudo pkill --signal KILL -U <uid>
```
