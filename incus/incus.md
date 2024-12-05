# Incus

Incus looks like a pretty cool option for container/VM hosting, similar to use cases of Proxmox but simplified and stripped down a bit.

Leaving this note here for further exploration

<https://linuxcontainers.org/incus/docs/main/>

It can run VMs, LXC, and even Docker (or other OCI compatible) images.

As far as application development (as opposed to hosting existing images), Docker still feels like the right choice because of how easy its build tools are in comparison and docker compose. I did find [incus-compose](https://github.com/bketelsen/incus-compose), which is under community development and looks promising given some time.

[distrobuilder](https://github.com/lxc/distrobuilder) looks like the `Dockerfile` equivalent

The [projects](https://linuxcontainers.org/incus/docs/main/projects/) feature looks close to what I'd want for compose-style things, but it doesn't look like you can create a project-as-code file to just bring up... at least everything in the docs happens one by one through the CLI still
