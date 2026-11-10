/** Hanya izinkan redirect ke path internal (mencegah open redirect, mis. "//evil.com"). */
export function safeNext(next: unknown, fallback: string): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
