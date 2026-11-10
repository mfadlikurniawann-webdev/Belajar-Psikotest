"use server";

import { eq, sessions, users } from "@psikotest/db";
import { hashPassword, verifyPassword } from "@psikotest/db/password";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { createSession, destroySession, getClientIp, getCurrentUser, safeNext } from "@/lib/auth/session";
import { consumeAuthToken, createAuthToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mailer";
import { formatRetry, rateLimit } from "@/lib/rate-limit";

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

const email = z.string().trim().toLowerCase().pipe(z.email("Format email tidak valid").max(254));
const password = z.string().min(8, "Minimal 8 karakter").max(128, "Maksimal 128 karakter");

function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}

// Hash dummy agar waktu respons login sama walaupun email tidak terdaftar (mencegah user enumeration).
let dummyHash: Promise<string> | undefined;

/* ------------------------------- Register ------------------------------- */

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { name: raw.name ?? "", email: raw.email ?? "" };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const limit = await rateLimit(`register:${await getClientIp()}`, 10, 60 * 60);
  if (!limit.ok)
    return { error: `Terlalu banyak percobaan. Coba lagi dalam ${formatRetry(limit.retryAfterSec)}.`, values };

  const { name } = parsed.data;
  const [created] = await db
    .insert(users)
    .values({ name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id, name: users.name, email: users.email });

  if (!created) return { fieldErrors: { email: ["Email sudah terdaftar. Silakan masuk."] }, values };

  const token = await createAuthToken(created.id, "email_verification");
  after(() => sendVerificationEmail(created, token));
  await createSession(created.id);
  redirect("/dashboard?welcome=1");
}

/* -------------------------------- Login -------------------------------- */

const loginSchema = z.object({ email, password: z.string().min(1, "Kata sandi wajib diisi").max(128) });

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { email: raw.email ?? "" };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const ip = await getClientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`login:ip:${ip}`, 30, 15 * 60),
    rateLimit(`login:email:${parsed.data.email}`, 8, 15 * 60),
  ]);
  if (!byIp.ok || !byEmail.ok) {
    const wait = Math.max(byIp.retryAfterSec, byEmail.retryAfterSec);
    return { error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${formatRetry(wait)}.`, values };
  }

  const [user] = await db
    .select({ id: users.id, role: users.role, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  dummyHash ??= hashPassword("dummy-password-for-timing");
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await dummyHash));
  if (!user || !ok) return { error: "Email atau kata sandi salah.", values };

  await createSession(user.id);
  const fallback = user.role === "superadmin" ? "/admin" : "/dashboard";
  redirect(safeNext(raw.next, fallback));
}

/* -------------------------------- Logout -------------------------------- */

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

/* --------------------------- Forgot / Reset --------------------------- */

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = email.safeParse(formData.get("email"));
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { fieldErrors: { email: ["Format email tidak valid"] }, values };

  const [byIp, byEmail] = await Promise.all([
    rateLimit(`forgot:ip:${await getClientIp()}`, 10, 60 * 60),
    rateLimit(`forgot:email:${parsed.data}`, 3, 60 * 60),
  ]);
  if (!byIp.ok || !byEmail.ok) {
    return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti.", values };
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, parsed.data))
    .limit(1);

  if (user) {
    const token = await createAuthToken(user.id, "password_reset");
    after(() => sendPasswordResetEmail(user, token));
  }
  // Pesan yang sama untuk email terdaftar/tidak (mencegah user enumeration).
  return { success: "Jika email terdaftar, tautan atur ulang kata sandi telah dikirim. Periksa kotak masuk Anda." };
}

const resetSchema = z
  .object({ token: z.string().min(10).max(100), password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const userId = await consumeAuthToken(parsed.data.token, "password_reset");
  if (!userId) return { error: "Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru." };

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password), emailVerifiedAt: new Date() })
    .where(eq(users.id, userId));
  // Keluarkan semua sesi lama (mis. bila akun sempat diakses orang lain).
  await db.delete(sessions).where(eq(sessions.userId, userId));
  redirect("/login?reset=1");
}

/* ------------------------- Verifikasi email ------------------------- */

export async function resendVerificationAction(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerifiedAt) return { success: "Email Anda sudah terverifikasi." };

  const limit = await rateLimit(`verify:${user.id}`, 3, 60 * 60);
  if (!limit.ok) return { error: `Tunggu ${formatRetry(limit.retryAfterSec)} sebelum mengirim ulang.` };

  const token = await createAuthToken(user.id, "email_verification");
  after(() => sendVerificationEmail(user, token));
  return { success: `Email verifikasi telah dikirim ke ${user.email}.` };
}
