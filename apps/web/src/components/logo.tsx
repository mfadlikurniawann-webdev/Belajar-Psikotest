import { Brain } from "lucide-react";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-bold text-slate-900">
      <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
        <Brain className="size-4.5" aria-hidden />
      </span>
      <span>
        Belajar <span className="text-indigo-600">Psikotest</span>
      </span>
    </Link>
  );
}
