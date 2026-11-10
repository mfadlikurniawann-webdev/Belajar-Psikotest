"use client";

import { Mail } from "lucide-react";
import { useActionState } from "react";
import { type FormState, resendVerificationAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export function VerifyEmailBanner({ email, required }: { email: string; required: boolean }) {
  const [state, action] = useActionState<FormState>(resendVerificationAction, {});
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center">
      <Mail className="size-4 shrink-0" aria-hidden />
      <p className="flex-1">
        {state.success ?? state.error ?? (
          <>
            Email <strong>{email}</strong> belum diverifikasi.
            {required ? " Verifikasi diperlukan sebelum memulai tes." : " Periksa kotak masuk Anda."}
          </>
        )}
      </p>
      {!state.success ? (
        <form action={action}>
          <SubmitButton variant="secondary" size="sm" pendingText="Mengirim…">
            Kirim ulang email
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
