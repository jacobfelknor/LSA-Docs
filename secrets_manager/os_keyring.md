# OS Keyring

We often have to manage secret values - such as username and password - in our code for certain applications or network resources. There are many ways of handling this problem, from storing the credentials in plain text either in the code or a file, using environment variables, all the way to using a sophisticated secrets manager provided by a 3rd party.

A simple but secure alternative is to use the native OS keyring provided in Windows, Linux, and MacOS. We can delegate the handling of these sensitive values to the OS and simply query and set them with our code.

> **WARNING**: Unlocking the OS keyring allows any user process on your system to query and retrieve passwords in plaintext. It should only be used in trusted environments, and remember to lock your computer when you are not using it.

## Python Example

In Python, there is a very simple package aptly named `keyring` that will help us accomplish this. It's [GitHub](https://github.com/jaraco/keyring) page provides more details, but I've summarized simple usage here.

```bash
# installation
pip install keyring
```

```python
import keyring
# setting and getting
keyring.set_password("name_of_service", "username", "password")
keyring.get_password("name_of_service", "username") # NOTE: returns None if no password set

# can also remove password from keyring
keyring.delete_password("name_of_service", "username")
```

## Windows


On Windows, this should just simply work as expected. Your keyring is automatically unlocked on login and you're able to use the above with no further setup.

## Linux

On Linux, I've noticed a few hiccups using this method that must be addressed.

### SSH Session

The keyring is not available by default when in a remote session via SSH. However, the following series of commands has worked for me.

```bash
dbus-run-session -- bash
# NOTE: the following command will wait for stdin. Type your password, then Ctrl-D to signal end of data
# WARNING: Do not echo your password in to this command with pipes, as it will be written to disk plaintext in your bash history 
gnome-keyring-daemon --unlock
# the keyring should now be available.
```

### XRDP Session

Keyring is not automatically unlocked on login, even when your user & keyring password match. When first attempt is made to access keyring, you must unlock with its password. The GUI will prompt you.

> TIP: Search for "Passwords and Keys" (or download the `seahorse` application if not present) to manage your keyring via a GUI. You can view/edit/delete entries, change you password, and otherwise manage the keyring from this app.

### Console GNOME Session

This works seamlessly as expected. Keyring gets unlocked on login and no further action is required.

### Update Keyring Password

We can update the keyring password by opening `Password and Keys`, right clicking on the `Login` keyring under `Passwords`, and entering the existing/new password.

### Auto-Update Keyring Password

By default, your keyring password doesn't get updated alongside your login password. If you'd like to automatically keep these in sync, add the following line to your PAM configuration:

```ini
# /etc/pam.d/passwd
...
password    optional    pam_gnome_keyring.so
```
