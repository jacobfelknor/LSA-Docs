# Windows Target Setup

Sometimes it is necessary to manage the configuration of a Windows machine through Ansible. We must set up Windows targets a little differently than we're used to for linux just using SSH. For more detailed instructions and more options, see [ansible docs for windows setup](https://docs.ansible.com/ansible/latest/os_guide/windows_setup.html)

Note: c

## Enable Windows Remote Mangement (winrm)

The easiest way to set this up is to run

```powershell
winrm quickconfig
```

After config is done, run the following to allow unencrypted connections, if necessary. This can fix some `Bad HTTP response returned from server. Code 500` errors if you're getting them.

```powershell
Set-Item -Path WSMan:\localhost\Service\AllowUnencrypted -Value true
```

If you get an error on this command about an interface being public, try disabling any network interfaces created by WSL or Hyper-V in the control panel. Then, run the command again. If it worked this time, you may re-enable these interfaces.

## Control Machine Dependencies

We must install a few additional dependencies on our control machine.

```bash
# Through DNF (RHEL/Centos/Fedora for the newer version)
# NOTE! you may need to specify the version of python3-devel, like python3.11-devel
dnf install gcc python3-devel krb5-devel krb5-libs krb5-workstation

# Through Apt (Ubuntu)
sudo apt install python3-dev libkrb5-dev krb5-user
```

## Python Dependencies

Ensure you're using the version of `python` and `pip` specified by the output of `ansible --version`. For example, in this case, it is at `/usr/bin/python3.11`

```text
ansible [core 2.14.2]
  config file = /etc/ansible/ansible.cfg
  configured module search path = ['/root/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3.11/site-packages/ansible
  ansible collection location = /root/.ansible/collections:/usr/share/ansible/collections
  executable location = /usr/bin/ansible
  python version = 3.11.2 (main, Feb 17 2023, 09:28:16) [GCC 8.5.0 20210514 (Red Hat 8.5.0-18)] (/usr/bin/python3.11)
  jinja version = 3.1.2
  libyaml = True
```

Install Python dependencies:

```bash
/path/to/python -m pip install pywinrm pykerberos requests-kerberos kerberos
```

Install Ansible dependencies:

```bash
ansible-galaxy collection install ansible.windows
```

## Setup Inventory

In my case, I use `kerberos` authentication because my target was joined to a domain. See [ansible documentaion](https://docs.ansible.com/ansible/latest/os_guide/windows_winrm.html#kerberos) for more details.

```yml
windowshosts:
  vars:
    ansible_user: user
    ansible_password: password
    ansible_connection: winrm
    ansible_port: 5985
    ansible_winrm_transport: kerberos
  hosts:
    windows-host:
      ansible_host: windows-host.example.local
```
