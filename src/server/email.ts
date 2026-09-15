import { Resend } from "resend";

let client: Resend | null = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = process.env.EMAIL_FROM ?? "AELIA <no-reply@aelia.dev>";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not configured — would have sent "${subject}" to ${to}`);
    return { success: false };
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("[email] send failed", error);
    return { success: false };
  }
  return { success: true };
}
