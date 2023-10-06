# SSH MFA for Linux Server

You may think that your publicly accessible SSH server is safe from attacks because "I'm not a target" or, "Why would anyone want to access my server?". You are wrong.

If you don't believe me, run the following command on your server and watch live the attempted authentications. The source IPs are often from overseas, from countries like China, Germany, and Russia.

```bash
watch -n 1 tail /var/log/auth.log
```

For example, my output was

```text
Every 1.0s: tail /var/log/auth.log                                                   sshtunnel: Mon Jun  5 16:31:57 2023
Jun  5 16:31:38 sshtunnel sshd[7369]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser=
rhost=201.186.40.250  user=root
Jun  5 16:31:40 sshtunnel sshd[7369]: Failed password for root from 201.186.40.250 port 56312 ssh2
Jun  5 16:31:40 sshtunnel sshd[7369]: Received disconnect from 201.186.40.250 port 56312:11: Bye Bye [preauth]
Jun  5 16:31:40 sshtunnel sshd[7369]: Disconnected from authenticating user root 201.186.40.250 port 56312 [preauth]
Jun  5 16:31:49 sshtunnel sshd[7404]: Invalid user oracle from 164.90.189.102 port 35194
Jun  5 16:31:49 sshtunnel sshd[7404]: pam_unix(sshd:auth): check pass; user unknown
Jun  5 16:31:49 sshtunnel sshd[7404]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser=
rhost=164.90.189.102
Jun  5 16:31:50 sshtunnel sshd[7404]: Failed password for invalid user oracle from 164.90.189.102 port 35194 ssh2
Jun  5 16:31:51 sshtunnel sshd[7404]: Received disconnect from 164.90.189.102 port 35194:11: Bye Bye [preauth]
Jun  5 16:31:51 sshtunnel sshd[7404]: Disconnected from invalid user oracle 164.90.189.102 port 35194 [preauth]
```

and attempted logins kept coming every couple seconds. That's a lot of malicious traffic!

## Options

There are a couple different strategies you can take to protect yourself from this. [Fail2Ban](https://www.linode.com/docs/guides/how-to-use-fail2ban-for-ssh-brute-force-protection/) is one of most popular mitigation strategies for brute force attacks. Another option is to disable password authentication over `ssh` altogether and rely solely on keys. The option I've selected for now is to set up MFA, so that even in the case where your password is compromised in a brute force attack, access will be denied because the attacker will not have your OTP.

## Google Authenticator

To set up MFA on my SSH server, I've used `libpam-google-authenticator` in the past. Note that you are not required to use Google's own OTP app, and can use an alternative like Authy if you'd like.

To install on Ubuntu, simply run

```bash
apt update
apt install libpam-google-authenticator
```

Then run the initialization guide

```bash
google-authenticator
```

> **WARNING**: This needs to be done on a user by user basis! At the very least, this should be done for the root user if you allow password authentication for it over `ssh`

Configure `sshd` auth settings at `/etc/pam.d/sshd`

```conf
# /etc/pam.d/sshd
...
# add to end of file
auth required pam_google_authenticator.so nullok
```

Configure `sshd` config `/etc/ssh/sshd_config`

```conf
# /etc/ssh/sshd_config
...
# Change to yes to enable challenge-response passwords (beware issues with
# some PAM modules and threads)
ChallengeResponseAuthentication yes
...
```

The above method will require MFA for password logins, but not for ssh key logins. Optionally, we can require an SSH key and the use of MFA. For this and more detailed configuration, see the following article these steps were inspired from

<https://www.digitalocean.com/community/tutorials/how-to-set-up-multi-factor-authentication-for-ssh-on-ubuntu-16-04>
