import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CognitoProvider from "next-auth/providers/cognito";
import { setCookie } from "nookies";

const refreshCognitoAccessToken = async (token: JWT) => {
  const client = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION,
  });
  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: token.refreshToken as string,
    },
  });
  const response = await client.send(command);
  return response.AuthenticationResult;
};

const isProd = process.env.NODE_ENV === "production";
const cookieConfig = {
  httpOnly: isProd,
  secure: isProd,
  maxAge: 30 * 24 * 60 * 60,
  path: "/",
  domain: isProd ? ".wonder.money" : undefined,
};

type NextAuthOptionsCallback = (
  req: NextApiRequest,
  res: NextApiResponse
) => NextAuthOptions;

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
// @ts-expect-error
const nextAuthOptions: NextAuthOptionsCallback = (req, res) => {
  return {
    // https://next-auth.js.org/configuration/providers/oauth
    providers: [
      CognitoProvider({
        clientId: process.env.COGNITO_CLIENT_ID!,
        issuer: process.env.COGNITO_ISSUER,
        // use cognito for token signing
        // https://github.com/nextauthjs/next-auth/issues/4707
        // https://github.com/nextauthjs/next-auth/discussions/5145
        clientSecret: process.env.COGNITO_CLIENT_SECRET!,
        client: {
          token_endpoint_auth_method: "none",
        },
      }),
    ],
    theme: {
      colorScheme: "auto",
    },
    callbacks: {
      async jwt({ account, token, user }) {
        console.log("jwt callback");
        console.log("account", account);
        console.log("token", token);
        console.log("user", user);
        // https://next-auth.js.org/configuration/callbacks#jwt-callback
        // Persist the OAuth access_token and or the user id to the token right after signin
        // Initial sign in
        if (account && user) {
          setCookie({ res }, "wm_ac", account.access_token, cookieConfig);
          return {
            // save token to session for authenticating to AWS
            // https://next-auth.js.org/configuration/callbacks#jwt-callback
            accessToken: account.access_token,
            accessTokenExpires: account.expires_at
              ? account.expires_at * 1000
              : 0,
            refreshToken: account.refresh_token,
            user,
          };
        }

        // Return previous token if the access token has not expired yet
        if (Date.now() < token.accessTokenExpires) {
          console.log("existing token is still valid");
          return token;
        }

        console.log("existing token has expired, refreshing");
        // Access token has expired, try to update it
        const refreshedTokens = await refreshCognitoAccessToken(token);
        setCookie(
          { res },
          "wm_ac",
          refreshedTokens?.AccessToken ?? token.accessToken,
          cookieConfig
        );
        return {
          ...token,
          accessToken: refreshedTokens?.AccessToken,
          accessTokenExpires: refreshedTokens?.ExpiresIn
            ? Date.now() + refreshedTokens?.ExpiresIn * 1000
            : 0,
          refreshToken: refreshedTokens?.RefreshToken ?? token.refreshToken, // Fall back to old refresh token
        };
      },
      async session({ session, token }) {
        console.log("session callback");
        console.log("session", session);
        console.log("token", token);
        // Send properties to the client, like an access_token and user id from a provider.
        if (!session?.user || !token?.accessToken) {
          console.error("No accessToken found on token or session");
          return session;
        }
        session.user = token.user;
        session.accessToken = token.accessToken;
        // session.error = token.error;
        return session;
      },
    },
  };
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, nextAuthOptions(req, res));
};
