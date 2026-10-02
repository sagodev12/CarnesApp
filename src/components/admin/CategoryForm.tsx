"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";

import { createCategory } from "@/app/admin/categorias/actions";
import {
  Field,
  FormMessage,
  SubmitButton,
  fileInputClass,
  inputClass,
  pick,
} from "@/components/ui/form";
import { initialFormState, type FormState } from "@/lib/forms";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/validations/common";
import type { Category } from "@/types";

type CategoryFormProps = {
  // Por defecto crea; en edición llega updateCategory.bind(null, id).
  action?: (state: FormState, formData: FormData) => Promise<FormState>;
  // Si viene, el formulario está en modo edición.
  category?: Category;
};

export default function CategoryForm({ action = createCategory, category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const values = state.values;
  const errors = state.fieldErrors ?? {};
  const isEditing = Boolean(category);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-line bg-white/60 p-5 sm:p-6"
    >
      {!isEditing && <h2 className="font-display text-xl font-semibold">Nueva categoría</h2>}

      <FormMessage state={state} />

      <Field label="Nombre" name="name" errors={errors.name}>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          placeholder="Ej: Res, Cerdo, Pollo"
          defaultValue={pick(values, "name", category?.name ?? "")}
          aria-invalid={Boolean(errors.name)}
          className={inputClass}
        />
      </Field>

      <Field
        label="Descripción"
        name="description"
        errors={errors.description}
        optional
        hint="Se muestra en la tarjeta del inicio y en la página de la categoría."
      >
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={200}
          placeholder="Ej: Cortes frescos de res, seleccionados cada mañana."
          defaultValue={pick(values, "description", category?.description ?? "")}
          aria-invalid={Boolean(errors.description)}
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
          defaultValue={pick(values, "order", String(category?.order ?? 0))}
          aria-invalid={Boolean(errors.order)}
          className={inputClass}
        />
      </Field>

      <Field
        label={category?.image_url ? "Cambiar imagen" : "Imagen"}
        name="image"
        errors={errors.image}
        optional
        hint="JPG, PNG o WEBP. Máximo 4 MB. Mejor horizontal."
      >
        {category?.image_url && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-16 w-24 overflow-hidden rounded-md bg-charcoal/5">
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="remove_image"
                defaultChecked={pick(values, "remove_image", false)}
                className="size-4 accent-brick"
              />
              Quitar imagen actual
            </label>
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          aria-invalid={Boolean(errors.image)}
          className={fileInputClass}
        />
      </Field>

      {isEditing ? (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/categorias"
            className="inline-flex items-center justify-center rounded-md border border-line px-4 py-2.5 text-sm font-medium"
          >
            Cancelar
          </Link>
          <SubmitButton pending={pending}>Guardar cambios</SubmitButton>
        </div>
      ) : (
        <SubmitButton pending={pending} className="w-full">
          Crear categoría
        </SubmitButton>
      )}
    </form>
  );
}
