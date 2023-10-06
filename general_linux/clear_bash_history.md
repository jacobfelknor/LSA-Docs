# Completely Clear Bash History

You can clear bash history by deleting the contents of `~/.bash_history`. However, one annoying side-effect is that the history entries has a copy in the memory and it will flush back to the file when you log out. We can use the following command to completely clear history.

```bash
cat /dev/null > ~/.bash_history && history -c && exit
```
