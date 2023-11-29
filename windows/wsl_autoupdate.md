# WSL Automatically Update

Windows Subsystem for Linux is a great tool to unlock access to nearly limitless Linux tooling on your Windows host. However, it has some limitations. Specifically in this context, we cannot count on things like `cron` or other scheduled tasks, such as `systemd` timers.

As a result, it may become annoying to keep a WSL instance up to date. Each update must be run manually, and I found myself almost never doing so, going months between updates.

A simple way to solve this is to add a scheduled task to Windows to log in to a WSL shell and execute the updates. This delegates the scheduling to Windows itself, solving our problem of not being able to count on WSL being up all the time.

## Setup

First, you must allow `apt` to be ran as sudo with no password. This allows the scheduled task to run unattended without prompting you with your password. In an `/etc/sudoers.d` file,

```text
%sudo ALL=NOPASSWD:/usr/bin/apt
```

Then, try the following command from the `Run` window (`Win + R`):

```powershell
%windir%\system32\bash.exe -c "sudo apt update && sudo apt upgrade -y"
```

If successful, you will see a terminal window open, run the `apt` commands, and then close after finishing. Your input should not be required.

## Create Scheduled Task

The details surrounding creating a scheduled task in windows is outside the scope of this documentation. However, you can use the command we pasted into `Win + R` above as the `Action` for your associated task, which accomplishes our goal of enabling automatic updates for a WSL instance.

The `Program/script` entry should be `%windir%\system32\bash.exe`, and the arguments should be `-c "sudo apt update && sudo apt upgrade -y"`
