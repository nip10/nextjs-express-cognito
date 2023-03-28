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

- To use AWS Cognito without client secret, you need to add this in the Provider config

```ts
client: {
  token_endpoint_auth_method: "none",
},
```

- There are multiple ways to store the auth token (either tokenId or accessToken): cookie, save somewhere and use as header, directly into http client interceptor, etc.
