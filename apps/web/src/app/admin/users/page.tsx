import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { listParticipants, PAGE_SIZE, type ParticipantStatus } from "@/lib/admin";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Peserta" };

const FILTERS: { value: ParticipantStatus; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "completed", label: "Selesai semua" },
  { value: "in_progress", label: "Sedang berjalan" },
  { value: "not_started", label: "Belum mulai" },
];

export default async function AdminUsersPage(props: PageProps<"/admin/users">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = (FILTERS.find((f) => f.value === sp.status)?.value ?? "all") as ParticipantStatus;
  const page = Math.max(1, Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const { rows, total, totalTests } = await listParticipants({ q, status, page });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (params: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    const merged = { q, status, page, ...params };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "" && !(k === "status" && v === "all") && !(k === "page" && v === 1)) {
        u.set(k, String(v));
      }
    }
    const s = u.toString();
    return s ? `/admin/users?${s}` : "/admin/users";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Peserta</h1>
        <p className="mt-1 text-sm text-slate-500">{total} peserta ditemukan</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <form className="relative flex-1" action="/admin/users">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau email…"
            aria-label="Cari peserta"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-10 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
          />
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
        </form>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={href({ status: f.value, page: 1 })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                status === f.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Peserta</th>
                <th className="px-5 py-3">Progres</th>
                <th className="px-5 py-3">Rata-rata kognitif</th>
                <th className="px-5 py-3">Terdaftar</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    Tidak ada peserta yang cocok.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500">
                        {r.email}
                        {!r.emailVerifiedAt ? <span className="ml-1 text-amber-600">(belum verifikasi)</span> : null}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex min-w-36 items-center gap-2">
                        <Progress value={(r.completed / totalTests) * 100} className="h-1.5" />
                        <span className="text-xs text-slate-500 tabular-nums">
                          {r.completed}/{totalTests}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {r.avg != null ? (
                        <span className="font-semibold text-slate-900 tabular-nums">{r.avg}%</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      {r.completed === totalTests ? (
                        <Badge tone="green" className="ml-2">
                          Lengkap
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-xs whitespace-nowrap text-slate-500">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/users/${r.id}`} className={buttonClass({ variant: "ghost", size: "sm" })}>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {pages > 1 ? (
        <nav className="flex items-center justify-between" aria-label="Paginasi">
          <p className="text-sm text-slate-500">
            Halaman {page} dari {pages}
          </p>
          <div className="flex gap-2">
            <Link
              href={href({ page: page - 1 })}
              aria-disabled={page <= 1}
              className={buttonClass({
                variant: "secondary",
                size: "sm",
                className: page <= 1 ? "pointer-events-none opacity-50" : "",
              })}
            >
              <ChevronLeft className="size-4" aria-hidden /> Sebelumnya
            </Link>
            <Link
              href={href({ page: page + 1 })}
              aria-disabled={page >= pages}
              className={buttonClass({
                variant: "secondary",
                size: "sm",
                className: page >= pages ? "pointer-events-none opacity-50" : "",
              })}
            >
              Berikutnya <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
