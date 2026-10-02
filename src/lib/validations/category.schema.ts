import { z } from "zod";

import { slugify } from "@/lib/slug";

import { checkbox, file, optionalImageSchema, orderSchema, text } from "./common";

export const categorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(60, "Máximo 60 caracteres")
      .refine((name) => slugify(name) !== "", "Usa al menos una letra o número"),
    // Vacío = sin descripción.
    description: z
      .string()
      .trim()
      .max(200, "Máximo 200 caracteres")
      .transform((value) => value || null),
    order: orderSchema,
    image: optionalImageSchema,
    remove_image: z.boolean(),
  })
  // El slug (URL de la página de la categoría) sale del nombre.
  .transform(({ name, ...rest }) => ({ name, slug: slugify(name), ...rest }));

export type CategoryInput = z.infer<typeof categorySchema>;

export function parseCategoryFormData(formData: FormData) {
  return categorySchema.safeParse({
    name: text(formData, "name"),
    description: text(formData, "description"),
    order: text(formData, "order"),
    image: file(formData, "image"),
    remove_image: checkbox(formData, "remove_image"),
  });
}
