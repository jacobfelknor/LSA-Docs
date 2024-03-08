# Diff Containers and Images

Sometimes it can be useful, particularly when you're building your own images, to inspect the differences between two images. A useful tool is called `container-diff`. See its GitHub here: <https://github.com/GoogleContainerTools/container-diff>

## Usage

Their `README` does a good job explaining installation/usage, so won't repeat it here, but will only include my most frequent commands.

```bash
# compare filesystem of image tarballs.
# pipe to less if you expect a large output
container-diff diff --type=file image1:tag image2:tag | less

# if you need to compare two images that are local and
# not in a remote repository, prefix with daemon://
container-diff diff --type=file daemon://image:tag daemon://image:tag
```
