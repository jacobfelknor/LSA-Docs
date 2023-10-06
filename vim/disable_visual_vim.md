# Visual Vim

Sometimes your `vim` installation will have a "visual" mode enabled that makes copying and pasting a horrible experience. You *could* hold `SHIFT` while copying, but in my experience that method doesn't respect newlines and your entire selection gets pasted on a single line.

A better solution is to add the following to your `~/.vimrc` file which disables the visual mode while maintaining all other default settings.

```bash
source $VIMRUNTIME/defaults.vim
set mouse-=a
```
