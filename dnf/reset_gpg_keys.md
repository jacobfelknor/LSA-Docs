# Reset or Remove GPG Key for Repo

Sometimes the GPG key for a repository you use changes. When this happens, you'll start to get annoying errors which can look something like

```text
Error: Failed to download metadata for repo 'xxxxxxxxxxxxxxx': repomd.xml GPG signature verification error: Bad GPG signature
```

This will prevent you from upgrading system packages until it is resolved, either by disabling the GPG check for the repo (not recommended, of course) or removing the old key and adding the correct one.

## Locate the Bad Key

To list all GPG keys for yum repos, run

```bash
rpm -q gpg-pubkey --qf '%{NAME}-%{VERSION}-%{RELEASE}\t%{SUMMARY}\n'
```

Output will look something like

```text
gpg-pubkey-d88e42b4-52371eca    gpg(Elasticsearch (Elasticsearch Signing Key) <dev_ops@elasticsearch.org>)
gpg-pubkey-104b5281-63d1fa97    gpg(gsauthof_dracut-sshd (None) <gsauthof#dracut-sshd@copr.fedorahosted.org>)
gpg-pubkey-64c3c388-62164eba    gpg(MongoDB 6.0 Release Signing Key <packaging@mongodb.com>)
gpg-pubkey-9310d3fc-609af0ea    gpg(OpenSearch project <opensearch@amazon.com>)
gpg-pubkey-3af28a14-6585b2a3    gpg(Nodesource Operations <operations@nodesource.com>)
```

## Remove the Bad Key

Once you recognize the bad key, remove it with

```bash
rpm --erase --allmatches gpg-pubkey-xxxxxxxx-yyyyyyyy
```

## Clear Cache and Retry dnf Operation

Now, when you attempt to refresh dnf's cache, you should be prompted to accept the new key.

```bash
dnf clean all
# you'd think the above is sufficient, but sometimes I've had to manually
# remove the directory for the affected repo at /var/cache/dnf/<repo-dir>
# before the update worked

# accept any new keys!
dnf update
```
