import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-indigo-600">404</p>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-500">Halaman yang Anda cari tidak ada atau Anda tidak memiliki akses.</p>
        <Link href="/" className={buttonClass({ className: "mt-6" })}>
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
