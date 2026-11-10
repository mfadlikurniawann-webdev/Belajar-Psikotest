import { TESTS } from "@psikotest/core";
import { getExportRows } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { BOM, csvRow } from "@/lib/csv";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") return new Response("Not found", { status: 404 });

  const rows = await getExportRows();

  // Kolom: info peserta, skor tiap tes kognitif, dan skor tiap dimensi kepribadian.
  const columns: { header: string; slug: string; key?: string }[] = [];
  for (const t of TESTS) {
    if (t.kind === "cognitive") columns.push({ header: `${t.title} (%)`, slug: t.slug });
    else for (const d of t.dimensions) columns.push({ header: `${d.label} (%)`, slug: t.slug, key: d.key });
  }

  type Person = { name: string; email: string; createdAt: Date; results: Map<string, (typeof rows)[number]["result"]> };
  const people = new Map<string, Person>();
  for (const r of rows) {
    const p = people.get(r.id) ?? { name: r.name, email: r.email, createdAt: r.createdAt, results: new Map() };
    if (r.slug && r.result) p.results.set(r.slug, r.result);
    people.set(r.id, p);
  }

  const lines = [csvRow(["Nama", "Email", "Terdaftar", "Tes selesai", ...columns.map((c) => c.header)])];
  for (const p of people.values()) {
    const cells = columns.map((c) => {
      const res = p.results.get(c.slug);
      if (!res) return "";
      if (res.kind === "cognitive") return res.percent;
      return res.dimensions.find((d) => d.key === c.key)?.percent ?? "";
    });
    lines.push(csvRow([p.name, p.email, p.createdAt.toISOString(), `${p.results.size}/${TESTS.length}`, ...cells]));
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(`${BOM}${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hasil-psikotes-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
