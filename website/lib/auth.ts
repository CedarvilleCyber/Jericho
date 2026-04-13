import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";
import { admin, username } from "better-auth/plugins";
import { sendEmail, verificationEmailHtml } from "./email";

const microsoftClientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
const microsoftClientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["microsoft"],
    },
  },
  socialProviders:
    microsoftClientId && microsoftClientSecret
      ? {
          microsoft: {
            clientId: microsoftClientId,
            clientSecret: microsoftClientSecret,
            tenantId:
              process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID || undefined,
            authority:
              process.env.AUTH_MICROSOFT_ENTRA_ID_AUTHORITY || undefined,
          },
        }
      : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password — Jericho",
        html: verificationEmailHtml({
          url,
          heading: "Reset your password",
          body: `We received a request to reset the password for your Jericho account (<strong>${user.email}</strong>). Click the button below to choose a new password. This link expires in 1 hour.`,
          buttonLabel: "Reset Password",
        }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address — Jericho",
        html: verificationEmailHtml({
          url,
          heading: "Verify your email address",
          body: `Please verify the email address associated with your Jericho account (<strong>${user.email}</strong>). This link expires in 1 hour.`,
          buttonLabel: "Verify Email Address",
        }),
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [nextCookies(), username(), admin()],
});
