# Advanced Monitoring with Prometheus

MinIO provides an option to enable more advanced monitoring and alerts with prometheus.

TODO: Enable alerting, the following only enables the console graphs.

## Prometheus Config

Generate the prometheus configuration entry with

```bash
mc admin prometheus generate ALIAS
```

Then, update `prometheus.yml` with the output from above. For example,

```yml
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: minio-job
    bearer_token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    metrics_path: /minio/v2/metrics/cluster
    scheme: https
    static_configs:
    - targets: ['minio.example.com:443']
```

cmd

```bash
./prometheus --config.file=prometheus.yml --web.listen-address=:8080
```

## MinIO Config

```ini
# Prometheus Settings
MINIO_PROMETHEUS_URL="http://example.com:8080"
MINIO_PROMETHEUS_JOB_ID="minio-job"
```

## systemd Daemon

You can create a systemd service manually for prometheus to start on boot in background. A simple example is shown here

```ini
# /etc/systemd/system/prometheus.service
[Unit]
Description=Prometheus Server
Documentation=https://prometheus.io/docs/introduction/overview/
After=network-online.target

[Service]
User=root
# Restart=on-failure

# Change this line if you downloaded Prometheus on different path
ExecStart=/root/prometheus/prometheus --config.file=/root/prometheus/prometheus.yml --web.listen-address=:8080

[Install]
WantedBy=multi-user.target
```
