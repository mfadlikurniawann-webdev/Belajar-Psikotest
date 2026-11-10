import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";
import { verifyEmailToken } from "@/lib/auth/tokens";

export const metadata: Metadata = { title: "Verifikasi Email" };

export default async function VerifyEmailPage(props: PageProps<"/verify-email">) {
  const { token } = await props.searchParams;
  const ok = typeof token === "string" && (await verifyEmailToken(token));

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Verifikasi email</h1>
      {ok ? (
        <Alert tone="success" className="mt-6">
          Email Anda berhasil diverifikasi. Selamat mengerjakan psikotes!
        </Alert>
      ) : (
        <Alert tone="error" className="mt-6">
          Tautan verifikasi tidak valid atau sudah kedaluwarsa. Kirim ulang tautan dari dashboard.
        </Alert>
      )}
      <Link href="/dashboard" className={buttonClass({ className: "mt-6 w-full", size: "lg" })}>
        Ke Dashboard
      </Link>
    </>
  );
}
