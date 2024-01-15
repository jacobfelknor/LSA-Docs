# Collection of Interesting Command Line Tools

A series of intersting command line tools I've stumbled upon that could be useful

## Bypass Alias

If you need to use a non-aliased version of a command, you can do so by prepending `\` to it. For example, I alias the `cat` command to use `bat` instead (shown later). If I instead really wanted to use built in `cat`, I could run `\cat`

## bat

Better `cat`. Allows output of files in syntax highlighted ways.

I alias `cat` to `bat -pp`, so that it behaves almost identical to `cat` except the highlighting.

```bash
# like cat, but better (bat) https://github.com/sharkdp/bat#installation
sudo dnf/apt install bat
# like gzip, but parallelized (pigz) https://github.com/madler/pigz
git clone https://github.com/madler/pigz.git
cd pigz
make
```

## exa

`exa` is a modern replacement of `ls` command written in rust, colorized by default.

Install with `apt`

```bash
sudo apt install exa
```

Install using binary from GitHub

```bash
wget https://github.com/ogham/exa/releases/download/v0.10.1/exa-linux-x86_64-v0.10.1.zip
unzip exa-linux-x86_64-v0.10.1.zip
sudo cp ./bin/exa /usr/bin/
```

I alias `ll` to `exa -aFbghHliS` for an extremely detailed and pretty output. It is most similar to my normal `ll` alias with some extra features that `exa` provides.

## Monitoring tools

These are good system monitoring tools I use on a daily basis. `htop` is terminal general system monitor, and `ncdu` is a ncurses version of the `du` command, which shows filesystem usage information.

```bash
# for system monitor
sudo dnf/apt install htop
# bpytop, a even cooler sys monitor
sudo dnf/snap install bpytop
# for storage analyzer
sudo dnf/apt install ncdu
```

## Git Delete Merged Branches

A more convenient way to keep local and remote deleted branches synced. See its [GitHub repo](https://github.com/hartwork/git-delete-merged-branches?utm_source=tldrnewsletter) for more details.

## Powerline Go

Informative shell prompt

[https://github.com/justjanne/powerline-go](https://github.com/justjanne/powerline-go)

## jc

"JSON Convert", JSONifies the output of many CLI tools, file-types, and common strings for easier parsing in scripts.

See its [GitHub](https://github.com/kellyjonbrazil/jc?utm_source=tldrnewsletter)

Example:

```bash
lsblk | jc --lsblk
```

```json
[
  {
    "name": "vda",
    "maj_min": "252:0",
    "rm": false,
    "size": "50G",
    "ro": false,
    "type": "disk",
    "mountpoint": null
  },
  {
    "name": "vda1",
    "maj_min": "252:1",
    "rm": false,
    "size": "1G",
    "ro": false,
    "type": "part",
    "mountpoint": "/boot"
  },
  {
    "name": "vda2",
    "maj_min": "252:2",
    "rm": false,
    "size": "49G",
    "ro": false,
    "type": "part",
    "mountpoint": null
  },
]
```

## tqdm

See github page at <https://github.com/tqdm/tqdm#tqdm>. Nice progress bar for python, including a cmd line utility which you can pipe normal commands to.

## banner

This is a classic-style banner program similar to the one found in Solaris or AIX in the late 1990s.  It prints a short string to the console in very large letters.

To install,

```bash
# RHEL
dnf install banner
# Debian
apt install sysvbanner
```

Try it out!

```bash
banner "hello"

#     #  #######  #        #        #######  
#     #  #        #        #        #     #  
#     #  #        #        #        #     #  
#######  #####    #        #        #     #  
#     #  #        #        #        #     #  
#     #  #        #        #        #     #  
#     #  #######  #######  #######  ####### 

# for "block" letters, replace with sed
banner "hello" | sed 's/#/█/g'

█     █  ███████  █        █        ███████  
█     █  █        █        █        █     █  
█     █  █        █        █        █     █  
███████  █████    █        █        █     █  
█     █  █        █        █        █     █  
█     █  █        █        █        █     █  
█     █  ███████  ███████  ███████  ███████  

```
