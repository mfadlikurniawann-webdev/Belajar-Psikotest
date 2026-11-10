import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Buat akun</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Masuk
        </Link>
      </p>
      <RegisterForm />
    </>
  );
}
