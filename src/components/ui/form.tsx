import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import type { FormState } from "@/lib/forms";

export const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 aria-invalid:border-brick";

export const fileInputClass =
  "block w-full text-sm text-charcoal/70 file:mr-3 file:rounded-md file:border-0 file:bg-charcoal/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-charcoal hover:file:bg-charcoal/10";

type FieldProps = {
  label: string;
  name: string;
  errors?: string[];
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ label, name, errors, optional, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-charcoal/50">(opcional)</span>}
      </label>
      {children}
      {hint && !errors?.[0] && <p className="mt-1 text-xs text-charcoal/60">{hint}</p>}
      {errors?.[0] && <p className="mt-1 text-xs text-brick">{errors[0]}</p>}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;

  const success = state.status === "success";

  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
        success ? "bg-green-50 text-green-800" : "bg-brick/10 text-brick-dark"
      }`}
    >
      {success ? (
        <CheckCircle2 size={18} className="mt-px shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-px shrink-0" />
      )}
      {state.message}
    </p>
  );
}

type SubmitButtonProps = {
  pending: boolean;
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
};

export function SubmitButton({
  pending,
  children,
  pendingText = "Guardando...",
  className = "",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}

// Lee un valor devuelto por la acción (tras un error) o usa el inicial.
export function pick<T>(values: FormState["values"], name: string, fallback: T): T {
  const value = values?.[name];
  return value === undefined ? fallback : (value as T);
}
