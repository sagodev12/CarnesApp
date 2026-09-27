// Verifica la conexión con Supabase usando las variables del .env
// Uso: node --env-file=.env scripts/check-supabase.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  console.error("✗ Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, publishableKey, { auth: { persistSession: false } });

// El endpoint de salud de Auth responde aunque aún no existan tablas.
const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: publishableKey } });
if (!res.ok) {
  console.error(`✗ No se pudo conectar (${res.status} ${res.statusText}). Revisa la URL y la publishable key.`);
  process.exit(1);
}
console.log("✓ Conexión con Supabase OK");

const { error } = await supabase.from("products").select("id", { head: true, count: "exact" });
if (error) {
  console.warn(`! La tabla "products" aún no es accesible: ${error.message}`);
} else {
  console.log('✓ Tabla "products" accesible');
}
