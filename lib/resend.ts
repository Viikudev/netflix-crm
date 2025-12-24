import { Resend } from 'resend';

export function sendEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
    
  resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'victoress18@gmail.com',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  });
}