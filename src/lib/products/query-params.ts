import { z } from "zod";

import { parsePage } from "@/lib/pagination";

// Máximo de ids por consulta (validación del carrito).
export const MAX_IDS = 50;

export type ProductQuery =
  | { mode: "page"; page: number; categoryId: string | null }
  | { mode: "ids"; ids: string[] };

const uuid = z.uuid();

// Interpreta los parámetros de /api/products. Devuelve null si son inválidos.
export function parseProductQuery(params: URLSearchParams): ProductQuery | null {
  const idsParam = params.get("ids");

  if (idsParam !== null) {
    const ids = [...new Set(idsParam.split(",").map((id) => id.trim()).filter(Boolean))];
    if (ids.length === 0 || ids.length > MAX_IDS) return null;
    if (!ids.every((id) => uuid.safeParse(id).success)) return null;
    return { mode: "ids", ids };
  }

  const category = params.get("categoria");
  if (category && !uuid.safeParse(category).success) return null;

  return { mode: "page", page: parsePage(params.get("pagina")), categoryId: category || null };
}

export function productsApiUrl({ page, categoryId }: { page: number; categoryId: string | null }) {
  const params = new URLSearchParams();
  if (page > 1) params.set("pagina", String(page));
  if (categoryId) params.set("categoria", categoryId);

  const query = params.toString();
  return query ? `/api/products?${query}` : "/api/products";
}
