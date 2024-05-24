# Update GitLab

## Check GitLab's Update Guide

The first step in every update is to check GitLab's [official docs for upgrading](https://docs.gitlab.com/ee/update/package/)

Some common considerations:

- If you're really out of date, check to make sure you follow a [supported upgrade path](https://docs.gitlab.com/ee/update/index.html#upgrade-paths)
- Sometimes it's required to update one minor version at a time. You can try to skip minors, but it may fail gracefully and tell you that you need to upgrade to a certain minor first.
- Check [deprecations](https://docs.gitlab.com/ee/update/deprecations.html) and [removals](https://docs.gitlab.com/ee/update/removals.html) by version.

## Before Starting

Make sure all background migrations and jobs have completed successfully. View these in the admin area, under the `Monitoring` tab.

## Disabled Repository By Default

In order to avoid upgrading GitLab by mistake when upgrading the rest of the system, it may be a good idea to disable its repository by default. For example, your `yum.repos.d` source may look like

```ini
[gitlab_gitlab-ee]
name=gitlab_gitlab-ee
baseurl=https://packages.gitlab.com/gitlab/gitlab-ee/el/8/$basearch
repo_gpgcheck=1
gpgcheck=1
############################################
# NOTE THAT THIS IS DISABLED BY DEFAULT!!
enabled=0
############################################
gpgkey=https://packages.gitlab.com/gitlab/gitlab-ee/gpgkey
       https://packages.gitlab.com/gitlab/gitlab-ee/gpgkey/gitlab-gitlab-ee-3D645A26AB9FBD22.pub.gpg
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
```

When you specifically want to upgrade GitLab itself, use the `--enablerepo` option specifying the repo you wish to enable. For this example, it would be `--enablerepo=gitlab_gitlab-ee`.

## DNF Version Lock

Alternatively, you can use [`dnf versionlock`](../dnf/dnf_pinning.md). See those notes for details. If using this method, specifying the `--enablerepo` option is not necessary, but you must first remove the lock before the upgrade will be allowed to continue.

## Upgrade

To upgrade, directly jumping to next version

```bash
sudo dnf install gitlab-ee --enablerepo=gitlab_gitlab-ee
```

To list specific versions available to upgrade to

```bash
# RHEL
sudo dnf --showduplicates list gitlab-ee --enablerepo=gitlab_gitlab-ee

# Ubuntu
sudo apt list -a gitlab-ee
```

To upgrade to a specific version

```bash
sudo dnf install gitlab-ee-<version> --enablerepo=gitlab_gitlab-ee
# for example,
sudo dnf install gitlab-ee-15.4.3-ee.0.el8 --enablerepo=gitlab_gitlab-ee

# ubuntu
apt install gitlab-ee=15.4.3-ee.0
```

Typically, I'll update GitLab to the version I want, and then will update the rest of the system packages but want to exclude GitLab. This is especially true when I'm not updating GitLab to the latest version. You can do this with the following:

```bash
# exclude explicitly, to ensure we don't get it if we've accidentally left the repo enabled
sudo dnf update --exclude=gitlab-ee
```

## After Upgrade

Again, make sure all background migrations and jobs have completed successfully. View these in the admin area, under the `Monitoring` tab.

Check the What's New tab, in the question mark in the top bar near your profile picture. This will alert you to any fancy new toys inside GitLab

# Runner Upgrade

For best results, keep the version of GitLab and the version of your GitLab Runners in sync.

## On Linux

You should be able to update the runner on Linux through your package manager. You can follow the same procedure as shown above for GitLab itself, replacing `gitlab-ee` with `gitlab-runner`.

## On Windows

On windows, you first need to manually stop the gitlab runner service with an elevated powershell window. This is done using `gitlab-runner.exe`, typically installed at `C:\GitLab-Runner`.

```powershell
.\gitlab-runner.exe stop
```

Then, download the [latest exe](https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-windows-amd64.exe) from their s3 bucket. Replace the old `gitlab-runner.exe` with the one you just downloaded. It may be prudent to rename the existing one `gitlab-runner-old.exe` in case you need to quickly revert to existing version.

Now, restart the service using the new binary

```powershell
.\gitlab-runner.exe start
```

You runner will now be using the latest version. You can check its version in the Admin panel of GitLab under Runners.
