# File Sizes Matching Regex

If you're trying to find the size of all files whose name matches a regex within a certain directory recursively, you can use the following command

```bash
find . -iregex '.*' -print0 | du --files0-from=- -ch | tail -1
```