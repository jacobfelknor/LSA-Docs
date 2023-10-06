# Find Parent Branch

This command line magic shows you which branch is the parent of the currently checkout out branch

```bash
git show-branch \
| sed "s/].*//" \
| grep "\*" \
| grep -v "$(git rev-parse --abbrev-ref HEAD)" \
| head -n1 \
| sed "s/^.*\[//"
```

You can make an alias for this command by placing the following in your `~/.gitconfig`

```ini
[alias]
    parent = "!git show-branch | grep '*' | grep -v \"$(git rev-parse --abbrev-ref HEAD)\" | head -n1 | sed 's/.*\\[\\(.*\\)\\].*/\\1/' | sed 's/[\\^~].*//' #"
```
