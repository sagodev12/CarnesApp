import "server-only";

import { ADMIN_PAGE_SIZE, pageRange, paginated, type Paginated } from "@/lib/pagination";
import { createAdminClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/types";

const PRODUCT_COLUMNS =
  "id, name, description, price, unit, image_url, category_id, active, order, created_at, updated_at, category:categories(id, name)";

// Consultas del panel admin (incluyen productos inactivos, usan service_role).
// Quien las llame debe haber verificado antes que el usuario es admin.

export async function getProductsPage(page: number): Promise<Paginated<ProductWithCategory>> {
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const { data, count, error } = await createAdminClient()
    .from("products")
    .select(PRODUCT_COLUMNS, { count: "exact" })
    .order("order")
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, to)
    .overrideTypes<ProductWithCategory[], { merge: false }>();

  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);

  return paginated(data, count ?? 0, page, ADMIN_PAGE_SIZE);
}

// Resumen para el encabezado del listado (sin traer las filas).
export async function getProductCounts() {
  const supabase = createAdminClient();
  const [all, hidden] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", false),
  ]);

  if (all.error) throw new Error(`No se pudieron contar los productos: ${all.error.message}`);

  return { total: all.count ?? 0, hidden: hidden.count ?? 0 };
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

// Categorías con su cantidad de productos, contada por Supabase (no trae las filas).
export async function getCategoriesWithCounts(): Promise<(Category & { productCount: number })[]> {
  const { data, error } = await createAdminClient()
    .from("categories")
    .select("id, name, order, created_at, products(count)")
    .order("order")
    .order("name")
    .overrideTypes<(Category & { products: { count: number }[] })[], { merge: false }>();

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);

  return data.map(({ products, ...category }) => ({
    ...category,
    productCount: products[0]?.count ?? 0,
  }));
}
