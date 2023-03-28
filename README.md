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

- What's the downside of this approach ?

  You are locked into their hosted UI, which looks ugly for today's standards. You can't customize it.

- Why create custom providers and not use Cognito directly in next-auth ?

  This way you can create "Sign in with <provider>" buttons directly in your app, instead of the default "Log in with Cognito" button from next-auth.

- Why not use AWS Amplify UI ?

  Because this lib stores tokens in localstorage or cookies without httpOnly. This is not secure, and the issues on the repo are not being addressed.

- I really want to use AWS Amplify UI, but I need to use cookies. How do I do that ?

  Since the major issue here is related to the way that tokens are stored, we need to find a workaround.

  - One way is to use a custom Storage class, which Amplify will use to store the tokens. You can build a custom storage that sends the tokens to the server, and the server will set the cookies back. In other words, a `set` method would make a POST request to some endpoint you created, and a `get` method would make a GET request to the same endpoint. You could also create a `delete` method that would make a DELETE request to the same endpoint, for the logout functionality.
  - Other way is to create a lambda function that will sit in between Cognito and the client, it would work something like this: client -> cognito -> (oauth2 redirect url) -> lambda -> (set httponly secure cookies) -> client.
