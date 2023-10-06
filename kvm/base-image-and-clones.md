# Base Image and Cloning

## Creating a Base Image

1. Choose and install an operating system. Use RHEL or Ubuntu if you can
    - create a local administrator user during installation. This user will be removed once the machine is joined to the domain and `sssd` is set up
2. Install all packages and services required for its use case
    - configure these to whatever default settings the machine should have
    - you probably want to enable EPEL packages if using Fedora based, i.e RHEL

    ```bash
    sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm -y
    ```

3. Remove the base image machine's `machine-id` when finished. This ensures the cloned copy will act as a separate machine.

    ```bash
    sudo rm -f /etc/machine-id
    ```

## Creating a Clone

1. Change the hostname of the cloned machine

    ```bash
    sudo hostnamectl set-hostname foo.example.local
    ```

2. Verify hostname information via the output of `hostnamectl`
3. Generate a new `machine-id`

    ```bash
    sudo systemd-machine-id-setup
    ```

4. Ensure that the machine now has a unique `machine-id`.
5. Ensure that the machine has a different MAC address (should be automatic)
