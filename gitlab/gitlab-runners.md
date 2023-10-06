# GitLab Runners

I may choose to document in more detail here in the future, but the [official docs](https://docs.gitlab.com/runner/register/) are quite good. I'm going to focus more on "gotchas" and little things

## Feature Flags

Check out [Gitlab Runner Feature Flags](https://docs.gitlab.com/runner/configuration/feature-flags.html), there may be some things in here that solve your problems

## Timezones

By default, your timezone may not be set in your runner containers. You could always add the timezone to the images themselves in your `Dockerfile` like this:

```Dockerfile
# Timezone Setting
ENV TZ=America/Denver
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
```

However, another option is just to set the `TZ` environment variable through the GitLab CI/CD settings if you wanted to avoid having a default timezone hardcoded in the container.

## .bashrc, my oh my

Your gitlab runners will not by default source `~/.bashrc`. Consequently, any aliases, environment variables, or scripts to `source` will not be honored. In addition, even if you follow a `source ~/.bashrc && cmd` pattern for your gitlab script, it will likely still not follow the expected behavior. This is because of a line in most skeleton `.bashrc` files requiring `$PS1` to be defined in order to proceed.

```bash
# ~/.bashrc
...
# If not running interactively, don't do anything
[ -z "$PS1" ] && return
...
# rest of script here
```

Therefore, you must define `$PS1` in order for the source to take the effect you expect, or remove this line from `.bashrc`. For example, you could define your gitlab script like this:

```yml
Unit Tests:
  variables:
    # PS1 required!! for sourcing bashrc to work. It can be a dummy value
    PS1: dummy
  script:
    - source ~/.bashrc && cmd
```

## Docker Registry Authentication

In your CI jobs for runners with the `docker` executor, the runner must first pull the image from the registry specified. For example, `image: gitlab.example.com:5050/docker/my_image:v1.0.0`.

> NOTE: if you do not specify a host, like `gitlab.example.com`, the public DockerHub registry will be used.

If you're using an internal registry, it is likely that authentication is required to pull. This authentication can be passed in the following ways, in order of precedence:

1. The contents of `DOCKER_AUTH_CONFIG`, which matches the syntax of what could be in...
2. The contents of `$HOME/.docker/.config.json`. This is automatically set up when you run `docker login` on the runner's host.
    > WARNING: This value is simply a base64 encoded string of `username:password`. It will work for as long as the username/password combination is valid. Changing your password will result in this starting to fail
3. Credentials sent by default with a job’s payload.
    > WARNING: Credentials sent by job payloads inherit the permissions of the user who triggered the job. This will only work if the image is hosted in the GitLab Container Registry and the user has permission to pull from it

## Nested Docker?

> UPDATE: I finally did find this in the official docs [here](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-docker-socket-binding)

If your docker runners must build docker containers themselves as a part of CI/CD build, we must pass the docker daemon socket through from the host machine to the container doing the building.

In your `/etc/gitlab-runner/config.toml`, mount the docker UNIX socket to the containers.

```toml
volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
```

If you do not do this, you'll get a slightly cryptic DNS error like the following when attempting to login to the registry:

```bash
$ echo -n $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
error during connect: Post "http://docker:2375/v1.24/auth": dial tcp: lookup docker on 192.168.119.28:53: server misbehaving
```

The "misbehaving" server is a DNS server, who cannot find the host `docker`, because it probably doesn't exist on your network.

### Possible Alternative

> UPDATE: found in the offical docs [here](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-docker-socket-binding). It looks to me like the socket binding method is better and simpler

Untested, because I found this after I got it working and haven't cared to try it yet, but this is also a possible solution. In your `.gitlab-ci.yml`, try adding the following

```yml
services:
  - docker:dind
```

> NOTE: `dind` stands for "docker in docker"

## Git Submodules, I think?

I can't remember exactly why this is here, but I vaguely remember putting this line in when I started for what I think was to fix failing cloning submodules during a CI/CD job.

I'll add more information here if I find/remember it

```toml
pre_clone_script = "git config --global --add url.\\\"${CI_SERVER_PROTOCOL}://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}:${CI_SERVER_PORT}/\\\".insteadOf \\\"git@gitlab.example.com:\\\"\n git config --global --add url.\\\"${CI_SERVER_PROTOCOL}://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}:${CI_SERVER_PORT}/\\\".insteadOf \\\"https://gitlab.example.com:\\\"\n"
```

Note that this was formatted much nicer in our old Windows host runner. I also remember this not working as shown when I tried it on our linux runner, but will keep in case it will someday

```toml
pre_clone_script =  '''
                        git config --global --add url.\"${CI_SERVER_PROTOCOL}://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER}:${CI_SERVER_PORT}/\".insteadOf \"git@gitlab.example.com:\"
                        git config --global --add url.\"${CI_SERVER_PROTOCOL}://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER}:${CI_SERVER_PORT}/\".insteadOf \"https://gitlab.example.com:\"
                      '''
```

## Windows Runners

Try using the [chocolatey](https://chocolatey.org/) package manager. You can add this to a windows container with the following inside your `Dockerfile`

```Dockerfile
## Add chocolatey
RUN Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

## For example, to add Git
RUN choco install git.install -y
```

This leads to much nicer installs than trying to chain together multiple Powershell commands to install things while also making it easier to install things non-interactive.

### Shell Selection

By default, your windows runner will be registered with `shell = "pwsh"` in your `config.toml`. I've found that this hasn't worked for me, but switching the shell to `powershell` does. For example,

```toml
[[runners]]
  ...
  executor = "docker-windows"
  shell = "powershell" # originally "pwsh"
  ...
```

## Git Safe Directories

`git` versions 2.35.2 and newer introduce a concept of "safe directories". Newer versions of the `gitlab-runner` include this newer version of `git`. As a result, the helper container spawned using `gitlab-runner` checks out the code as `root`. If your container doesn't use the root user to execute its script, you'll run into the following error:

```console
fatal: detected dubious ownership in repository at '/path/to/build'
```

Enabling the `FF_DISABLE_UMASK_FOR_DOCKER_EXECUTOR` [feature flag](https://docs.gitlab.com/runner/configuration/feature-flags.html) may resolve this issue, but only for Linux Runners.

A workaround proposed in [this GitLab issue](https://gitlab.com/gitlab-org/gitlab-runner/-/issues/29022) is to add the following to your `pre_clone_script` section of your `config.toml`.

### Linux Runner

```toml
[[runners]]
  pre_clone_script = "git config --global --add safe.directory $CI_PROJECT_DIR"
```

If your container is not guaranteed to have `git` installed, you could use the following instead

```toml
[[runners]]
  pre_clone_script = "command -v git &> /dev/null && git config --global --add safe.directory ${CI_PROJECT_DIR}"
```

### Windows Runner

Note that on Windows, I was unable to get this working other than completely disabling safe directory checking

```toml
[[runners]]
  pre_clone_script = "git config --global --add safe.directory '*'"

  # the below doesn't work. Hunch says its a hashed path of some sort, and the case and slashes don't match
  # $env:CI_PROJECT_DIR --> c:\builds\python\python_windows_ci
  # Error --> fatal: detected dubious ownership in repository at 'C:/builds/python/python_windows_ci'

  # pre_clone_script = "git config --global --add safe.directory $env:CI_PROJECT_DIR"

```
