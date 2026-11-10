import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { getCurrentUser, safeNext } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, user.role === "superadmin" ? "/admin" : "/dashboard"));

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Masuk</h1>
      <p className="mt-1 text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Daftar gratis
        </Link>
      </p>
      {sp.reset ? (
        <Alert tone="success" className="mt-6">
          Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.
        </Alert>
      ) : null}
      <LoginForm next={next} />
    </>
  );
}
