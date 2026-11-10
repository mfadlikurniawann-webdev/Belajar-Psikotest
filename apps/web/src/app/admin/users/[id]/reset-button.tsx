"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { resetAttemptAction } from "@/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";

/** Konfirmasi dua langkah (tanpa window.confirm) sebelum menghapus attempt peserta. */
export function ResetAttemptButton({ userId, slug }: { userId: string; slug: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <RotateCcw className="size-3.5" aria-hidden /> Reset tes
      </Button>
    );
  }

  return (
    <form action={resetAttemptAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="slug" value={slug} />
      <span className="text-xs text-slate-600">Hapus jawaban & izinkan mengulang?</span>
      <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
        Batal
      </Button>
      <SubmitButton variant="danger" size="sm" pendingText="Mereset…">
        Ya, reset
      </SubmitButton>
    </form>
  );
}
