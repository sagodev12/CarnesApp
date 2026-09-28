import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { SiteConfig } from "@/types";

import { withSiteConfigDefaults } from "./defaults";

// Pública (publishable key + RLS). cache() evita repetir la consulta cuando
// el layout y la página la piden en el mismo render.
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const { data, error } = await createClient()
    .from("site_config")
    .select(
      "id, business_name, logo_url, hero_image_url, description, address, phone_whatsapp, whatsapp_message, schedule, instagram, facebook, primary_color, latitude, longitude, opening_hours",
    )
    .eq("singleton", true)
    .maybeSingle();

  if (error) console.error("No se pudo cargar site_config:", error.message);

  return withSiteConfigDefaults(data);
});
