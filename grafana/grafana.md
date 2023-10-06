# Grafana

## Install

Installation is fairly straightforward, follow the steps in their [official documentation](https://grafana.com/docs/grafana/latest/setup-grafana/installation/)


## MongoDB Plugin

There is a "community" MongoDB plugin in this [github repo](https://github.com/JamesOsgood/mongodb-grafana), but it hasn't been updated since 2018. Alas, we're trying it and this is how I installed it.

First, clone the repo

```bash
git clone https://github.com/JamesOsgood/mongodb-grafana
```

Move the repo to the plugins directory for your grafana install.

```bash
sudo mv mongodb-grafana /var/lib/grafana/plugins
sudo chown grafana. -R /var/lib/grafana/plugins/mongodb-grafana
```

Install NPM Dependencies for the proxy server and start it. It listens on `localhost:3333`

```bash
cd /var/lib/grafana/plugins/mongodb-grafana
npm install
npm run server
```

Configure Grafana on where to look for the plugins and allow this unsigned plugin

```ini
# /etc/grafana/grafana.ini
...
[paths]
plugins = /var/lib/grafana/plugins
...
[plugins]
allow_loading_unsigned_plugins = grafana-mongodb-datasource
...
```
