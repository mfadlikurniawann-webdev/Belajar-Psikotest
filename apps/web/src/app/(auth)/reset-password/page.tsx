import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { isAuthTokenValid } from "@/lib/auth/tokens";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = { title: "Atur Ulang Kata Sandi" };

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const { token } = await props.searchParams;
  const valid = typeof token === "string" && (await isAuthTokenValid(token, "password_reset"));

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Atur ulang kata sandi</h1>
      {valid ? (
        <>
          <p className="mt-1 text-sm text-slate-500">Buat kata sandi baru untuk akun Anda.</p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <>
          <Alert tone="error" className="mt-6">
            Tautan tidak valid atau sudah kedaluwarsa.
          </Alert>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-indigo-600">
            Minta tautan baru →
          </Link>
        </>
      )}
    </>
  );
}
