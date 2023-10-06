# Approximate Pi in Bash

Here is a funny little bash script (thanks to [this tweet](https://twitter.com/vmisev/status/1658165389904191489)) to print out digits of pi with a sum approximated by `n` steps.

```bash
#!/bin/sh
: "${PI_SCALE:=5}";u(){ echo "Usage: ${0##*/} [-h] [-n scale]">&2;exit 1;}
while getopts hn: f;do case "$f" in n)PI_SCALE="$OPTARG";;*) u;esac;done
echo "scale=$PI_SCALE;16*a(1/5) - 4*a(1/239)"|BC_LINE_LENGTH=$((${PI_SCALE}+4)) bc -l
```

Place that in a file `pi`, `chmod +x pi`, then you can run

```bash
pi -n 10
```
