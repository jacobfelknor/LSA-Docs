# Enable BitLocker Encryption on Windows 10 Guest

These instructions assume a Windows 10 Guest installed with legacy BIOS boot. This is the default setup you get if you do not explicitly enable UEFI boot during VM setup.

## Convert KVM Windows Machine to UEFI

To enable BitLocker, we must first enable secure booting via UEFI.

1. Make a backup
2. Convert from MBR to GPT
    - Based on [this forum post](https://answers.microsoft.com/en-us/windows/forum/all/convert-an-existing-windows-10-installation-from/aa8c2de3-460b-4a8c-b30b-641405f800d7)
    - Boot to a recovery environment. The easiest way of doing this is by using an installation media and selecting "repair your computer"
    - Select "Troubleshoot", then "Command Prompt"
    - Validate MBR2GPT can convert your disk with `mbr2gpt.exe /validate`
    - If validation is successful, convert the disk with `mbr2gpt.exe /convert`
    - Exit command prompt and shutdown the guest
3. in Overview XML,

    ```xml
    <os>
        <!-- ...... -->
        <loader readonly="yes" secure="yes" type="pflash">/usr/share/edk2/ovmf/OVMF_CODE.secboot.fd</loader>
        <nvram>/var/lib/libvirt/qemu/nvram/win10_VARS.fd</nvram>
        <!-- ...... -->
    </os>
    <features>
        <!-- ...... -->
        <smm state="on"/>
        <!-- ...... -->
    </features>
    ```

4. Start VM and ensure it boots correctly

## Enable BitLocker

Now that we have UEFI secure booting enabled, we can start using BitLocker. To ensure the setup above was successful, attempt to turn on BitLocker in the Control Panel. If you get an error saying that the startup options are not correct for the computer, you did not successfully convert to UEFI. If you don't get any errors, you should be able to proceed with BitLocker setup from there normally.

You can check the status of encryption with `manage-bde -status`
