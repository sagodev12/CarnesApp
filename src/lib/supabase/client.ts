import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

// Cliente para Client Components. Usa la publishable key, así que solo puede hacer
// lo que las políticas RLS permitan (lectura pública).
export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
