import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
// import { sendEmail } from "@/lib/resend";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/lib/db";
import TwitchResetPasswordEmail from "@/components/emails/ResetPassword";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
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
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email!,
        subject: "Verify your email",
        html: `<p>Please verify your email by clicking <a href="${url}">here</a>.</p>`,
      });
    },
  },

  plugins: [nextCookies()],
});
