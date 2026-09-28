import { z } from "zod";

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

export const productSchema = z.object({
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
  unit: z.enum(unitValues, { error: "Selecciona una unidad" }),
  category_id: z
    .union([z.uuid(), z.literal("")])
    .transform((value) => value || null),
  order: orderSchema,
  active: z.boolean(),
  image: optionalImageSchema,
  remove_image: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export function parseProductFormData(formData: FormData) {
  return productSchema.safeParse({
    name: text(formData, "name"),
    description: text(formData, "description"),
    price: formData.get("price"),
    unit: formData.get("unit"),
    category_id: text(formData, "category_id"),
    order: text(formData, "order"),
    active: checkbox(formData, "active"),
    image: file(formData, "image"),
    remove_image: checkbox(formData, "remove_image"),
  });
}
