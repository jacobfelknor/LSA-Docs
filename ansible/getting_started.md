# Getting Started with Ansible

This is a getting started guide for working with Ansible. It was created while reading their [official getting started guide](https://docs.ansible.com/ansible/latest/getting_started/index.html).

## Installation

We install `ansible` through our Python installation. Ensure the version of python you want for ansible is the one you use to install.

```bash
python -m pip install --user ansible
```

We can enable shell completion for Ansible by installing an optional dependency

```bash
python -m pip install --user argcomplete
# activate
activate-global-python-argcomplete --user
```

## Hosts File

The hosts file lives at `/etc/ansible/hosts`. This is where you define which hosts your control machine will administer, and which groups they belong in. For example, it may look something like

```ini
[webservers]
alpha.example.org
beta.example.org
192.168.1.100
192.168.1.110

[dbservers]
db1.example.org
192.168.1.111
```

We can list all configured hosts with

```terminal
$ ansible all --list-hosts
hosts (6):
    alpha.example.org
    beta.example.org
    192.168.1.100
    192.168.1.110
    db1.example.org
    192.168.1.111
```

If you only wanted to list a certain group of hosts, we can do that as well.

```terminal
ansible webservers --list-hosts
hosts (4):
    alpha.example.org
    beta.example.org
    192.168.1.100
    192.168.1.110
```

## SSH Connection

Your control machine must have `ssh` access to the specified hosts via an `ssh` key pair. Generating these is outside the scope of this document. Once you have your pair set, Ansible can begin using the keys to comminute over `ssh` between your control machine and hosts.

If the key you wish to use is not the default key, you may specifiy which private key to use to ansible by using the `--private-key` setting.

## Sanity Check - Pinging Hosts

Before doing anything further, we should check to make sure all our hosts are pingable and that `ansible` can successfully connect via `ssh`. Check your setup for a particular group of hosts like this

```bash
ansible webservers -m ping --private-key ~/.ssh/webserver_privkey -u username
```

## Inventories

Instead of specifying many options repeatedly to `ansible`, we can define an "inventory" and define those options in `YAML` or `INI` for reuse. Inventory files are essentially the same as the hosts file discussed previously. In typical use, you are likely to use custom inventory files, that probably have been captured in version control, to manage your infrastructure over the built in hosts file at `/etc/ansible/hosts`.

Let's try accomplishing the same thing as we've already done above, except this time using an inventory, minimizing the required parameters we pass to `ansible`. Our inventory file `inventory.yml` will look like this

```yml
webservers:
  vars:
    ansible_ssh_private_key_file: ~/.ssh/webserver_privkey
    ansible_ssh_user: username
  hosts:
    web1:
      ansible_host: alpha.example.org
    web2:
      ansible_host: beta.example.org
    web3:
      ansible_host: 192.168.1.100
    web4:
      ansible_host: 192.168.1.110
```

Verify we can list our inventory with

```bash
ansible-inventory -i inventory.yml --list
```

Now, let's ping our hosts inside our inventory, like before, but this time omitting the `--private-key` and `-u` options since we defined them in inventory.

```bash
ansible webservers -m ping -i inventory.yml
```

## Playbooks

Further developing our example, we will now create a playbook to ping and print a "Hello World" message using our newly defined inventory. Create the following `playbook.yml`

```yml
- name: My first play
  hosts: webservers
  tasks:
   - name: Ping my hosts
     ansible.builtin.ping:
   - name: Print message
     ansible.builtin.debug:
       msg: Hello World
```

Run our playbook

```bash
ansible-playbook -i inventory.yml playbook.yml
```

You should see output from this playbook indicating we've successfully pinged all our hosts and also have received a "Hello World" message from each.
