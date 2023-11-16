# Prevent MacOS Sleep On Lid Close

If you're repurposing an old Macbook for some server usage, you probably want to disable automatic screen locking and sleep options. This can typically be done in System Preferences under the Battery/Power settings. Howver, this does not control whether the display is locked/turned off when closing the laptop lid. In order to prevent this, we can run the following command:

```bash
sudo pmset -a disablesleep 1
```

After running, test to make sure closing the lid does not do anything. I would recommend testing this while in a remote VNC session as well, to ensure you can connect/disconnect freely with the lid closed and your sessions are not interrupted.
