// app/api/auth/[...nextauth]/auth.ts
import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,

      // Use issuer (or wellKnown) for multi-tenant:
      issuer:
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ||
        "https://login.microsoftonline.com/common/v2.0",
      // alternatively:
      // wellKnown: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",

      profile(profile) {
        const oid = (profile as any).oid || profile.sub;
        return {
          id: oid,
          name: profile.name || "",
          email: (profile as any).email || (profile as any).preferred_username || "",
          tenantId: (profile as any).tid, // this is fine on *your* user object
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user.id = token.uid;
      return session;
    },
    // keep your school-domain allowlist if desired
    async signIn({ profile }) {
      const email =
        (profile as any).email || (profile as any).preferred_username || "";
      return email.endsWith("@cedarville.edu");
    },
  },
});
