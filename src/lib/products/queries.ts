import "server-only";

import { ADMIN_PAGE_SIZE, pageRange, paginated, type Paginated } from "@/lib/pagination";
import { createAdminClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/types";

const PRODUCT_COLUMNS =
  "id, name, description, price, sale_price, sale_starts_at, sale_ends_at, unit, image_url, category_id, active, order, created_at, updated_at, category:categories(id, name)";

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

// Datos del inicio del panel: conteos (sin traer filas) y productos con
// precio promo; la vigencia de cada promoción se calcula al mostrarla.
export async function getDashboardData() {
  const supabase = createAdminClient();
  const [counts, categories, withoutImage, promotions] = await Promise.all([
    getProductCounts(),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).is("image_url", null),
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .not("sale_price", "is", null)
      .order("order")
      .order("name")
      .overrideTypes<ProductWithCategory[], { merge: false }>(),
  ]);

  if (promotions.error) {
    throw new Error(`No se pudieron cargar las promociones: ${promotions.error.message}`);
  }

  return {
    ...counts,
    categories: categories.count ?? 0,
    withoutImage: withoutImage.count ?? 0,
    promotions: promotions.data,
  };
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
