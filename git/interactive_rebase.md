# Interactive Rebase

These are not comprehensive notes, but presents a specific situation where I learned about interactive rebases

## Case Study: Fix Commit Author

I recently contributed to an open source project and realized after I had opened the PR that my commits were not created under the correct author. I quickly looked up how to amend the commit author, and found the following

```bash
git commit --amend --author="Your Name <your_email@domain.com>"
```

After trying it out, it worked! The last commit I made now reflected the correct author. However.... there were several commits behind it who still were blamed on the wrong author. To my surprise, the `git commit --amend` command does not provide an option to amend specific commits, only the latest. I suspect this is because once you start rewriting previous history, you introduce the potential for conflicts.

The solution was to use an interactive rebase. I first found the SHA of first commit with the bad author. In this case, lets say it was `f46bc462`. I then ran

```bash
git rebase --interactive f46bc462~
```

Note the `~` after the SHA, indicating we want to rebase on top of the _parent_ of `f46bc462`, not that commit itself. You'll then be presented with an editor and a file that looks something like

```bash
pick 2f11978ad commit message one
pick cdf67f3db commit message two

# Rebase 113b9e9fd..cdf67f3db onto 113b9e9fd (2 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
#         create a merge commit using the original merge commit's
#         message (or the oneline, if no original merge commit was
#         specified); use -c <commit> to reword the commit message
# u, update-ref <ref> = track a placeholder for the <ref> to be updated
#                       to this position in the new commits. The <ref> is
#                       updated at the end of the rebase
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
```

For the commits you'd like to amend, change the `pick` to an `edit`. This will tell `git` to stop there during the rebase to allow us to make changes. Exit and save this file and the rebase will begin.

For each point in which the rebase stops to let you edit, your `HEAD` now becomes the commit we want to amend, meaning the previous command to amend the "last" commit will do exactly what we want. Re-run the amend command and continue the rebase for each commit to amend.

```bash
git commit --amend --author="Your Name <your_email@domain.com>"
git rebase --continue
```
