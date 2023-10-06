# RHEL Subscription Attach

About once a year, RHEL machines tend to disconnect from their subscription. This results in that machine being unable to receive updates from RHEL repositories. Importantly, this includes most security updates and patches. The procedure below helped me get my subscription reattached

```bash
sudo subscription-manager list --available
# from above, look for your pool ID
sudo subscription-manager attach --pool=<pool_id>
# clear all cache, refresh subscription, and run the update command again
sudo dnf clean all
sudo rm -rf /var/cache/yum/*
sudo subscription-manager refresh
sudo dnf update
```
