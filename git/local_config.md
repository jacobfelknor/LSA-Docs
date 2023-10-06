# Local Per Repository Config

Most of the time, it is acceptable to use a global config for your `git` operations (i.e. in `~/.gitconfig`). This is especially true when you're only working with a single origin server (GitHub, GitLab, etc) for a single organization. You can set global settings by doing something like

```bash
git config --global user.name "Your Name"
git config --global user.email "user@example.com"
```

However, if you need to make commits to two different origins and your account information is different between them, it is important that you're able to have separate configs per repo. Every repo includes its own config file at `.git/config`. The values in this local config take precedence over the global config when they exist. If a setting is not found locally, it falls back to the global config file. We can add settings to this per repo config by omitting the `--global` in our commands above, or if you want to be explicit, including the `--local` flag instead.

```bash
git config --local user.name "Your Name"
git config --local user.email "user@example.com"
```

Now, when making commits from this repository your name and email will be different from the global setting.