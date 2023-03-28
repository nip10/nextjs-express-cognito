import NextAuth, { NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

// https://github.com/kndt84/passport-cognito/issues/35
// I had the same error and I solved it creating an "App client" without a client secret in the AWS console configuration

// After successful authentication of a user, Amazon Cognito issues three tokens to the client:
// - ID token
// - Access token
// - Refresh token

// Save these tokens within the client app (preferably as cookies). When any API is invoked from client, pass in the AccessToken or IDToken to the server.

// It's completely up to you how you pass in the AccessToken or IDToken. Here are two options:
// - By adding them explicitly in Request Headers
// - Just save the tokens as cookies. This way they get attached to request headers whenever APIs are invoked.

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      // https://github.com/nextauthjs/next-auth/discussions/5145
      // https://github.com/nextauthjs/next-auth/issues/4707
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      // clientSecret: "",
      issuer: process.env.COGNITO_ISSUER,
      client: {
        token_endpoint_auth_method: "none",
      },
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ account, token }) {
      // https://next-auth.js.org/configuration/callbacks#jwt-callback
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        console.log("jwt account", account);
        // eslint-disable-next-line no-param-reassign
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session", session);
      // Send properties to the client, like an access_token and user id from a provider.
      // eslint-disable-next-line no-param-reassign
      // @ts-expect-error
      session.idToken = token.idToken;
      return session;
    },
  },
};

export default NextAuth(authOptions);
