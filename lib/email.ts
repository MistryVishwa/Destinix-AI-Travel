import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  return await resend.emails.send({
    from: "noreply@yourdomain.com",
    to,
    subject,
    html,
  });
}
