// Verifica las políticas RLS de lectura pública (supabase/public-read-policies.sql).
// Uso: npm run check:public
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !secretKey) {
  console.error("✗ Faltan variables de Supabase en el .env");
  process.exit(1);
}

const options = { auth: { persistSession: false } };
const anon = createClient(url, publishableKey, options);
const admin = createClient(url, secretKey, options);

let failures = 0;
function check(ok: boolean, message: string) {
  console.log(`${ok ? "✓" : "✗"} ${message}`);
  if (!ok) failures++;
}

const [anonProducts, allProducts, anonCategories, anonConfig, anonAdmins] = await Promise.all([
  anon.from("products").select("id, active"),
  admin.from("products").select("id, active"),
  anon.from("categories").select("id"),
  anon.from("site_config").select("business_name, phone_whatsapp"),
  anon.from("admin_users").select("id"),
]);

const activeIds = new Set((allProducts.data ?? []).filter((p) => p.active).map((p) => p.id));
const inactiveCount = (allProducts.data ?? []).length - activeIds.size;

check(!anonProducts.error, "anon puede leer products");
check(
  (anonProducts.data ?? []).length === activeIds.size &&
    (anonProducts.data ?? []).every((p) => p.active),
  `anon ve solo los productos activos (${activeIds.size} activos, ${inactiveCount} ocultos)`,
);
check(!anonCategories.error, `anon puede leer categories (${anonCategories.data?.length ?? 0})`);
check((anonConfig.data ?? []).length === 1, "anon puede leer la fila de site_config");
check((anonAdmins.data ?? []).length === 0, "anon NO puede leer admin_users");

const phone = anonConfig.data?.[0]?.phone_whatsapp;
if (!phone) console.warn("! site_config.phone_whatsapp está vacío: los botones de pedido no se mostrarán");

// Escritura anónima debe estar bloqueada.
const { error: writeError } = await anon.from("categories").insert({ name: "__rls_test__" });
check(Boolean(writeError), "anon NO puede escribir");

process.exit(failures ? 1 : 0);
