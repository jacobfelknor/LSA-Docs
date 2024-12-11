# Python Script with Sudo Prompt

Inspired by <https://stackoverflow.com/questions/47881339/how-to-make-python-script-to-give-sudo-prompt-my-password>

Sometimes it can be helpful to call commands with `sudo` from a Python script. If the user running the script doesn't have permission to use `sudo` without a password, we must handle getting the password to the process in a secure fashion.

The following can be used to achieve this

```python
import pexpect
import getpass

sudo_passwd = getpass.getpass(prompt="sudo password: ")

# spawn the process, 
process = pexpect.spawn('sudo /usr/bin/whoami', timeout=20)

# if you want to spawn multiple sudo commands at once...
# OR could reuse the password obtained for multiple spawn() calls
# more_than_one_process = pexpect.spawn("bash -c 'sudo cmd2 && sudo cmd2'")

# it will prompt something like: "[sudo] password for username:"
# you "expect" to receive a string containing keyword "password"
process.expect('password')

# if it's found, send the password
process.sendline(sudo_passwd)

# read the output
try:
    output_lines = process.readlines()
    # do whatever you want with output... 
    whoami_bytes: bytes = output_lines[-1]
    whoami: str = whoami_bytes.decode().strip()
    print(f"You are {whoami}")
except pexpect.exceptions.TIMEOUT:
    print("Command timed out. sudo authentication may have failed")

```

## Future Work to Improve

- [ ] better error handling. relying on a timeout to detect an invalid password
- [ ] potentially better options for capturing output. Can we capture the output live?
