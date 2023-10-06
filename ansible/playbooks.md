# Ansible Playbooks

These docs provide some simple, but common, real-world playbook scenarios.

## Note on Ordering

Plays are executed in order, from top to bottom, of your playbook `YAML` file. Similarly, tasks within a play execute in order.

## Linting

We can lint ansible playbooks with the `ansible-lint` command. It requires an extra install. For example,

```bash
# install 
python -m pip install ansible-lint
ansible-lint playbook.yml
```

## Arbitrary Shell Commands

Use this when you want to execute arbitrary shell commands on your targets. You can pass in a bash script as a file, or provide the commands to execute directly in the playbook `YAML`.

> **NOTE:** See also [ansible.builtin.command](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/command_module.html#ansible-collections-ansible-builtin-command-module) which, instead of executing a command through the shell, executes the command directly.

For more details, see Ansible's [official examples](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/shell_module.html#examples)

Provide script file:

```yml
- name: Execute the command in remote shell; stdout goes to the specified file on the remote; Change the working directory to somedir/ before executing the command
  ansible.builtin.shell: somescript.sh >> somelog.txt
  args:
    chdir: somedir/
    # if necessary, specify the shell you need
    executable: /bin/bash
    # set the stdin of the command directly to this value
    stdin:
    # should std include a newline? (Default true)
    stdin_add_newline: true
```

Directly in playbook:

```yml
- name: This command will change the working directory to somedir/, then list some files and run whoami
  ansible.builtin.shell:
    cmd: |
        ls -la
        whoami
        pwd
    chdir: somedir/
  # only required if you want to see the debug output as defined below
  register: mycmd
# If you'd like to see the output of the commands, you can use the `andsible.builtin.debug` module for this
- name: Print output
  ansible.builtin.debug:
    msg: "{{ mycmd.stdout_lines }}"
```

### Changed and Failed When

When using the shell module, there is no default way of checking if the playbook has changed or failed. We can add these behaviors by adding the `changed_when` and `failed_when` keywords to our `YAML`. See [offical docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_error_handling.html) for more information, but here is an example containing both

```yml
- name: Restart deployment
  hosts: myservers
  tasks:
    - name: Execute server restart
      ansible.builtin.shell:
        cmd: |
          /path/to/restart/cmd
      register: restartcmd
      changed_when: restartcmd.rc == 0
      failed_when: "'Restarted successfully' not in restartcmd.stdout"
    - name: Print output of restart status
```

## Single Package Update

In a case where you want to ensure a specific package is updated to the latest version on a set of particular hosts, we can use the Ansible built-in `yum` module to do this. For example,

```yml
- name: Update web servers
  hosts: webservers
  remote_user: root

  tasks:
  - name: Ensure apache is at the latest version
    ansible.builtin.yum:
      name: httpd
      state: latest
  - name: Write the apache config file
    ansible.builtin.template:
      src: /srv/httpd.j2
      dest: /etc/httpd.conf
```
