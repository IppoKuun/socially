// src/lib/mail/sendEmail.ts
import { resend } from "@/lib/resend";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Resend error:", error);
    return { ok: false, error };
  }

  return { ok: true, id: data?.id };
}
