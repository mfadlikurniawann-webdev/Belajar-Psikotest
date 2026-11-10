export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8" role="status" aria-label="Memuat">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-slate-200" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
      </div>
      <div className="h-28 rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton statis
          <div key={i} className="h-60 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
