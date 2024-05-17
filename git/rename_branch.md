# Rename git Branch

Rename an existing branch with

```bash
# rename a branch
git branch -m <oldname> <newname>

# remove the upstream info from old branch name
git branch --unset-upstream

# push to origin branch of new name
git push

# NOTE: follow output if you need to create the new remote branch
#       may need to use --force if pushing to an existing remote branch
```

**NOTE:** You must ensure that a local branch with that name does not already exist. If the remote branch for the new name exists, you will need to either first delete the remote branch or force push
