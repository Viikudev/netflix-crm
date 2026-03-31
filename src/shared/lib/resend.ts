import { Resend } from "resend";

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail() {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping email send");
    return;
  }

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "victoress18@gmail.com",
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });
}
