import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getResend } from "@/lib/resend";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/lib/db";
import TwitchResetPasswordEmail from "@/components/emails/ResetPassword";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      const host =
        process.env.NEXT_PUBLIC_APP_URL ??
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const resetUrl = url ?? `${host}/reset-password?token=${token}`;

      console.log("sendResetPassword called", {
        email: user.email,
        url,
        token,
        resetUrl,
      });

      const resend = getResend();
      if (!resend) {
        console.warn("RESEND_API_KEY not set; skipping reset password email");
        return;
      }

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email!,
        subject: "Reset your password",
        react: TwitchResetPasswordEmail({
          resetUrl,
          username: user.name!,
          updatedDate: new Date(),
        }),
      });
    },

    onPasswordReset: async ({ user }) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const host =
        process.env.NEXT_PUBLIC_APP_URL ??
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const resend = getResend();
      if (!resend) {
        console.warn("RESEND_API_KEY not set; skipping verification email");
        return;
      }

      // Ensure the URL uses the correct host
      let fixedUrl = url;
      try {
        const targetUrl = new URL(url);
        const baseHost = new URL(host);

        targetUrl.protocol = baseHost.protocol;
        targetUrl.host = baseHost.host;
        targetUrl.port = baseHost.port;
        fixedUrl = targetUrl.toString();
      } catch {
        // If url is relative or invalid, prepend host
        fixedUrl = `${host}${url}`;
      }

      console.log("sendVerificationEmail called", {
        email: user.email,
        originalUrl: url,
        fixedUrl,
      });

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email!,
        subject: "Verify your email",
        html: `<p>Please verify your email by clicking <a href="${fixedUrl}">here</a>.</p>`,
      });
    },
  },

  plugins: [nextCookies()],
});
