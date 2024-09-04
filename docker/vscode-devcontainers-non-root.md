# Use a Non-Root User in VSCode Dev Container

VSCode dev containers are a fantastic way to set up your development environment in a predictable, reproducible way. You should read more about them [here, in VSCode's documentation](https://code.visualstudio.com/docs/devcontainers/containers)

However, if you're using `root` from within the container, you may run into some annoying permission problems as you work.

Most notably, a problem arises when you create a new file from within the container and then later try to manipulate that file outside the container. Since you were `root` inside, and all Linux cares about is the UID/GID of the owner, it will also be owned by `root` outside the container.

This means your normal user on the host will not be able to edit/delete or otherwise change this new file unless you use `sudo` or manually change the ownership back to your host user, or make the modifications back from within the container.

Obviously, this becomes extremely annoying. Luckily, there is a better way.

## Create and Configure a Non-Root User for Dev Container

Doing this is outside the scope of these notes, but a non-root container user must be available to connect to.

You can read [VSCode's documentation](https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user) to get a better idea how to do this.

## Tips and Tricks

Once you have your non-root user set up, here are some tips and tricks I've found while setting up dev environments to ensure you keep the advantages of using one (namely, volume mount permissions)

1. Use named volumes for containers that run as `root`, such as databases
    - The files created under bind mounts (like `./host/path:/container/path`) will be owned by root. Use named docker volumes here instead, like `namedvolume:/container/path`
    - Database directories are great fits here, since you're rarely if ever going to edit these files from outside the container
    - The host user will be able to remove the named docker volume without root, but not the dir created by the file (because itll be owned by root)

2. Use bind volumes for containers that run as your non-root user, like your dev envrionment
    - workdirs with your source code, or other configuration to use across container runs are great fits here
    - These bind points should already exist *before* your containers start, so the docker daemon doesn't create them on start (and will therefore be owned by root)
    - If you *need* to create files that aren't already here, ensure they're created in your `postInitScript` or similar so they are created by your non-root user

3. Instead of mounting to a non-root user's home dir for configurations, change the locations of these config files to a subdir of a folder in the working directory
    - things like bash history, client config, etc
    - these config file locations can often be changed with an ENV var that can be set in `Dockerfile`
    - then, `mkdir -p` these in the postInit/entrypoint and let them write to workdir/subdir. They can then be shared across containers without the docker daemon needing to create them on docker compose run (which makes them owned by root)
