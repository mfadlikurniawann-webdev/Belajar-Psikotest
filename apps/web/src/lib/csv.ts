/** Byte Order Mark agar Excel membaca file sebagai UTF-8. */
export const BOM = String.fromCharCode(0xfeff);

/** Escape satu sel CSV (RFC 4180) + cegah CSV/formula injection di Excel/Sheets. */
export function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(",");
}
