import { z } from "zod";

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Un <input type="file"> vacío envía un File de tamaño 0: se trata como "sin imagen".
export const optionalImageSchema = z
  .instanceof(File)
  .optional()
  .transform((file) => (file && file.size > 0 ? file : undefined))
  .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, "La imagen no puede pesar más de 4 MB")
  .refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Formato no soportado (usa JPG, PNG o WEBP)",
  );

// Posición en listados: entero ≥ 0; vacío = 0.
export const orderSchema = z
  .union([z.literal(""), z.coerce.number()])
  .transform((value) => (value === "" ? 0 : value))
  .pipe(
    z
      .number()
      .int("Usa un número entero")
      .min(0, "No puede ser negativo")
      .max(9999, "Máximo 9999"),
  );

export const checkbox = (formData: FormData, name: string) => formData.get(name) === "on";

// Texto de un campo; si no viene, string vacío.
export const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export const file = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return value instanceof File ? value : undefined;
};
