# hadolint

`hadolint` is a linter for `Dockerfile` that can catch some common mistakes and make suggestions on your build. For example, it tells you to pin down `pip` installs so that builds are deterministic.

It can be installed from its [GitHub releases](https://github.com/hadolint/hadolint/releases/) page.

```bash
# at the time of writing, this is the latest version. Replace link with newest at time of install
wget https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64
chmod +x hadolint-Linux-x86_64
sudo mv hadolint-Linux-x86_64 /usr/bin
```

## Try the Linter

```bash
hadolint /path/to/Dockerfile
```

## VSCode Extension

Install `exiasr.hadolint` VSCode extension to get live linting.

## Ignore

Create a file called `.hadolint.yaml` containing specific ignore codes. For example,

```yml
ignored:
  - DL3018
```
