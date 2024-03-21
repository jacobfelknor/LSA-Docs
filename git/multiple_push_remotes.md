# Push to Multiple Remotes

Sometimes it can be useful to push changes to a local git repository to two different remotes. The typical approach here would be to add a second remote explicitly.

```console
#~ git remote -v
origin  https://example.com/myproject.git (fetch)
origin  https://example.com/myproject.git (push)

#~ git remote add other-origin https://other-origin.com/myproject.git

#~ git remote -v
origin  https://example.com/myproject.git (fetch)
origin  https://example.com/myproject.git (push)
other-origin    https://other-origin.com/myproject.git (fetch)
other-origin    https://other-origin.com/myproject.git (push)
```

This scenario is helpful if you expect to `push` and `fetch` changes to/from both remotes. You could do any variation of the following:

```bash
# git <operation> <remote name>

git push origin
git push other-origin

git pull origin
git fetch other-origin
```

However, sometimes all you'd like to do is `push` changes to two different remotes, but only ever `fetch` from one. We can accomplish this by modifying our `.git/config` file inside the local repository.

```ini
[remote "origin"]
    url = https://example.com/myproject.git
    fetch = +refs/heads/*:refs/remotes/origin/*
    pushurl = https://example.com/myproject.git
    pushurl = https://other-origin.com/myproject.git
```

Now, we can do a `git push` which will push changes to both remotes simultaneously, while `git fetch` or `git pull` will only get changes from the `example.com` origin.
