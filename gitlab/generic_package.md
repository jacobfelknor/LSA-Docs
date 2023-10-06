# Publishing Generic Packages

GitLab allows us to push generic "packages" - which could be just any tarball - to a project's package repository.

The deploy token used for these commands must have the `write_package_registry` permission. If using a personal access token, it must have the `api` permission.

## CI/CD

For CI/CD jobs, try the following:

```yaml
image: curlimages/curl:latest

stages:
  - upload
  - download

upload:
  stage: upload
  script:
    - 'curl --header "JOB-TOKEN: $CI_JOB_TOKEN" --upload-file path/to/file.txt "${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/<pkg_name>/0.0.1/file.txt"'

download:
  stage: download
  script:
    - 'wget --header="JOB-TOKEN: $CI_JOB_TOKEN" ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/<pkg_name>/0.0.1/file.txt'
```

## Command Line

We can also publish a package manually using the command line. For this, try the following:

```bash
# download
curl --header "PRIVATE-TOKEN: <your_access_token>" \
     "https://gitlab.example.com/api/v4/projects/<project_id>/packages/generic/<pkg_name>/0.0.1/file.txt"

# upload
curl --header "PRIVATE-TOKEN: <your_access_token>" \
     --upload-file path/to/file.txt \
     "https://gitlab.example.com/api/v4/projects/<project_id>/packages/generic/<pkg_name>/0.0.1/file.txt"
```
