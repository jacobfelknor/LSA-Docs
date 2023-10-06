# At Command Linux

For more details, see <https://www.linuxjournal.com/content/schedule-one-time-commands-unix-tool>

Sometimes, we want to run a scheduled command in Linux but do not need it to repeat on a schedule like we use `cron` for. If the scheduled command is a one-off, using another utility `at` is better suited for the job.

This can be used for a variety of cases, such as taking VM snapshots, rebooting VMs, taking a one-off backup, or anything else you can come up with.

## Time Syntax

Scheduling a command requires giving `at` a time. Luckily, it is very easy to do so, as `at` understands expressions such as

- `18:00`
- `5:30pm`
- `1am tomorrow`

For a more examples, see `man at`

## At One-Liner

For a simple scheduled one line command, use something like the following

```bash
echo "cmd to run" | at 1am tomorrow
```

## View Pending Jobs

To view pending `at` jobs, run `atq` (read as, "at queue").

```terminal
~# atq
2       Thu Jun  8 19:35:00 2023 a root
```

The first number, `2` in this case, is the job id. It can be used with the `atrm` command ("at remove"), as shown

```bash
# remove the job with id "2"
atrm 2
```
