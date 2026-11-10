import { ChartColumn, LayoutDashboard, LogOut, ShieldCheck, Users } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import type { CurrentUser } from "@/lib/auth/session";
import { Logo } from "./logo";
import { NavLink } from "./nav-link";

export function AppHeader({ user, area = "user" }: { user: CurrentUser; area?: "user" | "admin" }) {
  const isAdmin = user.role === "superadmin";
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo href={area === "admin" ? "/admin" : "/dashboard"} />
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Navigasi utama">
          {area === "admin" ? (
            <>
              <NavLink href="/admin" exact>
                <ChartColumn className="size-4" aria-hidden />
                <span className="hidden sm:inline">Ringkasan</span>
              </NavLink>
              <NavLink href="/admin/users">
                <Users className="size-4" aria-hidden />
                <span className="hidden sm:inline">Peserta</span>
              </NavLink>
              <NavLink href="/dashboard">
                <LayoutDashboard className="size-4" aria-hidden />
                <span className="hidden sm:inline">Mode Peserta</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink href="/dashboard">
                <LayoutDashboard className="size-4" aria-hidden />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>
              <NavLink href="/results">
                <ChartColumn className="size-4" aria-hidden />
                <span className="hidden sm:inline">Hasil</span>
              </NavLink>
              {isAdmin ? (
                <NavLink href="/admin">
                  <ShieldCheck className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Admin</span>
                </NavLink>
              ) : null}
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{isAdmin ? "Superadmin" : user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
