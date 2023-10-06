# Generate and List GPG Keys

GPG is a large and complex cryptography tool, but at a basic level, GPG keys can be used to sign messages or files. It can be used to verify things such as [signed `git` commits](../git/signed_commits.md)

## Generate Key

To generate a new key, run

```bash
gpg --full-generate-key
```

From here, follow the prompts given, selecting the appropriate options for your application.

## List Keys

To list all keys, run

```bash
gpg --list-secret-keys --keyid-format=long
```

The `id` is shown on the line containing `sec`. In the following case, the `id` is `3AA5C34371567BD2`

```text
/Users/hubot/.gnupg/secring.gpg
------------------------------------
sec   4096R/3AA5C34371567BD2 2016-03-10 [expires: 2017-03-10]
uid                          Hubot <hubot@example.com>
ssb   4096R/4BB6D45482678BE3 2016-03-10
```

To print the public key associated with a certain `id`, run

```bash
gpg --armor --export <id>
```
