# Docker

## Installation

Consult the [official documentation](https://docs.docker.com/engine/install/) for installing `docker` to your system.

Once installed, confirm the service is running and enable it so that it starts on boot.

```bash
sudo systemctl start docker.service
sudo systemctl start containerd.service
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

> **NOTE:** If you're running RHEL, the CentOS packages tend to work but may cause issues during future `dnf update`'s. I've found that the leftover package `containers-common` conflicts with some of the packages installed by Docker, specifically the `runc` package has mismatched dependencies. Running a `dnf update --allowerasing --nobest`, followed by `dnf erase containers-common` has set me up for cleaner upgrades in the future.

## Storage Location

If you'd like to move the default storage location for docker's containers and images, we can do so it its configuration. First, ensure the docker daemon is stopped. If you already have a working installation, move all data from `/var/lib/docker` to its new location. Edit or create the file `/etc/docker/daemon.json` and configure the following

```json
{
  "data-root": "/path/to/new/location"
}
```

Now we can restart docker with `systemctl.`

## Docker Compose

For new installers, docker compose is now included by running `docker compose` (note the lack of "-"). If you need to install it separately, go to `docker-compose` [releases page](https://github.com/docker/compose/releases).

Find the release you want, `wget`, `chmod +x`, rename to `docker-compose`, and copy to `/usr/bin`. For example,

```
wget https://github.com/docker/compose/releases/download/v2.9.0/docker-compose-linux-x86_64
chmod +x docker-compose-linux-x86_64
mv docker-compose-linux-x86_64 docker-compose
sudo cp docker-compose /usr/bin
```

P.S. [awesome-compose](https://github.com/docker/awesome-compose) is a great starting point for some common scenarios.

## Restart Policies

If you need to run a container detached, you likely want to define a restart policy in case of failure or host reboot. This can be done via the `--restart` argument when starting or updating a container. Policies include `always`, `on-failure`, `unless-stopped`, and `no` (the default). See [official docs](https://docs.docker.com/config/containers/start-containers-automatically/) for more details.

To update an existing running container with a new policy,

```bash
sudo docker update --restart <policy> <container_id>
```

To start a new container with a policy,

```bash
sudo docker run <args> --restart <policy> <image_id>
```

If you're using `docker compose`, you can specify the restart policy in `docker-compose.yml`. See below for an example,

```yaml
services:
  web: 
    build:
      context: app
      target: builder
    ports: 
      - '8000:8000'
    restart: always
```

## Docker Inspect

Sometimes, it is useful to learn more about a running container after you have started it. There is lots of information available via the `docker inspect` command. Specifically, I often want to know which restart policy (see above) I started a container with a long time ago. This specific example is shown below.

```bash
sudo docker inspect <container_id>

# example output, truncated
"HostConfig": {
    ...
    "RestartPolicy": {
        "Name": "always",
        "MaximumRetryCount": 0
    }
    ...
}
```

Another really helpful property of the inspect output is which compose file started the container, if applicable.

```bash
sudo docker container inspect <container_id> | grep compose

# Example output, truncated
"com.docker.compose.project": "<project name>",
"com.docker.compose.project.config_files": "/path/to/docker-compose.yml",
"com.docker.compose.project.working_dir": "/path/to",
"com.docker.compose.service": "<service name>",
```

## Shell Options

By default, the `RUN` commands inside the `Dockerfile` are executed by `/bin/sh`. Sometimes, they expect that you're in a `bash` shell, or you may have items inside your `~/.bashrc` that need to be read before executing the command. In leiu of sourcing and calling `bash` explicity, you can add the following to your `Dockerfile` that will do this for you.

```Dockerfile
# NOTE: omit --login if you don't want .bashrc sourced
SHELL ["/bin/bash", "--login", "-c"]
```

## Windows "Fun"

I have gotten a strange error on my Docker build like the following, after months of a working install:

```console
hcsshim::PrepareLayer - failed failed in Win32: Incorrect function. (0x1)
```

The only solution I found that worked was from [stackoverflow](https://stackoverflow.com/questions/58986352/docker-build-fails-always-with-error-hcsshimpreparelayer-failed-failed-in-wi), saying that renaming a driver resolved issue.

I renamed `C:\Windows\System32\drivers\cbfs6.sys` to `C:\Windows\System32\drivers\cbfs6_bad_for_docker.sys` and rebooted. The reboot took an extraordinary amount of time, but eventually it came back up and my docker build then worked.

If I run into this again, try just restarting the docker service instead of a full reboot. I was worried my machine wasn't gonna come back up there for a while.
