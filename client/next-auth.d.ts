import { JWT } from "next-auth/jwt";
import NextAuth, { type DefaultSession } from "next-auth";

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    accessToken: string;
    accessTokenExpires: number;
    refreshToken?: string;
    user: {
      id: string;
      email: string;
    };
    // iat: number;
    // exp: number;
    // jti: string;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      email: string;
    };
    accessToken: string;
    expires: string;
  }

  interface Account {
    access_token: string;
  }
}
