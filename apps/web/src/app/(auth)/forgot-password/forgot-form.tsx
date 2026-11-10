"use client";

import { useActionState } from "react";
import { type FormState, forgotPasswordAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  if (state.success) {
    return (
      <Alert tone="success" className="mt-6">
        {state.success}
      </Alert>
    );
  }
  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <SubmitButton className="w-full" size="lg" pendingText="Mengirim…">
        Kirim tautan
      </SubmitButton>
    </form>
  );
}
