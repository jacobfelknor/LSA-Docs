# Common Policies

This should serve as a quick reference for common MinIO policies to be applied to users or access keys.

## Read and List Only

Allow reading and listing ANY bucket

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketLocation",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::*"
            ]
        }
    ]
}
```

Allow reading and listing a SPECIFIC bucket (omit the `GetBucketLocation` action).

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::BUCKET-NAME-HERE*"
            ]
        }
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
            ],
            "Resource": [
                "arn:aws:s3:::BUCKET-NAME-HERE/*"
            ]
        }
    ]
}
```

## Read and Write

Full read/write access to specified buckets. Users will only be able to list buckets that they have access to.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:ListBucketMultipartUploads",
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::BUCKET-NAME-HERE"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:AbortMultipartUpload",
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:ListMultipartUploadParts",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::BUCKET-NAME-HERE/*"
            ]
        }
    ]
}
```

## Full Access on a Bucket

Full access to any s3 action, including deleting the bucket itself.

```json
{
 "Version": "2012-10-17",
 "Statement": [
  {
   "Effect": "Allow",
   "Action": [
    "s3:*"
   ],
   "Resource": [
    "arn:aws:s3:::BUCKET-NAME-HERE*"
   ]
  }
 ]
}
```

## Full Console Admin

```json
{
 "Version": "2012-10-17",
 "Statement": [
  {
   "Effect": "Allow",
   "Action": [
    "admin:*"
   ]
  },
  {
   "Effect": "Allow",
   "Action": [
    "kms:*"
   ]
  },
  {
   "Effect": "Allow",
   "Action": [
    "s3:*"
   ],
   "Resource": [
    "arn:aws:s3:::*"
   ]
  }
 ]
}
```
