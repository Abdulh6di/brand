import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config: no Prisma/adapter here (middleware runs on the edge
 * runtime and the `pg` driver is Node-only). Route protection is implemented
 * directly in `src/middleware.ts`. The full provider + adapter config is
 * added in `auth.ts`, which only runs in Node contexts (route handlers,
 * server components, API routes).
 */
export const authConfig = {
  pages: {
    signIn: "/account/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    // Edge (proxy.ts) decodes the JWT directly and needs this to expose
    // role/permissions on `req.auth.user` — the full callback set (which
    // also populates the token from `authorize()`) lives in auth.ts.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
