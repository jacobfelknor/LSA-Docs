# Object Storage for GitLab

It is possible to use object storage (like AWS S3 or MinIO) to back much of the storage needs of a GitLab server. For example, artifacts, git LFS, uploads, packages, and container images are some of the supported items. Notably, ordinary repository storage (the actual code) is not included in this list.

## Consolidated Configuration

Reference the [official docs](https://docs.gitlab.com/ee/administration/object_storage.html) for the most up to date configuration. At the time of writing, these settings can be used in `/etc/gitlab/gitlab.rb` to enable object storage:

```ruby
# Consolidated object storage configuration
gitlab_rails['object_store']['enabled'] = true
##############################################################################################
# should gitlab machine act as a proxy for object retrieval to client? 
# if yes, network may be bottleneck for large GitLab instances if all traffic
# must pass through host. Network traffic may be better handled through object store
# If no, slightly better security because you can place object store behind a firewall,
# In addition, temp signed URLs for client are created if proxy is false which can linger beyond 
# a single use. These can be shared without auth until they expire
gitlab_rails['object_store']['proxy_download'] = true
##############################################################################################
gitlab_rails['object_store']['connection'] = {
  'provider' => 'AWS',
  'endpoint' => 'https://minio.example.com',
  'region' => 'us-east-1',
  'path_style' => true, # set to true for MinIO, false for AWS
  'aws_access_key_id' => '<AWS_ACCESS_KEY_ID>',
  'aws_secret_access_key' => '<AWS_SECRET_ACCESS_KEY>'
}
# OPTIONAL: The following lines are only needed if server side encryption is required
gitlab_rails['object_store']['storage_options'] = {
  'server_side_encryption' => '<AES256 or aws:kms>',
  'server_side_encryption_kms_key_id' => '<arn:aws:kms:xxx>'
}

# NOTE: below is configured to use a single bucket with different prefixes, which 
# differs from their docs but does work. 
# see the following for more information
# https://gitlab.com/gitlab-org/gitlab/-/issues/292958#note_1084838016
# https://gitlab.com/gitlab-org/gitlab/-/merge_requests/91307
gitlab_rails['object_store']['objects']['artifacts']['bucket'] = 'gitlab/artifacts'
gitlab_rails['object_store']['objects']['external_diffs']['bucket'] = 'gitlab/mr-diffs'
gitlab_rails['object_store']['objects']['lfs']['bucket'] = 'gitlab/lfs'
gitlab_rails['object_store']['objects']['uploads']['bucket'] = 'gitlab/uploads'
gitlab_rails['object_store']['objects']['packages']['bucket'] = 'gitlab/packages'
gitlab_rails['object_store']['objects']['dependency_proxy']['bucket'] = 'gitlab/dependency-proxy'
gitlab_rails['object_store']['objects']['terraform_state']['bucket'] = 'gitlab/terraform-state'
gitlab_rails['object_store']['objects']['ci_secure_files']['bucket'] = 'gitlab/ci-secure-files'
gitlab_rails['object_store']['objects']['pages']['bucket'] = 'gitlab/pages'

##############################################################################################
# required to enable external diff storage
gitlab_rails['external_diffs_enabled'] = true
```

Because GitLab takes advantage of the [existing open source docker registry](https://github.com/distribution/distribution), the container registry is left out from the consolidated object storage settings and must be set individually. Within the `'s3'` section, we must specify the arguments for connecting a registry to S3 as [documented here](https://docs.docker.com/registry/storage-drivers/s3/)

```ruby
### Registry backend storage
###! Docs: https://docs.gitlab.com/ee/administration/container_registry.html#container-registry-storage-driver
registry['storage'] = {
    's3' => {
      'accesskey' => 'access_key',
      'secretkey' => 'secret_key',
      'region' => 'us-east-1',
      'path_style' => true, # true for MinIO, false for AWS S3
      'bucket' => 'gitlab',
      'rootdirectory' => 'registry', # a prefix for where the root is in bucket. In this example, it would be at gitlab/registry/*
      'regionendpoint' => 'https://minio.example.com',
      'v4Auth' => true,
    },
    'redirect' => {
      # same idea as before, should we proxy through GitLab?
     'disable' => true
   },
   'maintenance' => {
      # set to true when migrating
     'readonly' => {
        'enabled' => false
      }
    }
}
```

## Migrate to Object Storage

Once we've configured GitLab to use object storage, we must migrate existing data to it. Follow the directions [here](https://docs.gitlab.com/ee/administration/object_storage.html#migrate-to-object-storage) for everything **except the container registry**. It would be wise to enable [Maintenance Mode](https://docs.gitlab.com/ee/administration/maintenance_mode/#gitlab-maintenance-mode) while performing the migration.

## Migrate Container Registry to Object Storage

Similarly as the configuration, the container registry is left out of these directions. It is still possible to do a manual migration however. There is some directions [in GitLab's official documentation](https://github.com/distribution/distribution), though what I found most helpful was in one of their [issues](https://gitlab.com/gitlab-org/omnibus-gitlab/-/issues/4208). Specifically, [this comment](https://gitlab.com/gitlab-org/omnibus-gitlab/-/issues/4208#note_153115586) outlines the general process which I've repeated below:

1. Create a bucket on a provider of choice. For this example, we will use MinIO
2. Configure `mc` client to connect to the bucket (see their documentation)
3. `mc mirror /var/opt/gitlab/gitlab-rails/shared/registry ALIAS/gitlab/registry`
4. Update the `gitlab.rb` with the alteration to the registry configuration to connect the Registry to the MinIO bucket. Ensure the access keys uses have the permissions necessary to push/pull from registry bucket. See examples below
5. `gitlab-ctl reconfigure`

Permissions for access keys:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
        "Effect": "Allow",
        "Action": [
            "s3:ListBucket",
            "s3:GetBucketLocation",
            "s3:ListBucketMultipartUploads"
        ],
        "Resource": "arn:aws:s3:::S3_BUCKET_NAME"
        },
        {
        "Effect": "Allow",
        "Action": [
            "s3:PutObject",
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:ListMultipartUploadParts",
            "s3:AbortMultipartUpload"
        ],
        "Resource": "arn:aws:s3:::S3_BUCKET_NAME/*"
        }
    ]
}
```

## Migrate from Object Storage to Local Storage

Sometimes it is necessary to reverse course and go back to local storage instead of remote object storage. In most cases you can, but for some things (like MR diffs), switching to object storage is irreversible. For those you can, there is usually information on the same page that documents the migration to object storage on how to reverse. When I have had to do so, I document in this section my process and if anything undocumented happens.

### Artifacts


Trigger the migration back to local storage, which is undocumented.

```bash
# undocumented!
sudo gitlab-rake gitlab:artifacts:migrate_to_local
```

Check progress of migration

```bash
sudo gitlab-psql
```

```console
gitlabhq_production=# SELECT count(*) AS total, sum(case when file_store = '1' then 1 else 0 end) AS filesystem, sum(case when file_store = '2' then 1 else 0 end) AS objectstg FROM ci_job_artifacts;

total | filesystem | objectstg
------+------------+-----------
   19 |          0 |        19
```

Disable object storage for artifacts

```ruby
# selectively disable object storage for artifacts in the consolidated object storage settings.
gitlab_rails['object_store']['objects']['artifacts']['enabled'] = false
```

### Dangling Artifacts

Dangling objects occur when the record for an artifact exists in the GitLab database, but are not available in the expected location. This can happen when objects are deleted manually outside of GitLab's scope. Any attempt to migrate dangling objects from object storage back to local storage will fail with an error `WARN -- : Failed to transfer Ci::JobArtifact ID 344 with error: undefined method 'move_to'`.

To clean up dangling objects, first see [this procedure to clean up broken references to object storage](https://docs.gitlab.com/ee/administration/raketasks/check.html#update-dangling-object-storage-references). Once completed, see [the associated documentation for deleting the dangling records](https://docs.gitlab.com/ee/administration/raketasks/check.html#delete-references-to-missing-artifacts).