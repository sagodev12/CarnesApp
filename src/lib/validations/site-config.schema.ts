import { z } from "zod";

import { roundCoordinate } from "@/lib/location";
import { normalizePhone } from "@/lib/whatsapp";

import { checkbox, file, optionalImageSchema, text } from "./common";

export const DEFAULT_PRIMARY_COLOR = "#9a3324";

// Texto opcional: vacío se guarda como null.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((value) => value || null);

// URL opcional; se acepta sin protocolo ("instagram.com/x").
const optionalUrl = z
  .string()
  .trim()
  .transform((value) =>
    value && !/^https?:\/\//i.test(value) ? `https://${value}` : value,
  )
  .pipe(z.union([z.literal(""), z.url({ error: "Ingresa un enlace válido" })]))
  .transform((value) => value || null);

// Coordenada opcional (la llena el mapa del panel); vacío = null.
const optionalCoordinate = (limit: number) =>
  z.preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.coerce
      .number({ error: "Coordenada inválida" })
      .min(-limit, "Coordenada fuera de rango")
      .max(limit, "Coordenada fuera de rango")
      .transform(roundCoordinate)
      .nullable(),
  );

export const siteConfigSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "Máximo 80 caracteres"),
    description: optionalText(300),
    address: optionalText(150),
    schedule: optionalText(150),
    // Vacío = sin WhatsApp (se ocultan los botones de pedido).
    phone_whatsapp: z
      .string()
      .transform(normalizePhone)
      .refine(
        (phone) => phone === "" || (phone.length >= 10 && phone.length <= 15),
        "Número inválido: incluye el indicativo del país (ej: 57 312 000 0000)",
      ),
    whatsapp_message: optionalText(200),
    instagram: optionalUrl,
    facebook: optionalUrl,
    primary_color: z
      .string()
      .trim()
      .regex(/^#[0-9a-f]{6}$/i, "Usa un color en formato #RRGGBB")
      .transform((value) => value.toLowerCase()),
    logo: optionalImageSchema,
    hero: optionalImageSchema,
    remove_logo: z.boolean(),
    remove_hero: z.boolean(),
    latitude: optionalCoordinate(90),
    longitude: optionalCoordinate(180),
  })
  .superRefine(({ latitude, longitude }, ctx) => {
    if ((latitude === null) !== (longitude === null)) {
      ctx.addIssue({ code: "custom", path: ["latitude"], message: "Marca la ubicación en el mapa" });
    }
  });

export type SiteConfigInput = z.infer<typeof siteConfigSchema>;

export function parseSiteConfigFormData(formData: FormData) {
  return siteConfigSchema.safeParse({
    business_name: text(formData, "business_name"),
    description: text(formData, "description"),
    address: text(formData, "address"),
    schedule: text(formData, "schedule"),
    phone_whatsapp: text(formData, "phone_whatsapp"),
    whatsapp_message: text(formData, "whatsapp_message"),
    instagram: text(formData, "instagram"),
    facebook: text(formData, "facebook"),
    primary_color: text(formData, "primary_color") || DEFAULT_PRIMARY_COLOR,
    logo: file(formData, "logo"),
    hero: file(formData, "hero"),
    remove_logo: checkbox(formData, "remove_logo"),
    remove_hero: checkbox(formData, "remove_hero"),
    latitude: text(formData, "latitude"),
    longitude: text(formData, "longitude"),
  });
}
