import { z } from "zod";

import { DAY_NAMES, isValidDay, isValidTime, type DayHours } from "@/lib/hours";
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

// Horario: 7 días (0 = domingo) leídos del formulario. Un día sin marcar
// queda cerrado; si ningún día está marcado, no hay horario.
type DayInput = { enabled: boolean; open: string; close: string };

const openingHoursSchema = z
  .array(z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }))
  .length(7)
  .superRefine((days: DayInput[], ctx) => {
    days.forEach((day, index) => {
      if (!day.enabled) return;
      const name = DAY_NAMES[index][0].toUpperCase() + DAY_NAMES[index].slice(1);

      if (!isValidTime(day.open) || !isValidTime(day.close)) {
        ctx.addIssue({ code: "custom", message: `${name}: indica la hora de apertura y de cierre` });
      } else if (!isValidDay(day)) {
        ctx.addIssue({ code: "custom", message: `${name}: la hora de cierre debe ser después de la apertura` });
      }
    });
  })
  .transform((days): (DayHours | null)[] | null =>
    days.some((day) => day.enabled)
      ? days.map(({ enabled, open, close }) => (enabled ? { open, close } : null))
      : null,
  );

export const siteConfigSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "Máximo 80 caracteres"),
    description: optionalText(300),
    footer_text: optionalText(300),
    about_title: optionalText(80),
    about_text: optionalText(3000),
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
    about_image: optionalImageSchema,
    remove_about_image: z.boolean(),
    latitude: optionalCoordinate(90),
    longitude: optionalCoordinate(180),
    opening_hours: openingHoursSchema,
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
    footer_text: text(formData, "footer_text"),
    about_title: text(formData, "about_title"),
    about_text: text(formData, "about_text"),
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
    about_image: file(formData, "about_image"),
    remove_about_image: checkbox(formData, "remove_about_image"),
    latitude: text(formData, "latitude"),
    longitude: text(formData, "longitude"),
    opening_hours: Array.from({ length: 7 }, (_, day) => ({
      enabled: checkbox(formData, `hours_${day}_enabled`),
      open: text(formData, `hours_${day}_open`),
      close: text(formData, `hours_${day}_close`),
    })),
  });
}
