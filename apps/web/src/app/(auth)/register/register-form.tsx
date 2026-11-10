"use client";

import { useActionState } from "react";
import { type FormState, registerAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

export function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});
  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <Field
        label="Nama lengkap"
        name="name"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        errors={state.fieldErrors?.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <Field
        label="Kata sandi"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="Minimal 8 karakter."
        errors={state.fieldErrors?.password}
      />
      <Field
        label="Ulangi kata sandi"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <SubmitButton className="w-full" size="lg" pendingText="Membuat akun…">
        Daftar
      </SubmitButton>
    </form>
  );
}
