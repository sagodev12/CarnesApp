import { z } from "zod";

import { OFFER_LAYOUTS, OFFER_STYLES, OFFERS_LIMIT } from "@/lib/offers-banner";

import { checkbox, file, optionalImageSchema, text } from "./common";

// Texto opcional: vacío = texto por defecto (null).
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((value) => value || null);

const styleValues = OFFER_STYLES.map((style) => style.value) as [
  (typeof OFFER_STYLES)[number]["value"],
  ...(typeof OFFER_STYLES)[number]["value"][],
];
const layoutValues = OFFER_LAYOUTS.map((layout) => layout.value) as [
  (typeof OFFER_LAYOUTS)[number]["value"],
  ...(typeof OFFER_LAYOUTS)[number]["value"][],
];

export const offersSchema = z.object({
  offers_visible: z.boolean(),
  offers_eyebrow: optionalText(40),
  offers_title: optionalText(60),
  offers_subtitle: optionalText(160),
  offers_style: z.enum(styleValues, { error: "Elige un estilo" }),
  offers_layout: z.enum(layoutValues, { error: "Elige un formato" }),
  offers_limit: z.coerce
    .number({ error: "Ingresa un número" })
    .int("Usa un número entero")
    .min(OFFERS_LIMIT.min, `Mínimo ${OFFERS_LIMIT.min}`)
    .max(OFFERS_LIMIT.max, `Máximo ${OFFERS_LIMIT.max}`),
  offers_image: optionalImageSchema,
  remove_offers_image: z.boolean(),
});

export type OffersInput = z.infer<typeof offersSchema>;

export function parseOffersFormData(formData: FormData) {
  return offersSchema.safeParse({
    offers_visible: checkbox(formData, "offers_visible"),
    offers_eyebrow: text(formData, "offers_eyebrow"),
    offers_title: text(formData, "offers_title"),
    offers_subtitle: text(formData, "offers_subtitle"),
    offers_style: text(formData, "offers_style"),
    offers_layout: text(formData, "offers_layout"),
    offers_limit: text(formData, "offers_limit"),
    offers_image: file(formData, "offers_image"),
    remove_offers_image: checkbox(formData, "remove_offers_image"),
  });
}
