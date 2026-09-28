import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/types";

// Consultas del sitio público: usan la publishable key, así que dependen de
// las políticas RLS (supabase/public-read-policies.sql): solo productos activos.
// Si fallan, se devuelve una lista vacía para no romper la landing.

export async function getActiveProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await createClient()
    .from("products")
    .select(
      "id, name, description, price, unit, image_url, category_id, active, order, created_at, updated_at, category:categories(id, name)",
    )
    .eq("active", true)
    .order("order")
    .order("created_at", { ascending: false })
    .overrideTypes<ProductWithCategory[], { merge: false }>();

  if (error) {
    console.error("No se pudieron cargar los productos públicos:", error.message);
    return [];
  }

  return data;
}

export async function getPublicCategories(): Promise<Category[]> {
  const { data, error } = await createClient()
    .from("categories")
    .select("id, name, order, created_at")
    .order("order")
    .order("name");

  if (error) {
    console.error("No se pudieron cargar las categorías públicas:", error.message);
    return [];
  }

  return data;
}
