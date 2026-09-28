import "server-only";

import { unstable_cache } from "next/cache";

import { PUBLIC_PAGE_SIZE, pageRange, paginated, type Paginated } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/types";

// Consultas del sitio público: usan la publishable key, así que dependen de
// las políticas RLS (supabase/public-read-policies.sql): solo productos activos.
//
// Se cachean en el servidor (etiqueta "products") para que cada visita no
// consulte Supabase; las acciones del panel invalidan la etiqueta al guardar.
// Nota: unstable_cache está reemplazado por 'use cache' en Next 16, pero ese
// reemplazo exige activar Cache Components en toda la app.
export const PRODUCTS_TAG = "products";
const CACHE_SECONDS = 3600;

const PRODUCT_COLUMNS =
  "id, name, description, price, unit, image_url, category_id, active, order, created_at, updated_at, category:categories(id, name)";

type PageQuery = { page: number; categoryId: string | null };

export const getActiveProductsPage = unstable_cache(
  async ({ page, categoryId }: PageQuery): Promise<Paginated<ProductWithCategory>> => {
    const { from, to } = pageRange(page, PUBLIC_PAGE_SIZE);

    let query = createClient()
      .from("products")
      .select(PRODUCT_COLUMNS, { count: "exact" })
      .eq("active", true);
    if (categoryId) query = query.eq("category_id", categoryId);

    const { data, count, error } = await query
      .order("order")
      .order("created_at", { ascending: false })
      .order("id") // desempate estable para que las páginas no se solapen
      .range(from, to)
      .overrideTypes<ProductWithCategory[], { merge: false }>();

    // Un error se lanza (no se cachea) para no guardar una página vacía.
    if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);

    return paginated(data, count ?? 0, page, PUBLIC_PAGE_SIZE);
  },
  // El tamaño de página va en la clave: si cambia, no se reusan páginas viejas.
  ["public-products-page", `size-${PUBLIC_PAGE_SIZE}`],
  { tags: [PRODUCTS_TAG], revalidate: CACHE_SECONDS },
);

// Para validar el carrito guardado: devuelve solo los que siguen activos.
export const getActiveProductsByIds = unstable_cache(
  async (ids: string[]): Promise<ProductWithCategory[]> => {
    const { data, error } = await createClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .in("id", ids)
      .overrideTypes<ProductWithCategory[], { merge: false }>();

    if (error) throw new Error(`No se pudieron validar los productos: ${error.message}`);

    return data;
  },
  ["public-products-by-ids"],
  { tags: [PRODUCTS_TAG], revalidate: CACHE_SECONDS },
);

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
