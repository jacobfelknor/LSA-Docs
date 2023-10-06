# Signed Commits

These notes are inspired by <https://withblue.ink/2020/05/17/how-and-why-to-sign-git-commits.html>

It can be beneficial to require that commits to your remote be signed by some key pair in order to verify that the user making the commit is who you think they are. Though credentials are required in order to be able to push changes to your remote, it is possible (and easy!) to impersonate someone else (who also has access to that repository) when making those commits.

## Case Study

Let's assume we have two users in our `Example Project` repository. Our first user is `John Smith` with email address `jsmith@example.com`. Our second user is me, `Jacob Felknor` with email address `jfelknor@example.com`. Both of us have access to the `Example Project` and can push code. Now, I'd like to push up some work I've done but am nervous about how the code review will go. In a lapse of morals, I decide that I'd like to blame John for my shaky work. I modify my local config by running `git config user.name` and `git config user.email` to match those of John. After pushing my work, Git(Hub/Lab) tells everyone that John is the one who made the commit! He gets all the blame in our code review and I get off scot-free... that's not fair!

## Signed Commits to the Rescue

The above case study may be surprising at first. How come I was so easily able to impersonate another user? Bottom line is, the user information in your `git` config is not designed to do any authentication and is simply a way of self declaring who made a commit in the `git log`. Assuming you have set up your repo permissions appropriately, and you trust the members on your team, this shouldn't ever be a problem. Developers will represent themselves faithfully and not act as I did in the example. However, if you'd like to be certain that the person committing is who they say they are, we can used signed commits to accomplish that.

## Sign with SSH

You must first have your SSH public key associated with your Git(Lab/Hub) account. Doing so is outside the scope of these notes. Once you've done that, we can configure `git` to use SSH for signing.

```bash
# add --global key if you want these settings to span all repos
git config gpg.format ssh
git config user.signingkey ~/.ssh/yourkey
```

Now, when you'd like to sign your commits, we can use the `-S` flag to do so

```bash
git commit -S -m "my msg"
# optionally configure git to always sign
git config commit.gpgsign true
```

## Sign with GPG

You must first have your GPG key associated with your Git(Lab/Hub) account. Doing so is outside the scope of these notes. Once you've done that, we can configure `git` to use your GPG key for signing

```bash
# clear setting, so that we ensure we're using the default GPG as signing. Use --global if necessary
git config --unset gpg.format
```

List the long form of GPG keys

```bash
gpg --list-secret-keys --keyid-format=long
```

From the list of GPG keys, copy the long form of the GPG key ID you'd like to use. In this example, the GPG key ID is `3AA5C34371567BD2`:

```text
------------------------------------
sec   4096R/3AA5C34371567BD2 2016-03-10 [expires: 2017-03-10]
uid                          Hubot <hubot@example.com>
ssb   4096R/4BB6D45482678BE3 2016-03-10
```

Then tell `git` to use that key for signing

```bash
# use --global if necessary
git config user.signingkey 3AA5C34371567BD2
```

Now, when you'd like to sign your commits, we can use the `-S` flag to do so

```bash
git commit -S -m "my msg"
# optionally, configure git to always sign
git config commit.gpgsign true
```
