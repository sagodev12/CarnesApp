import { z } from "zod";

import { orderSchema, text } from "./common";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "Máximo 60 caracteres"),
  order: orderSchema,
});

export function parseCategoryFormData(formData: FormData) {
  return categorySchema.safeParse({
    name: text(formData, "name"),
    order: text(formData, "order"),
  });
}
