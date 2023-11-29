# Inventree Update

Based on [offical documentation](https://docs.inventree.org/en/0.7.6/start/docker_prod/#updating-inventree)

1. Stop all containers

    ```bash
    sudo docker compose down
    ```

2. Pull latest version of containers

    ```bash
    sudo docker compose pull
    ```

3. Run update script, applying migrations, installing new requirements, etc.

    ```bash
    # using --skip-backup option avoids creating a db/media folder backup
    # should only be used in production when you have an alternative backup
    # like VM snapshots
    sudo docker compose run inventree-server invoke update --skip-backup
    ```

4. Restart containers

    ```bash
    sudo docker compose up -d
    ```

## Export Data

To export database to a JSON file,

```bash
sudo docker compose run inventree-server invoke export-records -f /home/inventree/data/data.json
```
