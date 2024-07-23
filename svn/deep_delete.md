# SVN "Deep Delete"

Naturally, SVN keeps copies of "deleted" files around in its revision history to reference later if needed.

However, some cases warrant a "deep delete" of some file(s) checking into SVN. For example, when a sensitive file or large binary files were accidentally committed. In this case, we must perform the deletion from the SVN server from an admin perspective.

It works basically like this:

1. Dump existing repo with `svnadmin dump` command. This requires enough free space to write the ENTIRE existing repo to an additional dump file
2. Filter the existing dump with `svndumpfilter`, a way to create a new dump without any tracking of certain paths
3. Delete the existing SVN repo on the server
4. Create a new SVN repo with the same name with `svnadmin create`
5. Restore the filtered dump with `svnadmin load`

I will fill in more details if necessary when I do this for the first time.

See:

<https://stackoverflow.com/questions/2050475/delete-file-with-all-history-from-svn-repository>
<https://www.railscarma.com/blog/technical-articles/remove-files-revision-history-svn-repository>
