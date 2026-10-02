import { parseOpeningHours } from "@/lib/hours";
import type { SiteConfig } from "@/types";

const DEFAULTS: SiteConfig = {
  id: null,
  business_name: "Mi Carnicería",
  logo_url: null,
  hero_image_url: null,
  description: null,
  footer_text: null,
  about_title: null,
  about_text: null,
  about_image_url: null,
  offers_visible: true,
  offers_eyebrow: null,
  offers_title: null,
  offers_subtitle: null,
  offers_style: "dark",
  offers_image_url: null,
  offers_layout: "carousel",
  offers_limit: 12,
  address: null,
  phone_whatsapp: "",
  whatsapp_message: "Hola, quiero hacer un pedido",
  schedule: null,
  instagram: null,
  facebook: null,
  primary_color: "#9a3324",
  latitude: null,
  longitude: null,
  opening_hours: null,
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Completa la fila de site_config con valores por defecto. Si no hay fila
// (o RLS no deja leerla) la página igual se renderiza.
export function withSiteConfigDefaults(row: Partial<SiteConfig> | null): SiteConfig {
  const config = { ...DEFAULTS };
  if (!row) return config;

  for (const key of Object.keys(DEFAULTS) as (keyof SiteConfig)[]) {
    const value = row[key];
    if (value !== null && value !== undefined) Object.assign(config, { [key]: value });
  }

  if (!HEX_COLOR.test(config.primary_color ?? "")) {
    config.primary_color = DEFAULTS.primary_color;
  }

  // jsonb sin esquema en la base: se valida antes de usarlo.
  config.opening_hours = parseOpeningHours(config.opening_hours);

  return config;
}

// Texto del pie de página: el propio o, si no hay, el eslogan de la portada.
export function footerText(config: SiteConfig) {
  return config.footer_text ?? config.description;
}

// La página /nosotros (y su enlace) existe solo si se escribió la historia.
export function hasAboutPage(config: SiteConfig) {
  return Boolean(config.about_text);
}

// Palabra del nombre que se muestra en color de acento (la última).
export function brandHighlight(name: string) {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? words.at(-1) : undefined;
}
