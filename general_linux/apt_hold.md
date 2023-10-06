# APT Hold Package

Sometimes it can be helpful to omit a certain package from typical system updates. This can be done for flagship applications that should be intentionally updated, and should be excluded from typical frequent OS security updates.

## Place on Hold

To place a certain package on hold, use `apt-mark`.

```bash
sudo apt-mark hold pkg
# check that the package was successfully held
sudo apt-mark showhold | grep pkg
```

## Install in Spite of Hold

If you'd like to upgrade the package in spite of the hold, just specify the package directly.

```bash
sudo apt install pkg
```

## Remove Hold

Removing the hold is easy enough.

```bash
sudo apt-mark unhold pkg
```
