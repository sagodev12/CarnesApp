// Las variables NEXT_PUBLIC_* se inlinean en build, por eso se leen de forma
// explícita (process.env[name] dinámico no funcionaría en el cliente).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el .env",
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}
