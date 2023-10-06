# Pre-configured Git Authentication for Containers

## Background

Sometimes, it is useful for a container to be preconfigured with git credentials so that user input is not required to perform git operations during use.
This is especially useful if the container is being used in an automated CI/CD situation where there is no user to input credentials. There are a couple different ways to handle this.

## SSH Keys

My preferred way to handle this is to use ssh keys. The idea being, each container is spawned with the same private ssh key, and its corresponding public key is configured in your git provider of choice.

1. First, create a new ssh key pair for use with this container
    ```bash
    ssh-keygen
    ```

    Note the location in which the key gets saved (default is `~/.ssh/id_rsa`, `~/.ssh/id_rsa.pub`)

2. Copy these files to your container's repo.
3. Add a version of the following to your `Dockerfile`

    > **⚠️ WARNING!** This method leaves a copy of your private key in the image itself. It should only be used with a specific ssh key and user for this container and in private/internal repo visibility settings.

    For Linux containers
    ```Dockerfile
    # example shown for root user, but use the home directory of whatever user needs access to the keys

    # ensure ssh dir exists
    RUN mkdir -p /root/.ssh
    # copy over private key
    # WARNING: anyone who has access to this image will also be able to see this private key in its corresponding layer,
    # even if you delete it in a later RUN.
    ADD id_rsa /root/.ssh/id_rsa

    # Set up known hosts, so user input isn't required
    RUN ssh-keyscan git.example.com >> /root/.ssh/known_hosts

    ## Turn off StrictHostChecking if you don't want to worry about known_hosts
    # Contents of config file:
    # Host *
    #    StrictHostKeyChecking no
    # COPY config /root/.ssh

    # run the git clone!
    RUN git clone ...
    ```

    For Windows containers, I like to define all the files in the repo itself, to avoid encoding issues and other problems I faced when trying to `echo` things into files

    ```Dockerfile
    ## Create ssh directory
    RUN mkdir C:\Users\ContainerAdministrator\.ssh
    # for some reason, it doesn't like COPY id_rsa C:\Users\ContainerAdministrator\.ssh, so we work around that
    COPY id_rsa .
    RUN mv id_rsa C:\Users\ContainerAdministrator\.ssh

    ## Turn off StrictHostChecking if you don't want to worry about known_hosts
    # Contents of config file:
    # Host *
    #    StrictHostKeyChecking no
    # COPY config .
    # RUN mv config C:\Users\ContainerAdministrator\.ssh

    # Contents of known_hosts is the output of ssk-keyscan git.example.com
    COPY known_hosts . 
    RUN mv known_hosts C:\Users\ContainerAdministrator\.ssh
    ```

## HTTP Authentication

This method is less ideal, but still possible. The first way I've done this is using a `netrc` file. The specification of this file can be found [here](https://www.gnu.org/software/inetutils/manual/html_node/The-_002enetrc-file.html), but it is essentially a list of login information to be used by default on requests to certain machines. It will work on both windows and linux containers.

> **⚠️ WARNING!** This method leaves a copy of your username and password in plain text in the image. It should only be used with a specific user for this container, and in repos with internal/private visibility. 

For Linux containers,

```Dockerfile
## Set http git credentials in .netrc
RUN echo "machine git.example.com login username password yourpassword" > /root/.netrc
```

For Windows containers,

```Dockerfile
## Set http git credentials in _netrc
# NOTE: setting HOME env var is required!
RUN setx HOME %USERPROFILE% 
# Contents of _netrc:
# machine git.example.com
# login username 
# password yourpassword
COPY _netrc .
RUN mv _netrc C:\Users\ContainerAdministrator\_netrc
```

### Gotcha! Some things that don't work...

- setting the git credential helper to "store" and populating a `~/.git-credentials` file with the appropriate information. Still prompts for username/password on first use, but then works from then on. This is true of running `git config --global credential.helper store` OR using a `.gitconfig` file in the user's home directory
- Using `echo` to populate `_netrc` on the Windows container
- Not setting the `%HOME%` environment variable on the Windows container
- Simiilarly, using `set` to set the `%HOME%` env var instead of `setx`. The former is temporary to the shell its executed in, the latter is persistent across new shells.

### Future Work

- I claim that using the `git config` method with stored credentials and a `.git-credentials` file doesn't work. This was only rigorously tested with a windows container, then applied to the Linux container. May want to come back and try this on Linux again

- Use access tokens for HTTP access, set to a readonly mode. 
    - See [this article](https://medium.com/paperchain/fetching-private-github-repos-from-a-docker-container-273f25ec5a74) for more, but the important line was
    
        ```Dockerfile
        RUN git config --global url.”https://{token}:@github.com/".insteadOf “https://github.com/"
        ```
