# Remote Unlocking of Encrypted Server

When you encrypt partitions on a Linux machine, you add security by requiring a passphrase to decrypt the contents in order to boot. However, in a server environment, this can be a roadblock if ever you need to reboot remotely. By default, you would need physical console access in order to type in your decryption passphrase to finish the booting process. Therefore, a remote reboot poses a significant problem when physical console access is not available.

One strategy of solving this problem is to configure an `ssh` daemon and networking to run in `initramfs`, which is a filesystem embedded into the kernel and loaded early in the boot process. Then, after a reboot, we can `ssh` into this environment to provide the encryption passphrase.

> **WARNING:** This guide assumes that your `/boot` partition or disk remains unencrypted.

## Ubuntu

So far, I have not needed to do this with an Ubuntu server, but this article should provide a good starting point when the need comes

- <https://www.cyberciti.biz/security/how-to-unlock-luks-using-dropbear-ssh-keys-remotely-in-linux/>

## RHEL

These steps inspired by and adapted from <https://forums.centos.org/viewtopic.php?t=72465>

1. First, we need to install `dracut-sshd` on server.

    ```bash
    # enable the appropriate repository
    sudo dnf copr enable gsauthof/dracut-sshd
    # install package
    sudo dnf install dracut-sshd
    ```

2. Next, copy an ssh public key from your client machine to your server. Generate a new key if needed. You will not be able to provide a password when connecting to the `initramfs`, so this step is required.

    ```bash
    # create key if needed
    ssk-keygen
    # copy key to server. Make sure to copy to root user!
    ssh-copy-id -i /path/to/key.pub root@example
    ```

3. Regenerate `initramfs` on server to include our ssh key and ssh daemon configured above.

    ```bash
    sudo dracut -f -v 
    ```

4. Add early networking capabilities to our GRUB configuration on server at `/etc/default/grub`. Note that the IP address, netmask, and interface name should match what is outputted by `ip a`, which should be a static IP configured at least at the router DHCP reserved address level. You can obtain the default gateway with `ip r`.

    ```ini
    ...
    # append to the existing options for this setting
    # NOTE: the "off" at the end is our DHCP setting. The server needs a static IP address
    GRUB_CMDLINE_LINUX="... rd.neednet=1 ip=<static_ip>::<default_gateway>:<netmask>:<hostname>:<interface>:off"
    ...
    ```

5. Regenerate GRUB configuration on server

    ```bash
    grub2-mkconfig --output /etc/grub2.cfg
    ```

6. Reboot server. After a moment, you should be able to `ssh` into server as `root` user using the ssh key corresponding to the one we copied to server.

    > **NOTE:** If you're viewing the console, it won't look any different than before and will still be prompting you for the decryption password. This is expected

7. Once you successfully `ssh` in, we can use the following to input our decryption passphrase:

    ```bash
    # list pending prompts
    systemd-tty-ask-password-agent --list
    # input passwords
    systemd-tty-ask-password-agent
    ```

    After inputting passphrase for each encrypted disk, the `ssh` session will disconnect and the boot process will continue on the server. If the session does not exit automatically, it is likely that you did not input the passphrase correctly. Re-run the command to try again. After boot completes, you'll be able to access the server again normally.

### Other Considerations

**Question:** I need to encrypt not only root drive, but attached drives as well. Can these be automatically decrypted? What about services that rely on these attached encrypted drives (like MinIO). Can we still configure these services to start on boot?
  
**Answer:** Yes. See [Use Keyfile to Unlock on Boot](luks_decrypt_on_boot_keyfile.md) for this. Note that the keyfile should exist on an encrypted partition.
