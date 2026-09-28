import "server-only";

import { createAdminClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/types";

const PRODUCT_COLUMNS =
  "id, name, description, price, unit, image_url, category_id, active, order, created_at, updated_at, category:categories(id, name)";

// Consultas del panel admin (incluyen productos inactivos, usan service_role).
// Quien las llame debe haber verificado antes que el usuario es admin.

export async function getAllProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await createAdminClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("order")
    .order("created_at", { ascending: false })
    .overrideTypes<ProductWithCategory[], { merge: false }>();

  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);

  return data;
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const { data, error } = await createAdminClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<ProductWithCategory | null, { merge: false }>();

  if (error) throw new Error(`No se pudo cargar el producto: ${error.message}`);

  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await createAdminClient()
    .from("categories")
    .select("id, name, order, created_at")
    .order("order")
    .order("name");

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);

  return data;
}

// Cantidad de productos por categoría (para el listado de categorías).
export async function getProductCountByCategory(): Promise<Record<string, number>> {
  const { data, error } = await createAdminClient()
    .from("products")
    .select("category_id");

  if (error) throw new Error(`No se pudieron contar los productos: ${error.message}`);

  const counts: Record<string, number> = {};
  for (const { category_id: categoryId } of data) {
    if (categoryId) counts[categoryId] = (counts[categoryId] ?? 0) + 1;
  }
  return counts;
}
