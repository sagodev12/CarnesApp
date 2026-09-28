"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Percent } from "lucide-react";

import {
  Field,
  FormMessage,
  SubmitButton,
  fileInputClass,
  inputClass,
  pick,
} from "@/components/ui/form";
import { initialFormState, type FormState } from "@/lib/forms";
import { toBusinessDate } from "@/lib/promotions";
import {
  ACCEPTED_IMAGE_TYPES,
  PRODUCT_UNITS,
} from "@/lib/validations/product.schema";
import type { Category, Product } from "@/types";

type ProductFormProps = {
  categories: Pick<Category, "id" | "name">[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  // Si viene, el formulario está en modo edición.
  product?: Product;
};

export default function ProductForm({ categories, action, product }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  const values = state.values;
  const errors = state.fieldErrors ?? {};
  const isEditing = Boolean(product);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6"
    >
      <FormMessage state={state} />

      <Field label="Nombre" name="name" errors={errors.name}>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          placeholder="Ej: Punta de anca"
          defaultValue={pick(values, "name", product?.name ?? "")}
          aria-invalid={Boolean(errors.name)}
          className={inputClass}
        />
      </Field>

      <Field label="Descripción" name="description" errors={errors.description} optional>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={pick(values, "description", product?.description ?? "")}
          aria-invalid={Boolean(errors.description)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Precio (COP)" name="price" errors={errors.price}>
          <input
            id="price"
            name="price"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            placeholder="32000"
            defaultValue={pick(values, "price", product ? String(product.price) : "")}
            aria-invalid={Boolean(errors.price)}
            className={inputClass}
          />
        </Field>

        <Field label="Unidad" name="unit" errors={errors.unit}>
          <select
            id="unit"
            name="unit"
            defaultValue={pick(values, "unit", product?.unit ?? "kg")}
            aria-invalid={Boolean(errors.unit)}
            className={inputClass}
          >
            {PRODUCT_UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="rounded-xl border border-brick/25 bg-brick/5 p-4 sm:p-5">
        <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-brick">
          <Percent size={14} />
          Promoción
          <span className="font-normal text-charcoal/50">(opcional)</span>
        </legend>
        <p className="mb-4 text-xs text-charcoal/60">
          Con un precio promo el producto sale destacado en &quot;Ofertas&quot;. Déjalo vacío
          para quitar la promoción.
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Precio promo (COP)" name="sale_price" errors={errors.sale_price}>
            <input
              id="sale_price"
              name="sale_price"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="28000"
              defaultValue={pick(
                values,
                "sale_price",
                product?.sale_price != null ? String(product.sale_price) : "",
              )}
              aria-invalid={Boolean(errors.sale_price)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Desde"
            name="sale_starts_at"
            errors={errors.sale_starts_at}
            hint="Vacío: desde ya."
          >
            <input
              id="sale_starts_at"
              name="sale_starts_at"
              type="date"
              defaultValue={pick(
                values,
                "sale_starts_at",
                toBusinessDate(product?.sale_starts_at ?? null),
              )}
              aria-invalid={Boolean(errors.sale_starts_at)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Hasta (incluido)"
            name="sale_ends_at"
            errors={errors.sale_ends_at}
            hint="Vacío: sin fecha límite."
          >
            <input
              id="sale_ends_at"
              name="sale_ends_at"
              type="date"
              defaultValue={pick(
                values,
                "sale_ends_at",
                toBusinessDate(product?.sale_ends_at ?? null, { end: true }),
              )}
              aria-invalid={Boolean(errors.sale_ends_at)}
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Categoría" name="category_id" errors={errors.category_id} optional>
          <select
            id="category_id"
            name="category_id"
            defaultValue={pick(values, "category_id", product?.category_id ?? "")}
            aria-invalid={Boolean(errors.category_id)}
            className={inputClass}
          >
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-charcoal/60">
              <Link href="/admin/categorias" className="underline">
                Crea una categoría
              </Link>{" "}
              para agrupar productos.
            </p>
          )}
        </Field>

        <Field
          label="Orden"
          name="order"
          errors={errors.order}
          hint="Menor número aparece primero."
        >
          <input
            id="order"
            name="order"
            type="number"
            min={0}
            step={1}
            defaultValue={pick(values, "order", String(product?.order ?? 0))}
            aria-invalid={Boolean(errors.order)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label={product?.image_url ? "Cambiar imagen" : "Imagen"}
        name="image"
        errors={errors.image}
        optional
        hint="JPG, PNG o WEBP. Máximo 4 MB."
      >
        {product?.image_url && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative size-16 overflow-hidden rounded-md bg-charcoal/5">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="64px"
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

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={pick(values, "active", product?.active ?? true)}
          className="size-4 accent-brick"
        />
        Visible en la tienda
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/productos"
          className="inline-flex items-center justify-center rounded-md border border-line px-4 py-2.5 text-sm font-medium"
        >
          {isEditing ? "Cancelar" : "Volver al listado"}
        </Link>
        <SubmitButton pending={pending}>
          {isEditing ? "Guardar cambios" : "Agregar producto"}
        </SubmitButton>
      </div>
    </form>
  );
}
