# Base64 via Command Line

There is a simple utility in Linux to encode and decode `base64` strings. For a more detailed walkthrough, see [this interesting RedHat article](https://www.redhat.com/sysadmin/base64-encoding). Specifically, I found the use case of encoding a multiline file as a `base64` encoded string interesting. I can use that in cases where I need to pass multiline information (like the contents of a config file) to something that doesn't typically accept multiline content (like environment variables).

## Enocde

Encode a string as follows:

```bash
echo "this is my string to encode!" | base64
# should print 'dGhpcyBpcyBteSBzdHJpbmcgdG8gZW5jb2RlIQo='

# OR without the newline automatically added by echo
echo -n "this is my string to encode!" | base64
```

## Decode

Decode a string as follows:

```bash
echo "dGhpcyBpcyBteSBzdHJpbmcgdG8gZW5jb2RlIQo=" | base64 --decode

# if your encoded string doesn't contain a newline, but you would like to print on anyways, just add an extra 'echo'
echo "dGhpcyBpcyBteSBzdHJpbmcgdG8gZW5jb2RlIQo=" | base64 --decode && echo
```
