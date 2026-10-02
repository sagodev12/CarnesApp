import type { SiteConfig } from "@/types";

import { isImageTone, type ImageTone } from "./luminance";

// Estilos de la franja de ofertas del inicio (se eligen en /admin/ofertas).
export const OFFER_STYLES = [
  { value: "dark", label: "Oscuro" },
  { value: "brand", label: "Color de marca" },
  { value: "light", label: "Claro" },
  { value: "image", label: "Con imagen" },
] as const;

export const OFFER_LAYOUTS = [
  { value: "carousel", label: "Carrusel", hint: "Fila que se desliza" },
  { value: "grid", label: "Cuadrícula", hint: "Todas a la vista" },
] as const;

export type OfferStyle = (typeof OFFER_STYLES)[number]["value"];
export type OfferLayout = (typeof OFFER_LAYOUTS)[number]["value"];

// Cuántas ofertas mostrar en el inicio.
export const OFFERS_LIMIT = { min: 3, max: 24, default: 12 } as const;

export const OFFERS_DEFAULT_TEXT = { eyebrow: "Por tiempo limitado", title: "Ofertas" } as const;

export type OffersBanner = {
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  style: OfferStyle;
  imageUrl: string | null;
  // Brillo de la imagen: decide el color del texto (null = sin analizar).
  imageTone: ImageTone | null;
  layout: OfferLayout;
  limit: number;
};

type OffersConfig = Pick<
  SiteConfig,
  | "offers_visible"
  | "offers_eyebrow"
  | "offers_title"
  | "offers_subtitle"
  | "offers_style"
  | "offers_image_url"
  | "offers_image_tone"
  | "offers_layout"
  | "offers_limit"
>;

const isStyle = (value: string): value is OfferStyle =>
  OFFER_STYLES.some((style) => style.value === value);
const isLayout = (value: string): value is OfferLayout =>
  OFFER_LAYOUTS.some((layout) => layout.value === value);

function clampLimit(value: number) {
  if (!Number.isInteger(value)) return OFFERS_LIMIT.default;
  return Math.min(OFFERS_LIMIT.max, Math.max(OFFERS_LIMIT.min, value));
}

// Ajustes listos para mostrar: textos por defecto y valores inválidos corregidos.
export function offersBanner(config: OffersConfig): OffersBanner {
  const style = isStyle(config.offers_style) ? config.offers_style : "dark";
  const imageUrl = config.offers_image_url;

  return {
    visible: config.offers_visible,
    eyebrow: config.offers_eyebrow ?? OFFERS_DEFAULT_TEXT.eyebrow,
    title: config.offers_title ?? OFFERS_DEFAULT_TEXT.title,
    subtitle: config.offers_subtitle,
    // Sin imagen no se puede usar el estilo con imagen.
    style: style === "image" && !imageUrl ? "dark" : style,
    imageUrl,
    imageTone: isImageTone(config.offers_image_tone) ? config.offers_image_tone : null,
    layout: isLayout(config.offers_layout) ? config.offers_layout : "carousel",
    limit: clampLimit(config.offers_limit),
  };
}
