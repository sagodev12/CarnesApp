// Búsqueda de productos por texto (nombre o descripción), sin distinguir
// tildes ni mayúsculas ("salmon" encuentra "Salmón").
import { pageRange, paginated, type Paginated } from "@/lib/pagination";

export const MAX_SEARCH_LENGTH = 60;
const MIN_SEARCH_LENGTH = 2;

// Deja letras (con tildes), números, espacios y guiones.
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

// Sin tildes ni mayúsculas, para comparar.
const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function matchesSearch(
  product: { name: string; description: string },
  search: string | null,
) {
  if (!search) return true;
  const term = fold(search);
  return fold(product.name).includes(term) || fold(product.description).includes(term);
}

// Filtra una lista ya cargada y devuelve la página pedida.
export function searchPage<T extends { name: string; description: string }>(
  items: T[],
  search: string,
  page: number,
  pageSize: number,
): Paginated<T> {
  const matches = items.filter((item) => matchesSearch(item, search));
  const { from, to } = pageRange(page, pageSize);
  return paginated(matches.slice(from, to + 1), matches.length, page, pageSize);
}
