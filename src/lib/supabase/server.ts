import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

// La autenticación la maneja Auth0, no Supabase Auth, así que no hay sesión
// de Supabase en cookies que leer ni refrescar. Por eso estos clientes no
// usan cookies(): así la landing puede seguir siendo estática / ISR.
const noSession = {
  auth: { persistSession: false, autoRefreshToken: false },
};

// Lecturas públicas desde Server Components (landing, catálogo).
// Sujeto a RLS: solo ve lo que las políticas permiten a "anon" (publishable key).
export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();

  return createSupabaseClient(supabaseUrl, supabasePublishableKey, noSession);
}

// Escrituras del panel admin (Server Actions / Route Handlers).
// Usa la service_role key y se salta RLS: llamarlo SOLO después de
// verificar la sesión de Auth0 del administrador.
export function createAdminClient() {
  const { supabaseUrl } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el .env");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, noSession);
}
