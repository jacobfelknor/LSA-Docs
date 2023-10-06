# Container Registry Administration

Here, I've documented some useful container registry admin topics. See GitLab's [official documentation](https://docs.gitlab.com/ee/administration/packages/container_registry.html) for more details.

## Container Registry Garbage Collection

This command clears some unused layers in your container registry. This is a storage intensive feature of GitLab, and doing the garbage collection can help free up some space.

```bash
sudo gitlab-ctl registry-garbage-collect
```

There is also a way more destructive (but frees more space) command that removes all untagged manifests and layers. This includes containers that are pushed with no tag. Before running this command, understand the implications and it is highly recommended to take a backup first.

```bash
sudo gitlab-ctl registry-garbage-collect -m
```
