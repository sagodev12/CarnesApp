export const PUBLIC_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 24;
const MAX_PAGE = 1000;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
};

// Número de página desde la URL: entero ≥ 1; cualquier otra cosa es la 1.
export function parsePage(value: unknown) {
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !/^\d+$/.test(text)) return 1;

  const page = Number(text);
  if (page < 1) return 1;
  return Math.min(page, MAX_PAGE);
}

// Rango inclusivo para .range(from, to) de Supabase.
export function pageRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { items, total, page, pageSize, totalPages, hasMore: page < totalPages };
}

// Números a mostrar en un paginador: primera, última y vecinas de la actual.
export function pageWindow(current: number, totalPages: number): (number | "…")[] {
  const pages = new Set([1, totalPages, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  for (const page of sorted) {
    const previous = result.at(-1);
    if (typeof previous === "number" && page - previous === 2) result.push(previous + 1);
    else if (typeof previous === "number" && page - previous > 2) result.push("…");
    result.push(page);
  }
  return result;
}
