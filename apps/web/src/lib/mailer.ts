import "server-only";
import {
  adminCompletedTemplate,
  createMailer,
  type Mailer,
  resetPasswordTemplate,
  resultsReadyTemplate,
  verifyEmailTemplate,
} from "@psikotest/email";
import { appUrl, env } from "./env";

let mailer: Mailer | undefined;

function getMailer(): Mailer {
  const e = env();
  mailer ??= createMailer({ apiKey: e.RESEND_API_KEY, from: e.EMAIL_FROM });
  return mailer;
}

type Recipient = { name: string; email: string };

export function sendVerificationEmail(user: Recipient, token: string) {
  const url = appUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  return getMailer().send(user.email, verifyEmailTemplate({ name: user.name, url }));
}

export function sendPasswordResetEmail(user: Recipient, token: string) {
  const url = appUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  return getMailer().send(user.email, resetPasswordTemplate({ name: user.name, url }));
}

/** Dikirim sekali saat peserta menyelesaikan seluruh psikotes. */
export async function sendAllCompletedEmails(user: Recipient & { id: string }) {
  const tasks = [getMailer().send(user.email, resultsReadyTemplate({ name: user.name, url: appUrl("/results") }))];
  const admins = env()
    .ADMIN_NOTIFY_EMAIL?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (admins?.length) {
    tasks.push(
      getMailer().send(
        admins,
        adminCompletedTemplate({
          userName: user.name,
          userEmail: user.email,
          url: appUrl(`/admin/users/${user.id}`),
        }),
      ),
    );
  }
  await Promise.allSettled(tasks);
}
