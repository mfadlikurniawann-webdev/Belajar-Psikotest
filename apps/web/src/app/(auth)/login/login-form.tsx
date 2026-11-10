"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type FormState, loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
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
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.password}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Lupa kata sandi?
        </Link>
      </div>
      <SubmitButton className="w-full" size="lg" pendingText="Memproses…">
        Masuk
      </SubmitButton>
    </form>
  );
}
