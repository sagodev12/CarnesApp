import type { SiteConfig } from "@/types";

const DEFAULTS: SiteConfig = {
  id: null,
  business_name: "Mi Carnicería",
  logo_url: null,
  hero_image_url: null,
  description: null,
  address: null,
  phone_whatsapp: "",
  whatsapp_message: "Hola, quiero hacer un pedido",
  schedule: null,
  instagram: null,
  facebook: null,
  primary_color: "#9a3324",
  latitude: null,
  longitude: null,
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

  return config;
}

// Palabra del nombre que se muestra en color de acento (la última).
export function brandHighlight(name: string) {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? words.at(-1) : undefined;
}
