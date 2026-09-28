// Búsqueda de productos por texto (nombre o descripción).

export const MAX_SEARCH_LENGTH = 60;
const MIN_SEARCH_LENGTH = 2;

// Deja letras (con tildes), números, espacios y guiones. Así el texto no
// trae comodines de LIKE (% _) ni caracteres que rompan el filtro or() de
// PostgREST (comas, paréntesis, comillas).
export function normalizeSearch(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const search = raw
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH)
    .trim();

  return search.length >= MIN_SEARCH_LENGTH ? search : null;
}

// Filtro para .or() de Supabase. Recibe un texto ya normalizado.
export function searchOrFilter(search: string) {
  return `name.ilike.%${search}%,description.ilike.%${search}%`;
}

// Sin tildes ni mayúsculas, para comparar en el cliente.
const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Versión en el cliente (lista de ofertas ya cargada).
export function matchesSearch(
  product: { name: string; description: string },
  search: string | null,
) {
  if (!search) return true;
  const term = fold(search);
  return fold(product.name).includes(term) || fold(product.description).includes(term);
}
