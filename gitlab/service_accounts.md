# GitLab Service Accounts

When you want to create a bot account for a GitLab instance, a good option is to use a service account. These accounts do not count towards your license usage and can be used for various automated tasks, such as enforcing repository permissions

## Create Service Account

To create a service account, we must use the API.

```console
~# curl --request POST --header "PRIVATE-TOKEN: $GL_TOKEN" https://gitlab.example.com/api/v4/service_accounts
{"id":<user_id>,"username":"service_account_cdc0be8f404d492a949609931ae6e49d","name":"Service account user","state":"active","avatar_url":"https://secure.gravatar.com/avatar/f1863b95d1df8f9791aba8ef1d23a7fd?s=80\u0026d=identicon","web_url":"https://gitlab.example.com/service_account_cdc0be8f404d492a949609931ae6e49d"}
```

Optionally, make this user an administrator if you need to do administrative tasks with it. Make sure to replace the user ID with the one you got from the above response.

```console
~# curl --request PUT --header "PRIVATE-TOKEN: $GL_TOKEN" --header "Content-Type: application/json" --data '{"admin": "true"}' https://gitlab.example.com/api/v4/users/<user_id>
```

Optionally, set an avatar for the service account.

```console
~# curl --request PUT --header "PRIVATE-TOKEN: $GL_TOKEN" --form "avatar=@/path/to/file.jpg" https://gitlab.example.com/api/v4/users/<user_id>
```

Now, we must create access tokens for this account so that it may authenticate via the API. See [personal access token scopes](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#personal-access-token-scopes) for a list of options for `"scopes"`. Omit `"expires_at"` if you don't want the key to expire.

Create a token

```console
~# curl --request POST --header "PRIVATE-TOKEN: $GL_TOKEN" --header "Content-Type:application/json" --data '{ "name": "Token Name", "scopes": ["api", "read_repository"], "expires_at": "2024-01-31"}' https://gitlab.example.com/api/v4/users/<user_id>/personal_access_tokens
```

List active, non-revoked tokens with

```console
~# curl --header "PRIVATE-TOKEN: $GL_TOKEN" "https://gitlab.example.com/api/v4/personal_access_tokens?user_id=<user_id>&active=true&revoked=false"
```

Revoke a token with

```console
~# curl --request DELETE --header "PRIVATE-TOKEN: $GL_TOKEN" "https://gitlab.example.com/api/v4/personal_access_tokens/<personal_access_token_id>"
```
