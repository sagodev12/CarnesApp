import "server-only";

import { createAdminClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/types";

const PRODUCT_COLUMNS =
  "id, name, description, price, unit, image_url, category_id, active, created_at, updated_at, category:categories(id, name)";

// Solo para el panel admin (incluye productos inactivos).
// Quien la llame debe haber verificado antes que el usuario es admin.
export async function getAllProducts(): Promise<ProductWithCategory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false })
    .returns<ProductWithCategory[]>();

  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);

  return data;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .order("name");

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);

  return data;
}
