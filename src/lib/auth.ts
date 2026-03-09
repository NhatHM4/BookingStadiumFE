import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginApi, socialLoginApi, refreshTokenApi } from "@/lib/api/auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: string;
      phone?: string | null;
      authProvider: string;
    };
  }

  interface User {
    accessToken: string;
    refreshToken: string;
    role: string;
    phone?: string | null;
    authProvider: string;
  }
}

declare module "next-auth" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    role: string;
    phone?: string | null;
    authProvider: string;
    error?: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await loginApi({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          console.log("Login response:", { success: res.success, message: res.message }, credentials);

          if (res.success && res.data) {
            const { accessToken, refreshToken, user } = res.data;
            return {
              id: String(user.id),
              email: user.email,
              name: user.fullName,
              image: user.avatarUrl,
              accessToken,
              refreshToken,
              role: user.role,
              phone: user.phone,
              authProvider: user.authProvider,
            };
          }
          console.error("Login failed:", res.message);
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in: call social-login API
      if (account?.provider === "google") {
        try {
          const res = await socialLoginApi({
            email: user.email!,
            fullName: user.name!,
            avatarUrl: user.image || undefined,
          });

          if (res.success && res.data) {
            user.accessToken = res.data.accessToken;
            user.refreshToken = res.data.refreshToken;
            user.role = res.data.user.role;
            user.phone = res.data.user.phone;
            user.authProvider = res.data.user.authProvider;
            user.id = String(res.data.user.id);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.phone = user.phone;
        token.authProvider = user.authProvider;
        // Access token expires in 24h
        token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
      }

      // Return previous token if access token has not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh
      try {
        const res = await refreshTokenApi(token.refreshToken as string);
        if (res.success && res.data) {
          token.accessToken = res.data.accessToken;
          token.refreshToken = res.data.refreshToken;
          token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          token.error = undefined;
        }
      } catch {
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.phone = token.phone as string;
      session.user.authProvider = token.authProvider as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (match refresh token)
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
