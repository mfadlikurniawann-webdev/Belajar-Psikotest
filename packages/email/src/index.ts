import { Resend } from "resend";
import type { EmailContent } from "./templates";

export * from "./templates";

export interface MailerConfig {
  apiKey?: string;
  from: string;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface Mailer {
  send(to: string | string[], content: EmailContent): Promise<SendResult>;
}

/**
 * Mailer berbasis Resend. Bila RESEND_API_KEY kosong (development), email hanya dicetak
 * ke console sehingga alur verifikasi/reset tetap bisa diuji tanpa akun Resend.
 */
export function createMailer({ apiKey, from }: MailerConfig): Mailer {
  if (!apiKey) {
    return {
      async send(to, content) {
        console.info(
          `\n[email:dev] To: ${[to].flat().join(", ")}\n[email:dev] Subject: ${content.subject}\n${content.text}\n`,
        );
        return { ok: true, id: "dev" };
      },
    };
  }

  const resend = new Resend(apiKey);
  return {
    async send(to, content) {
      try {
        const { data, error } = await resend.emails.send({
          from,
          to: [to].flat(),
          subject: content.subject,
          html: content.html,
          text: content.text,
        });
        if (error) {
          console.error("[email] Resend error:", error.message);
          return { ok: false, error: error.message };
        }
        return { ok: true, id: data?.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[email] gagal mengirim:", message);
        return { ok: false, error: message };
      }
    },
  };
}
