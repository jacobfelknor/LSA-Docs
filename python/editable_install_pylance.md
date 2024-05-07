# Pylance Resolve Editable Install

I noticed when developing a companion python package for a project that editable installs of the companion package sometimes could not be resolved by Pylance, VSCode's python language server.

However, according to [this StackOverflow answer](https://stackoverflow.com/a/76897706), we're able to fix this by using the "strict" editable mode setting:

```bash
pip install -e /path/to/package --config-settings editable_mode=strict
```

After installing with this method, Pylance was once again able to resolve imports for the editable package.
