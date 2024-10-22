# Object Storage Backend for Django

By default when using `models.FileField`, or other files Django considers `MEDIA`, these files are stored and server directly from the filesystem of the host you're running your application on. In some cases, this is fine, especially if you aren't working with large datasets. However, if your dataset is expected to be large and you want to take advantage of object storage, we can configure Django to do this.

## Install django-storages

The first step is to install a required dependency. In my case, I was using an S3 compatible service (MinIO), so installed with the `s3` extra

```bash
pip install django-storages[s3]
```

## Configure Storages

Now, in your `settings.py`, we need to tell Django which backends to use for different categories of files. In the example below, there is a `get_setting()` function that is assumed to get the value from environment variables or some configuration file so that we may later reconfigure this without a code change

```python
USE_OBJECT_STORAGE = get_setting('USE_OBJECT_STORAGE')

if USE_OBJECT_STORAGE:
    STORAGES = {
        # NOTE: the "default" storage include MEDIA files
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {
                "access_key": get_setting('MINIO_ACCESS_KEY_ID'),
                "secret_key": get_setting('MINIO_SECRET_ACCESS_KEY'),
                "bucket_name": get_setting("MINIO_BUCKET_NAME"),
                "endpoint_url": get_setting("MINIO_ENDPOINT_URL"),
                "addressing_style": "path",
                # a prefix that will be prepended to all uploads. 
                # helpful if this bucket is shared with other categories, like staticfiles
                "location": "default",
            }
        },
        # NOTE: I still wanted to store my static files on the local filesystem
        # since this was the default and I had no storage concerns here
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
        # NOTE: you may configure staticfiles for object storage too, but this was untested by me
        # "staticfiles": {
        #     "BACKEND": "storages.backends.s3.S3Storage",
        #     "OPTIONS": {
        #         "access_key": get_setting('MINIO_ACCESS_KEY_ID'),
        #         "secret_key": get_setting('MINIO_SECRET_ACCESS_KEY'),
        #         "bucket_name": get_setting("STATICFILES_MINIO_BUCKET_NAME"),
        #         "endpoint_url": get_setting("MINIO_ENDPOINT_URL"),
        #         "addressing_style": "path",
        #         # a prefix that will be prepended to all uploads
        #         "location": "staticfiles",
        #     }
        # }
    }

```

Now, uploaded files to `FileField` will be sent to S3 and the URL generated for downloading the files will now be a pre-signed S3 URL instead of a local URL.

## Considerations

In my experience, you must be careful about the following:

1. You must adjust your code to be backend-agnostic. Do not check for filepaths directly using something like `os.path()`, or attempt to manually generate the path/url to a file
2. Be careful about HTML sanitization. The url must maintain the literal `"&"` instead of this being translated to `"&amp;"`

## Further Reading

Check out the [django documentation](https://docs.djangoproject.com/en/5.1/ref/settings/#storages) and [django-storages documentation](https://django-storages.readthedocs.io/en/latest/) for more information and configuration options.
