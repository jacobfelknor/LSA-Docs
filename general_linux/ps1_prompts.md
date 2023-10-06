# PS1 Prompts

It is generally a good idea to give some visual indication of what environment you are in at the command line prompt. Often, production and development machines will be very similar or identical, so this visual cue can be extremely helpful as to not get confused about which command line you're at. The environment variable `PS1` controls what prompt you see.

I typically have 3 different modes for my `PS1` - one for development, one for staging, and one for production.

## Development Prompt - Green

```bash
#!/bin/sh
export PS1="\[\033[38;5;10m\]\u@\h\[$(tput sgr0)\]:\[$(tput sgr0)\]\[\033[38;5;12m\]\w\[$(tput sgr0)\]\\$ \[$(tput sgr0)\]"
```

## Staging Prompt - Yellow

```bash
#!/bin/sh
export PS1="\[\033[38;5;3m\]\u@\h\[$(tput sgr0)\]:\[$(tput sgr0)\]\[\033[38;5;27m\]\w\[$(tput sgr0)\]\\$\[$(tput sgr0)\] "
```

## Production Prompt - Red

```bash
#!/bin/sh
export PS1="\[\033[38;5;1m\]\u@\h\[$(tput sgr0)\]:\[$(tput sgr0)\]\[\033[38;5;27m\]\w\[$(tput sgr0)\]\\$\[$(tput sgr0)\] "
```

## Install

To "install" these prompts for all users, place these in a file under `/etc/profile.d/`. For example, for my production machines, I created a file `/etc/profile.d/production_prompt.sh` containing the prompt above.

If, instead, you'd like to "install" only for a single user, you can place it in a user specific location like inside their `~/.bashrc` or `~/.bash_profile`.

## Build New Ones

As you can see, the syntax for these prompts is borderline unreadable. Instead of fiddling with it manually, I use a site like [bashrcgenerator](https://bashrcgenerator.com/) to build new prompts.
