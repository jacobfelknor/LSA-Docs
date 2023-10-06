# tmux

`tmux` is a terminal multiplexer for linux that allows for simultaneous access to different terminal sessions, and allows you to keep a session running in the background to return to later. 

## Installation

Installation should be very straightforward using your distro's package manager. For example, using `apt`,

```bash
sudo apt install tmux
```

## Config

`tmux` allows you to use a configuration file to customise your installation. The configuration file `.tmux.conf` should live in your home directory. 

The one setting I always change is the escape prefix. For example, when detaching from a session I use the key combo "backtick + d"

```bash
# ~/.tmux.conf
set -g prefix `
```

## Frequent Commands

For a wider scope, see this [tmux cheatsheet](https://tmuxcheatsheet.com/)

Create a New Named Session

```bash
tmux new -s mysession
```

Create a new window within an existing session

```console
` + c
```

Next/Previous window

```console
` + n
` + p
```

Rename window

```console
` + ,
```