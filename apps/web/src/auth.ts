import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    apiToken?: string;
  }
  interface Session {
    apiToken?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    apiToken?: string;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

type ApiAuthUser = {
  id: string;
  email: string;
  name: string | null;
  apiToken: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : null;
        const password = typeof credentials?.password === "string" ? credentials.password : null;
        if (!email || !password) {
          return null;
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return null;
        }

        const user = (await response.json()) as ApiAuthUser;
        return { id: user.id, email: user.email, name: user.name, apiToken: user.apiToken };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.apiToken) {
        token.apiToken = user.apiToken;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (typeof token.apiToken === "string") {
        session.apiToken = token.apiToken;
      }
      return session;
    },
  },
});
