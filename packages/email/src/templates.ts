export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const BRAND = "Belajar Psikotest";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

interface LayoutInput {
  preview: string;
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
  footnote?: string;
}

/** Layout email berbasis tabel + inline style agar kompatibel dengan mayoritas email client. */
function layout({ preview, heading, paragraphs, cta, footnote }: LayoutInput): string {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#334155">${p}</p>`)
    .join("");
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:10px;background:#4f46e5">
<a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(cta.label)}</a>
</td></tr></table>
<p style="margin:0 0 16px;font-size:12px;line-height:18px;color:#64748b">Jika tombol tidak berfungsi, salin tautan ini ke browser:<br><a href="${escapeHtml(cta.url)}" style="color:#4f46e5;word-break:break-all">${escapeHtml(cta.url)}</a></p>`
    : "";
  const foot = footnote
    ? `<p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#94a3b8">${footnote}</p>`
    : "";

  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 24px;font-size:14px;font-weight:700;color:#4f46e5">${BRAND}</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:30px;color:#0f172a">${escapeHtml(heading)}</h1>
${body}${button}${foot}
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} ${BRAND}</p>
</td></tr></table></body></html>`;
}

function textVersion(lines: (string | undefined)[]): string {
  return lines.filter(Boolean).join("\n\n");
}

export function verifyEmailTemplate(input: { name: string; url: string }): EmailContent {
  const name = escapeHtml(input.name);
  return {
    subject: `Verifikasi email Anda - ${BRAND}`,
    html: layout({
      preview: "Konfirmasi alamat email untuk mulai mengerjakan psikotes.",
      heading: "Verifikasi alamat email",
      paragraphs: [
        `Halo ${name},`,
        "Terima kasih telah mendaftar. Klik tombol di bawah untuk memverifikasi email Anda. Tautan berlaku selama 24 jam.",
      ],
      cta: { label: "Verifikasi Email", url: input.url },
      footnote: "Abaikan email ini jika Anda tidak merasa mendaftar.",
    }),
    text: textVersion([
      `Halo ${input.name},`,
      "Verifikasi email Anda melalui tautan berikut (berlaku 24 jam):",
      input.url,
    ]),
  };
}

export function resetPasswordTemplate(input: { name: string; url: string }): EmailContent {
  const name = escapeHtml(input.name);
  return {
    subject: `Atur ulang kata sandi - ${BRAND}`,
    html: layout({
      preview: "Permintaan atur ulang kata sandi.",
      heading: "Atur ulang kata sandi",
      paragraphs: [
        `Halo ${name},`,
        "Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Tautan berlaku selama 1 jam.",
      ],
      cta: { label: "Atur Ulang Kata Sandi", url: input.url },
      footnote: "Jika Anda tidak meminta ini, abaikan saja email ini. Kata sandi Anda tidak akan berubah.",
    }),
    text: textVersion([`Halo ${input.name},`, "Atur ulang kata sandi Anda (berlaku 1 jam):", input.url]),
  };
}

export function resultsReadyTemplate(input: { name: string; url: string }): EmailContent {
  const name = escapeHtml(input.name);
  return {
    subject: `Hasil psikotes Anda sudah tersedia - ${BRAND}`,
    html: layout({
      preview: "Selamat! Anda telah menyelesaikan semua psikotes.",
      heading: "Semua psikotes selesai 🎉",
      paragraphs: [
        `Halo ${name},`,
        "Selamat, Anda telah menyelesaikan seluruh rangkaian psikotes. Hasil lengkap kini dapat Anda lihat di dashboard.",
      ],
      cta: { label: "Lihat Hasil", url: input.url },
    }),
    text: textVersion([`Halo ${input.name},`, "Semua psikotes selesai. Lihat hasil Anda:", input.url]),
  };
}

export function adminCompletedTemplate(input: { userName: string; userEmail: string; url: string }): EmailContent {
  return {
    subject: `[Admin] ${input.userName} menyelesaikan semua psikotes`,
    html: layout({
      preview: `${input.userName} telah menyelesaikan semua psikotes.`,
      heading: "Peserta menyelesaikan psikotes",
      paragraphs: [
        `<strong>${escapeHtml(input.userName)}</strong> (${escapeHtml(input.userEmail)}) telah menyelesaikan seluruh rangkaian psikotes.`,
      ],
      cta: { label: "Buka Hasil Peserta", url: input.url },
    }),
    text: textVersion([`${input.userName} (${input.userEmail}) telah menyelesaikan seluruh psikotes.`, input.url]),
  };
}
