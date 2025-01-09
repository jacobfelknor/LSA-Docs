# Machines with NVIDIA Cards

Sometimes NVIDIA cards can make installing Linux a challenge. There are many side effects and potential solutions to the problems you may see.

## Black Screen - Refuses to Boot

Sometimes adding the following kernel option to the GRUB menu may help

```text
linux ... ... ... nouveau.modeset=0
```

Remember, these options should be added to the end of the line which starts with "linux".
