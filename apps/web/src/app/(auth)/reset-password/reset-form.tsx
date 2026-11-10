"use client";

import { useActionState } from "react";
import { type FormState, resetPasswordAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <input type="hidden" name="token" value={token} />
      <Field
        label="Kata sandi baru"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Minimal 8 karakter."
        errors={state.fieldErrors?.password}
      />
      <Field
        label="Ulangi kata sandi baru"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <SubmitButton className="w-full" size="lg" pendingText="Menyimpan…">
        Simpan kata sandi
      </SubmitButton>
    </form>
  );
}
