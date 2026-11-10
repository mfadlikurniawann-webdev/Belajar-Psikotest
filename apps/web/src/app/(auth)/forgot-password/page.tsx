import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = { title: "Lupa Kata Sandi" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Lupa kata sandi</h1>
      <p className="mt-1 text-sm text-slate-500">
        Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        Ingat kata sandi?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Masuk
        </Link>
      </p>
    </>
  );
}
