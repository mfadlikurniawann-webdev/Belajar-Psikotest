import { BookOpen, Calculator, ListChecks, Puzzle, ScanSearch, UserRound } from "lucide-react";

const icons = {
  kepribadian: UserRound,
  numerik: Calculator,
  verbal: BookOpen,
  "penalaran-logis": Puzzle,
  ketelitian: ScanSearch,
} as const;

export function TestIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = icons[slug as keyof typeof icons] ?? ListChecks;
  return <Icon className={className} aria-hidden />;
}
