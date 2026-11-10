import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIES = ["__Host-ps_session", "ps_session"];

/**
 * Pemeriksaan cepat (tanpa query database): halaman terproteksi hanya butuh cookie sesi.
 * Validasi sesi sesungguhnya dilakukan di server component lewat `requireUser()`.
 */
export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/tests/:path*", "/results/:path*", "/admin/:path*"],
};
