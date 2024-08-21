# Image Builds and Python Dependencies

These notes are here to express my thoughts on how to approach shipping docker images with or without the python dependencies of your application pre-installed. It was inspired by the fact that I wasn't doing this in my projects, but found that others were, and so wanted to write down what I thought were advantages or disadvantages of either method.

## First, What NOT To Do

Before I move on to the two options I have used, its best to get what *not* to do out of the way first. A bad approach here would be to ship your image without python dependencies while additionally not specifying a volume for the python environment created when the container starts. In this scenario, since we don't save our environment off as a volume, it gets erased as soon as our container is stopped. Therefore, container startup time is significantly penalized because it must first resolve and install all dependencies over and over again on each start.

If you don't want to ship your environment within your container, **use a volume** (next section).

## No Environment, Use Volume

This is the approach I naturally chose the first time I was writing a Django web application shipped with Docker. It was most familiar to me moving the project from bare-metal to containerized. In my bare-metal scenario, the following general steps were required to run my application:

1. Find a suitable linux host machine
2. Ensure all my host dependencies were installed
    - Python, a webserver, a database, etc
    - Installation guidance was documented in the README of the project
3. Create a virtual environment and install python dependencies
4. Start all services

The easiest concept to understand while first planning the shift to Docker (and learning Docker along the way) was to replace steps 1 and 2 only. In was my intention, then, to change the previous steps to the following:

1. Find a suitable linux host machine that could run Docker
2. Docker pull/build etc. All dependencies defined by `Dockerfile` + `docker-compose.yml`
3. Create a virtual environment and install python dependencies
    - This was done by specifying a volume mount point inside my `docker-compose.yml` to store the .venv in some external directory
4. Start all services

For that particular project, I continue to use this strategy today.

### Advantages

1. Docker images stay smaller
    - since we don't ship the python dependencies, our images stay smaller than including them.
    - results in faster builds, lower storage usage in our registry, and faster pull times on the other end

2. Typical start up times are not significantly penalized
    - since the environment is stored externally in the mount, we don't need to reinstall on start and can share this environment across containers

### Disadvantages

1. Environment is not "frozen in time"
    - because this environment is not in the image, I must rely on external package registries to start my application
    - if, one day, one of my dependencies is pulled from the package registry I depend on, there will be no way for me to recreate that exact environment in future containers

2. Initial and Update scenarios incur large startup penalty
    - any time the environment is going to change (or initialized in the beginning), I incur large start up penalties because the container must first sync its environment before proceeding.

## Ship Environment

This is what I have now noticed most other projects use as their strategy for shipping a Python project. I can definitely see why this may be the preferred method. It especially starts to make sense if you treat you image as the platform+environment, not just the platform. It is a bit of a strange concept (but not *wrong*, per say) to use a python virtual environment with a container. A virtual environment is meant to isolate one project from another, but that is also the purpose of a container. Isolating a virtual environment within an already isolated container is potentially not necessary (but every project is different, and maybe this suits your use case, like if you have multiple python projects within the same container for your justified reason).

The advantages and disadvantages of this method generally mirror the previous scenario:

### Advantages

1. Environment is "frozen in time"
    - if you're able to build your image once, you can be sure you can at any time in the future provide an environment for your application that is exactly the same as it was during build.
    - this is true even if dependencies were pulled from registries for whatever reason - a copy still exists in your image

2. All startup times are fast
    - we essentially move the burden of installing dependencies to the build step, so there is nothing to do here on start
    - this is true for both ordinary start/stops, initial runs, upgrades, etc.

### Disadvantages

1. Image sizes will be larger
    - a side effect of putting the environment inside the image is that this will consume storage and increase the size of the image
    - slower builds, slower pulls
    - you can get creative here with multistage builds, using a builder image to build/compile dependencies and then simple copy the artifacts to the prod image, but this still consumes space

## Conclusion

After looking at these options, and considering these days storage is cheap, I think I'll prefer shipping my environment in the image for future projects. Eventually I may migrate my existing project to use this strategy, but it is not necessarily a priority without further motivation.
