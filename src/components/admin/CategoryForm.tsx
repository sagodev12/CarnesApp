"use client";

import { useActionState } from "react";

import { createCategory } from "@/app/admin/categorias/actions";
import { Field, FormMessage, SubmitButton, inputClass, pick } from "@/components/ui/form";
import { initialFormState } from "@/lib/forms";

export default function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-line bg-white/60 p-5 sm:p-6"
    >
      <h2 className="font-display text-xl font-semibold">Nueva categoría</h2>

      <FormMessage state={state} />

      <Field label="Nombre" name="name" errors={errors.name}>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          placeholder="Ej: Res, Cerdo, Pollo"
          defaultValue={pick(state.values, "name", "")}
          aria-invalid={Boolean(errors.name)}
          className={inputClass}
        />
      </Field>

      <Field label="Orden" name="order" errors={errors.order} hint="Menor número aparece primero.">
        <input
          id="order"
          name="order"
          type="number"
          min={0}
          step={1}
          defaultValue={pick(state.values, "order", "0")}
          aria-invalid={Boolean(errors.order)}
          className={inputClass}
        />
      </Field>

      <SubmitButton pending={pending} className="w-full">
        Crear categoría
      </SubmitButton>
    </form>
  );
}
