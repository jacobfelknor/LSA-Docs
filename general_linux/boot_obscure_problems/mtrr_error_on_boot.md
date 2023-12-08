# Funny MTRR Error on Boot

One time, when trying to boot into an Ubuntu live CD for installation, I ran into a funny kernel error. It looked something like

```text
pmd_set_huge: Cannot satisfy [mem 0xf8000000-0xf8200000] with a huge-page mapping due to MTRR override.
```

> **NOTE:** At first, it was just hanging at the splash screen with no output on why. To show the logs on boot, remove the `quiet` and `splash` parameters from the GRUB edit menu, reached by pressing `e` when presented with the GRUB menu

For some more context on what MTRR is, see [this stackexchange post](https://unix.stackexchange.com/a/578515) or [MTRR's wikipedia entry](https://en.wikipedia.org/wiki/Memory_type_range_register).

## Solution

The solution for me in this specific case was to add `enable_mtrr_cleanup=1` in the GRUB edit screen for the boot entry, right where `quiet` and `splash` *used* to be. After doing so, the Ubuntu live CD was able to boot. It is unclear to me exactly how we ended up in this state, but the "cleanup" preformed seemed to do the trick.
