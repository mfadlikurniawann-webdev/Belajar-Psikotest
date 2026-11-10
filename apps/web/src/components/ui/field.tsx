import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  name,
  errors,
  className,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; errors?: string[]; hint?: string }) {
  const id = `f-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? errorId : undefined}
        className={cn(
          "block h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none",
          errors?.length ? "border-rose-400" : "border-slate-300",
        )}
        {...props}
      />
      {hint && !errors?.length ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {errors?.length ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
