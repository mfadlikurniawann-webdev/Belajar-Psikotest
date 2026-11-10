"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  return (
    <div className="grid min-h-[60dvh] place-items-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-slate-500">
          Maaf, terjadi gangguan saat memuat halaman. Silakan coba lagi.
          {digest ? <span className="mt-1 block font-mono text-xs text-slate-400">Kode: {digest}</span> : null}
        </p>
        <Button className="mt-6" onClick={() => retry()}>
          Coba lagi
        </Button>
      </div>
    </div>
  );
}
