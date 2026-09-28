import { z } from "zod";

import { fromBusinessDate } from "@/lib/promotions";

import { checkbox, file, optionalImageSchema, orderSchema, text } from "./common";

export { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "./common";

export const PRODUCT_UNITS = [
  { value: "kg", label: "Kilo" },
  { value: "lb", label: "Libra" },
  { value: "unidad", label: "Unidad" },
  { value: "paquete", label: "Paquete" },
] as const;

const unitValues = PRODUCT_UNITS.map((unit) => unit.value) as [
  (typeof PRODUCT_UNITS)[number]["value"],
  ...(typeof PRODUCT_UNITS)[number]["value"][],
];

// Campo vacío del formulario = null.
const emptyToNull = (value: unknown) => (value === "" || value == null ? null : value);

const optionalDate = z.preprocess(
  emptyToNull,
  z.iso.date({ error: "Fecha inválida" }).nullable(),
);

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(120, "Máximo 120 caracteres"),
    // En la base es NOT NULL default '': vacío se guarda como "".
    description: z.string().trim().max(500, "Máximo 500 caracteres"),
    price: z.coerce
      .number({ error: "Ingresa un precio válido" })
      .positive("El precio debe ser mayor a 0")
      .max(100_000_000, "Precio demasiado alto"),
    sale_price: z.preprocess(
      emptyToNull,
      z.coerce
        .number({ error: "Ingresa un precio válido" })
        .positive("El precio promo debe ser mayor a 0")
        .nullable(),
    ),
    sale_starts_at: optionalDate,
    sale_ends_at: optionalDate,
    unit: z.enum(unitValues, { error: "Selecciona una unidad" }),
    category_id: z
      .union([z.uuid(), z.literal("")])
      .transform((value) => value || null),
    order: orderSchema,
    active: z.boolean(),
    image: optionalImageSchema,
    remove_image: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.sale_price === null) return;

    if (data.sale_price >= data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["sale_price"],
        message: "El precio promo debe ser menor al precio normal",
      });
    }
    // Formato YYYY-MM-DD: el orden de texto es el orden de fechas.
    if (data.sale_starts_at && data.sale_ends_at && data.sale_ends_at < data.sale_starts_at) {
      ctx.addIssue({
        code: "custom",
        path: ["sale_ends_at"],
        message: "La fecha final no puede ser anterior a la inicial",
      });
    }
  })
  // Sin precio promo no se guardan fechas; con él, se pasan a hora de Colombia.
  .transform(({ sale_price, sale_starts_at, sale_ends_at, ...rest }) => ({
    ...rest,
    sale_price,
    sale_starts_at: sale_price !== null && sale_starts_at ? fromBusinessDate(sale_starts_at) : null,
    sale_ends_at:
      sale_price !== null && sale_ends_at ? fromBusinessDate(sale_ends_at, { end: true }) : null,
  }));

export type ProductInput = z.infer<typeof productSchema>;

export function parseProductFormData(formData: FormData) {
  return productSchema.safeParse({
    name: text(formData, "name"),
    description: text(formData, "description"),
    price: formData.get("price"),
    sale_price: text(formData, "sale_price"),
    sale_starts_at: text(formData, "sale_starts_at"),
    sale_ends_at: text(formData, "sale_ends_at"),
    unit: formData.get("unit"),
    category_id: text(formData, "category_id"),
    order: text(formData, "order"),
    active: checkbox(formData, "active"),
    image: file(formData, "image"),
    remove_image: checkbox(formData, "remove_image"),
  });
}

export function unitLabel(unit: string | null) {
  if (!unit) return "";
  return PRODUCT_UNITS.find((u) => u.value === unit)?.label.toLowerCase() ?? unit;
}
