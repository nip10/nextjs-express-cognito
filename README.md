# NextJS Express Cognito

Just testing out NextJS with external NodeJS Express server and AWS Cognito.

## Structure

- `server/` - NodeJS Express server
- `client/` - NextJS client (next-auth template)

## Setup

- Setup AWS Cognito (check next auth docs)
- Update env variables
- Run

## Notes

- Use AWS Cognito for token signing. This is required for the `next-auth` library to work w/ AWS Cognito. See [this issue](https://github.com/nextauthjs/next-auth/issues/4707)

```ts
// use cognito for token signing
// https://github.com/nextauthjs/next-auth/issues/4707
clientSecret: '',
client: {
  token_endpoint_auth_method: 'none',
},
```

- There are multiple ways to store the auth token (either tokenId or accessToken): cookie, save somewhere and use as header, directly into http client interceptor, database, etc. In this repo, I'll be using cookies.

- You need to handle access token refresh: check the expiration in the `jwt` callback, and use `@aws-sdk/client-cognito-identity-provider` to get a new access token. If this fails (default 30 days), redirect to login page.

- After successful authentication of a user, Amazon Cognito issues three tokens to the client:

  - ID token
  - Access token
  - Refresh token

  You can use either the ID token or the Access token to make requests to the backend.
