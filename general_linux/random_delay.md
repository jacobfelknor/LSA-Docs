# Random Delay for a Linux Command

Inspired by [this StackExchange answer](https://serverfault.com/a/347583) and []

Sometimes it can be helpful to add a random delay before running a Linux command. Particularly, this can be helpful when you want to introduce some randomness to the schedule of a cron job. Cron does not have this functionality built in, so we must do this ourselves.

In `bash`, there is a shell variable named `RANDOM` that gets set to an integer between `0` and `32767` each time it is referenced. It is not and environment variable and will not appear in the output of `env`. Furthermore, it will not appear in the output of `set` (which prints shell variables) until it is used at least once. For example,

```console
$ # https://unix.stackexchange.com/a/453554
$ set | grep RAN   ## returns nothing, RANDOM is unset
$ echo "$RANDOM"   ## this will assign a value to RANDOM
1234
$ set | grep RAN   ## so now it will also appear in the output of set 
RANDOM=1234
```

Knowing this, we can craft our `sleep` command to take advantage of this randomness as follows:

```bash
# where MAXWAIT is the max number of seconds to sleep
sleep $((RANDOM % MAXWAIT)) 
```

In `cron`, we need to escape the `'%'`, like this

```cron
* * * * * /usr/bin/sleep $((RANDOM \% 300)) && cmd
```
