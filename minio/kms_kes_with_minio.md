# MinIO Encrypted Buckets

These notes are unrefined and serve only as my initial notes while investigating how this stuff works. I still have lots to learn and have not followed through with this setup.

## Sources

- [MinIO KES Concepts](https://min.io/docs/kes/concepts/)
- [MinIO KES Server](https://min.io/docs/kes/)
- [MinIO SSE-S3 Documentation](https://min.io/docs/minio/linux/administration/server-side-encryption/server-side-encryption-sse-s3.html)
- Setup with External Secrets Manager
  - [AWS Secrets Manager](https://min.io/docs/kes/integrations/aws-secrets-manager/)
  - [Azure Key Vault](https://min.io/docs/kes/integrations/azure-keyvault/)
  - no documented option for Bitwarden Secrets Manager

## Main Components

I need 3 main components in order to set this up

1. An external secrets manager, called a Key Management Service (KMS)
2. An internal Key Encryption Service (KES) server
    - MinIO [provides one](https://min.io/docs/kes/) I can configure to run alongside the storage cluster (has not been set up yet)
3. An application to talk to the KES
    - In the present case, MinIO itself
    - However this client is general and I believe I could use this KES/KMS setup for other future needs if they arise

## Auth

1. Between the internal KES and external KMS (external secrets manager like Azure, AWS, etc)
    - An access key/secret access key pair from the KMS
2. Between the KES server and client
    - KES server needs a certificate and pub/priv keypair with Extended Key Usage of Server Authentication
    - KES client needs a certificate and pub/priv keypair with Extended Key Usage of Client Authentication
    - both certificates must be issued by a CA trusted by both client and server (I think this ends up being a long-lived cert signed by an internal CA)

## Usage

Once setup is complete, I can request a new key via the KES. which gets stored in the KMS, and the MinIO bucket can be configured to talk to the KES and use this key for encryption.

For this, I have the option of SSE-S3 or SSE-KMS (see documentation)
