"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import {
  createProduct,
  type ProductFormState,
} from "@/app/admin/productos/actions";
import {
  ACCEPTED_IMAGE_TYPES,
  PRODUCT_UNITS,
} from "@/lib/validations/product.schema";
import type { Category } from "@/types";

const initialState: ProductFormState = { status: "idle" };

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 aria-invalid:border-brick";

type ProductFormProps = {
  categories: Pick<Category, "id" | "name">[];
};

export default function ProductForm({ categories }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(
    createProduct,
    initialState,
  );

  const values = state.values;
  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-line bg-white/60 p-5 sm:p-6"
    >
      <h2 className="font-display text-xl font-semibold">Nuevo producto</h2>

      {state.message && (
        <p
          role="status"
          className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
            state.status === "success"
              ? "bg-green-50 text-green-800"
              : "bg-brick/10 text-brick-dark"
          }`}
        >
          {state.status === "success" ? (
            <CheckCircle2 size={18} className="mt-px shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-px shrink-0" />
          )}
          {state.message}
        </p>
      )}

      <Field label="Nombre" name="name" errors={errors.name}>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          placeholder="Ej: Punta de anca"
          defaultValue={values?.name as string | undefined}
          aria-invalid={Boolean(errors.name)}
          className={inputClass}
        />
      </Field>

      <Field label="Descripción" name="description" errors={errors.description} optional>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={values?.description as string | undefined}
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
            defaultValue={values?.price as string | undefined}
            aria-invalid={Boolean(errors.price)}
            className={inputClass}
          />
        </Field>

        <Field label="Unidad" name="unit" errors={errors.unit}>
          <select
            id="unit"
            name="unit"
            defaultValue={(values?.unit as string | undefined) ?? "kg"}
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

      <Field label="Categoría" name="category_id" errors={errors.category_id} optional>
        <select
          id="category_id"
          name="category_id"
          defaultValue={(values?.category_id as string | undefined) ?? ""}
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
      </Field>

      <Field label="Imagen" name="image" errors={errors.image} optional>
        <input
          id="image"
          name="image"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          aria-invalid={Boolean(errors.image)}
          className="block w-full text-sm text-charcoal/70 file:mr-3 file:rounded-md file:border-0 file:bg-charcoal/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-charcoal hover:file:bg-charcoal/10"
        />
        <p className="mt-1 text-xs text-charcoal/60">JPG, PNG o WEBP. Máximo 4 MB.</p>
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={(values?.active as boolean | undefined) ?? true}
          className="size-4 accent-brick"
        />
        Visible en la tienda
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "Guardando..." : "Agregar producto"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  errors?: string[];
  optional?: boolean;
  children: React.ReactNode;
};

function Field({ label, name, errors, optional, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-charcoal/50">(opcional)</span>}
      </label>
      {children}
      {errors?.[0] && <p className="mt-1 text-xs text-brick">{errors[0]}</p>}
    </div>
  );
}
