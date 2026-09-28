import { z } from "zod";

export const PRODUCT_UNITS = [
  { value: "kg", label: "Kilo" },
  { value: "lb", label: "Libra" },
  { value: "unidad", label: "Unidad" },
  { value: "paquete", label: "Paquete" },
] as const;

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  description: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .transform((value) => value || null),
  price: z.coerce
    .number({ error: "Ingresa un precio válido" })
    .positive("El precio debe ser mayor a 0")
    .max(100_000_000, "Precio demasiado alto"),
  unit: z.enum(unitValues, { error: "Selecciona una unidad" }),
  category_id: z
    .union([z.uuid(), z.literal("")])
    .transform((value) => value || null),
  active: z.boolean(),
  // Un <input type="file"> vacío envía un File de tamaño 0.
  image: z
    .instanceof(File)
    .optional()
    .transform((file) => (file && file.size > 0 ? file : undefined))
    .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, "La imagen no puede pesar más de 4 MB")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Formato no soportado (usa JPG, PNG o WEBP)",
    ),
});

export type ProductInput = z.infer<typeof productSchema>;

export function parseProductFormData(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    unit: formData.get("unit"),
    category_id: formData.get("category_id") ?? "",
    active: formData.get("active") === "on",
    image: formData.get("image") ?? undefined,
  });
}
