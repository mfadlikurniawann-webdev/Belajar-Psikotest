import "server-only";
import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  APP_URL: optionalString.pipe(z.url().optional()),
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: z.string().trim().default("Belajar Psikotest <onboarding@resend.dev>"),
  /** Daftar email superadmin yang dinotifikasi saat peserta selesai (pisahkan dengan koma). */
  ADMIN_NOTIFY_EMAIL: optionalString,
  REQUIRE_EMAIL_VERIFICATION: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  VERCEL_ENV: optionalString,
  VERCEL_URL: optionalString,
  VERCEL_PROJECT_PRODUCTION_URL: optionalString,
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Validasi env secara lazy (saat pertama dipakai) agar `next build` tidak butuh secret. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Konfigurasi environment tidak valid:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** URL publik aplikasi untuk tautan di email. Tidak memakai header Host (mencegah host header injection). */
export function appUrl(path = ""): string {
  const e = env();
  let base = e.APP_URL;
  if (!base && e.VERCEL_ENV === "production" && e.VERCEL_PROJECT_PRODUCTION_URL) {
    base = `https://${e.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (!base && e.VERCEL_URL) base = `https://${e.VERCEL_URL}`;
  base ??= "http://localhost:3000";
  return new URL(path, base).toString();
}
