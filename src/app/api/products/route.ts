import {
  getActiveProductsByIds,
  getActiveProductsPage,
} from "@/lib/products/public-queries";
import { parseProductQuery } from "@/lib/products/query-params";

// Catálogo público paginado para la galería:
//   GET /api/products?pagina=2&categoria=<uuid>&buscar=<texto>
//   GET /api/products?ids=<uuid>,<uuid>   (valida el carrito guardado)
// Los datos salen de la caché del servidor; además la CDN puede cachear la
// respuesta un minuto.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const query = parseProductQuery(new URL(request.url).searchParams);

  if (!query) {
    return Response.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  try {
    if (query.mode === "ids") {
      const items = await getActiveProductsByIds(query.ids);
      return Response.json({ items }, { headers: CACHE_HEADERS });
    }

    const page = await getActiveProductsPage({
      page: query.page,
      categoryId: query.categoryId,
      search: query.search,
    });
    return Response.json(page, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "No se pudieron cargar los productos" }, { status: 500 });
  }
}
