# Auto-Login as User

Sometimes you'd like for a specific user to be automatically logged in upon boot so that in an unattended reboot, things come back up with no user input. This may be the case if you're running some service inside a Windows machine that must be available after a non-interactive reboot (such as a power outage).

These docs sourced from [microsoft documentation](https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/turn-on-automatic-logon#use-registry-editor-to-turn-on-automatic-logon)

## Automatically Log In via Registry Setting

They way I have accomplished this is through the Windows Registry.

1. Windows key + R, to open Run
2. type `regedit.exe` and hit `Enter`
3. Locate the `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon` subkey in the registry
4. On the `Edit` menu, click `New`, and then point to `String Value`
5. Type `AutoAdminLogon`, and then press `Enter`
6. Double-click `AutoAdminLogon`, and change the `Value data` to `1`
7. Double-click the `DefaultUserName` entry, type your user name, and then click OK
8. Double-click the `DefaultPassword` entry, type your password, and then click OK
    - If the `DefaultPassword` value does not exist, it must be added. To add the value, follow these steps:
    - On the `Edit` menu, click `New`, and then point to `String Value`
    - Type `DefaultPassword`, and then press `Enter`
    - Double-click `DefaultPassword`
    - In the `Edit String` dialog, type your password and then click OK
9. If you have joined the computer to a domain, you should add the `DefaultDomainName` value, and the data for the value should be set as the fully qualified domain name (FQDN) of the domain, for example `example.com.`
10. Exit Registry Editor
11. Restart your computer. You can now log on automatically
